// 「新课一键生成」的测试：只通过 createDraft 的输入输出检查行为。运行：npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createDraft } = require("../scripts/draft.js");

const ROOT = path.join(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");

// 用仓库里真实的 days.js 和课页面当输入
function draft(fields = {}, today = "2026-10-19") {
  return createDraft({
    daysJs: read("assets/days.js"),
    readLesson: read,
    fields: { title: "让 Claude Code 帮我建文件夹", summary: "一句话总结。", glyph: "建", tool: "文件夹提示词", ...fields },
    today
  });
}

// 执行 days.js，取出 DAYS / WEEKS
function runDays(js) {
  const window = {};
  vm.runInNewContext(js, { window });
  return JSON.parse(JSON.stringify(window));
}

test("草稿让 days.js 最前面多一课，原有的课不变", () => {
  const before = runDays(read("assets/days.js")).DAYS;
  const { DAYS } = runDays(draft({ keywords: "文件夹 终端" }).daysJs);
  assert.deepEqual(DAYS[0], {
    day: 8,
    keywords: "文件夹 终端",
    date: "2026-10-19",
    week: 2,
    title: "让 Claude Code 帮我建文件夹",
    summary: "一句话总结。",
    tool: "文件夹提示词",
    glyph: "建",
    url: "days/day-08.html"
  });
  assert.deepEqual(DAYS.slice(1), before);
});

test("上一课的「明天见」变成指向这一课草稿的链接，其余一字不动", () => {
  const before = read("days/day-07.html");
  const { prevHtml } = draft();
  assert.equal(
    prevHtml,
    before.replace(
      '<span class="next"><small>下一课 · Day 8</small><b>明天见</b></span>',
      '<a class="next" href="day-08.html"><small>下一课 · Day 8</small><b>让 Claude Code 帮我建文件夹 ›</b></a>'
    )
  );
  assert.notEqual(prevHtml, before);
});

test("草稿页面的标题和分享卡片是这一课的，安全设置原样保留", () => {
  const { newHtml } = draft();
  const full = "Day 8 · 让 Claude Code 帮我建文件夹 · Haoyu 的 AI 工具箱";
  assert.match(newHtml, new RegExp(`<title>${full}</title>`));
  assert.ok(newHtml.includes(`<meta name="description" content="一句话总结。">`));
  assert.ok(newHtml.includes(`<meta property="og:title" content="${full}">`));
  assert.ok(newHtml.includes(`<meta property="og:description" content="一句话总结。">`));
  assert.ok(newHtml.includes(`<meta property="og:url" content="https://chuhaoyu124-jpg.github.io/days/day-08.html">`));
  assert.ok(newHtml.includes(`<meta http-equiv="Content-Security-Policy" content="default-src 'self';`));
  assert.ok(newHtml.includes(`<meta name="referrer" content="strict-origin-when-cross-origin">`));
});

test("草稿页面不残留上一课的正文和小工具脚本", () => {
  const { newHtml } = draft();
  // Day 7 的标题只应出现在 pager 的「上一课」里
  assert.equal(newHtml.split("拼出我的第一个 skill").length - 1, 1, "Day 7 的标题出现在 pager 以外");
  assert.ok(!newHtml.includes("拼出我的<br>"), "还有 Day 7 的大标题");
  assert.ok(!newHtml.includes("skill 拼装台"), "还有 Day 7 的小工具");
  assert.ok(!newHtml.includes("const BLOCKS"), "还有 Day 7 的小工具脚本");
  assert.ok(newHtml.includes(`<script src="../assets/site.js"></script>\n</body>`));
});

test("草稿的 hero 填好了：第几周按 Day 编号算，主题来自路线图", () => {
  const { newHtml } = draft();
  assert.ok(newHtml.includes(`<div class="glyph reveal">建</div>`));
  assert.ok(newHtml.includes(`<span class="eyebrow reveal d1">Day 8 · Claude Code 与图片</span>`));
  assert.ok(newHtml.includes(`<h1 class="headline reveal d1">让 Claude Code 帮我建文件夹。</h1>`));
  assert.ok(newHtml.includes(`<p class="lead reveal d2">一句话总结。</p>`));
  assert.ok(newHtml.includes(`<p class="meta reveal d3">2026 年 10 月 19 日 · 第 2 周</p>`));
});

test("填了渐变才给图标写渐变", () => {
  const grad = "linear-gradient(135deg, #fff 0%, #000 100%)";
  const { newHtml, daysJs } = draft({ grad });
  assert.ok(newHtml.includes(`<div class="glyph reveal" style="--g:${grad}">建</div>`));
  assert.equal(runDays(daysJs).DAYS[0].grad, grad);
});

test("没填渐变和搜索词时，days.js 里不写这两项", () => {
  const { DAYS } = runDays(draft().daysJs);
  assert.ok(!("grad" in DAYS[0]));
  assert.ok(!("keywords" in DAYS[0]));
});

test("三个手写版块只留骨架和【待写】", () => {
  const { newHtml } = draft();
  for (const id of ["learn", "practice", "tool"]) {
    const section = newHtml.match(new RegExp(`<section class="section[^"]*" id="${id}">[\\s\\S]*?</section>`));
    assert.ok(section, `缺少 #${id} 版块`);
    assert.ok(section[0].includes("【待写】"), `#${id} 里没有【待写】`);
  }
  assert.ok(newHtml.includes(`<h2 class="title reveal d1">文件夹提示词。</h2>`));
});

test("草稿的 pager 指向上一课，下一课是「明天见」；面包屑是这一课", () => {
  const { newHtml } = draft();
  assert.ok(newHtml.includes(`<a href="day-07.html"><small>上一课 · Day 7</small><b>‹ 拼出我的第一个 skill</b></a>`));
  assert.ok(newHtml.includes(`<span class="next"><small>下一课 · Day 9</small><b>明天见</b></span>`));
  assert.ok(newHtml.includes(`<span class="sep">›</span><span>Day 8 · 让 Claude Code 帮我建文件夹</span>`));
});

test("标题里有特殊字符时，页面和 days.js 都正确", () => {
  const title = `"<AI> & 我" 花了 $5`;
  const { newHtml, daysJs, prevHtml } = draft({ title });
  const html = "&quot;&lt;AI&gt; &amp; 我&quot; 花了 $5";
  assert.ok(newHtml.includes(`<h1 class="headline reveal d1">${html}。</h1>`));
  assert.ok(newHtml.includes(`<title>Day 8 · ${html} · Haoyu 的 AI 工具箱</title>`));
  assert.ok(prevHtml.includes(`<b>${html} ›</b>`));
  assert.equal(runDays(daysJs).DAYS[0].title, title);
});

// ---- 出错时拒绝（ticket 02）----

test("缺了必填项就拒绝，并说出缺哪一项", () => {
  for (const key of ["title", "summary", "glyph", "tool"]) {
    assert.throws(() => draft({ [key]: undefined }), new RegExp(`--${key}`), `缺 ${key} 没有拒绝`);
    assert.throws(() => draft({ [key]: "  " }), new RegExp(`--${key}`), `${key} 只有空格没有拒绝`);
  }
});

test("图标不是一个字就拒绝", () => {
  assert.throws(() => draft({ glyph: "建文" }), /一个字/);
  assert.doesNotThrow(() => draft({ glyph: "🗂" }));
});

test("days.js 里已经有这一课就拒绝", () => {
  assert.throws(() => draft({ day: 7 }), /Day 7 已经在 days\.js 里/);
});

test("Day 编号跳号就拒绝", () => {
  assert.throws(() => draft({ day: 9 }), /应该是 Day 8/);
});

test("超出四周计划就拒绝，提示先在路线图里加一周", () => {
  const js = read("assets/days.js").replace(/day: 7,/, "day: 28,");
  const readLesson = rel => read(rel).replace("下一课 · Day 8", "下一课 · Day 29");
  assert.throws(
    () => createDraft({ daysJs: js, readLesson, fields: { title: "t", summary: "s", glyph: "字", tool: "x" }, today: "2026-11-08" }),
    /Day 29 超出了路线图.*WEEKS/
  );
});

test("上一课找不到「明天见」就拒绝", () => {
  const readLesson = rel => read(rel).replace("<b>明天见</b>", "<b>后天见</b>");
  assert.throws(
    () => createDraft({ daysJs: read("assets/days.js"), readLesson, fields: { title: "t", summary: "s", glyph: "字", tool: "x" }, today: "2026-10-19" }),
    /days\/day-07\.html.*明天见/
  );
});

test("日期不是真实的 YYYY-MM-DD 就拒绝", () => {
  for (const date of ["2026/10/19", "2026-13-45", "2026-02-30", "明天", "2026-1-9"]) {
    assert.throws(() => draft({ date }), /--date/, `${date} 没有拒绝`);
  }
  assert.doesNotThrow(() => draft({ date: "2026-10-20" }));
});

test("Day 编号不是正整数就拒绝", () => {
  for (const day of ["abc", "8.0", "8.5", "-8", ""]) {
    assert.throws(() => draft({ day }), /--day 要写成正整数/, `「${day}」没有拒绝`);
  }
  assert.doesNotThrow(() => draft({ day: "8" }));
});

test("带肤色或组合的 emoji 也算一个字", () => {
  for (const glyph of ["👍🏽", "👨‍👩‍👧", "🇩🇪"]) {
    assert.doesNotThrow(() => draft({ glyph }), `${glyph} 被拒绝了`);
  }
  assert.throws(() => draft({ glyph: "👍👍" }), /一个字/);
});
