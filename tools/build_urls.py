#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import gzip
import html
import json
import random
import re
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

SITEMAP_INDEX_URL = "https://note.com/sitemap.xml.gz"
DEFAULT_OUTPUT_PATH = Path("urls.json")
NAMESPACE = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


def fetch_bytes(url: str, timeout_s: int) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "random_note_url_builder/1.0"})
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:
        return resp.read()


def fetch_text(url: str, timeout_s: int) -> str:
    return fetch_bytes(url, timeout_s).decode("utf-8", errors="ignore")


def maybe_gunzip(data: bytes) -> bytes:
    if len(data) >= 2 and data[0] == 0x1F and data[1] == 0x8B:
        return gzip.decompress(data)
    return data


def parse_xml_bytes(data: bytes) -> ET.Element:
    return ET.fromstring(data)


def parse_iso8601(value: str | None) -> dt.datetime | None:
    if not value:
        return None
    try:
        return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def find_text(node: ET.Element, path: str) -> str | None:
    found = node.find(path, NAMESPACE)
    if found is None or found.text is None:
        return None
    return found.text.strip()


def load_sitemap_index(timeout_s: int) -> list[dict[str, str | dt.datetime | None]]:
    raw = fetch_bytes(SITEMAP_INDEX_URL, timeout_s)
    root = parse_xml_bytes(maybe_gunzip(raw))
    entries: list[dict[str, str | dt.datetime | None]] = []

    for sitemap in root.findall("sm:sitemap", NAMESPACE):
        loc = find_text(sitemap, "sm:loc")
        if not loc:
            continue
        lastmod = parse_iso8601(find_text(sitemap, "sm:lastmod"))
        entries.append({"loc": loc, "lastmod": lastmod})

    return entries


def pick_child_sitemaps(index_entries: list[dict[str, str | dt.datetime | None]], max_children: int, random_seed: int) -> list[str]:
    if not index_entries:
        return []

    with_time = [e for e in index_entries if e["lastmod"] is not None]
    without_time = [e for e in index_entries if e["lastmod"] is None]
    with_time.sort(key=lambda item: item["lastmod"], reverse=True)

    top = (with_time + without_time)[: max_children * 2]
    rng = random.Random(random_seed)
    rng.shuffle(top)
    selected = top[:max_children]
    return [item["loc"] for item in selected if isinstance(item.get("loc"), str)]


def extract_urls_from_child_sitemap(url: str, now: dt.datetime, within_hours: int, timeout_s: int) -> tuple[list[str], list[str]]:
    raw = fetch_bytes(url, timeout_s)
    root = parse_xml_bytes(maybe_gunzip(raw))

    prioritized: list[str] = []
    fallback: list[str] = []

    for url_node in root.findall("sm:url", NAMESPACE):
        loc = find_text(url_node, "sm:loc")
        if not loc or "/n/" not in loc:
            continue

        lastmod = parse_iso8601(find_text(url_node, "sm:lastmod"))
        if lastmod is None:
            fallback.append(loc)
            continue

        if now - lastmod <= dt.timedelta(hours=within_hours):
            prioritized.append(loc)
        else:
            fallback.append(loc)

    return prioritized, fallback


def is_live_note_url(url: str, timeout_s: int) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": "random_note_url_validator/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            return 200 <= resp.status < 400
    except urllib.error.HTTPError as err:
        return err.code not in (404, 410)
    except Exception:
        return False


def extract_note_id(article_url: str) -> str | None:
    match = re.search(r"/n/([^/?#]+)", article_url)
    if not match:
        return None
    return match.group(1)


def pick_meta(html_text: str, prop: str) -> str:
    pattern = re.compile(
        rf'<meta[^>]+(?:property|name)=["\']{re.escape(prop)}["\'][^>]+content=["\']([^"\']+)["\']',
        flags=re.IGNORECASE,
    )
    match = pattern.search(html_text)
    return html.unescape(match.group(1).strip()) if match else ""


def build_urls(
    max_children: int,
    max_urls: int,
    min_urls: int,
    within_hours: int,
    timeout_s: int,
    random_seed: int,
    validate_urls: bool,
    validation_timeout_s: int,
) -> dict:
    now = dt.datetime.now(dt.timezone.utc)
    index_entries = load_sitemap_index(timeout_s)
    child_sitemaps = pick_child_sitemaps(index_entries, max_children=max_children, random_seed=random_seed)
    if not child_sitemaps:
        raise RuntimeError("No child sitemaps found in sitemap index")

    prioritized_urls: list[str] = []
    fallback_urls: list[str] = []
    for child_url in child_sitemaps:
        try:
            pri, fb = extract_urls_from_child_sitemap(child_url, now=now, within_hours=within_hours, timeout_s=timeout_s)
            prioritized_urls.extend(pri)
            fallback_urls.extend(fb)
            if len(set(prioritized_urls)) >= min_urls:
                break
        except Exception:
            continue

    merged = prioritized_urls + fallback_urls
    deduped = list(dict.fromkeys(merged))

    if validate_urls:
        validated: list[str] = []
        scan_limit = min(len(deduped), max_urls * 3)
        for item in deduped[:scan_limit]:
            if is_live_note_url(item, timeout_s=validation_timeout_s):
                validated.append(item)
            if len(validated) >= max_urls:
                break
        deduped = validated
    else:
        deduped = deduped[:max_urls]

    embed_urls: list[str] = []
    for article_url in deduped:
        note_id = extract_note_id(article_url)
        if not note_id:
            continue
        embed_urls.append(f"https://note.com/embed/notes/{note_id}")

    if not embed_urls:
        raise RuntimeError("No embed URLs could be generated")

    return {
        "generated_at": now.isoformat().replace("+00:00", "Z"),
        "source": "note sitemap",
        "urls": embed_urls,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Build urls.json from note sitemap")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH)
    parser.add_argument("--max-children", type=int, default=30)
    parser.add_argument("--max-urls", type=int, default=5000)
    parser.add_argument("--min-urls", type=int, default=300)
    parser.add_argument("--within-hours", type=int, default=100)
    parser.add_argument("--timeout", type=int, default=20)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--validate-urls", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--validation-timeout", type=int, default=10)
    args = parser.parse_args()

    payload = build_urls(
        max_children=args.max_children,
        max_urls=args.max_urls,
        min_urls=args.min_urls,
        within_hours=args.within_hours,
        timeout_s=args.timeout,
        random_seed=args.seed,
        validate_urls=args.validate_urls,
        validation_timeout_s=args.validation_timeout,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
