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
