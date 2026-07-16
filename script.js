/*
 * Apps ScriptをWebアプリとしてデプロイ後、下記API_URLを書き換えるだけで動きます。
 * 例: const API_URL = "https://script.google.com/macros/s/XXXXX/exec";
 */
const API_URL = "https://script.google.com/macros/s/AKfycbwJKRyeAw9jiC-jmvJ2fIgRdmdHpu1CVCu61cEC9OojBjMtszdU4fdj99eBIPz0ogwh/exec";

const MILESTONES = [100, 500, 1000, 10000, 100000, 1000000];
const BACKGROUNDS = [
  "assets/tub_base.png",
  "assets/tub_levelup1.png",
  "assets/tub_levelup2.png",
  "assets/tub_levelup3.png",
  "assets/tub_levelup4.png",
  "assets/tub_levelup5.png",
  "assets/tub_levelup6.png"
];
const GOLDFISH_SPRITES = [
  "assets/goldfish_sprite.png",
  "assets/goldfish_black.png",
  "assets/demekin_red.png",
  "assets/demekin_black.png",
  "assets/demekin_gold.png"
];
const KOI_SPRITES = [
  "assets/koi_sprite.png",
  "assets/koi_sanke.png",
  "assets/koi_gold.png"
];
const MAX_VISIBLE_FISH = 72;
const REQUEST_TIMEOUT_MS = 10000;
const COUNTER_CACHE_KEY = "counter_last_success";
const FIREWORK_COLORS = ["#f1c85b", "#fff1a5", "#c94b2d", "#d2d77a", "#f28f45"];
const fallbackStorage = new Map();
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let fireworksTimer = null;

const elements = {
  gameScreen: document.querySelector("#gameScreen"),
  scene: document.querySelector("#scene"),
  fireworks: document.querySelector("#fireworks"),
  fishPond: document.querySelector("#fishPond"),
  total: document.querySelector("#totalCount"),
  qr: document.querySelector("#qrCount"),
  sns: document.querySelector("#snsCount"),
  stage: document.querySelector("#stageLabel"),
  progressTrack: document.querySelector("#progressTrack"),
  progressFill: document.querySelector("#progressFill"),
  progressLabel: document.querySelector("#progressLabel"),
  celebration: document.querySelector("#celebration"),
  milestoneLabel: document.querySelector("#milestoneLabel"),
  status: document.querySelector("#statusMessage"),
  sourceNote: document.querySelector("#sourceNote")
};

function getJstDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function getValidSource() {
  const value = new URLSearchParams(window.location.search).get("src");
  return value === "qr" || value === "sns" ? value : null;
}

function getStoredValue(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return fallbackStorage.get(key) || null;
  }
}

function setStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    fallbackStorage.set(key, value);
  }
}

function hasStoredFlag(key) {
  return getStoredValue(key) === "1";
}

function storeFlag(key) {
  setStoredValue(key, "1");
}

function isLocalDemo() {
  const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  return isLocalPreview && new URLSearchParams(window.location.search).has("demo");
}

function normalizeCounterData(data) {
  const values = [data?.qr, data?.sns, data?.total];
  if (!values.every((value) => Number.isFinite(value) && value >= 0)) {
    throw new Error("Counter API response is invalid");
  }

  const [qr, sns, total] = values.map(Math.floor);
  if (total !== qr + sns) {
    throw new Error("Counter API totals are inconsistent");
  }
  return { qr, sns, total };
}

function cacheCounter(data) {
  setStoredValue(COUNTER_CACHE_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
}

function readCachedCounter() {
  try {
    const cached = JSON.parse(getStoredValue(COUNTER_CACHE_KEY));
    return normalizeCounterData(cached);
  } catch (error) {
    return null;
  }
}

function getStage(total) {
  return MILESTONES.filter((milestone) => total >= milestone).length;
}

function createFirework() {
  if (!elements.fireworks || reducedMotionQuery.matches || document.hidden) return;

  const firework = document.createElement("div");
  const rocket = document.createElement("span");
  const flash = document.createElement("span");
  const x = 16 + Math.random() * 68;
  const y = 8 + Math.random() * 25;
  const stage = Number(elements.gameScreen.dataset.stage) || 0;
  const palette = stage <= 1
    ? ["#a8322b", "#c94b2d", "#e35b32", "#f28f45"]
    : FIREWORK_COLORS;
  const color = palette[Math.floor(Math.random() * palette.length)];
  const particleCount = 13 + Math.floor(Math.random() * 8);
  const screenScale = Math.min(1.15, Math.max(0.68, elements.gameScreen.clientWidth / 760));
  const launchDistance = Math.max(
    90,
    Math.round(elements.gameScreen.clientHeight * (0.62 - y / 100))
  );
  const burstDelay = 620 + Math.floor(Math.random() * 180);

  firework.className = "firework";
  firework.style.left = `${x}%`;
  firework.style.top = `${y}%`;
  firework.style.setProperty("--firework-color", color);
  firework.style.setProperty("--launch-distance", `${launchDistance}px`);
  firework.style.setProperty("--burst-delay", `${burstDelay}ms`);

  rocket.className = "firework-rocket";
  flash.className = "firework-flash";
  firework.append(rocket, flash);

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.18;
    const distance = (42 + Math.random() * 46) * screenScale;
    const particleColor = Math.random() < 0.72
      ? color
      : palette[Math.floor(Math.random() * palette.length)];

    particle.className = "firework-particle";
    particle.style.setProperty("--particle-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--particle-y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--particle-color", particleColor);
    particle.style.setProperty("--particle-size", `${3 + Math.floor(Math.random() * 3)}px`);
    firework.appendChild(particle);
  }

  elements.fireworks.appendChild(firework);
  window.setTimeout(() => firework.remove(), burstDelay + 1800);
}

