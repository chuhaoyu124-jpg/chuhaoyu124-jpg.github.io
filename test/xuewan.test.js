// 「学完记录」模块的测试：只通过对外接口检查行为。运行：npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const { createXuewan } = require("../assets/xuewan.js");

// 内存假存储，接口和网站里的 localStorage 包装一样：get / set
function memoryStore() {
  const data = {};
  return {
    get: k => (k in data ? data[k] : null),
    set: (k, v) => { v == null ? delete data[k] : (data[k] = v); }
  };
}

test("还没标记过的课不算学完", () => {
  const xuewan = createXuewan(memoryStore());
  assert.equal(xuewan.isLearned(7), false);
});

test("切换一次变成学完，再切换一次取消", () => {
  const xuewan = createXuewan(memoryStore());
  assert.equal(xuewan.toggle(7), true);
  assert.equal(xuewan.isLearned(7), true);
  assert.equal(xuewan.toggle(7), false);
  assert.equal(xuewan.isLearned(7), false);
});

test("刷新页面后学完记录还在", () => {
  const store = memoryStore();
  createXuewan(store).toggle(7);
  const afterReload = createXuewan(store);
  assert.equal(afterReload.isLearned(7), true);
});

test("每课分别标记，互不影响", () => {
  const xuewan = createXuewan(memoryStore());
  xuewan.toggle(3);
  xuewan.toggle(7);
  xuewan.toggle(3);
  assert.equal(xuewan.isLearned(3), false);
  assert.equal(xuewan.isLearned(7), true);
  assert.equal(xuewan.isLearned(5), false);
});

test("浏览器存储不能用时不报错，当作没学完", () => {
  const broken = {
    get() { throw new Error("SecurityError"); },
    set() { throw new Error("QuotaExceededError"); }
  };
  const xuewan = createXuewan(broken);
  assert.equal(xuewan.isLearned(7), false);
  assert.doesNotThrow(() => xuewan.toggle(7));
});

test("存的记录损坏时当作空的", () => {
  for (const bad of ["不是 JSON", '{"7":true}', "7", "null"]) {
    const store = memoryStore();
    store.set("xuewan", bad);
    const xuewan = createXuewan(store);
    assert.equal(xuewan.isLearned(7), false, `存的是 ${bad}`);
    assert.equal(xuewan.toggle(7), true, `存的是 ${bad}`);
  }
});

test("写不进浏览器时撤回这次标记，不假装学完了", () => {
  const readOnly = memoryStore();
  readOnly.set = () => { throw new Error("QuotaExceededError"); };
  const xuewan = createXuewan(readOnly);
  assert.equal(xuewan.toggle(7), false);
  assert.equal(xuewan.isLearned(7), false);
});
