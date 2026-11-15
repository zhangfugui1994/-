// 初恋资源库 —— 静态渲染逻辑
// 数据源: data/resources.json

const $ = (sel) => document.querySelector(sel);

async function loadResources() {
  try {
    const res = await fetch("data/resources.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    console.error("加载资料失败:", err);
    const catalog = $("#catalog");
    if (catalog) {
      catalog.innerHTML =
        '<p class="empty">资料加载失败:' +
        "请确认页面通过 <strong>HTTP 服务</strong>访问(本地直接用 file:// 打开会因 CORS 无法 fetch)。" +
        "部署到 GitHub / Cloudflare 后此问题不存在。</p>";
    }
    return [];
  }
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderCatalog(items) {
  const catalog = $("#catalog");
  if (!items.length) {
    catalog.innerHTML = '<p class="empty">没有匹配的资料。</p>';
    return;
  }
  catalog.innerHTML = items
    .map((r) => {
      const tags = (r.tags || [])
        .map((t) => `<span class="chip">${escapeHtml(t)}</span>`)
        .join("");
      const cat = r.category
        ? `<span class="chip cat">${escapeHtml(r.category)}</span>`
        : "";
      const summary = escapeHtml(r.summary || "");
      return `
        <article class="card">
          <div class="chips">${cat}${tags}</div>
          <h3><a href="resource.html?id=${encodeURIComponent(r.id)}">${escapeHtml(r.title)}</a></h3>
          <p>${summary}</p>
        </article>`;
    })
    .join("");
}

function renderFilters(items) {
  const select = $("#filter-category");
  const cats = [...new Set(items.map((i) => i.category).filter(Boolean))];
  select.innerHTML =
    `<option value="">全部分类</option>` +
    cats
      .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
      .join("");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---- 列表页 ----
function initListPage() {
  if (!document.getElementById("catalog")) return;
  let all = [];
  const applyFilters = () => {
    const q = ($("#search")?.value || "").trim().toLowerCase();
    const cat = $("#filter-category")?.value || "";
    const filtered = all.filter((r) => {
      const hay = (r.title + " " + (r.summary || "") + " " + (r.tags || []).join(" ") + " " + (r.category || "")).toLowerCase();
      const okCat = !cat || r.category === cat;
      const okQ = !q || hay.includes(q);
      return okCat && okQ;
    });
    renderCatalog(filtered);
  };

  loadResources().then((items) => {
    all = items || [];
    renderFilters(all);
    $("#search").addEventListener("input", applyFilters);
    $("#filter-category").addEventListener("change", applyFilters);
    applyFilters();
  });
}

// ---- 详情页 ----
function initDetailPage() {
  if (!document.getElementById("detail")) return;
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  loadResources().then((items) => {
    const item = (items || []).find((r) => r.id === id);
    const root = $("#detail");
    if (!item) {
      root.innerHTML = `<p class="empty">未找到该资料(id=${escapeHtml(id || "?")})。<a class="back" href="index.html">← 返回列表</a></p>`;
      return;
    }
    document.title = item.title + " · 初恋资源库";
    const tags = (item.tags || []).map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join("");
    const cat = item.category ? `<span class="chip cat">${escapeHtml(item.category)}</span>` : "";
    const body = (item.body || "暂无正文。").split(/\n+/).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    root.innerHTML = `
      <a class="back" href="index.html">← 返回列表</a>
      <h1>${escapeHtml(item.title)}</h1>
      <div class="meta">${cat}${tags}</div>
      <div class="body">${body}</div>`;
  });
}

initListPage();
initDetailPage();