function scheduleFirework(initialDelay = null) {
  if (reducedMotionQuery.matches || document.hidden) return;
  const delay = initialDelay ?? 900 + Math.random() * 1600;

  fireworksTimer = window.setTimeout(() => {
    createFirework();
    scheduleFirework();
  }, delay);
}

function stopFireworks() {
  window.clearTimeout(fireworksTimer);
  fireworksTimer = null;
  elements.fireworks?.replaceChildren();
}

function startFireworks() {
  stopFireworks();
  if (!reducedMotionQuery.matches && !document.hidden) {
    scheduleFirework(350 + Math.random() * 650);
  }
}

function setupFireworks() {
  const updateFireworks = () => {
    if (reducedMotionQuery.matches || document.hidden) stopFireworks();
    else startFireworks();
  };

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", updateFireworks);
  } else {
    reducedMotionQuery.addListener(updateFireworks);
  }
  document.addEventListener("visibilitychange", updateFireworks);
  updateFireworks();
}

function getProgress(total) {
  const stage = getStage(total);
  const previousMilestone = stage === 0 ? 0 : MILESTONES[stage - 1];
  const nextMilestone = MILESTONES[stage] || null;

  if (!nextMilestone) {
    return { percent: 100, previousMilestone, nextMilestone: null };
  }

  return {
    percent: ((total - previousMilestone) / (nextMilestone - previousMilestone)) * 100,
    previousMilestone,
    nextMilestone
  };
}

function seededPosition(index) {
  const angle = index * 2.399963 + 0.6;
  const radius = Math.sqrt((index + 1) / (MAX_VISIBLE_FISH + 2));
  const x = 48 + Math.cos(angle) * radius * 42;
  const y = 48 + Math.sin(angle) * radius * 36;
  return { x, y };
}

