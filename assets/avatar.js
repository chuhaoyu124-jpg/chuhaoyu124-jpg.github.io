// 虚拟形象：眼睛跟着鼠标（手机上跟着手指）走，表情随你的动作变化
// 用法：页面里放一个 <button type="button" class="me" data-avatar aria-label="…"></button>，再引入本文件
(function () {
  const hosts = [...document.querySelectorAll("[data-avatar]")];
  if (!hosts.length) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 照着 Haoyu 本人画的：黑色蘑菇头齐刘海、圆脸、细长单眼皮、抿嘴小得意、浅粉卫衣 + 黑外套
  const C = { skin: "#ffe0c8", skinDark: "#f3c4a2", hair: "#1e1a19", hairHi: "#3a3230", ink: "#2a2220", mouth: "#c4544b", cheek: "#ff8f86", hoodie: "#f6d9df", hoodieDark: "#e9c0c9", jacket: "#2b2829" };
  const EYES = { L: [77, 107], R: [123, 107] };
  const ERY = 7.5; // 眼睛高度的一半：单眼皮，细长一点
  const SHUT = ERY * 2 + 2;

  // 嘴型：[路径, 填充]
  const MOUTHS = {
    smile: ["M89 129 Q100 134 112 127", "none"],
    grin: ["M86 124 Q100 139 114 124", "none"],
    open: ["M85 123 Q100 146 115 123 Q100 127 85 123 Z", C.mouth],
    small: ["M93 128 Q100 133 107 128", "none"],
    o: ["M100 123 C105 123 107 128 107 131 C107 135 104 137 100 137 C96 137 93 135 93 131 C93 128 95 123 100 123 Z", C.mouth],
    flat: ["M94 130 Q100 132 106 130", "none"]
  };
  // 表情：嘴、眉毛高低/角度、腮红、眼皮、眼睛样式、瞳孔大小
  const FACES = {
    idle: { mouth: "smile", brow: 0, browRot: 0, cheek: .28, lid: 2, eyes: "open" },
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
      <clipPath id="${id}-c${side}"><ellipse cx="${x}" cy="${y}" rx="12" ry="${ERY + .5}"/></clipPath>
      <g class="me-eye-open" data-side="${side}" clip-path="url(#${id}-c${side})">
        <ellipse cx="${x}" cy="${y}" rx="11.5" ry="${ERY}" fill="#fff"/>
        <g class="me-pupil"><circle cx="${x}" cy="${y}" r="5.6" fill="#1d1513"/><circle cx="${x + 2}" cy="${y - 2.2}" r="1.8" fill="#fff"/></g>
        <g class="me-lid"><rect x="${x - 13}" y="${y - ERY - 30}" width="26" height="30" fill="${C.skin}"/><path d="M${x - 13} ${y - ERY - .5} H${x + 13}" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/></g>
      </g>
      <path d="M${x - 12} ${y - 1} Q${x} ${y - ERY - 3.5} ${x + 12} ${y - 1}" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round" class="me-lash" data-side="${side}"/>
      <path class="me-eye-happy" data-side="${side}" d="M${x - 11} ${y + 3} Q${x} ${y - 7} ${x + 11} ${y + 3}" fill="none" stroke="${C.ink}" stroke-width="3.6" stroke-linecap="round" opacity="0"/>`;
    return `<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc46b"/><stop offset=".55" stop-color="#f07b2e"/><stop offset="1" stop-color="#e2505c"/></linearGradient>
        <clipPath id="${id}-clip"><circle cx="100" cy="100" r="100"/></clipPath>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#${id}-bg)"/>
      <g clip-path="url(#${id}-clip)"><g class="me-bob">
        <path d="M14 206 C16 170 50 154 100 154 C150 154 184 170 186 206 Z" fill="${C.jacket}"/>
        <path d="M66 160 Q100 150 134 160 L120 206 H80 Z" fill="${C.hoodie}"/>
        <path d="M90 134 H110 V156 Q100 162 90 156 Z" fill="${C.skinDark}"/>
        <path d="M60 164 C64 146 84 150 100 158 C116 150 136 146 140 164 C130 158 116 162 100 170 C84 162 70 158 60 164 Z" fill="${C.hoodieDark}"/>
        <path d="M93 168 V186 M107 168 V186" stroke="${C.hoodieDark}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M66 160 L56 206 M134 160 L144 206" stroke="#1a1818" stroke-width="2" opacity=".6"/>
        <g class="me-head">
          <path d="M38 112 C30 62 62 30 101 30 C140 30 172 62 162 112 C160 120 156 124 152 124 L48 124 C44 124 40 120 38 112 Z" fill="${C.hair}"/>
          <ellipse cx="43" cy="114" rx="8" ry="11" fill="${C.skinDark}"/><ellipse cx="157" cy="114" rx="8" ry="11" fill="${C.skinDark}"/>
          <path d="M44 106 C44 78 70 64 100 64 C130 64 156 78 156 106 C156 142 132 166 100 166 C68 166 44 142 44 106 Z" fill="${C.skin}"/>
          <path d="M42 104 C40 60 66 38 101 38 C136 38 162 60 158 104 C154 92 150 86 146 84 C130 88 112 86 100 84 C86 87 70 88 54 84 C50 88 45 95 42 104 Z" fill="${C.hair}"/>
          <path d="M66 52 C80 44 96 42 112 44" fill="none" stroke="${C.hairHi}" stroke-width="5" stroke-linecap="round" opacity=".8"/>
          <path d="M70 84 L73 78 M86 85 L88 79 M104 84 L102 78 M120 85 L118 79 M136 84 L133 78" stroke="${C.hair}" stroke-width="4" stroke-linecap="round"/>
          <g class="me-face">
            <ellipse class="me-cheek" cx="62" cy="126" rx="11" ry="6.5" fill="${C.cheek}" opacity=".28"/>
            <ellipse class="me-cheek" cx="138" cy="126" rx="11" ry="6.5" fill="${C.cheek}" opacity=".28"/>
            <path class="me-brow" data-side="L" d="M67 95 Q77 92 87 94" fill="none" stroke="${C.ink}" stroke-width="3.2" stroke-linecap="round"/>
            <path class="me-brow" data-side="R" d="M113 94 Q123 92 133 95" fill="none" stroke="${C.ink}" stroke-width="3.2" stroke-linecap="round"/>
            ${eye("L", EYES.L)}${eye("R", EYES.R)}
            <path d="M96 117 Q100 120.5 104 117" fill="none" stroke="#e5a585" stroke-width="2.4" stroke-linecap="round"/>
            <path class="me-mouth" d="${MOUTHS.smile[0]}" fill="none" stroke="${C.ink}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
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
    host.innerHTML = svg(id);
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
      host.classList.toggle("sleepy", name === "sleepy");
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
