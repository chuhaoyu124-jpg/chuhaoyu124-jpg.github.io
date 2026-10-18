// Claude Code PreToolUse hook：拦下删除或移动仓库 .git 目录的 Bash 命令。
// 2026-10-18 一个审查 sub-agent 在真实仓库里跑了 `rm -rf .git`，这个 hook 就是为它加的。
// 退出码 2 = 拦下这条命令，stderr 会转给 agent 看。
let input = "";
process.stdin.on("data", c => (input += c));
process.stdin.on("end", () => {
  let command = "";
  try { command = JSON.parse(input).tool_input?.command || ""; } catch (_) { process.exit(0); }
  // rm / rmdir / mv / trash 后面，同一段命令里出现 .git 这个目录（不算 .gitignore、.github）
  const danger = /\b(rm|rmdir|mv|trash)\b[^;&|\n]*(^|[\s'"=/])\.git(?=$|[\s'"/;&|])/m;
  if (danger.test(command)) {
    process.stderr.write(
      "已拦下：这条命令会删除或移动 .git。要试跑会改文件的命令，先 git clone 一份到 $TMPDIR，在副本里跑（见 docs/agents/agent-workflow.md）。\n"
    );
    process.exit(2);
  }
  process.exit(0);
});
