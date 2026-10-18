# Agent 工作方式

## 试跑会改文件的命令

在副本里跑：先 `git clone <仓库路径> "$TMPDIR/<名字>"`，之后每条命令都用副本的绝对路径。真实仓库只用来读文件、改代码和提交。

## 派审查 sub-agent

- 审查用只读的 agent 类型（Explore）：它读 diff 和文件，写下报告。要试跑时按上一节在副本里做。
- 两路审查（Standards + Spec）留给有逻辑改动的 diff。只改文字、注释或变量名的 diff，自己读一遍 diff 就够。

## 做完一个 ticket

测试通过 → 提交 → `git push origin <分支>`，让 GitHub 上随时有一份备份。推的是分支；线上网站只发布 `main`。

## 本地预览和检查线上

- 本地服务器：`.claude/launch.json` 里的 `site`（端口 8765）。
- 浏览器会缓存 html / js / css，每次检查都在网址后加一个新的 `?v=…`。线上 GitHub Pages 最多缓存 10 分钟，刚推送完看到旧版是正常的。
