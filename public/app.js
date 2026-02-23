const URLS_JSON_PATH = "./public/urls.json";
const CARD_COUNT = 10;

const randomButton = document.getElementById("randomButton");
const statusEl = document.getElementById("status");
const loadingEl = document.getElementById("loading");
const errorBoxEl = document.getElementById("errorBox");
const cardListEl = document.getElementById("cardList");

let previousSelection = new Set();

randomButton.addEventListener("click", () => {
  void renderRandomCards();
});

window.addEventListener("DOMContentLoaded", () => {
  void renderRandomCards();
});

function setLoading(isLoading) {
  randomButton.disabled = isLoading;
  loadingEl.classList.toggle("hidden", !isLoading);
}

function setStatus(message) {
  statusEl.textContent = message;
}

function setError(message) {
  if (!message) {
    errorBoxEl.textContent = "";
    errorBoxEl.classList.add("hidden");
    return;
  }

  errorBoxEl.textContent = message;
  errorBoxEl.classList.remove("hidden");
}

async function fetchUrlsJson() {
  const response = await fetch(URLS_JSON_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`urls.json の取得失敗: HTTP ${response.status}`);
  }
  return response.json();
}

function toEmbedUrl(noteUrl) {
  const m = String(noteUrl).match(/\/n\/([a-z0-9]+)/i);
  if (!m) {
    return null;
  }

  return `https://note.com/embed/notes/${m[1]}`;
}

function extractSourceUrls(payload) {
  const urlsFromItems = Array.isArray(payload.items)
    ? payload.items.map((item) => (item && typeof item === "object" ? item.article_url : null))
    : [];

  const urlsFromLegacy = Array.isArray(payload.urls) ? payload.urls : [];
  const sourceUrls = [...urlsFromItems, ...urlsFromLegacy].filter((url) => typeof url === "string");
  return [...new Set(sourceUrls)];
}

function pickRandomDistinct(items, count, avoidSet) {
  const pool = items.filter((item) => !avoidSet.has(item));
  const source = pool.length >= count ? pool : items;
  const shuffled = [...source];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function createCard(noteUrl) {
  const cardEl = document.createElement("article");
  cardEl.className = "url-card";

  const titleEl = document.createElement("h2");
  titleEl.className = "url-card-title";
  titleEl.textContent = "記事URL";

  const urlEl = document.createElement("p");
  urlEl.className = "url-card-url";
  urlEl.textContent = noteUrl;

  const iframeEl = document.createElement("iframe");
  iframeEl.className = "note-frame";
  iframeEl.loading = "lazy";
  iframeEl.title = `note embed: ${noteUrl}`;
  iframeEl.src = toEmbedUrl(noteUrl) ?? "about:blank";

  cardEl.append(titleEl, urlEl, iframeEl);
  return cardEl;
}

function renderCards(urls) {
  cardListEl.replaceChildren();

  const fragment = document.createDocumentFragment();
  for (const url of urls) {
    fragment.appendChild(createCard(url));
  }

  cardListEl.appendChild(fragment);
  return urls.length;
}

async function renderRandomCards() {
  setLoading(true);
  setError("");
  setStatus("URLを取得中...");

  try {
    const payload = await fetchUrlsJson();
    const sourceUrls = extractSourceUrls(payload);

    if (sourceUrls.length === 0) {
      throw new Error("urls.json に有効なURLがありません。tools/build_urls.py を実行して更新してください。");
    }

    const selectedUrls = pickRandomDistinct(sourceUrls, CARD_COUNT, previousSelection);
    previousSelection = new Set(selectedUrls);
    const renderedCount = renderCards(selectedUrls);

    if (selectedUrls.length < CARD_COUNT) {
      setError(`候補不足のため ${selectedUrls.length} 件のみ表示しています。`);
    }

    setStatus(`${renderedCount} 件を表示中`);
  } catch (error) {
    cardListEl.replaceChildren();
    setError(`取得に失敗しました: ${error instanceof Error ? error.message : "unknown"}`);
    setStatus("取得に失敗しました");
  } finally {
    setLoading(false);
  }
}
