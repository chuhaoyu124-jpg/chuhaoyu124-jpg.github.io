# Haoyu 的 AI 工具箱

每天学一点，每天多一个能用的小工具。网址：https://chuhaoyu124-jpg.github.io

风格参照 Apple 官网：白灰交替底色、近黑文字、暖橙记号，毛玻璃导航，滚动淡入，深色模式跟随系统。

## 结构
- `index.html` 首页：大标题、最新一课展示、全部课程、四周路线图。内容全部来自 `assets/days.js`
- `days/day-NN.html` 每天一页
- `about.html` 关于页
- `assets/style.css` 设计系统；`assets/site.js` 导航、淡入动效、`copyText()` 复制

## 每天新增一课
以最新一课的页面为模板（Day 1 是"三次尝试对比"写法，Day 2 是"采访对话"写法），复制成 `days/day-NN.html`，保留四个版块：
1. `lesson-hero`：渐变图标（一个字）、eyebrow「Day N · 第几周主题」、大标题、一句话总结
2. `section alt #learn` 今天学了什么：`statement` 大字 + `features` 要点格子（最关键的一格用 `hl`）+ `pull` 金句 / `note-grid`
3. `section #practice` 我的练习：Haoyu 的真实提示词、AI 输出、提问和收获。截图一律转写成文字，不贴原图。AI 自己补的句子用 `<mark>` 标出
4. `section alt #tool` 小工具：`studio` 两栏，左边 `panel-card` 表单（`seg` 场景切换、`toggle` 开关），右边 `preview` 输出 + 复制按钮。纯前端，不调任何 API
5. 底部 `pager` 指向上一课和下一课

然后在 `assets/days.js` 最前面加一条（含 `week`、`glyph`、`grad`），把上一课的 pager「明天见」改成链接，推送到 main。
