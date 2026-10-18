# 03: 草稿不能被当成更新推上去，README 换成新流程

**What to build:** 读者永远看不到写着【待写】的课：Haoyu 推送前跑 `npm test`，只要还有草稿没写完就会失败，并指出是哪一课。README 写清新的每天新增一课流程，隔一段时间再用也记得怎么做。

**Blocked by:** 01（一条命令生成草稿）

**Status:** done

- [x] 新测试：读取 days.js 列出的每一课页面，断言其中没有【待写】；失败信息写出是哪一课
- [x] 现有已更新的课（Day 1–7）都通过这条检查
- [x] README「每天新增一课」改为：跑 `npm run new-day -- …`（附完整命令示例）→ 写完三个版块的【待写】→ `npm test` 变绿 → 推送；保留四个版块的写法说明
- [x] README「测试」一节补一句：`npm test` 也检查草稿，写草稿期间是红的属于正常
- [x] 用词符合 `GLOSSARY.md`（课、更新、草稿）

## Comments

- 2026-10-18 已实现（分支 `xin-ke-yi-jian-sheng-cheng`）。在一份生成了 Day 8 草稿的仓库副本上跑过，这条检查失败并指出「Day 8（days/day-08.html）还有 14 处【待写】」；真实仓库里 Day 1–7 都通过。README「结构」一节也补上了 `scripts/`。
