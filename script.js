/*
 * Apps ScriptをWebアプリとしてデプロイ後、下記API_URLを書き換えるだけで動きます。
 * 例: const API_URL = "https://script.google.com/macros/s/XXXXX/exec";
 */
const API_URL = "https://script.google.com/macros/s/AKfycbwJKRyeAw9jiC-jmvJ2fIgRdmdHpu1CVCu61cEC9OojBjMtszdU4fdj99eBIPz0ogwh/exec";

const MILESTONES = [100, 500, 1000, 10000, 100000, 1000000];
const BACKGROUNDS = [
  "assets/tub_base.png",
  "assets/backgrounds-no-static-fireworks/tub_levelup1.png",
  "assets/backgrounds-no-static-fireworks/tub_levelup2.png",
  "assets/backgrounds-no-static-fireworks/tub_levelup3.png",
  "assets/backgrounds-no-static-fireworks/tub_levelup4.png",
  "assets/backgrounds-no-static-fireworks/tub_levelup5.png",
  "assets/backgrounds-no-static-fireworks/tub_levelup6.png"
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
const FIREWORK_PHASES = [
  { name: "launch", src: "assets/fireworks/firework-launch.png" },
  { name: "opening", src: "assets/fireworks/firework-opening.png" },
  { name: "full", src: "assets/fireworks/firework-full.png" },
  { name: "fade", src: "assets/fireworks/firework-fade.png" }
];
const FIREWORK_COLORS = [
  { name: "red", hue: 0 },
  { name: "gold", hue: 28 },
  { name: "cyan", hue: 168 },
  { name: "violet", hue: 252 }
];
const BACKGROUND_FIREWORKS = [
  [],
  [
    { x: 18, y: 15, size: 7 }, { x: 70, y: 6, size: 4 },
    { x: 84, y: 15, size: 7 }
  ],
  [
    { x: 17, y: 18, size: 5 }, { x: 25, y: 11, size: 8 },
    { x: 56, y: 4, size: 4 }, { x: 76, y: 11, size: 8 },
    { x: 85, y: 18, size: 5 }
  ],
  [
    { x: 14, y: 7, size: 7 }, { x: 23, y: 6, size: 8 },
    { x: 30, y: 4, size: 3 }, { x: 37, y: 7, size: 7 },
    { x: 45, y: 5, size: 3 }, { x: 52, y: 6, size: 8 },
    { x: 62, y: 9, size: 7 }, { x: 72, y: 4, size: 5 },
    { x: 78, y: 9, size: 7 }, { x: 18, y: 18, size: 7 },
    { x: 29, y: 16, size: 7 }, { x: 71, y: 15, size: 7 },
    { x: 76, y: 18, size: 3 }, { x: 85, y: 17, size: 6 }
  ],
  [
    { x: 14, y: 7, size: 7 }, { x: 23, y: 6, size: 8 },
    { x: 35, y: 3, size: 4 }, { x: 41, y: 8, size: 7 },
    { x: 45, y: 3, size: 3 }, { x: 52, y: 5, size: 7 },
    { x: 63, y: 8, size: 7 }, { x: 75, y: 10, size: 7 },
    { x: 80, y: 2, size: 5 }, { x: 83, y: 8, size: 4 },
    { x: 12, y: 13, size: 3 }, { x: 18, y: 16, size: 7 },
    { x: 29, y: 16, size: 7 }, { x: 69, y: 14, size: 3 },
    { x: 71, y: 17, size: 4 }, { x: 84, y: 16, size: 5 }
  ],
  [
    { x: 17, y: 5, size: 8 }, { x: 26, y: 3, size: 3 },
    { x: 27, y: 7, size: 3 }, { x: 42, y: 6, size: 6 },
    { x: 36, y: 14, size: 4 }, { x: 58, y: 5, size: 4 },
    { x: 64, y: 6, size: 7 }, { x: 79, y: 7, size: 7 },
    { x: 84, y: 20, size: 4 }
  ],
  [
    { x: 24, y: 6, size: 7 }, { x: 32, y: 6, size: 7 },
    { x: 40, y: 6, size: 4 }, { x: 59, y: 4, size: 5 },
    { x: 68, y: 6, size: 7 }, { x: 76, y: 6, size: 7 },
    { x: 29, y: 16, size: 6 }, { x: 72, y: 16, size: 6 }
  ]
];
const fallbackStorage = new Map();

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

function getSampleTotal() {
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.has("sample")) return null;

  const value = Number(searchParams.get("sample"));
  const allowedTotals = [0, ...MILESTONES];
  return allowedTotals.includes(value) ? value : null;
}

