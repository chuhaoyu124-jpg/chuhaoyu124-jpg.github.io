// 「新课一键生成」命令行的冒烟测试：在临时文件夹里放一份仓库副本跑命令。运行：npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const CLI = path.join(ROOT, "scripts", "new-day.js");

// 临时仓库副本：只需要 days.js 和全部课页面
function tempRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "new-day-"));
  fs.cpSync(path.join(ROOT, "assets", "days.js"), path.join(dir, "assets", "days.js"));
  fs.cpSync(path.join(ROOT, "days"), path.join(dir, "days"), { recursive: true });
  return dir;
}

const run = (dir, args) => spawnSync(process.execPath, [CLI, ...args], { cwd: dir, encoding: "utf8" });
const ARGS = ["--title", "让 Claude Code 帮我建文件夹", "--summary", "一句话总结。", "--glyph", "建", "--tool", "文件夹提示词", "--date", "2026-10-19"];

test("跑一次命令就生成草稿：新建草稿页面，改 days.js 和上一课", () => {
  const dir = tempRepo();
  const result = run(dir, ARGS);
  assert.equal(result.status, 0, result.stderr);
  const page = fs.readFileSync(path.join(dir, "days", "day-08.html"), "utf8");
  assert.ok(page.includes("<title>Day 8 · 让 Claude Code 帮我建文件夹 · Haoyu 的 AI 工具箱</title>"));
  assert.ok(fs.readFileSync(path.join(dir, "assets", "days.js"), "utf8").includes('url: "days/day-08.html"'));
  assert.ok(fs.readFileSync(path.join(dir, "days", "day-07.html"), "utf8").includes('<a class="next" href="day-08.html">'));
  assert.match(result.stdout, /days\/day-08\.html/);
  assert.match(result.stdout, /还剩 \d+ 处【待写】/);
  assert.match(result.stdout, /keywords/);
});

test("草稿页面已经存在时拒绝，三个文件都不改", () => {
  const dir = tempRepo();
  const files = ["days/day-08.html", "assets/days.js", "days/day-07.html"].map(f => path.join(dir, f));
  fs.writeFileSync(files[0], "写了一半的草稿");
  const before = files.map(f => fs.readFileSync(f, "utf8"));
  const result = run(dir, ARGS);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /days\/day-08\.html 已经存在/);
  assert.deepEqual(files.map(f => fs.readFileSync(f, "utf8")), before);
});

test("规则不通过时（比如缺了标题）三个文件都不改", () => {
  const dir = tempRepo();
  const files = ["assets/days.js", "days/day-07.html"].map(f => path.join(dir, f));
  const before = files.map(f => fs.readFileSync(f, "utf8"));
  const result = run(dir, ARGS.slice(2));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--title/);
  assert.deepEqual(files.map(f => fs.readFileSync(f, "utf8")), before);
  assert.ok(!fs.existsSync(path.join(dir, "days", "day-08.html")));
});

test("写到一半失败时撤回：已写的文件恢复原样，草稿页面也删掉", () => {
  const dir = tempRepo();
  const files = ["assets/days.js", "days/day-07.html"].map(f => path.join(dir, f));
  const before = files.map(f => fs.readFileSync(f, "utf8"));
  fs.chmodSync(files[1], 0o444); // 上一课是最后写的，让它写不进去
  const result = run(dir, ARGS);
  fs.chmodSync(files[1], 0o644);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /已撤回/);
  assert.deepEqual(files.map(f => fs.readFileSync(f, "utf8")), before);
  assert.ok(!fs.existsSync(path.join(dir, "days", "day-08.html")));
});
