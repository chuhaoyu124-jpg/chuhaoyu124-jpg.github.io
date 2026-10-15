// 虚拟形象：眼睛跟着鼠标（手机上跟着手指）走，表情随你的动作变化
// 用法：页面里放一个 <button type="button" class="me" data-avatar aria-label="…"></button>，再引入本文件
// 图片模式：加 data-avatar-img="assets/me.png"，就用这张图（3D 渲染图等）代替代码画的脸，
//   图片会跟着鼠标转头、有一束流动的光。再加 data-avatar-faces="hover:assets/me-smile.png,wink:assets/me-wink.png,…"
//   可给各表情配不同的图（hover / near / curious / surprised / sleepy / wink / shy），缺的表情用底图
(function () {
  const hosts = [...document.querySelectorAll("[data-avatar]")];
  if (!hosts.length) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 照着 Haoyu 本人的照片画，3D 动画电影那种质感。抓的特征：
  // 黑色蓬松蘑菇头，刘海偏分、盖住眉毛；圆润的脸，脸颊饱满，下巴柔和；
  // 细长的单眼皮眼睛，眼角微微下垂，眼神放松；眉毛平直偏粗、贴近眼睛；
  // 鼻头圆润；嘴唇略厚、抿着嘴笑得有点得意；浅粉色连帽卫衣外面套黑外套
  const C = { skin: "#f7cfae", ink: "#2a1d18", mouth: "#b9574e", cheek: "#ff8a7a" };
  const EYES = { L: [76, 110], R: [124, 110] };
  const ERY = 7; // 眼睛高度的一半：单眼皮，细长一点
  const SHUT = ERY * 2 + 2;

  // 嘴型：[路径, 填充]
  const MOUTHS = {
    smile: ["M88 137 Q100 141 112 136", "none"],
    grin: ["M86 135 Q100 146 114 134", "none"],
    open: ["M86 134 Q100 154 114 134 Q100 139 86 134 Z", C.mouth],
    small: ["M93 137 Q100 141 107 137", "none"],
    o: ["M100 132 C105 132 107 137 107 140 C107 144 104 147 100 147 C96 147 93 144 93 140 C93 137 95 132 100 132 Z", C.mouth],
    flat: ["M94 138 Q100 140 106 138", "none"]
  };
  // 表情：嘴、眉毛高低/角度、腮红、眼皮、眼睛样式、瞳孔大小
  const FACES = {
    idle: { mouth: "smile", brow: 0, browRot: 0, cheek: .28, lid: 2.5, eyes: "open" },
    near: { mouth: "grin", brow: -1, browRot: 0, cheek: .45, lid: 0, eyes: "open" },
    hover: { mouth: "open", brow: -3, browRot: 0, cheek: .7, lid: 0, eyes: "happy" },
    curious: { mouth: "small", brow: -5, browRot: -6, cheek: .32, lid: 0, eyes: "open", pupil: 1.12 },
    surprised: { mouth: "o", brow: -8, browRot: 0, cheek: .3, lid: 0, eyes: "open", pupil: .78 },
    sleepy: { mouth: "flat", brow: 2, browRot: 4, cheek: .22, lid: 9, eyes: "open" },
    wink: { mouth: "open", brow: -3, browRot: 0, cheek: .75, lid: 0, eyes: "wink" },
    shy: { mouth: "small", brow: 1, browRot: 6, cheek: 1, lid: 0, eyes: "happy" }
  };
  const HELLO = "嗨～我是 Haoyu";
  const TALK = ["你好呀～", "今天也学一点点吧", "点开最新一课看看？", "别戳啦，会痒 >_<", "再戳我要脸红了…"];

  function svg(id) {
    const eye = (side, [x, y]) => `
      <clipPath id="${id}-c${side}"><path d="M${x - 13} ${y + 1} C${x - 10} ${y - ERY - 2} ${x + 10} ${y - ERY - 2} ${x + 13} ${y} C${x + 10} ${y + ERY + 1} ${x - 10} ${y + ERY + 1} ${x - 13} ${y + 1} Z"/></clipPath>
      <g class="me-eye-open" data-side="${side}">
        <g clip-path="url(#${id}-c${side})">
          <rect x="${x - 14}" y="${y - 12}" width="28" height="24" fill="url(#${id}-white)"/>
          <g class="me-pupil">
            <circle cx="${x}" cy="${y}" r="6.6" fill="url(#${id}-iris)"/>
            <circle cx="${x}" cy="${y}" r="6.6" fill="none" stroke="#2b1a12" stroke-width="1"/>
            <circle cx="${x}" cy="${y + .3}" r="3.1" fill="#120a08"/>
            <circle cx="${x + 2.3}" cy="${y - 2.4}" r="1.9" fill="#fff"/>
            <circle cx="${x - 2.2}" cy="${y + 2.6}" r=".9" fill="#fff" opacity=".7"/>
          </g>
          <path d="M${x - 14} ${y - 12} H${x + 14} V${y - 2} C${x + 8} ${y - 6} ${x - 8} ${y - 6} ${x - 14} ${y - 2} Z" fill="#000" opacity=".16"/>
          <g class="me-lid"><rect x="${x - 15}" y="${y - ERY - 32}" width="30" height="32" fill="url(#${id}-lid)"/><path d="M${x - 14} ${y - ERY - .3} H${x + 14}" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round"/></g>
        </g>
      </g>
      <path class="me-lash" data-side="${side}" d="M${x - 13} ${y + 1} C${x - 10} ${y - ERY - 3} ${x + 10} ${y - ERY - 3} ${x + 13.5} ${y - .5}" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M${x - 11} ${y + ERY + 1.5} Q${x} ${y + ERY + 3.5} ${x + 11} ${y + ERY + 1.5}" fill="none" stroke="#c98e6c" stroke-width="1" opacity=".7"/>
      <path class="me-eye-happy" data-side="${side}" d="M${x - 11} ${y + 3} Q${x} ${y - 7} ${x + 11} ${y + 3}" fill="none" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round" opacity="0"/>`;
    return `<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd58a"/><stop offset=".55" stop-color="#f07b2e"/><stop offset="1" stop-color="#e2505c"/></linearGradient>
        <radialGradient id="${id}-skin" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#ffe3c6"/><stop offset=".55" stop-color="#f7cfae"/><stop offset="1" stop-color="#d9a07c"/></radialGradient>
        <radialGradient id="${id}-lid" cx=".5" cy="1" r="1"><stop offset="0" stop-color="#f3c6a4"/><stop offset="1" stop-color="#f7cfae"/></radialGradient>
        <radialGradient id="${id}-white" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe3ea"/></radialGradient>
        <radialGradient id="${id}-iris" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#8a5a3c"/><stop offset=".6" stop-color="#4a2b1c"/><stop offset="1" stop-color="#2a1710"/></radialGradient>
        <radialGradient id="${id}-hair" cx=".45" cy=".25" r=".8"><stop offset="0" stop-color="#4a4140"/><stop offset=".5" stop-color="#231d1c"/><stop offset="1" stop-color="#0e0b0b"/></radialGradient>
        <linearGradient id="${id}-hoodie" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe4e8"/><stop offset="1" stop-color="#e8c3cb"/></linearGradient>
        <linearGradient id="${id}-jacket" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3638"/><stop offset=".5" stop-color="#222021"/><stop offset="1" stop-color="#121011"/></linearGradient>
        <radialGradient id="${id}-cheek" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.cheek}"/><stop offset="1" stop-color="${C.cheek}" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}-nose" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#ffdcc0"/><stop offset="1" stop-color="#e3a985"/></radialGradient>
        <linearGradient id="${id}-lip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d98a7c"/><stop offset="1" stop-color="#c06a60"/></linearGradient>
        <clipPath id="${id}-clip"><circle cx="100" cy="100" r="100"/></clipPath>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#${id}-bg)"/>
      <circle cx="100" cy="100" r="100" fill="#000" opacity=".06"/>
      <g clip-path="url(#${id}-clip)"><g class="me-bob">
        <!-- 黑外套 + 粉卫衣帽子 + 脖子 -->
        <path d="M8 210 C10 168 44 150 100 150 C156 150 190 168 192 210 Z" fill="url(#${id}-jacket)"/>
        <path d="M58 164 C66 148 84 144 100 156 C116 144 134 148 142 164 L134 212 H66 Z" fill="url(#${id}-hoodie)"/>
        <path d="M58 164 C70 154 86 156 100 170 C114 156 130 154 142 164 C132 160 116 166 100 180 C84 166 68 160 58 164 Z" fill="#d9adb8" opacity=".75"/>
        <path d="M92 176 V196 M108 176 V196" stroke="#d6a8b3" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M60 166 C56 184 54 198 54 212 M140 166 C144 184 146 198 146 212" fill="none" stroke="#0c0a0a" stroke-width="2" opacity=".5"/>
        <path d="M89 130 H111 V158 C104 165 96 165 89 158 Z" fill="#dba57f"/>
        <g class="me-head">
          <!-- 后发 -->
          <path d="M34 118 C26 56 60 24 101 24 C142 24 176 56 166 118 C164 128 158 132 152 132 L48 132 C42 132 36 128 34 118 Z" fill="url(#${id}-hair)"/>
          <!-- 耳朵 -->
          <ellipse cx="42" cy="118" rx="8.5" ry="12" fill="#e8b48f"/><ellipse cx="42" cy="118" rx="4.5" ry="7" fill="#d79a74"/>
          <ellipse cx="158" cy="118" rx="8.5" ry="12" fill="#e8b48f"/><ellipse cx="158" cy="118" rx="4.5" ry="7" fill="#d79a74"/>
          <!-- 脸：圆润饱满，下巴柔和 -->
          <path d="M43 104 C43 76 68 60 100 60 C132 60 157 76 157 104 C157 140 134 170 100 170 C66 170 43 140 43 104 Z" fill="url(#${id}-skin)"/>
          <path d="M46 118 C50 150 70 168 100 168 C130 168 150 150 154 118 C150 154 128 172 100 172 C72 172 50 154 46 118 Z" fill="#c98b66" opacity=".35"/>
          <ellipse cx="100" cy="160" rx="14" ry="4" fill="#d9a07c" opacity=".45"/>
          <!-- 刘海：蓬松、偏分、盖住眉毛 -->
          <path d="M40 108 C38 58 66 34 101 34 C138 34 164 58 160 108 C156 92 150 84 146 80 C138 92 128 96 118 92 C110 100 100 102 92 96 C84 104 72 104 64 94 C56 96 48 100 40 108 Z" fill="url(#${id}-hair)"/>
          <path d="M66 90 C74 82 84 80 92 92 M118 88 C112 80 104 76 96 82" fill="none" stroke="#0e0b0b" stroke-width="3" stroke-linecap="round" opacity=".55"/>
          <path d="M60 50 C72 40 90 36 110 38 M118 42 C128 44 138 50 146 60" fill="none" stroke="#6b605e" stroke-width="5" stroke-linecap="round" opacity=".55"/>
          <path d="M70 44 C84 38 98 37 112 40" fill="none" stroke="#8f8381" stroke-width="2" stroke-linecap="round" opacity=".5"/>
          <!-- 刘海投下的阴影 -->
          <path d="M44 108 C56 100 68 100 76 104 C86 108 96 106 100 104 C108 102 120 100 130 98 C142 96 152 96 156 108 C150 102 140 102 130 104 C118 106 108 110 100 110 C90 110 80 110 70 108 C60 106 50 108 44 108 Z" fill="#8b5a3c" opacity=".16"/>
          <g class="me-face">
            <ellipse class="me-cheek" cx="60" cy="128" rx="14" ry="8" fill="url(#${id}-cheek)" opacity=".28"/>
            <ellipse class="me-cheek" cx="140" cy="128" rx="14" ry="8" fill="url(#${id}-cheek)" opacity=".28"/>
            <!-- 眉毛：平直、偏粗、贴近眼睛 -->
            <path class="me-brow" data-side="L" d="M64 97 C72 92 82 92 90 95" fill="none" stroke="${C.ink}" stroke-width="3.8" stroke-linecap="round"/>
            <path class="me-brow" data-side="R" d="M110 95 C118 92 128 92 136 97" fill="none" stroke="${C.ink}" stroke-width="3.8" stroke-linecap="round"/>
            ${eye("L", EYES.L)}${eye("R", EYES.R)}
            <!-- 鼻子：鼻头圆润 -->
            <path d="M96 112 C94 118 92 122 93 125" fill="none" stroke="#d49a76" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
            <ellipse cx="100" cy="124" rx="7.5" ry="5" fill="url(#${id}-nose)"/>
            <path d="M94 126.5 Q96 129 99 128 M106 126.5 Q104 129 101 128" fill="none" stroke="#c98b66" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
            <!-- 嘴：略厚的嘴唇，抿着嘴笑 -->
            <path d="M88 137 Q100 133 112 137 Q100 141 88 137 Z" fill="url(#${id}-lip)" opacity=".85"/>
            <path class="me-mouth" d="${MOUTHS.smile[0]}" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>
            <path d="M90 141 Q100 146 110 141" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".45"/>
          </g>
        </g>
      </g></g>
      <g class="me-zs" fill="#fff" font-weight="700" font-family="-apple-system, sans-serif">
        <text class="me-z" x="150" y="62" font-size="16">z</text><text class="me-z" x="162" y="46" font-size="20">z</text><text class="me-z" x="176" y="28" font-size="24">Z</text>
      </g>
    </svg><span class="me-say" role="status" aria-live="polite"></span>`;
  }

  // ---- 全局指针状态 ----
  const P = { x: 0, y: 0, active: false, over: null, overLink: false, speed: 0, t: 0, lastActive: performance.now(), touchAt: 0 };
  const glance = { x: 0, y: 0, next: 0 };

  function onMove(x, y, target, isTouch) {
    const now = performance.now();
    if (P.active && !isTouch) {
      const dt = Math.max(1, now - P.t);
      const v = Math.hypot(x - P.x, y - P.y) / dt;
      P.speed = P.speed * .7 + v * .3;
    }
    P.x = x; P.y = y; P.t = now; P.active = true;
    if (isTouch) P.touchAt = now;
    P.over = target && target.closest ? target.closest("[data-avatar]") : null;
    P.overLink = !!(target && target.closest && !P.over && target.closest("a, button, input, textarea, select, label, .chip"));
    wake(now);
  }
  function wake(now) {
    if (now - P.lastActive > SLEEP_AFTER) hosts.forEach(h => h.__me && h.__me.wake());
    P.lastActive = now;
  }
  const SLEEP_AFTER = 9000;

  addEventListener("pointermove", e => { if (e.pointerType === "mouse" || e.pointerType === "pen") onMove(e.clientX, e.clientY, e.target, false); }, { passive: true });
  addEventListener("pointerdown", e => onMove(e.clientX, e.clientY, e.target, e.pointerType === "touch"), { passive: true });
  addEventListener("touchmove", e => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY, null, true); }, { passive: true });
  document.addEventListener("mouseout", e => { if (!e.relatedTarget) { P.active = false; P.over = null; P.overLink = false; } });
  ["scroll", "keydown"].forEach(t => addEventListener(t, () => wake(performance.now()), { passive: true }));

  // ---- 每个形象 ----
  hosts.forEach((host, n) => {
    const id = "me" + n;
    const photo = host.dataset.avatarImg;
    const faceImgs = {};
    (host.dataset.avatarFaces || "").split(",").map(x => x.trim()).filter(Boolean).forEach(x => { const i = x.indexOf(":"); if (i > 0) faceImgs[x.slice(0, i).trim()] = x.slice(i + 1).trim(); });
    if (photo) {
      host.classList.add("me-photo");
      host.innerHTML = `<div class="me-stage"><div class="me-card"><img class="me-img" src="${photo.replace(/"/g, "&quot;")}" alt="" draggable="false"><img class="me-img me-img-alt" alt="" draggable="false"><div class="me-gloss"></div></div></div>
        <span class="me-zs"><span class="me-z">z</span><span class="me-z">z</span><span class="me-z">Z</span></span><span class="me-say" role="status" aria-live="polite"></span>`;
      Object.values(faceImgs).forEach(src => { const i = new Image(); i.src = src; }); // 预加载
    } else host.innerHTML = svg(id);
    host.style.setProperty("--shut", SHUT + "px");
    const $ = s => host.querySelector(s), $$ = s => [...host.querySelectorAll(s)];
    const el = {
      head: $(".me-head"), face: $(".me-face"), mouth: $(".me-mouth"), say: $(".me-say"),
      pupils: $$(".me-pupil"), lids: $$(".me-lid"), brows: $$(".me-brow"), cheeks: $$(".me-cheek"),
      open: $$(".me-eye-open"), happy: $$(".me-eye-happy"), lash: $$(".me-lash")
    };
    const s = { px: 0, py: 0, fx: 0, fy: 0, rot: 0, face: "", visible: true, nextBlink: performance.now() + 1800, until: 0, untilFace: "", clicks: 0, greeted: false, sayTimer: 0 };

    function setFace(name) {
      if (s.face === name) return;
      s.face = name;
      host.classList.toggle("sleepy", name === "sleepy");
      if (photo) {
        const src = faceImgs[name] || "";
        const alt = $(".me-img-alt");
        if (src) { if (alt.getAttribute("src") !== src) alt.src = src; alt.classList.add("show"); }
        else alt.classList.remove("show");
        host.dataset.face = name;
        return;
      }
      const f = FACES[name], m = MOUTHS[f.mouth];
      el.mouth.setAttribute("d", m[0]);
      el.mouth.setAttribute("fill", m[1]);
      el.brows.forEach(b => {
        const r = b.dataset.side === "L" ? f.browRot : -f.browRot;
        b.style.transform = `translateY(${f.brow}px) rotate(${r}deg)`;
      });
      el.cheeks.forEach(c => c.style.opacity = f.cheek);
      el.lids.forEach(l => l.style.transform = `translateY(${f.lid}px)`);
      el.lash.forEach(l => l.style.opacity = f.eyes === "open" || (f.eyes === "wink" && l.dataset.side === "R") ? 1 : 0);
      const happy = side => f.eyes === "happy" || (f.eyes === "wink" && side === "L");
      el.open.forEach(e => e.style.opacity = happy(e.dataset.side) ? 0 : 1);
      el.happy.forEach(e => e.style.opacity = happy(e.dataset.side) ? 1 : 0);
    }
    function say(text, ms) {
      el.say.textContent = text;
      el.say.classList.add("show");
      clearTimeout(s.sayTimer);
      s.sayTimer = setTimeout(() => el.say.classList.remove("show"), ms || 1800);
    }
    function react(face, ms) { s.untilFace = face; s.until = performance.now() + ms; }

    host.__me = {
      wake() { if (s.face === "sleepy") { react("surprised", 700); say("啊，我没睡！", 1400); } }
    };

    host.addEventListener("pointerenter", e => {
      if (e.pointerType === "mouse" && !s.greeted) { s.greeted = true; say(HELLO, 2000); }
    });
    host.addEventListener("click", () => {
      s.clicks++;
      const shy = s.clicks % 5 === 0;
      react(shy ? "shy" : "wink", shy ? 1800 : 1200);
      say(TALK[(s.clicks - 1) % TALK.length]);
      hearts(shy ? 5 : 3);
    });
    function hearts(k) {
      if (reduce) return;
      for (let i = 0; i < k; i++) {
        const h = document.createElement("span");
        h.className = "me-heart"; h.textContent = "♥";
        h.style.setProperty("--x", (30 + Math.random() * 40) + "%");
        h.style.setProperty("--dx", (Math.random() * 60 - 30).toFixed(0) + "px");
        h.style.animationDelay = (i * 90) + "ms";
        host.appendChild(h);
        setTimeout(() => h.remove(), 1400 + i * 90);
      }
    }

    host.__s = s;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(es => { s.visible = es[0].isIntersecting; if (s.visible) start(); }).observe(host);
    }

    s.frame = now => {
      const r = host.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * .52;

      // 看哪里：有鼠标/手指就看它，否则偶尔东张西望
      let dx, dy;
      const touchStale = P.touchAt && now - P.touchAt > 2500 && now - P.t > 2500;
      if (P.active && !touchStale) { dx = P.x - cx; dy = P.y - cy; }
      else {
        if (now > glance.next) {
          const look = Math.random() < .35;
          glance.x = look ? 0 : (Math.random() * 2 - 1) * 160;
          glance.y = look ? 0 : (Math.random() * 2 - 1) * 90;
          glance.next = now + 1800 + Math.random() * 2600;
        }
        dx = glance.x; dy = glance.y;
      }
      const dist = Math.hypot(dx, dy), k = Math.min(1, dist / 160), a = Math.atan2(dy, dx);

      // 选表情
      let face = "idle";
      const sleeping = now - P.lastActive > SLEEP_AFTER && !document.hidden;
      if (P.speed > 4.5 && now - P.t < 120) react("surprised", 900);
      if (now < s.until) face = s.untilFace;
      else if (sleeping) face = "sleepy";
      else if (P.active && P.over === host) face = "hover";
      else if (P.active && P.overLink && !touchStale) face = "curious";
      else if (P.active && !touchStale && dist < 230) face = "near";
      setFace(face);

      // 眨眼
      if (now > s.nextBlink) {
        if (FACES[face].eyes !== "happy" && face !== "sleepy") {
          host.classList.remove("blink"); void host.offsetWidth; host.classList.add("blink");
        }
        s.nextBlink = now + (Math.random() < .2 ? 260 : 2400 + Math.random() * 3600);
      }

      // 图片模式：整张图朝鼠标方向转，光随之流动
      if (photo) {
        const tx = reduce ? 0 : Math.cos(a) * 12 * k, ty = reduce ? 0 : Math.sin(a) * 9 * k + (face === "sleepy" ? 6 : 0);
        s.fx += (tx - s.fx) * .12; s.fy += (ty - s.fy) * .12;
        const sc = face === "hover" ? 1.06 : face === "surprised" ? 1.03 : 1;
        s.rot += (sc - s.rot - 1) * .15;
        host.style.setProperty("--ry", s.fx.toFixed(2) + "deg");
        host.style.setProperty("--rx", (-s.fy).toFixed(2) + "deg");
        host.style.setProperty("--sc", (1 + s.rot).toFixed(3));
        host.style.setProperty("--gx", (50 + Math.cos(a) * 45 * k).toFixed(1) + "%");
        host.style.setProperty("--gy", (50 + Math.sin(a) * 45 * k).toFixed(1) + "%");
        P.speed *= .92;
        return;
      }

      // 平滑跟随
      const sleepDrop = face === "sleepy" ? 3 : 0;
      const tp = [Math.cos(a) * 5 * k, Math.sin(a) * 2.2 * k + sleepDrop * .4];
      s.px += (tp[0] - s.px) * .2; s.py += (tp[1] - s.py) * .2;
      const pScale = FACES[face].pupil || 1;
      el.pupils.forEach((p, i) => {
        const [ex, ey] = i ? EYES.R : EYES.L;
        p.setAttribute("transform", `translate(${(s.px).toFixed(2)} ${(s.py).toFixed(2)}) translate(${ex} ${ey}) scale(${pScale}) translate(${-ex} ${-ey})`);
      });
      if (!reduce) {
        s.fx += (Math.cos(a) * 5 * k - s.fx) * .12; s.fy += (Math.sin(a) * 4 * k + sleepDrop - s.fy) * .12;
        const tr = face === "sleepy" ? 7 : Math.max(-6, Math.min(6, dx / 70));
        s.rot += (tr - s.rot) * .1;
        el.face.setAttribute("transform", `translate(${s.fx.toFixed(2)} ${s.fy.toFixed(2)})`);
        el.head.setAttribute("transform", `rotate(${s.rot.toFixed(2)} 100 150)`);
      }
      P.speed *= .92;
    };
  });

  // ---- 动画循环：形象都不在屏幕上时停下 ----
  let running = false;
  function loop(now) {
    const live = hosts.filter(h => h.__s && h.__s.visible);
    live.forEach(h => h.__s.frame(now));
    if (live.length) requestAnimationFrame(loop); else running = false;
  }
  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
  start();
})();
