// 学完记录：读者给哪几课标了「学完」。只管记录，不碰页面。
// 浏览器里是 window.Xuewan；Node 测试里用 require。
(function (root) {
  const KEY = "xuewan";

  function load(store) {
    try {
      const days = JSON.parse(store.get(KEY));
      return Array.isArray(days) ? days.filter(Number.isInteger) : [];
    } catch (_) { return []; }
  }

  function createXuewan(store) {
    const learned = new Set(load(store));
    return {
      isLearned: day => learned.has(day),
      // 学完数只算已更新的课，所以不会超过已更新数
      count: updatedDays => ({ learned: updatedDays.filter(d => learned.has(d)).length, total: updatedDays.length }),
      // 返回切换后的状态；存不进去就撤回，返回值和切换前一样
      toggle(day) {
        const flip = () => learned.has(day) ? learned.delete(day) : learned.add(day);
        flip();
        try { store.set(KEY, JSON.stringify([...learned])); } catch (_) { flip(); }
        return learned.has(day);
      }
    };
  }

  // 浏览器里用的存储：读不到就当没有；写失败要抛出来，toggle 才知道该撤回
  const browserStore = {
    get: k => { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set: (k, v) => localStorage.setItem(k, v)
  };

  const api = { createXuewan, browserStore };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Xuewan = api;
})(this);
