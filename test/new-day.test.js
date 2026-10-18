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

test("草稿让 days.js 最前面多一条新课，原有的课不变", () => {
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

test("上一课的「明天见」变成指向新课的链接，其余一字不动", () => {
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

test("新课页面的标题和分享卡片是新课的，安全设置原样保留", () => {
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

test("新课页面不残留上一课的正文和小工具脚本", () => {
  const { newHtml } = draft();
  // Day 7 的标题只应出现在 pager 的「上一课」里
  assert.equal(newHtml.split("拼出我的第一个 skill").length - 1, 1, "Day 7 的标题出现在 pager 以外");
  assert.ok(!newHtml.includes("拼出我的<br>"), "还有 Day 7 的大标题");
  assert.ok(!newHtml.includes("skill 拼装台"), "还有 Day 7 的小工具");
  assert.ok(!newHtml.includes("const BLOCKS"), "还有 Day 7 的小工具脚本");
  assert.ok(newHtml.includes(`<script src="../assets/site.js"></script>\n</body>`));
});

test("新课的 hero 填好了：第几周按 Day 编号算，主题来自路线图", () => {
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

test("新课的 pager 指向上一课，下一课是「明天见」；面包屑是新课", () => {
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

