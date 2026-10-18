// 每一页都必须遵守的规则（来源：README「每天新增一课」）。机械规则交给测试，审查只管需要判断的事。
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const pages = ["index.html", "about.html", "404.html"]
  .concat(fs.readdirSync(path.join(root, "days")).filter(f => f.endsWith(".html")).map(f => `days/${f}`));

// 返回违反规则的页面列表，方便一眼看出是哪一页
const offenders = check => pages.filter(p => check(fs.readFileSync(path.join(root, p), "utf8")));

test("每一页都保留 Content-Security-Policy 和 referrer 两行 meta", () => {
  assert.deepEqual(offenders(html => !/<meta http-equiv="Content-Security-Policy"/.test(html)), [], "缺 CSP meta");
  assert.deepEqual(offenders(html => !/<meta name="referrer"/.test(html)), [], "缺 referrer meta");
});

test("链接不写成 ./ 或 ../（双击打开文件时会变成文件夹列表）", () => {
  assert.deepEqual(offenders(html => /href="\.{1,2}\/"/.test(html)), []);
});

test("不引用外部网址的脚本或样式", () => {
  assert.deepEqual(offenders(html => /<script[^>]+src="(https?:)?\/\//.test(html)), [], "外部脚本");
  assert.deepEqual(offenders(html => /<link[^>]+rel="stylesheet"[^>]+href="(https?:)?\/\//.test(html)), [], "外部样式");
});
