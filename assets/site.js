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
