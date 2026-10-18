// 已更新的课里不能有【待写】：有草稿没写完时这条会失败，提醒先别推送。运行：npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { countTodo } = require("../scripts/draft.js");

const ROOT = path.join(__dirname, "..");

test("已更新的课里没有【待写】（草稿写完才能推送）", () => {
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "assets", "days.js"), "utf8"), { window });
  const drafts = JSON.parse(JSON.stringify(window.DAYS))
    .map(d => ({ day: d.day, url: d.url, todo: countTodo(fs.readFileSync(path.join(ROOT, d.url), "utf8")) }))
    .filter(d => d.todo > 0);
  assert.deepEqual(
    drafts.map(d => `Day ${d.day}（${d.url}）还有 ${d.todo} 处【待写】`),
    [],
    "还有草稿没写完"
  );
});
