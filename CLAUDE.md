## Agent skills

### Issue tracker

Issues 和 specs 以本地 Markdown 文件存放在 `.scratch/<feature-slug>/` 下。See `docs/agents/issue-tracker.md`.

### Triage labels

使用默认的五个 triage labels（`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`），记录在每个 issue 文件的 `Status:` 行。See `docs/agents/triage-labels.md`.

### Domain docs

Single-context：根目录 `GLOSSARY.md` + `docs/adr/`（用到时再创建）。See `docs/agents/domain.md`.

### 工作方式

试跑会改文件的命令、派审查 sub-agent、做完一个 ticket、本地预览或检查线上页面之前，先读 `docs/agents/agent-workflow.md`.
