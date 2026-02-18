const SITEMAP_INDEX_URL = "https://note.com/sitemap.xml.gz";
const TIME_WINDOW_HOURS = 100;
const MAX_SITEMAP_RETRIES = 10;
const IFRAME_LOAD_TIMEOUT_MS = 8000;

const PROXY_VARIANTS = [
  null,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

const randomButton = document.getElementById("randomButton");
const articleFrame = document.getElementById("articleFrame");
const statusEl = document.getElementById("status");
const loadingEl = document.getElementById("loading");
const fallbackEl = document.getElementById("fallback");
const fallbackLink = document.getElementById("fallbackLink");

randomButton.addEventListener("click", () => {
  void loadRandomArticle();
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

function parseXml(xmlText) {
  return new DOMParser().parseFromString(xmlText, "application/xml");
}

function extractChildSitemaps(xmlDoc) {
  return [...xmlDoc.querySelectorAll("sitemap > loc")]
    .map((node) => node.textContent?.trim())
    .filter(Boolean);
}

function extractRecentArticleUrls(xmlDoc, windowHours) {
  const now = Date.now();
  const maxAgeMs = windowHours * 60 * 60 * 1000;

  const urlNodes = [...xmlDoc.querySelectorAll("url")];
  return urlNodes
    .map((urlNode) => {
      const loc = urlNode.querySelector("loc")?.textContent?.trim() ?? "";
      const lastmodText = urlNode.querySelector("lastmod")?.textContent?.trim() ?? "";
      const lastmodMs = Date.parse(lastmodText);
      return { loc, lastmodMs };
    })
    .filter((item) => item.loc.includes("/n/") && Number.isFinite(item.lastmodMs))
    .filter((item) => now - item.lastmodMs <= maxAgeMs)
    .map((item) => item.loc);
}

async function fetchTextWithFallback(url) {
  let lastError = null;

  for (const toProxyUrl of PROXY_VARIANTS) {
    const requestUrl = toProxyUrl ? toProxyUrl(url) : url;

    try {
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          Accept: "application/xml,text/xml,text/plain,*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Fetch failed");
}

function pickRandomFromArray(items) {
  return items[Math.floor(Math.random() * items.length)];
}

async function getRandomRecentArticleUrl() {
  const indexXmlText = await fetchTextWithFallback(SITEMAP_INDEX_URL);
  const indexXml = parseXml(indexXmlText);
  const childSitemaps = extractChildSitemaps(indexXml);

  if (!childSitemaps.length) {
    throw new Error("sitemap index に child sitemap がありません");
  }

  const tried = new Set();

  for (let attempt = 0; attempt < MAX_SITEMAP_RETRIES && tried.size < childSitemaps.length; attempt += 1) {
    const remaining = childSitemaps.filter((url) => !tried.has(url));
    const sitemapUrl = pickRandomFromArray(remaining);
    tried.add(sitemapUrl);

    try {
      const sitemapXmlText = await fetchTextWithFallback(sitemapUrl);
      const sitemapXml = parseXml(sitemapXmlText);
      const candidateUrls = extractRecentArticleUrls(sitemapXml, TIME_WINDOW_HOURS);

      if (candidateUrls.length > 0) {
        return pickRandomFromArray(candidateUrls);
      }
    } catch {
      // child sitemap が壊れていたら再試行
    }
  }

  throw new Error("100時間以内の記事を取得できませんでした");
}

function attachIframeWithFallback(url) {
  articleFrame.src = "about:blank";
  hideFallback();

  return new Promise((resolve) => {
    let done = false;

    const finish = (isEmbedded) => {
      if (done) return;
      done = true;
      articleFrame.onload = null;
      articleFrame.onerror = null;
      resolve(isEmbedded);
    };

    const timerId = setTimeout(() => {
      showFallback(url, "iframe の読み込みに失敗したため、リンク表示へ切り替えました。");
      finish(false);
    }, IFRAME_LOAD_TIMEOUT_MS);

    articleFrame.onload = () => {
      clearTimeout(timerId);
      finish(true);
    };

    articleFrame.onerror = () => {
      clearTimeout(timerId);
      showFallback(url, "iframe 埋め込みが許可されていない可能性があります。");
      finish(false);
    };

    articleFrame.src = url;
  });
}

async function loadRandomArticle() {
  setLoading(true);
  setStatus("ランダム記事を取得中...");

  try {
    const articleUrl = await getRandomRecentArticleUrl();
    const embedded = await attachIframeWithFallback(articleUrl);

    if (embedded) {
      setStatus(`表示中: ${articleUrl}`);
    }
  } catch (error) {
    articleFrame.src = "about:blank";
    showFallback("https://note.com", "取得に失敗しました。時間を置いて再試行してください。");
    setStatus(`エラー: ${error instanceof Error ? error.message : "unknown"}`);
  } finally {
    setLoading(false);
  }
}