function seededRandom(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function pickSprite(sprites, seed) {
  return sprites[Math.floor(seededRandom(seed) * sprites.length)];
}

function renderFish(total) {
  const count = Math.min(Math.max(Math.floor(total), 0), MAX_VISIBLE_FISH);
  const koiProbability = total >= 1000
    ? Math.min(0.34, 0.12 + Math.log10(total / 1000) * 0.055)
    : 0;
  const fragment = document.createDocumentFragment();
  elements.fishPond.replaceChildren();
  elements.fishPond.dataset.density = count <= 12
    ? "sparse"
    : count <= 36
      ? "medium"
      : "dense";

  for (let index = 0; index < count; index += 1) {
    const fish = document.createElement("img");
    const { x, y } = seededPosition(index);
    const typeRoll = seededRandom(total * 0.17 + index * 19.73);
    let isKoi = total >= 1000 && typeRoll < koiProbability;

    if (total >= 1000 && count >= 2) {
      if (index === 0) isKoi = false;
      if (index === 1) isKoi = true;
    }

    const sprites = isKoi ? KOI_SPRITES : GOLDFISH_SPRITES;
    fish.className = `goldfish${isKoi ? " is-koi" : ""}`;
    fish.src = pickSprite(sprites, total * 0.31 + index * 31.17);
    fish.alt = "";
    fish.style.left = `${x}%`;
    fish.style.top = `${y}%`;
    fish.style.setProperty("--duration", `${(isKoi ? 2.4 : 1.5) + (index % 5) * 0.3}s`);
    fish.style.setProperty("--delay", `${-(index % 7) * 0.27}s`);
    fish.style.transform = `translate(-50%, -50%) scaleX(${seededRandom(total + index * 7.7) < 0.38 ? -1 : 1})`;
    fragment.appendChild(fish);
  }

  elements.fishPond.appendChild(fragment);
}

function render(data) {
  const total = Number(data.total) || 0;
  const qr = Number(data.qr) || 0;
  const sns = Number(data.sns) || 0;
  const stage = getStage(total);
  const progress = getProgress(total);

  elements.total.textContent = total.toLocaleString("ja-JP");
  elements.qr.textContent = qr.toLocaleString("ja-JP");
  elements.sns.textContent = sns.toLocaleString("ja-JP");
  elements.stage.textContent = String(stage).padStart(2, "0");
  const background = BACKGROUNDS[Math.min(stage, BACKGROUNDS.length - 1)];
  elements.scene.src = background;
  elements.gameScreen.dataset.stage = String(stage);
  elements.gameScreen.style.setProperty("--scene-image", `url("${background}")`);

  elements.progressLabel.textContent = progress.nextMilestone
    ? `${total.toLocaleString("ja-JP")} / ${progress.nextMilestone.toLocaleString("ja-JP")}`
    : `MAX ${MILESTONES[MILESTONES.length - 1].toLocaleString("ja-JP")}`;
  elements.progressFill.style.width = `${progress.percent}%`;
  const accessiblePercent = Math.floor(progress.percent * 100) / 100;
  elements.progressTrack.setAttribute("aria-valuenow", String(accessiblePercent));
  elements.progressTrack.setAttribute(
    "aria-valuetext",
    progress.nextMilestone
      ? `次の${progress.nextMilestone}匹まで${progress.nextMilestone - total}匹`
      : "最高段階に到達"
  );
  renderFish(total);
}

function maybeCelebrate(total) {
  const reachedMilestone = [...MILESTONES].reverse().find((milestone) => total >= milestone);
  if (!reachedMilestone) return;

  const storageKey = `celebration_shown_${reachedMilestone}`;
  if (hasStoredFlag(storageKey)) return;

  storeFlag(storageKey);
  elements.milestoneLabel.textContent = `${reachedMilestone.toLocaleString("ja-JP")} FISH!`;
  elements.celebration.classList.remove("is-playing");
  requestAnimationFrame(() => elements.celebration.classList.add("is-playing"));
  window.setTimeout(() => elements.celebration.classList.remove("is-playing"), 5200);
}

async function fetchCounter(source) {
  const searchParams = new URLSearchParams(window.location.search);

  if (isLocalDemo()) {
    const requestedTotal = Number(searchParams.get("demo"));
    const demoTotal = Number.isFinite(requestedTotal)
      ? Math.floor(Math.max(0, requestedTotal))
      : 0;
    return {
      qr: Math.floor(demoTotal * 0.6),
      sns: Math.ceil(demoTotal * 0.4),
      total: demoTotal,
      demo: true
    };
  }

  if (API_URL.includes("YOUR_APPS_SCRIPT")) {
    return { qr: 0, sns: 0, total: 0, demo: true };
  }

  const url = new URL(API_URL);
  if (source) url.searchParams.set("src", source);
  url.searchParams.set("_", String(Date.now()));

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal
    });

    if (!response.ok) throw new Error(`Counter API returned ${response.status}`);
    return normalizeCounterData(await response.json());
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function initialize() {
  const source = getValidSource();
  const dailyKey = source ? `${getJstDateKey()}_${source}` : null;
  const shouldCount = Boolean(source && !hasStoredFlag(dailyKey));
  const requestSource = shouldCount ? source : null;

  // Reserve before the request so simultaneous tabs cannot both increment.
  if (shouldCount && !isLocalDemo()) storeFlag(dailyKey);

  elements.sourceNote.textContent = source === "qr"
    ? "会場QRから参加"
    : source === "sns"
      ? "SNSから参加"
      : "通常アクセス";

  try {
    const data = await fetchCounter(requestSource);
    if (!data.demo) cacheCounter(data);
    render(data);
    maybeCelebrate(Number(data.total) || 0);
    elements.status.classList.remove("is-error", "is-stale");
    elements.status.classList.add("is-hidden");
  } catch (error) {
    console.error(error);
    const cached = readCachedCounter();

    if (cached) {
      render(cached);
      elements.status.textContent = "前回の記録を表示しています";
      elements.status.classList.remove("is-hidden", "is-error");
      elements.status.classList.add("is-stale");
    } else {
      elements.status.textContent = "つうしんに しっぱいしました";
      elements.status.classList.remove("is-hidden", "is-stale");
      elements.status.classList.add("is-error");
    }
  }
}

initialize();
setupFireworks();
