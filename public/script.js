// ==============================
// CONFIG
// ==============================

// if true → all boxes open (for testing)
const TEST_MODE = false;

//fake server date
const TEST_DAY = 15;     // Fake "today" day (1–31)
const TEST_MONTH = 12;   // Fake "today" month (1–12)

// server date
let SERVER_DAY = null;
let SERVER_MONTH = null;

let TIME_READY = false;


const calendarContainer = document.getElementById("calendar-container");
const confettiCanvas = document.getElementById("confetti-canvas");
const confettiCtx = confettiCanvas.getContext("2d");
const starsCanvas = document.getElementById("stars-canvas");
const starsCtx = starsCanvas.getContext("2d");
const snowCanvas = document.getElementById("snow-canvas");
const snowCtx = snowCanvas.getContext("2d");
const topStarEl = document.getElementById("top-star");
const santaEl = document.getElementById("santa");
const reindeerContainer = document.getElementById("reindeers");
const modal = document.getElementById("video-modal");
const video = document.getElementById("video-player");
const closeBtn = document.getElementById("close-btn");

// tree row layout
const rows = [1, 2, 3, 4, 5, 6, 3];

// videos
const videoSources = {};
for (let i = 1; i <= 24; i++) {
  videoSources[i] = `videos/day${i}.mp4`;
}

let stars = [];
let snowflakes = [];

// ==============================
// SERVER TIME
// ==============================

async function fetchServerTime() {
  if (TEST_MODE) {
    SERVER_DAY = TEST_DAY;
    SERVER_MONTH = TEST_MONTH;
    TIME_READY = true;
    console.log("TEST MODE ACTIVE → Using fake date:", TEST_DAY, TEST_MONTH);
    return;
  }

  try {
    const res = await fetch("/api/time");
    const data = await res.json();
    SERVER_DAY = data.day;
    SERVER_MONTH = data.month;
    console.log("Server time:", data.iso);
  } catch (err) {
    console.warn("Server time failed → fallback to device time");
    const d = new Date();
    SERVER_DAY = d.getDate();
    SERVER_MONTH = d.getMonth() + 1;
  }
  TIME_READY = true;
}


// ==============================
// CANVAS SETUP
// ==============================

function resizeCanvases() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  confettiCanvas.width = w;
  confettiCanvas.height = h;
  starsCanvas.width = w;
  starsCanvas.height = h;
  snowCanvas.width = w;
  snowCanvas.height = h;
}

// ==============================
// STARS + SNOW
// ==============================

function createStars() {
  stars = [];
  for (let i = 0; i < 140; i++) {
    stars.push({
      x: Math.random() * starsCanvas.width,
      y: Math.random() * starsCanvas.height * 0.6,
      radius: Math.random() * 1.5 + 0.5,
      baseAlpha: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.02 + 0.01,
      offset: Math.random() * Math.PI * 2
    });
  }
}

function drawStars(t) {
  starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
  for (const s of stars) {
    const alpha = s.baseAlpha + 0.4 * Math.sin(t * s.speed + s.offset);
    starsCtx.beginPath();
    starsCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    starsCtx.fillStyle = `rgba(255,236,180,${Math.max(0, Math.min(1, alpha))})`;
    starsCtx.fill();
  }
}

function createSnow() {
  snowflakes = [];
  for (let i = 0; i < 180; i++) {
    snowflakes.push({
      x: Math.random() * snowCanvas.width,
      y: Math.random() * snowCanvas.height,
      r: Math.random() * 2.8 + 1.2,
      s: Math.random() * 0.8 + 0.6,
      d: Math.random() * 0.6 - 0.3
    });
  }
}

function drawSnow() {
  snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
  snowCtx.fillStyle = "#fff";
  for (const f of snowflakes) {
    snowCtx.beginPath();
    snowCtx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    snowCtx.fill();
    f.y += f.s;
    f.x += f.d;
    if (f.y > snowCanvas.height) {
      f.y = -5;
      f.x = Math.random() * snowCanvas.width;
    }
    if (f.x < 0) f.x = snowCanvas.width;
    if (f.x > snowCanvas.width) f.x = 0;
  }
}

