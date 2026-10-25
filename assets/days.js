// 每天新增一条，放在最前面。首页由这里生成。
// keywords：搜索用的关键词（可选）；glyph：图标上的一个字；grad：图标渐变（可选，不填用默认暖橙）
window.DAYS = [
  {
    day: 14,
    keywords: "一组图 社媒配图 小红书 封面 模板 角标 分镜 第二周",
    date: "2026-10-25",
    week: 2,
    title: "一组 3 张社媒配图",
    summary: "一组图要像一套：先做一个模板，三张共用尺寸、配色和边距，只换内容。封面让人点开，内容页每页最多三条，结尾一句话收住。",
    tool: "一组图分镜板",
    glyph: "组",
    grad: "linear-gradient(135deg, #bff3ff 0%, #38bdf8 50%, #6d5df6 100%)",
    url: "days/day-14.html"
  },
  {
    day: 13,
    keywords: "skill 海报风格 SKILL.md 复盘 五要素 三铁律 动画 导出 默认风格",
    date: "2026-10-24",
    week: 2,
    title: "拼出我的海报风格",
    summary: "第二周攒下的五块规则，再加上练习里选出来的默认风格，拼成第二个 skill。以后说一句“做张海报”，它就知道怎么做、做成什么样。",
    tool: "海报风格拼装台",
    glyph: "风",
    grad: "linear-gradient(135deg, #e3dcff 0%, #8fa8ff 50%, #2f6fd6 100%)",
    url: "days/day-13.html"
  },
  {
    day: 12,
    keywords: "导出 GIF PNG MP4 JPG 帧数 文件大小 循环 格式",
    date: "2026-10-23",
    week: 2,
    title: "导出 GIF 和 PNG",
    summary: "网页里的海报，要变成能发出去的文件：静图导出 PNG，会动的导出 GIF 或 MP4。记住一条：尺寸 × 帧数 = 文件大小。",
    tool: "导出参数计算器",
    glyph: "存",
    grad: "linear-gradient(135deg, #c7f9e9 0%, #4fd1c5 50%, #2b7fd9 100%)",
    url: "days/day-12.html"
  },
  {
    day: 11,
    keywords: "CSS 动画 keyframes 淡入 上浮 循环 节奏 reduced-motion",
    date: "2026-10-22",
    week: 2,
    title: "让海报动起来",
    summary: "CSS 动画就是告诉浏览器：什么东西、从什么样变成什么样、用多久、重复几次。让“第一周完成”从下往上淡入，让波浪慢慢起伏。",
    tool: "动画试衣间",
    glyph: "跃",
    grad: "linear-gradient(135deg, #b9f5ff 0%, #5ad1e6 50%, #3b82f6 100%)",
    url: "days/day-11.html"
  },
  {
    day: 10,
    keywords: "配色 排版 对比 对齐 留白 60-30-10 对比度 体检",
    date: "2026-10-21",
    week: 2,
    title: "配色排版三铁律",
    summary: "好看的图不靠灵感，靠三条规矩：对比要够、对齐留白、颜色不超过三种。学会用这三条给自己的海报体检，再请 Claude 一条一条地改。",
    tool: "排版体检表",
    glyph: "排",
    grad: "linear-gradient(135deg, #e0dcff 0%, #a5b4fc 50%, #4f7cf7 100%)",
    url: "days/day-10.html"
  },
  {
    day: 9,
    keywords: "海报 HTML SVG 代码画图 尺寸 配色 小红书 预览",
    date: "2026-10-20",
    week: 2,
    title: "用代码画一张海报",
    summary: "不会用设计软件也能做图：让 Claude 写一个 HTML/SVG 文件，浏览器一打开就是一张海报。说清尺寸、背景、文字、图形和配色，再一句一句地改。",
    tool: "海报小画板",
    glyph: "画",
    grad: "linear-gradient(135deg, #c9f7e6 0%, #5fd4c4 50%, #2a9fd6 100%)",
    url: "days/day-09.html"
  },
  {
    day: 8,
    keywords: "Claude Code 动手 文件夹 txt 权限 计划 提交 推送 云端",
    date: "2026-10-19",
    week: 2,
    title: "会动手的 Claude",
    summary: "聊天里的 Claude 只会说，Claude Code 会动手：建文件夹、写文件、改网页。第一次，先让它建一个文件夹、写一个 txt。",
    tool: "Claude Code 任务卡",
    glyph: "动",
    grad: "linear-gradient(135deg, #a7e9ff 0%, #22b8cf 50%, #2f6fd6 100%)",
    url: "days/day-08.html"
  },
  {
    day: 7,
    keywords: "skill SKILL.md 复盘 写作助手 规则 说明书 第一周",
    date: "2026-10-18",
    week: 1,
    title: "拼出我的第一个 skill",
    summary: "一周攒下的六条规则，拼成一份 SKILL.md。从此不用每次重复交代，AI 一开口就懂我的习惯。",
    tool: "skill 拼装台",
    glyph: "拼",
    grad: "linear-gradient(135deg, #d6ccff 0%, #9b8cff 50%, #4f7cf7 100%)",
    url: "days/day-07.html"
  },
  {
    day: 6,
    keywords: "挑刺 批评 自查 检查 德语 邮件 语法 报告 修改",
    date: "2026-10-17",
    week: 1,
    title: "先让 AI 挑刺，再动手改",
    summary: "直接让 AI 改，它会顺手把你的话全换掉。先让它当严格的老师，只挑问题不动笔，改哪条由你决定。",
    tool: "挑刺提示词生成器",
    glyph: "挑",
    grad: "linear-gradient(135deg, #b8f3d9 0%, #34d1a8 50%, #1597a8 100%)",
    url: "days/day-06.html"
  },
  {
    day: 5,
    keywords: "改写 缩短 扩写 语气 受众 格式 表格 课程笔记",
    date: "2026-10-16",
    week: 1,
    title: "一段话，五种改法",
    summary: "“帮我改一下”太模糊。说清往哪个方向改：缩短、扩写、换语气、换受众、换格式，AI 才知道怎么下手。",
    tool: "改写菜单",
    glyph: "改",
    grad: "linear-gradient(135deg, #c7e6ff 0%, #6cb4f5 50%, #3166d6 100%)",
    url: "days/day-05.html"
  },
  {
    day: 4,
    keywords: "多版本 三个版本 标题 挑选 混合 小红书 羊腿",
    date: "2026-10-15",
    week: 1,
    title: "多要几版，挑一个，再混合",
    summary: "AI 的第一版只是随手抽的一张牌。一次要 3 个方向不同的版本，挑一个，再把别的版本的好处借过来。",
    tool: "三版本提示词生成器",
    glyph: "选",
    grad: "linear-gradient(135deg, #c3b5ff 0%, #8a7dff 50%, #5b6cf0 100%)",
    url: "days/day-04.html"
  },
  {
    day: 3,
    keywords: "语气 风格 模仿 范文 样本 朋友圈 小红书 德国",
    date: "2026-10-15",
    week: 1,
    title: "给范文，胜过给形容词",
    summary: "“自然真诚”每个人理解都不一样。与其形容语气，不如给 AI 看一段你自己写的话。",
    tool: "语气样本提示词生成器",
    glyph: "样",
    grad: "linear-gradient(135deg, #a8e6a1 0%, #3fbf8f 50%, #2d8fb8 100%)",
    url: "days/day-03.html"
  },
  {
    day: 2,
    keywords: "小红书 采访 提问 追问 德国 留学 羊腿 奥利奥",
    date: "2026-10-14",
    week: 1,
    title: "先让AI问你",
    summary: "不必一次说全。一句“写之前先问我3个问题”，AI 就从代笔的人变成采访你的人。",
    tool: "“先问我”提示词生成器",
    glyph: "问",
    grad: "linear-gradient(135deg, #a5f3e8 0%, #2dd4bf 50%, #0e9fb3 100%)",
    url: "days/day-02.html"
  },
  {
    day: 1,
    keywords: "闲鱼 二手 台灯 文案 角色 任务 素材 要求 示例 提示词",
    date: "2026-10-14",
    week: 1,
    title: "一句话，和五件套",
    summary: "AI 不怕你啰嗦，就怕你含糊。好提示词有五件套：角色、任务、素材、要求、示例。",
    tool: "五件套提示词生成器",
    glyph: "五",
    grad: "linear-gradient(135deg, #8fd8ff 0%, #38bdf8 50%, #4f7cf7 100%)",
    url: "days/day-01.html"
  }
];

// 四周路线图
window.WEEKS = [
  { n: 1, title: "用 AI 写字", days: 7 },
  { n: 2, title: "Claude Code 与图片", days: 7 },
  { n: 3, title: "PPT 与短视频", days: 7 },
  { n: 4, title: "把信息做成产品", days: 7 }
];
