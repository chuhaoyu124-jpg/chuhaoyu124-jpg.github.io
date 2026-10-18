// 新课一键生成：根据最新一课生成下一课的草稿。纯函数，不读写文件，命令行入口见 new-day.js
const vm = require("node:vm");

const SITE = "https://chuhaoyu124-jpg.github.io";
const TODO = "【待写】";

function loadDays(daysJs) {
  const window = {};
  vm.runInNewContext(daysJs, { window });
  return { days: window.DAYS, weeks: window.WEEKS };
}

const pad = n => String(n).padStart(2, "0");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// 2026-10-19 → 2026 年 10 月 19 日
function chineseDate(date) {
  const [y, m, d] = date.split("-").map(Number);
  return `${y} 年 ${m} 月 ${d} 日`;
}

// days.js 新的一条，字段顺序和现有条目一致；没填的字段不写
function daysEntry(entry) {
  const lines = Object.entries(entry)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`);
  return `  {\n${lines.join(",\n")}\n  },\n`;
}

// 草稿页面 <main> 里的内容：hero 填好，三个版块是骨架 + 【待写】，最后是 pager
function lessonMain({ day, week, theme, date, title, summary, glyph, grad, tool, prev }) {
  const style = grad ? ` style="--g:${esc(grad)}"` : "";
  return `
    <!-- ① 标题 -->
    <section class="lesson-hero">
      <div class="container narrow">
        <div class="glyph reveal"${style}>${esc(glyph)}</div>
        <span class="eyebrow reveal d1">Day ${day} · ${esc(theme)}</span>
        <h1 class="headline reveal d1">${esc(title)}。</h1>
        <p class="lead reveal d2">${esc(summary)}</p>
        <div class="links reveal d3"><a href="#practice">看我的练习</a><a href="#tool">直接用工具</a></div>
        <p class="meta reveal d3">${chineseDate(date)} · 第 ${week} 周</p>
      </div>
    </section>

    <!-- ② 今天学了什么 -->
    <section class="section alt" id="learn">
      <div class="container wide">
        <span class="chapter-label center reveal">今天学了什么</span>
        <p class="statement reveal d1">${TODO}<br><span class="dim">${TODO}</span></p>
        <p class="pull reveal">${TODO}</p>

        <div class="features"><div class="feature reveal"><span class="k">01</span><h4>${TODO}</h4><p>${TODO}</p></div><div class="feature hl reveal d1"><span class="k">02</span><h4>${TODO}</h4><p>${TODO}</p></div></div>
      </div>
    </section>

    <!-- ③ 我的练习 -->
    <section class="section" id="practice">
      <div class="container wide">
        <div class="center">
          <span class="chapter-label reveal">我的练习</span>
          <h2 class="title reveal d1">${TODO}</h2>
          <p class="lead reveal d2">${TODO}</p>
        </div>

        <div class="result-card reveal" style="margin-top:56px">
          <span class="label">我对 AI 说</span>
          <pre class="code">${TODO}</pre>
        </div>

        <article class="result-card reveal">
          <span class="label">它的输出</span>
          <p>${TODO}</p>
        </article>
      </div>
    </section>

    <!-- ④ 小工具 -->
    <section class="section alt" id="tool">
      <div class="container wide">
        <div class="center">
          <span class="chapter-label reveal">今天的小工具</span>
          <h2 class="title reveal d1">${esc(tool)}。</h2>
          <p class="lead reveal d2">${TODO}</p>
        </div>

        <div class="studio">
          <div class="panel-card reveal">
            <div class="field">
              <label for="f-input"><span>${TODO}</span></label>
              <textarea id="f-input" rows="4"></textarea>
            </div>
          </div>

          <div class="panel-card preview reveal d1">
            <h3>${TODO}</h3>
            <textarea id="out" class="output" rows="12" readonly></textarea>
            <div class="row">
              <button class="btn" id="copy">复制</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section tight">
      <div class="container">
        <nav class="pager">
          <a href="day-${pad(prev.day)}.html"><small>上一课 · Day ${prev.day}</small><b>‹ ${esc(prev.title)}</b></a>
          <span class="next"><small>下一课 · Day ${day + 1}</small><b>明天见</b></span>
        </nav>
      </div>
    </section>
  `;
}

// 2026-10-19 这种格式，而且日历上真有这一天
function isRealDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

// 会把网站弄乱的输入一律拒绝：抛出带中文说明的错误，调用方据此什么文件都不写
function check(fields, days, weeks) {
  for (const key of ["title", "summary", "glyph", "tool"]) {
    if (!fields[key] || !String(fields[key]).trim()) throw new Error(`缺少 --${key}`);
  }
  if ([...fields.glyph.trim()].length !== 1) throw new Error(`--glyph 只能是一个字，现在是「${fields.glyph}」`);

  if (fields.date !== undefined && !isRealDate(fields.date)) throw new Error(`--date 要写成真实的日期，比如 2026-10-19，现在是「${fields.date}」`);

  const next = days[0].day + 1;
  if (fields.day !== undefined && !/^[1-9]\d*$/.test(String(fields.day))) throw new Error(`--day 要写成正整数，现在是「${fields.day}」`);
  const day = fields.day === undefined ? next : Number(fields.day);
  if (days.some(d => d.day === day)) throw new Error(`Day ${day} 已经在 days.js 里了`);
  if (day !== next) throw new Error(`最新一课是 Day ${days[0].day}，下一课应该是 Day ${next}，不能是 Day ${day}`);
  const planned = weeks.reduce((sum, w) => sum + w.days, 0);
  if (day > planned) throw new Error(`Day ${day} 超出了路线图（共 ${planned} 课），先在 days.js 的 WEEKS 里加一周`);
  return day;
}

function createDraft({ daysJs, readLesson, fields: raw, today }) {
  const { days, weeks } = loadDays(daysJs);
  const latest = days[0];
  const day = check(raw, days, weeks);
  const fields = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));
  const week = Math.ceil(day / 7);
  const date = fields.date || today;
  const file = `day-${pad(day)}.html`;
  const { title, summary, glyph, tool, grad, keywords } = fields;

  const entry = { day, keywords, date, week, title, summary, tool, glyph, grad, url: `days/${file}` };
  const marker = "window.DAYS = [\n";
  const newDaysJs = daysJs.replace(marker, () => marker + daysEntry(entry));

  const latestHtml = readLesson(latest.url);
  const fullTitle = `Day ${day} · ${esc(title)} · Haoyu 的 AI 工具箱`;
  const theme = weeks.find(w => w.n === week).title;
  // 用函数做替换，标题里有 $ 也不会被当成替换模式
  const put = (re, value) => html => html.replace(re, (_, a, b) => a + value + b);
  const steps = [
    put(/(<title>)[^<]*(<\/title>)/, fullTitle),
    put(/(<meta name="description" content=")[^"]*(">)/, esc(summary)),
    put(/(<meta property="og:title" content=")[^"]*(">)/, fullTitle),
    put(/(<meta property="og:description" content=")[^"]*(">)/, esc(summary)),
    put(/(<meta property="og:url" content=")[^"]*(">)/, `${SITE}/days/${file}`),
    put(/(<main>)[\s\S]*(<\/main>)/, lessonMain({ day, week, theme, date, title, summary, glyph, grad, tool, prev: latest })),
    put(/(<span class="sep">›<\/span><span>)[^<]*(<\/span>)/, `Day ${day} · ${esc(title)}`),
    put(/(<script src="\.\.\/assets\/site\.js"><\/script>)[\s\S]*(<\/body>)/, "\n")
  ];
  const newHtml = steps.reduce((html, step) => step(html), latestHtml);

  const tomorrow = `<span class="next"><small>下一课 · Day ${day}</small><b>明天见</b></span>`;
  if (!latestHtml.includes(tomorrow)) throw new Error(`${latest.url} 的 pager 里找不到「下一课 · Day ${day} 明天见」`);
  const prevHtml = latestHtml.replace(
    tomorrow,
    () => `<a class="next" href="${file}"><small>下一课 · Day ${day}</small><b>${esc(title)} ›</b></a>`
  );

  return { daysJs: newDaysJs, newHtml, prevHtml, newFile: `days/${file}`, prevFile: latest.url };
}

module.exports = { createDraft };
