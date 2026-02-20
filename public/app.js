const URLS_JSON_PATH = "./urls.json";
const IFRAME_TIMEOUT_MS = 3000;

const randomButton = document.getElementById("randomButton");
const articleFrame = document.getElementById("articleFrame");
const statusEl = document.getElementById("status");
const loadingEl = document.getElementById("loading");
const fallbackEl = document.getElementById("fallback");
const fallbackLink = document.getElementById("fallbackLink");

randomButton.addEventListener("click", () => {
  void showRandomFromUrlsJson();
});

function setLoading(isLoading) {
  randomButton.disabled = isLoading;
  loadingEl.classList.toggle("hidden", !isLoading);
}

function setStatus(message) {
  statusEl.textContent = message;
}

function showFallback(url, message) {
  fallbackLink.href = url;
  fallbackEl.classList.remove("hidden");
  setStatus(message);
}

function hideFallback() {
  fallbackEl.classList.add("hidden");
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

async function fetchUrlsJson() {
  const firstResponse = await fetch(URLS_JSON_PATH, { cache: "no-store" });

  if (!firstResponse.ok) {
    throw new Error(`urls.json の取得失敗: HTTP ${firstResponse.status}`);
  }

  const firstPayload = await firstResponse.json();
  const version = typeof firstPayload.generated_at === "string" ? encodeURIComponent(firstPayload.generated_at) : "";

  if (!version) {
    return firstPayload;
  }

  const versionedResponse = await fetch(`${URLS_JSON_PATH}?v=${version}`, { cache: "no-store" });
  if (!versionedResponse.ok) {
    return firstPayload;
  }

  return versionedResponse.json();
}

function extractArticleUrls(payload) {
  const urls = Array.isArray(payload.urls) ? payload.urls : [];
  return [...new Set(urls)].filter((url) => typeof url === "string" && url.includes("/n/"));
}

function attachToIframe(url) {
  hideFallback();
  articleFrame.src = url;

  const timeoutId = setTimeout(() => {
    showFallback(url, "iframe表示が完了しないため、リンクから開いてください。");
  }, IFRAME_TIMEOUT_MS);

  articleFrame.onload = () => {
    clearTimeout(timeoutId);
  };

  articleFrame.onerror = () => {
    clearTimeout(timeoutId);
    showFallback(url, "iframe表示に失敗したため、リンクから開いてください。");
  };
}

async function showRandomFromUrlsJson() {
  setLoading(true);
  setStatus("記事URLを取得中...");

  try {
    const payload = await fetchUrlsJson();
    const urls = extractArticleUrls(payload);

    if (urls.length === 0) {
      throw new Error("urls.json に /n/ URL がありません（Actions未実行の可能性）");
    }

    const selectedUrl = pickRandom(urls);
    attachToIframe(selectedUrl);
    setStatus(`表示中: ${selectedUrl}`);
  } catch (error) {
    articleFrame.src = "about:blank";
    showFallback("https://note.com", `取得に失敗しました: ${error instanceof Error ? error.message : "unknown"}`);
  } finally {
    setLoading(false);
  }
}
