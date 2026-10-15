// 共用脚本：导航阴影、滚动淡入、复制提示
(function () {
  const root = document.documentElement;
  root.classList.remove("no-js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) root.classList.add("no-motion");

  // 导航：滚动后出现细分隔线
  const nav = document.querySelector(".nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 滚动淡入
  window.observeReveal = function (scope) {
    const els = (scope || document).querySelectorAll(".reveal:not(.in)");
    if (root.classList.contains("no-motion")) { els.forEach(el => el.classList.add("in")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(el => io.observe(el));
  };
  document.addEventListener("DOMContentLoaded", () => window.observeReveal());

  // 课程页：导航里的“笔记 / 练习 / 工具”随滚动高亮当前版块
  const spy = [...document.querySelectorAll('.nav-links a[href^="#"]')]
    .map(a => [a, document.querySelector(a.getAttribute("href"))]).filter(([, s]) => s);
  if (spy.length && "IntersectionObserver" in window) {
    const so = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        spy.forEach(([a, s]) => a.classList.toggle("active", s === e.target));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    spy.forEach(([, s]) => so.observe(s));
  }

  // ---------- 动效 2.0 ----------
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const motion = !root.classList.contains("no-motion");

  // 卡片跟随鼠标倾斜 + 暖光位置
  if (fine) {
    document.addEventListener("pointermove", e => {
      const card = e.target.closest && e.target.closest(".tile, .showcase");
      document.querySelectorAll(".tilting").forEach(c => { if (c !== card) resetTilt(c); });
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      if (!motion) return;
      const max = card.classList.contains("showcase") ? 3 : 5;
      card.classList.add("tilting");
      card.style.setProperty("--rx", ((0.5 - y) * max).toFixed(2) + "deg");
      card.style.setProperty("--ry", ((x - 0.5) * max).toFixed(2) + "deg");
    }, { passive: true });
    document.addEventListener("pointerleave", () => document.querySelectorAll(".tilting").forEach(resetTilt));
  }
  function resetTilt(c) { c.classList.remove("tilting"); c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); }

  // 点开课程时，让被点的图标“飞”向课程页顶部的大图标
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || !motion) return;
    const g = a.querySelector(".glyph:not(.locked)");
    if (!g) return;
    document.querySelectorAll(".glyph").forEach(x => { if (x !== g && !x.closest(".lesson-hero")) x.style.viewTransitionName = ""; });
    g.style.viewTransitionName = "hero-glyph";
  });
  window.addEventListener("pageshow", () => document.querySelectorAll(".glyph").forEach(x => { if (!x.closest(".lesson-hero")) x.style.viewTransitionName = ""; }));

  // 数字从 0 滚动到目标值
  function countUp(el) {
    const m = el.textContent.match(/^(\d+)(.*)$/);
    if (!m || !motion) return;
    const to = +m[1], suffix = m[2], t0 = performance.now(), dur = 1100;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * k) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = "0" + suffix;
    requestAnimationFrame(step);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // 图标陈列的弹出顺序
    document.querySelectorAll(".dock > *").forEach((el, i) => el.style.setProperty("--i", i));

    const stats = document.querySelectorAll(".stat b");
    if (stats.length && motion) {
      const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(e.target); so.unobserve(e.target); } }), { threshold: 0.6 });
      stats.forEach(s => so.observe(s));
    }

    // 课程页：导航下沿的阅读进度
    if (nav && document.querySelector(".lesson-hero")) {
      const bar = document.createElement("div");
      bar.className = "readbar";
      nav.appendChild(bar);
      let ticking = false;
      const update = () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
        ticking = false;
      };
      addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();
    }
  });

  // 复制到剪贴板 + 轻提示
  window.copyText = async function (text, msg) {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const t = document.createElement("textarea");
      t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch (_) {}
      t.remove();
    }
    let toast = document.querySelector(".toast");
    if (!toast) { toast = document.createElement("div"); toast.className = "toast"; document.body.appendChild(toast); }
    toast.textContent = msg || "已复制，去 Claude 里粘贴吧";
    toast.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  };
})();

