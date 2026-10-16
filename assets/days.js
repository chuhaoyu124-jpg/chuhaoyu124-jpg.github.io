// 每天新增一条，放在最前面。首页由这里生成。
// keywords：搜索用的关键词（可选）；glyph：图标上的一个字；grad：图标渐变（可选，不填用默认暖橙）
window.DAYS = [
  {
    day: 5,
    keywords: "改写 缩短 扩写 语气 受众 格式 表格 课程笔记",
    date: "2026-10-16",
    week: 1,
    title: "一段话，五种改法",
    summary: "“帮我改一下”太模糊。说清往哪个方向改：缩短、扩写、换语气、换受众、换格式，AI 才知道怎么下手。",
    tool: "改写菜单",
    glyph: "改",
    grad: "linear-gradient(135deg, #ffb3c7 0%, #ff7aa2 50%, #c94fd6 100%)",
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
    grad: "linear-gradient(135deg, #ffd36b 0%, #ff9f43 50%, #ff6b6b 100%)",
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
    grad: "linear-gradient(135deg, #ffc46b 0%, #f07b2e 55%, #e2505c 100%)",
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
