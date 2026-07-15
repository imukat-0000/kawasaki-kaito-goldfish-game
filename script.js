/*
 * Apps ScriptをWebアプリとしてデプロイ後、下記API_URLを書き換えるだけで動きます。
 * 例: const API_URL = "https://script.google.com/macros/s/XXXXX/exec";
 */
const API_URL = "https://script.google.com/macros/s/AKfycbwJKRyeAw9jiC-jmvJ2fIgRdmdHpu1CVCu61cEC9OojBjMtszdU4fdj99eBIPz0ogwh/exec";

const FISH_PER_ACCESS = 10;
const CELEBRATION_INTERVAL = 100;
const LEVEL_THRESHOLDS = [0, 100, 300, 500];
const BACKGROUNDS = [
  "assets/tub_base.png",
  "assets/tub_levelup1.png",
  "assets/tub_levelup2.png",
  "assets/tub_levelup3.png"
];
const MAX_VISIBLE_FISH = 64;

const elements = {
  scene: document.querySelector("#scene"),
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

function getStage(total) {
  let stage = 0;
  LEVEL_THRESHOLDS.forEach((threshold, index) => {
    if (total >= threshold) stage = index;
  });
  return stage;
}

function getNextMilestone(total) {
  return (Math.floor(total / CELEBRATION_INTERVAL) + 1) * CELEBRATION_INTERVAL;
}

function getProgress(total) {
  const currentMilestone = Math.floor(total / CELEBRATION_INTERVAL) * CELEBRATION_INTERVAL;
  const nextMilestone = currentMilestone + CELEBRATION_INTERVAL;
  const withinStage = total - currentMilestone;
  return {
    percent: (withinStage / CELEBRATION_INTERVAL) * 100,
    currentMilestone,
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

function renderFish(total) {
  const count = Math.min(Math.floor(total / FISH_PER_ACCESS), MAX_VISIBLE_FISH);
  const fragment = document.createDocumentFragment();
  elements.fishPond.replaceChildren();

  for (let index = 0; index < count; index += 1) {
    const fish = document.createElement("img");
    const { x, y } = seededPosition(index);
    fish.className = "goldfish";
    fish.src = "assets/goldfish_sprite.png";
    fish.alt = "";
    fish.style.left = `${x}%`;
    fish.style.top = `${y}%`;
    fish.style.setProperty("--duration", `${1.5 + (index % 5) * 0.3}s`);
    fish.style.setProperty("--delay", `${-(index % 7) * 0.27}s`);
    fish.style.transform = `translate(-50%, -50%) scaleX(${index % 3 === 0 ? -1 : 1})`;
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
  elements.stage.textContent = String(stage + 1).padStart(2, "0");
  elements.scene.src = BACKGROUNDS[Math.min(stage, BACKGROUNDS.length - 1)];
  elements.progressLabel.textContent = `${total - progress.currentMilestone} / ${CELEBRATION_INTERVAL}`;
  elements.progressFill.style.width = `${progress.percent}%`;
  elements.progressTrack.setAttribute("aria-valuenow", String(Math.round(progress.percent)));
  elements.progressTrack.setAttribute("aria-valuetext", `次の${progress.nextMilestone}アクセスまで${progress.nextMilestone - total}件`);
  renderFish(total);
}

function maybeCelebrate(total) {
  const reachedMilestone = Math.floor(total / CELEBRATION_INTERVAL) * CELEBRATION_INTERVAL;
  if (reachedMilestone < CELEBRATION_INTERVAL) return;

  const storageKey = `celebration_shown_${reachedMilestone}`;
  if (localStorage.getItem(storageKey)) return;

  localStorage.setItem(storageKey, "1");
  elements.milestoneLabel.textContent = `${reachedMilestone} ACCESS!`;
  elements.celebration.classList.remove("is-playing");
  requestAnimationFrame(() => elements.celebration.classList.add("is-playing"));
  window.setTimeout(() => elements.celebration.classList.remove("is-playing"), 5200);
}

async function fetchCounter(source) {
  if (API_URL.includes("YOUR_APPS_SCRIPT")) {
    const demoTotal = Number(new URLSearchParams(window.location.search).get("demo")) || 0;
    return { qr: Math.floor(demoTotal * 0.6), sns: Math.ceil(demoTotal * 0.4), total: demoTotal, demo: true };
  }

  const url = new URL(API_URL);
  if (source) url.searchParams.set("src", source);
  url.searchParams.set("_", String(Date.now()));

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    redirect: "follow"
  });

  if (!response.ok) throw new Error(`Counter API returned ${response.status}`);
  const data = await response.json();
  if (![data.qr, data.sns, data.total].every(Number.isFinite)) {
    throw new Error("Counter API response is invalid");
  }
  return data;
}

async function initialize() {
  const source = getValidSource();
  const dailyKey = source ? `${getJstDateKey()}_${source}` : null;
  const shouldCount = Boolean(source && !localStorage.getItem(dailyKey));
  const requestSource = shouldCount ? source : null;

  elements.sourceNote.textContent = source === "qr"
    ? "会場QRから参加"
    : source === "sns"
      ? "SNSから参加"
      : "通常アクセス";

  try {
    const data = await fetchCounter(requestSource);
    if (shouldCount && !data.demo) localStorage.setItem(dailyKey, "1");
    render(data);
    maybeCelebrate(Number(data.total) || 0);
    elements.status.classList.add("is-hidden");
  } catch (error) {
    console.error(error);
    elements.status.textContent = "つうしんに しっぱいしました";
    elements.status.classList.add("is-error");
  }
}

initialize();