function animateBackground(t) {
  drawStars(t / 16);
  drawSnow();
  requestAnimationFrame(animateBackground);
}

// ==============================
// UTILS
// ==============================

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ==============================
// CALENDAR LAYOUT
// ==============================

function layoutBoxes() {
  calendarContainer.innerHTML = "";

  let nums = Array.from({ length: 24 }, (_, i) => i + 1);
  shuffle(nums);
  let idx = 0;

  const w = window.innerWidth;
  const h = window.innerHeight;

  const maxWidthSize = Math.floor(w / 6);
  const maxHeightSize = Math.floor(h / 12);
  const size = Math.min(90, maxWidthSize, maxHeightSize);

  const spacing = Math.floor(size * 0.18);

  const rowsLen = rows.length;
  const treeH = rowsLen * (size + spacing) - spacing;

  const groundH = h * 0.28;
  const topOffset = Math.max(40, (h - groundH - treeH) / 2);

  let topBox = null;

  rows.forEach((count, r) => {
    const rowW = count * size + (count - 1) * spacing;
    const startX = (w - rowW) / 2;
    const top = topOffset + r * (size + spacing);

    for (let i = 0; i < count; i++) {
      const left = startX + i * (size + spacing);
      const day = nums[idx++];

      const box = document.createElement("div");
      box.className = "box";
      box.dataset.day = day;
      box.id = `day-box-${day}`;
      box.style.width = size + "px";
      box.style.height = size + "px";
      box.style.left = left + "px";
      box.style.top = top + "px";

      const inner = document.createElement("div");
      inner.className = "box-inner";

      const rv = document.createElement("div");
      rv.className = "box-ribbon-vertical";

      const rh = document.createElement("div");
      rh.className = "box-ribbon-horizontal";

      const knot = document.createElement("div");
      knot.className = "box-ribbon-knot";

      const num = document.createElement("div");
      num.className = "box-number";
      num.textContent = day;

      inner.append(rv, rh, knot, num);
      box.append(inner);
      calendarContainer.appendChild(box);

      if (!topBox) topBox = box;
    }
  });

  if (topBox) {
    positionTopStar(topBox);
  }
}

// ==============================
// BOX STATE RESTORATION
// ==============================

function markAlreadyOpenedBoxes() {

  // TEST MODE: auto-open days 1 → TEST_DAY-1
  if (TEST_MODE && TEST_MONTH === 12) {
    for (let d = 1; d < TEST_DAY; d++) {
      const box = document.getElementById(`day-box-${d}`);
      if (box) box.classList.add("opened");
    }
    return; // stop here
  }

  // NORMAL MODE: auto-open days 1 → SERVER_DAY-1
  if (!TEST_MODE && SERVER_MONTH === 12) {
    for (let d = 1; d < SERVER_DAY; d++) {
      const box = document.getElementById(`day-box-${d}`);
      if (box) box.classList.add("opened");
    }
  }
}


// ==============================
// CONFETTI
// ==============================

function snowburst(x, y) {
  const parts = [];
  const count = 90;
  const cols = [
    "rgba(244,180,160,0.95)",
    "rgba(230,140,130,0.95)",
    "rgba(255,230,180,0.95)",
    "rgba(246,205,150,0.95)"
  ];

  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = Math.random() * 4 + 2;
    parts.push({
      x,
      y,
      dx: Math.cos(ang) * sp,
      dy: Math.sin(ang) * sp - 2,
      size: Math.random() * 4 + 3,
      col: cols[Math.floor(Math.random() * cols.length)],
      life: 60 + Math.random() * 20,
      rot: Math.random() * Math.PI * 2,
      dr: (Math.random() - 0.5) * 0.3
    });
  }

  function anim() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = 0;

    for (const p of parts) {
      if (p.life <= 0) continue;
      alive++;
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.15;
      p.rot += p.dr;
      p.life--;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.col.replace(/0\.95\)$/, p.life / 60 + ")");
      confettiCtx.beginPath();
      confettiCtx.moveTo(0, -p.size);
      confettiCtx.lineTo(p.size * 0.5, 0);
      confettiCtx.lineTo(0, p.size);
      confettiCtx.lineTo(-p.size * 0.5, 0);
      confettiCtx.closePath();
      confettiCtx.fill();
      confettiCtx.restore();
    }

    if (alive > 0) requestAnimationFrame(anim);
    else confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  anim();
}