function isSamplePreview() {
  return getSampleTotal() !== null;
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

function renderBackgroundFireworks(stage) {
  const fireworks = BACKGROUND_FIREWORKS[stage] || [];
  const fragment = document.createDocumentFragment();
  const baseDuration = Math.max(3.8, 7.2 - stage * 0.55);
  const availableColors = Math.min(FIREWORK_COLORS.length, Math.max(2, stage));

  elements.fireworks.replaceChildren();
  elements.fireworks.dataset.count = String(fireworks.length);
  elements.fireworks.dataset.phases = String(FIREWORK_PHASES.length);

  fireworks.forEach(({ x, y, size }, index) => {
    const firework = document.createElement("span");
    const diameter = size * 2;
    const duration = baseDuration + (index % 3) * 0.55 + Math.random() * 0.35;
    const stagger = stage <= 2 ? 1.45 : stage <= 4 ? 0.82 : 0.58;
    const delay = index * stagger + stage * 0.37 + Math.random() * 1.2;
    const color = FIREWORK_COLORS[(index + stage) % availableColors];

    firework.className = "background-firework";
    firework.dataset.color = color.name;
    firework.style.setProperty("--burst-left", `${x - size}%`);
    firework.style.setProperty("--burst-top", `${y - size}%`);
    firework.style.setProperty("--burst-diameter", `${diameter}%`);
    firework.style.setProperty("--burst-duration", `${duration}s`);
    firework.style.setProperty("--burst-delay", `${-delay}s`);
    firework.style.setProperty("--firework-hue", `${color.hue}deg`);

    FIREWORK_PHASES.forEach(({ name, src }) => {
      const image = document.createElement("img");
      image.className = `firework-phase firework-${name}`;
      image.src = src;
      image.alt = "";
      image.draggable = false;
      firework.appendChild(image);
    });

    fragment.appendChild(firework);
  });

  elements.fireworks.appendChild(fragment);
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
  renderBackgroundFireworks(stage);

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

function maybeCelebrate(total, force = false) {
  const reachedMilestone = [...MILESTONES].reverse().find((milestone) => total >= milestone);
  if (!reachedMilestone) return;

  const storageKey = `celebration_shown_${reachedMilestone}`;
  if (!force && hasStoredFlag(storageKey)) return;

  if (!force) storeFlag(storageKey);
  elements.milestoneLabel.textContent = `${reachedMilestone.toLocaleString("ja-JP")} FISH!`;
  elements.celebration.classList.remove("is-playing");
  requestAnimationFrame(() => elements.celebration.classList.add("is-playing"));
  window.setTimeout(() => elements.celebration.classList.remove("is-playing"), 5200);
}

async function fetchCounter(source) {
  const searchParams = new URLSearchParams(window.location.search);
  const sampleTotal = getSampleTotal();

  if (sampleTotal !== null) {
    return {
      qr: Math.floor(sampleTotal * 0.6),
      sns: Math.ceil(sampleTotal * 0.4),
      total: sampleTotal,
      demo: true,
      preview: true
    };
  }

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
  if (shouldCount && !isLocalDemo() && !isSamplePreview()) storeFlag(dailyKey);

  elements.sourceNote.textContent = isSamplePreview()
    ? "サンプル表示"
    : source === "qr"
    ? "会場QRから参加"
    : source === "sns"
      ? "SNSから参加"
      : "通常アクセス";

  try {
    const data = await fetchCounter(requestSource);
    if (!data.demo) cacheCounter(data);
    render(data);
    const forcePreviewEffect = data.preview
      && new URLSearchParams(window.location.search).get("effect") === "1";
    if (!data.preview || forcePreviewEffect) {
      maybeCelebrate(Number(data.total) || 0, forcePreviewEffect);
    }
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