// ---------- 3.0：搜索面板、外观切换、代码复制、阅读时长、键盘翻页 ----------
(function () {
  const root = document.documentElement;
  const me = document.currentScript;
  const base = me ? new URL("..", me.src).href : new URL(".", location.href).href; // 网站根目录
  const href = p => new URL(p, base).href;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (_) {} }
  };

  // 课程数据：首页已经加载；其他页面按需加载
  function loadDays(cb) {
    if (window.DAYS) return cb();
    let s = document.querySelector("script[data-days]");
    if (!s) { s = document.createElement("script"); s.src = href("assets/days.js"); s.dataset.days = ""; document.head.appendChild(s); }
    s.addEventListener("load", cb, { once: true });
  }

  // ---- 外观：跟随系统 / 浅色 / 深色 ----
  const THEMES = [["", "跟随系统"], ["light", "浅色"], ["dark", "深色"]];
  const ICONS = {
    "": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><path d="M12 3.8a8.2 8.2 0 0 1 0 16.4z" fill="currentColor" stroke="none"/></svg>',
    light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
    dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
  };
  const SEARCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>';
  const curTheme = () => root.dataset.theme || "";
  function setTheme(t) {
    const apply = () => {
      if (t) root.dataset.theme = t; else delete root.dataset.theme;
      store.set("theme", t || null);
      syncThemeBtn();
    };
    const motion = !root.classList.contains("no-motion");
    if (motion && document.startViewTransition) {
      root.classList.add("theme-switching");
      document.startViewTransition(apply).finished.finally(() => root.classList.remove("theme-switching"));
    } else apply();
    toast("外观：" + THEMES.find(x => x[0] === t)[1]);
  }
  function nextTheme() { const i = THEMES.findIndex(x => x[0] === curTheme()); setTheme(THEMES[(i + 1) % THEMES.length][0]); }
  function syncThemeBtn() {
    const b = document.querySelector(".nav-tool.theme");
    if (!b) return;
    const t = curTheme(), name = THEMES.find(x => x[0] === t)[1];
    b.innerHTML = ICONS[t];
    b.title = b.ariaLabel = "外观：" + name + "（点一下切换）";
  }
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove("show"), 1500);
  }

  // ---- 搜索面板（⌘K / Ctrl K / 斜杠） ----
  let pal, input, list, items = [], sel = 0, lastFocus;
  function buildPalette() {
    pal = document.createElement("div");
    pal.className = "palette";
    pal.hidden = true;
    pal.innerHTML = `
      <div class="palette-scrim" data-close></div>
      <div class="palette-box" role="dialog" aria-modal="true" aria-label="搜索课程和工具">
        <label class="palette-field">${SEARCH}<input type="text" placeholder="搜课程、工具、关键词…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="palette-list"><kbd data-close>esc</kbd></label>
        <ul class="palette-list" id="palette-list" role="listbox"></ul>
        <div class="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>↵</kbd> 打开</span><span><kbd>${isMac ? "⌘" : "Ctrl"}</kbd><kbd>K</kbd> 随时唤出</span></div>
      </div>`;
    document.body.appendChild(pal);
    input = pal.querySelector("input");
    list = pal.querySelector(".palette-list");
    pal.addEventListener("click", e => { if (e.target.closest("[data-close]")) closePalette(); });
    input.addEventListener("input", () => { sel = 0; render(); });
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!items.length) return;
        sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        paintSel();
      } else if (e.key === "Enter") { e.preventDefault(); run(items[sel]); }
      else if (e.key === "Escape") { e.preventDefault(); closePalette(); }
      else if (e.key === "Tab") e.preventDefault();
    });
    list.addEventListener("mousemove", e => {
      const li = e.target.closest("li[data-i]");
      if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; paintSel(false); }
    });
    list.addEventListener("click", e => { const li = e.target.closest("li[data-i]"); if (li) run(items[+li.dataset.i]); });
  }
  function entries() {
    const days = (window.DAYS || []).slice().sort((a, b) => b.day - a.day);
    const weeks = window.WEEKS || [];
    const out = days.map(d => ({
      group: "课程",
      glyph: d.glyph || d.day, grad: d.grad,
      title: d.title, sub: `Day ${d.day}${d.tool ? " · " + d.tool : ""}`,
      text: [d.title, d.summary, d.tool, d.keywords, d.glyph, "day" + d.day, "day " + d.day, "第" + d.day + "天", (weeks.find(w => w.n === d.week) || {}).title].join(" "),
      url: href(d.url)
    }));
    days.filter(d => d.tool).forEach(d => out.push({
      group: "小工具", glyph: d.glyph || d.day, grad: d.grad,
      title: d.tool, sub: `直接打开 · Day ${d.day}`,
      text: [d.tool, d.title, d.keywords, "工具 生成器"].join(" "),
      url: href(d.url) + "#tool"
    }));
    out.push(
      { group: "页面", icon: "⌂", title: "首页", sub: "最新一课和四周路线图", text: "首页 home index", url: href("index.html") },
      { group: "页面", icon: "▦", title: "全部课程", sub: "每一课都有笔记、练习和工具", text: "全部 课程 all", url: href("index.html#all") },
      { group: "页面", icon: "H", title: "关于 Haoyu", sub: "我在学什么，可以帮你做什么", text: "关于 about haoyu 我", url: href("about.html") },
      { group: "设置", icon: "◐", title: "切换外观", sub: "现在：" + THEMES.find(x => x[0] === curTheme())[1], text: "外观 主题 深色 浅色 夜间 dark light theme", action: () => { closePalette(); nextTheme(); } }
    );
    return out;
  }
  function render() {
    const q = input.value.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    items = entries().filter(it => {
      const hay = (it.title + " " + it.sub + " " + (it.text || "")).toLowerCase();
      return terms.every(t => hay.includes(t));
    });
    if (!items.length) {
      list.innerHTML = `<li class="palette-empty">没找到“${esc(input.value.trim())}”。<br>换个词试试，比如“闲鱼”“语气”“提问”。</li>`;
      return;
    }
    let g = "";
    list.innerHTML = items.map((it, i) => {
      const head = it.group !== g ? `<li class="palette-group" role="presentation">${esc(g = it.group)}</li>` : "";
      const ico = it.glyph != null
        ? `<span class="glyph xs" style="${it.grad ? "--g:" + esc(it.grad) : ""}">${esc(it.glyph)}</span>`
        : `<span class="palette-ico">${esc(it.icon)}</span>`;
      return `${head}<li role="option" id="pal-${i}" data-i="${i}">${ico}<span class="palette-txt"><b>${hl(it.title, terms)}</b><small>${hl(it.sub, terms)}</small></span><span class="palette-go">↵</span></li>`;
    }).join("");
    paintSel();
  }
  function hl(s, terms) {
    let h = esc(s);
    terms.forEach(t => { const e = esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); if (e) h = h.replace(new RegExp(e, "gi"), m => `<mark>${m}</mark>`); });
    return h;
  }
  function paintSel(scroll = true) {
    list.querySelectorAll("li[data-i]").forEach(li => li.setAttribute("aria-selected", +li.dataset.i === sel));
    const cur = list.querySelector(`li[data-i="${sel}"]`);
    if (cur) { input.setAttribute("aria-activedescendant", cur.id); if (scroll) cur.scrollIntoView({ block: "nearest" }); }
  }
  function run(it) {
    if (!it) return;
    if (it.action) return it.action();
    const u = new URL(it.url);
    closePalette();
    if (u.pathname === location.pathname && u.hash) { location.hash = u.hash; return; }
    location.href = it.url;
  }
  function openPalette() {
    if (!pal) buildPalette();
    if (!pal.hidden) return;
    lastFocus = document.activeElement;
    loadDays(() => { render(); });
    input.value = ""; sel = 0; render();
    pal.hidden = false;
    document.body.classList.add("palette-open");
    requestAnimationFrame(() => { pal.classList.add("show"); input.focus(); });
  }
  function closePalette() {
    if (!pal || pal.hidden) return;
    pal.classList.remove("show");
    document.body.classList.remove("palette-open");
    const done = () => { pal.hidden = true; };
    root.classList.contains("no-motion") ? done() : setTimeout(done, 180);
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }

  // ---- 导航右侧：搜索 + 外观 ----
  function mountNavTools() {
    const box = document.querySelector(".nav .container");
    if (!box || box.querySelector(".nav-tools")) return;
    const wrap = document.createElement("div");
    wrap.className = "nav-tools";
    wrap.innerHTML = `<button type="button" class="nav-tool search" aria-label="搜索（${isMac ? "⌘" : "Ctrl "}K）" title="搜索（${isMac ? "⌘" : "Ctrl "}K）">${SEARCH}<span class="kbd-hint">${isMac ? "⌘" : "Ctrl "}K</span></button><button type="button" class="nav-tool theme"></button>`;
    box.appendChild(wrap);
    wrap.querySelector(".search").addEventListener("click", openPalette);
    wrap.querySelector(".theme").addEventListener("click", nextTheme);
    syncThemeBtn();
  }

  // ---- 代码块：悬停出现“复制” ----
  function mountCodeCopy() {
    document.querySelectorAll("pre.code").forEach(pre => {
      if (pre.parentElement.classList.contains("code-wrap")) return;
      const wrap = document.createElement("div");
      wrap.className = "code-wrap";
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      if (pre.style.marginTop) { wrap.style.marginTop = pre.style.marginTop; pre.style.marginTop = "0"; }
      const b = document.createElement("button");
      b.type = "button"; b.className = "code-copy"; b.textContent = "复制";
      b.addEventListener("click", () => {
        window.copyText && window.copyText(pre.innerText.trim(), "已复制这段提示词");
        b.textContent = "已复制 ✓"; b.classList.add("done");
        setTimeout(() => { b.textContent = "复制"; b.classList.remove("done"); }, 1600);
      });
      wrap.appendChild(b);
    });
  }

  // ---- 课程页：阅读时长 + 分享 ----
  function mountLessonMeta() {
    const meta = document.querySelector(".lesson-hero .meta");
    const main = document.querySelector("main");
    if (!meta || !main || meta.dataset.enhanced) return;
    meta.dataset.enhanced = "1";
    const text = [...main.querySelectorAll("#learn, #practice")].map(s => s.innerText).join("");
    const cjk = (text.match(/[一-鿿]/g) || []).length;
    const words = (text.replace(/[一-鿿]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;
    const min = Math.max(1, Math.round(cjk / 400 + words / 220));
    meta.insertAdjacentHTML("beforeend", ` · 约 ${min} 分钟读完 · <button type="button" class="share-link">分享这一课</button>`);
    meta.querySelector(".share-link").addEventListener("click", async () => {
      const data = { title: document.title, url: location.href.split("#")[0] };
      if (navigator.share && matchMedia("(pointer: coarse)").matches) { try { await navigator.share(data); } catch (_) {} return; }
      window.copyText && window.copyText(data.url, "链接已复制，发给朋友吧");
    });
  }

  // ---- 键盘：⌘K 搜索，/ 搜索，← → 翻页 ----
  const typing = el => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      pal && !pal.hidden ? closePalette() : openPalette();
      return;
    }
    if (pal && !pal.hidden) return;
    if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "/") { e.preventDefault(); openPalette(); return; }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const links = document.querySelectorAll(".pager a");
      const a = [...links].find(l => (e.key === "ArrowRight") === l.classList.contains("next"));
      if (a) a.click();
    }
  });

  // ---- 手机：底部标签栏（像 iOS App） ----
  const TAB_ICONS = {
    home: '<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    me: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    learn: '<path d="M4 5.5A2 2 0 0 1 6 4h5v16H6a2 2 0 0 0-2 1.5zM20 5.5A2 2 0 0 0 18 4h-5v16h5a2 2 0 0 1 2 1.5z"/>',
    practice: '<path d="M14.5 5.5 18.5 9.5M4 20l1-4.5L15.8 4.7a1.8 1.8 0 0 1 2.5 0l1 1a1.8 1.8 0 0 1 0 2.5L8.5 19z"/>',
    tool: '<path d="M12 3.5 13.9 9l5.6.3-4.4 3.5 1.5 5.5L12 15.2l-4.6 3.1 1.5-5.5-4.4-3.5L10.1 9z"/>'
  };
  function mountTabbar() {
    if (document.querySelector(".tabbar")) return;
    const lesson = document.querySelector(".lesson-hero") && document.getElementById("learn");
    const page = location.pathname.split("/").pop() || "index.html";
    const tabs = lesson
      ? [["home", "首页", href("index.html")], ["learn", "笔记", "#learn"], ["practice", "练习", "#practice"], ["tool", "工具", "#tool"], ["search", "搜索"]]
      : [["home", "首页", href("index.html"), page === "index.html"], ["grid", "课程", href("index.html#all")], ["search", "搜索"], ["me", "关于", href("about.html"), page === "about.html"]];
    const bar = document.createElement("nav");
    bar.className = "tabbar";
    bar.setAttribute("aria-label", "快捷导航");
    bar.innerHTML = tabs.map(([k, label, url, cur]) => {
      const ico = `<svg viewBox="0 0 24 24" aria-hidden="true">${TAB_ICONS[k]}</svg>`;
      return url
        ? `<a href="${esc(url)}" data-tab="${k}"${cur ? ' aria-current="page"' : ""}>${ico}<span>${label}</span></a>`
        : `<button type="button" data-tab="${k}">${ico}<span>${label}</span></button>`;
    }).join("");
    document.body.appendChild(bar);
    bar.querySelector('[data-tab="search"]').addEventListener("click", openPalette);

    // 课程页：标签随滚动高亮
    const spy = [...bar.querySelectorAll('a[href^="#"]')].map(a => [a, document.querySelector(a.getAttribute("href"))]).filter(([, s]) => s);
    if (spy.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) spy.forEach(([a, s]) => a.classList.toggle("active", s === e.target));
      }), { rootMargin: "-45% 0px -50% 0px" });
      spy.forEach(([, s]) => io.observe(s));
    }
  }

  // ---- 手机：做工具时，底部浮出“复制提示词” ----
  function mountFabCopy() {
    const tool = document.getElementById("tool"), copy = document.getElementById("copy");
    if (!tool || !copy || !("IntersectionObserver" in window)) return;
    const fab = document.createElement("button");
    fab.type = "button"; fab.className = "fab-copy";
    fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>复制提示词';
    fab.addEventListener("click", () => copy.click());
    document.body.appendChild(fab);
    let inTool = false, copyVisible = false;
    const sync = () => fab.classList.toggle("show", inTool && !copyVisible);
    new IntersectionObserver(es => { inTool = es[0].isIntersecting; sync(); }, { rootMargin: "-30% 0px -20% 0px" }).observe(tool);
    new IntersectionObserver(es => { copyVisible = es[0].isIntersecting; sync(); }).observe(copy);
  }

  // 手机上打字时（键盘弹出），收起底部栏，免得挡住输入框
  document.addEventListener("focusin", e => { if (typing(e.target) && !e.target.closest(".palette")) document.body.classList.add("typing"); });
  document.addEventListener("focusout", () => document.body.classList.remove("typing"));

  const init = () => { mountNavTools(); mountCodeCopy(); mountLessonMeta(); mountTabbar(); mountFabCopy(); };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