// ==============================
// REINDEERS
// ==============================

function spawnReindeerHerd() {
  const herd = document.createElement("div");
  herd.className = "herd right-to-left";

  const isMobile = window.innerWidth <= 600;
  const count = 2 + Math.floor(Math.random() * 5);

  for (let i = 0; i < count; i++) {
    const deer = document.createElement("div");
    deer.className = "reindeer left-facing";

    const verticalOffset = isMobile
      ? -5 + Math.random() * 15
      : -10 + Math.random() * 30;
    deer.style.bottom = verticalOffset + "px";

    const scale = (isMobile ? 0.8 : 0.9) + Math.random() * 0.4;
    deer.style.transform = `scale(${scale})`;

    const img = document.createElement("img");
    img.src = "images/reindeer.png";
    img.alt = "Reindeer";

    deer.appendChild(img);
    herd.appendChild(deer);
  }

  reindeerContainer.appendChild(herd);

  setTimeout(() => herd.remove(), 36000);

  const delayBase = isMobile ? 10000 : 8000;
  setTimeout(spawnReindeerHerd, delayBase + Math.random() * 6000);
}

// ==============================
// SANTA
// ==============================

function scheduleSanta() {
  setTimeout(startSantaFlight, 15000 + Math.random() * 12000);
}

function startSantaFlight() {
  santaEl.classList.add("santa-flying");
  setTimeout(() => {
    santaEl.classList.remove("santa-flying");
    scheduleSanta();
  }, 18000);
}

// ==============================
// BOX CLICK
// ==============================

calendarContainer.addEventListener("click", (e) => {
    if (!TIME_READY) {
      alert("Egy pillanat... ⏳");
      return;
    }

  const box = e.target.closest(".box");
  if (!box) return;

  const day = parseInt(box.dataset.day, 10);

  if (box.classList.contains("opened")) {
    openVideo(day);
    return;
  }

  const allowed = TEST_MODE
      ? (TEST_MONTH === 12 && day <= TEST_DAY)
      : (SERVER_MONTH === 12 && day <= SERVER_DAY);


  if (!allowed) {
    alert("Ha véletlen volt, korán vagy még! Ha direkt akkor EJNYE!");
    return;
  }

  box.classList.add("opening");
  const r = box.getBoundingClientRect();
  snowburst(r.left + r.width / 2, r.top + r.height / 2);

  setTimeout(() => {
    box.classList.remove("opening");
    box.classList.add("opened");
    openVideo(day);
  }, 450);
});

// ==============================
// VIDEO MODAL
// ==============================

function openVideo(day) {
  video.src = videoSources[day];
  modal.classList.add("show");
  video.play();
}

closeBtn.onclick = () => {
  video.pause();
  video.currentTime = 0;
  modal.classList.remove("show");
};

// ==============================
// INIT
// ==============================

async function init() {
  await fetchServerTime();

  resizeCanvases();
  createStars();
  createSnow();
  layoutBoxes();
  markAlreadyOpenedBoxes();

  requestAnimationFrame(animateBackground);
  spawnReindeerHerd();
  scheduleSanta();
}

window.addEventListener("resize", () => {
  resizeCanvases();
  createStars();
  createSnow();
  layoutBoxes();
  markAlreadyOpenedBoxes();
});

function positionTopStar(topBox) {
  const rect = topBox.getBoundingClientRect();
  const starHeight = topStarEl.offsetHeight;

  // Phone vs desktop spacing
  const isMobile = window.innerWidth < 600;
  const boxSpacing = isMobile ? -4 : 0; 
  // mobile pulls star closer to box — prevents it going offscreen

  const x = rect.left + rect.width / 2;
  const y = rect.top - starHeight + boxSpacing;

  topStarEl.style.left = `${x}px`;
  topStarEl.style.top = `${y}px`;
}




init();



