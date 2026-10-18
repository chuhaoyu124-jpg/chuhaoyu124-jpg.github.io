#!/usr/bin/env node
// 新课一键生成：npm run new-day -- --title "…" --summary "…" --glyph 字 --tool "…"
// 只改本地文件，不做任何 git 操作。生成的规则见 draft.js 和 README「每天新增一课」
const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");
const { createDraft, countTodo } = require("./draft.js");

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

// 今天的本地日期，YYYY-MM-DD
function today() {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(n => String(n).padStart(2, "0")).join("-");
}

function main() {
  const { values } = parseArgs({
    options: Object.fromEntries(
      ["title", "summary", "glyph", "tool", "grad", "keywords", "day", "date"].map(k => [k, { type: "string" }])
    )
  });
  const draft = createDraft({ daysJs: read("assets/days.js"), readLesson: read, fields: values, today: today() });

  // 不覆盖写了一半的草稿；三个文件都算好之后才开始写
  if (fs.existsSync(path.join(root, draft.newFile))) throw new Error(`${draft.newFile} 已经存在，不会覆盖它`);
  const write = (rel, text) => fs.writeFileSync(path.join(root, rel), text);
  // 三个文件要么都写上，要么都不改：中途写失败就把已写的恢复原样
  const originals = { "assets/days.js": read("assets/days.js"), [draft.prevFile]: read(draft.prevFile) };
  try {
    write(draft.newFile, draft.newHtml);
    write("assets/days.js", draft.daysJs);
    write(draft.prevFile, draft.prevHtml);
  } catch (err) {
    fs.rmSync(path.join(root, draft.newFile), { force: true });
    for (const [rel, text] of Object.entries(originals)) {
      try { write(rel, text); } catch (_) { /* 本来就没写进去的文件，内容没变 */ }
    }
    throw new Error(`写文件时出错，已撤回，三个文件都没改（${err.message}）`);
  }

  const todo = countTodo(draft.newHtml);
  console.log(`已生成草稿：
  新建 ${draft.newFile}
  修改 assets/days.js（最前面加了一条）
  修改 ${draft.prevFile}（「明天见」改成了链接）

${draft.newFile} 里还剩 ${todo} 处【待写】。写完后跑 npm test，变绿了再推送。`);
  if (!values.keywords) console.log("没填 --keywords，搜索时可能搜不到这一课。");
}

try {
  main();
} catch (err) {
  console.error(`没有生成草稿：${err.message}`);
  process.exit(1);
}
