#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import gzip
import io
import json
import random
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

SITEMAP_INDEX_URL = "https://note.com/sitemap.xml.gz"
DEFAULT_OUTPUT_PATH = Path("public/urls.json")
NAMESPACE = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


def fetch_bytes(url: str, timeout_s: int) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "random_note_url_builder/1.0"})
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:
        return resp.read()


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
    xml_bytes = maybe_gunzip(raw)
    root = parse_xml_bytes(xml_bytes)

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

    sortable = []
    no_time = []
    for entry in index_entries:
        if entry["lastmod"] is None:
            no_time.append(entry)
        else:
            sortable.append(entry)

    sortable.sort(key=lambda item: item["lastmod"], reverse=True)
    ordered = sortable + no_time
    top = ordered[: max_children * 2]

    rng = random.Random(random_seed)
    rng.shuffle(top)
    selected = top[:max_children]

    return [item["loc"] for item in selected if isinstance(item.get("loc"), str)]


def extract_urls_from_child_sitemap(url: str, now: dt.datetime, within_hours: int, timeout_s: int) -> tuple[list[str], list[str]]:
    raw = fetch_bytes(url, timeout_s)
    xml_bytes = maybe_gunzip(raw)
    root = parse_xml_bytes(xml_bytes)

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


def build_urls(max_children: int, max_urls: int, min_urls: int, within_hours: int, timeout_s: int, random_seed: int) -> dict:
    now = dt.datetime.now(dt.timezone.utc)
    index_entries = load_sitemap_index(timeout_s)
    child_sitemaps = pick_child_sitemaps(index_entries, max_children=max_children, random_seed=random_seed)

    if not child_sitemaps:
        raise RuntimeError("No child sitemaps found in sitemap index")

    prioritized_urls: list[str] = []
    fallback_urls: list[str] = []

    for child_url in child_sitemaps:
        try:
            pri, fb = extract_urls_from_child_sitemap(
                child_url,
                now=now,
                within_hours=within_hours,
                timeout_s=timeout_s,
            )
            prioritized_urls.extend(pri)
            fallback_urls.extend(fb)

            if len(set(prioritized_urls)) >= min_urls:
                # 100h 優先で十分な候補があれば終了
                break
        except Exception:
            # 失敗 child はスキップ
            continue

    merged = prioritized_urls + fallback_urls

    deduped: list[str] = []
    seen = set()
    for item in merged:
        if item in seen:
            continue
        seen.add(item)
        deduped.append(item)
        if len(deduped) >= max_urls:
            break

    if not deduped:
        raise RuntimeError("No candidate URLs could be generated")

    return {
        "generated_at": now.isoformat().replace("+00:00", "Z"),
        "source": "note sitemap",
        "urls": deduped,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Build public/urls.json from note sitemap")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH)
    parser.add_argument("--max-children", type=int, default=30)
    parser.add_argument("--max-urls", type=int, default=5000)
    parser.add_argument("--min-urls", type=int, default=300)
    parser.add_argument("--within-hours", type=int, default=100)
    parser.add_argument("--timeout", type=int, default=20)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    payload = build_urls(
        max_children=args.max_children,
        max_urls=args.max_urls,
        min_urls=args.min_urls,
        within_hours=args.within_hours,
        timeout_s=args.timeout,
        random_seed=args.seed,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
