# 01: 一条命令生成草稿（主路径）

**What to build:** Haoyu 运行 `npm run new-day`，只填标题、一句话总结、图标字和小工具名，就得到下一课的**草稿**：新课页面以最新一课为底，head、hero、pager、面包屑都换成新课的信息，三个手写版块只剩骨架和【待写】；days.js 最前面多一条新课；上一课 pager 的「明天见」变成指向新课的链接。脚本不做任何 git 操作，结尾打印清单。背后是一个不读写文件的纯函数模块，配 Node 测试。

**Blocked by:** None（can start immediately）

**Status:** done

- [x] 纯函数模块对外只有一个函数：输入最新一课页面、days.js 文本、字段、今天日期，返回新页面、新 days.js、改好的上一课页面三段字符串
- [x] 很薄的命令行入口：解析参数、读文件、调用模块、三段都成功后才写入，零依赖 CommonJS；`package.json` 加 `new-day` 脚本
- [x] 必填 `--title` `--summary` `--glyph` `--tool`；选填 `--grad` `--keywords` `--day` `--date`；day 默认最新一课 +1，date 默认今天（本地日期），week = ceil(day / 7)，当周主题取自 `WEEKS`
- [x] 新页面 head：`<title>`、description、og:title、og:description、og:url 都是新课的；CSP、referrer、外观脚本等其它 meta 原样保留
- [x] 新页面 hero：图标字（填了 grad 才写 `--g`）、eyebrow「Day N · 当周主题」、大标题 = 标题 +「。」、lead = 一句话总结、日期行「YYYY 年 M 月 D 日 · 第 N 周」
- [x] 三个版块 id 为 learn / practice / tool，结构和 class 与 README 一致，各附一份最小写法示例，文字为【待写】；上一课的正文和内联小工具脚本不残留，全站脚本引用保留
- [x] 新页面 pager：上一课链接「‹ 上一课标题」+ 下一课「明天见」；页脚面包屑「Day N · 标题」
- [x] days.js：新条目文本插在 `window.DAYS = [` 之后，字段顺序与现有条目一致，字符串 JSON 转义；不填 grad / keywords 时不写该字段；文件其余部分一字不动
- [x] 上一课：只把 pager 里的「明天见」换成指向新课的链接「标题 ›」（写法同 Day 6 → Day 7），其余一字不动
- [x] 写进 HTML 的字段做 HTML 转义
- [x] 结尾打印：新建了哪个文件、改了哪两个文件、新页面还剩几处【待写】；没填 keywords 时提醒一句
- [x] 测试（纯函数，用真实 Day 7 页面和 days.js）：新页面信息正确且不含 Day 7 标题和小工具脚本；三个版块和【待写】都在；grad 有无对应 `--g` 有无；Day 8 → 第 2 周「Claude Code 与图片」；新 days.js 可执行、`DAYS[0]` 字段正确、原有各课不变；上一课只改了「明天见」；标题含 `<` `&` 引号时 HTML 和 days.js 都正确
- [x] 命令行冒烟测试：在临时文件夹的仓库副本里跑一次，三个文件都被正确写入

## Comments

- 2026-10-18 已实现（分支 `xin-ke-yi-jian-sheng-cheng`）。模块是 `createDraft({ daysJs, readLesson, fields, today })`：因为命令行要先从 days.js 知道最新一课是哪个文件，所以输入是「读一课页面的函数」而不是页面字符串，测试里传入读真实文件的函数。返回值多了 `newFile` / `prevFile` 两个路径，供命令行写文件。
