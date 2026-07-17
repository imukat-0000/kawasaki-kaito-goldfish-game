/*
 * Apps ScriptをWebアプリとしてデプロイ後、下記API_URLを書き換えるだけで動きます。
 * 例: const API_URL = "https://script.google.com/macros/s/XXXXX/exec";
 */
const API_URL = "https://script.google.com/macros/s/AKfycbwJKRyeAw9jiC-jmvJ2fIgRdmdHpu1CVCu61cEC9OojBjMtszdU4fdj99eBIPz0ogwh/exec";

const MILESTONES = [100, 500, 1000, 10000, 100000, 1000000];
const ORIGINAL_BACKGROUNDS = [
  "assets/tub_base.png",
  "assets/backgrounds-no-static-fireworks/tub_levelup1.png",
  "assets/backgrounds-low-water/tub_levelup2.png",
  "assets/backgrounds-low-water/tub_levelup3.png",
  "assets/backgrounds-low-water/tub_levelup4.png",
  "assets/backgrounds-low-water/tub_levelup5.png",
  "assets/backgrounds-low-water/tub_levelup6.png"
];
const BACKGROUNDS = [
  "assets/backgrounds-zoomed/tub_base.webp",
  "assets/backgrounds-zoomed/tub_levelup1.webp",
  "assets/backgrounds-zoomed/tub_levelup2.webp",
  "assets/backgrounds-zoomed/tub_levelup3.webp",
  "assets/backgrounds-zoomed/tub_levelup4.webp",
  "assets/backgrounds-zoomed/tub_levelup5.webp",
  "assets/backgrounds-zoomed/tub_levelup6.webp"
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
const GROWTH_CYCLE_LENGTH = 10;
const FROG_SWIM_START_PROGRESS = 8;
const TADPOLE_GROWTH_SCALES = [0.52, 0.46, 0.55, 0.59, 0.71, 0.83, 0.89];
const MAX_VISIBLE_KOI = 24;
const FROG_STAY_COUNTS = 12;
const ANIMAL_FRAME_ROOT = "assets/animal-sprites/color-v2/frames";
const HUMAN_FRAME_ROOT = "assets/human-sprites/frames";
const VISITOR_STORAGE_KEY = document.body.classList.contains("test-page")
  ? "growth_game_visitors_test_v1"
  : "growth_game_visitors_v1";
const VISITOR_CONFIG = {
  cat: { chance: 0.012, minStay: 5, maxStay: 9 },
  bird: { chance: 0.016, minStay: 4, maxStay: 8 }
};
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
  cameraTransition: document.querySelector("#cameraTransition"),
  fireworks: document.querySelector("#fireworks"),
  fishPond: document.querySelector("#fishPond"),
  visitorLayer: document.querySelector("#visitorLayer"),
  peopleLayer: document.querySelector("#peopleLayer"),
  total: document.querySelector("#totalCount"),
  qr: document.querySelector("#qrCount"),
  sns: document.querySelector("#snsCount"),
  stage: document.querySelector("#stageLabel"),
  progressTrack: document.querySelector("#progressTrack"),
  progressFill: document.querySelector("#progressFill"),
  progressLabel: document.querySelector("#progressLabel"),
  thankYou: document.querySelector("#thankYouMessage"),
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

function seededPosition(index) {
  const angle = seededRandom(index * 17.31 + 2.47) * Math.PI * 2;
  const radius = Math.sqrt(seededRandom(index * 29.17 + 8.91));
  const x = 50 + Math.cos(angle) * radius * 36;
  const y = 50 + Math.sin(angle) * radius * 30;
  return { x, y };
}

function seededRandom(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function pickSprite(sprites, seed) {
  return sprites[Math.floor(seededRandom(seed) * sprites.length)];
}

function isFrogCycle(cycleIndex) {
  if (cycleIndex === 1) return true;
  if (cycleIndex < 4) return false;
  return seededRandom(cycleIndex * 41.73 + 5.9) < 0.16;
}

function getGrowthState(total) {
  if (total === 0) {
    return { cycleIndex: 0, progress: 0, type: "goldfish", complete: false };
  }

  const remainder = total % GROWTH_CYCLE_LENGTH;
  const complete = remainder === 0;
  const cycleIndex = complete
    ? total / GROWTH_CYCLE_LENGTH - 1
    : Math.floor(total / GROWTH_CYCLE_LENGTH);
  return {
    cycleIndex,
    progress: complete ? GROWTH_CYCLE_LENGTH : remainder,
    type: isFrogCycle(cycleIndex) ? "frog" : "goldfish",
    complete
  };
}

function getAnimalFrame(group, action, frame) {
  return `${ANIMAL_FRAME_ROOT}/${group}/${action}-${String(frame).padStart(2, "0")}.png`;
}

function getHumanFrame(character, action, frame) {
  return `${HUMAN_FRAME_ROOT}/${character}/${action}-${String(frame).padStart(2, "0")}.png`;
}

function createPondAnimal({ className, src, seed, scale = 1, frameAction = null }) {
  const animal = document.createElement("img");
  const { x, y } = seededPosition(seed);
  const facing = seededRandom(seed * 7.7 + 3.1) < 0.5 ? -1 : 1;
  animal.className = `goldfish ${className}`;
  animal.src = src;
  animal.alt = "";
  animal.style.left = `${x}%`;
  animal.style.top = `${y}%`;
  animal.style.setProperty("--duration", `${1.8 + (seed % 5) * 0.28}s`);
  animal.style.setProperty("--delay", `${-(seed % 7) * 0.27}s`);
  animal.style.setProperty("--growth-scale", String(scale));
  animal.style.transform = `translate(-50%, -50%) scaleX(${facing}) scale(var(--growth-scale))`;
  animal.dataset.growthId = String(seed);

  if (frameAction) {
    animal.dataset.frameGroup = frameAction.group;
    animal.dataset.frameAction = frameAction.action;
    animal.dataset.frameOffset = String(Math.abs(seed) % 4);
  }
  return animal;
}

function collectRecentKoiCycles(completedCycles) {
  const cycles = [];
  for (let cycleIndex = completedCycles - 1; cycleIndex >= 0 && cycles.length < MAX_VISIBLE_KOI; cycleIndex -= 1) {
    if (!isFrogCycle(cycleIndex)) cycles.push(cycleIndex);
  }
  return cycles.reverse();
}

function renderGrowth(total, previousTotal = null) {
  const completedCycles = Math.floor(total / GROWTH_CYCLE_LENGTH);
  const growth = getGrowthState(total);
  const fragment = document.createDocumentFragment();
  elements.fishPond.replaceChildren();
  const koiCycles = collectRecentKoiCycles(completedCycles);

  koiCycles.forEach((cycleIndex) => {
    const koi = createPondAnimal({
      className: "is-koi adult-koi",
      src: pickSprite(KOI_SPRITES, cycleIndex * 31.17 + 7.3),
      seed: cycleIndex * 13 + 101
    });
    koi.dataset.cycle = String(cycleIndex);
    fragment.appendChild(koi);
  });

  const recentCycleStart = Math.max(0, completedCycles - 4);
  for (let cycleIndex = recentCycleStart; cycleIndex < completedCycles; cycleIndex += 1) {
    if (!isFrogCycle(cycleIndex)) continue;
    const matureAt = (cycleIndex + 1) * GROWTH_CYCLE_LENGTH;
    const escapeAt = matureAt + FROG_STAY_COUNTS;
    const crossedEscape = previousTotal !== null && previousTotal < escapeAt && total >= escapeAt;
    const isEscaping = total === escapeAt || crossedEscape;
    if (total > escapeAt && !crossedEscape) continue;

    const direction = seededRandom(cycleIndex * 9.3 + 2.1) < 0.5 ? "swim-left" : "swim-right";
    const frog = createPondAnimal({
      className: `growth-frog${isEscaping ? " is-escaping" : ""}`,
      src: getAnimalFrame("frog-swim", direction, 1),
      seed: cycleIndex * 17 + 701,
      frameAction: { group: "frog-swim", action: direction }
    });
    frog.dataset.cycle = String(cycleIndex);
    if (isEscaping) {
      frog.classList.add(direction === "swim-left" ? "escape-left" : "escape-right");
    }
    fragment.appendChild(frog);
  }

  if (!growth.complete || total === 0) {
    if (growth.type === "goldfish") {
      const scale = 0.48 + growth.progress * 0.07;
      const goldfish = createPondAnimal({
        className: "growth-active growth-goldfish",
        src: pickSprite(GOLDFISH_SPRITES, growth.cycleIndex * 31.17 + 7.3),
        seed: growth.cycleIndex * 19 + 1701,
        scale
      });
      goldfish.dataset.progress = String(growth.progress);
      fragment.appendChild(goldfish);
    } else if (growth.progress < FROG_SWIM_START_PROGRESS) {
      const frame = Math.max(1, Math.min(8, Math.ceil(growth.progress * 8 / 9)));
      const tadpole = createPondAnimal({
        className: "growth-active growth-tadpole",
        src: `${ANIMAL_FRAME_ROOT}/metamorphosis/frame-${String(frame).padStart(2, "0")}.png`,
        seed: growth.cycleIndex * 19 + 2701,
        scale: TADPOLE_GROWTH_SCALES[growth.progress - 1]
      });
      tadpole.dataset.progress = String(growth.progress);
      tadpole.dataset.metamorphosisFrame = String(frame);
      fragment.appendChild(tadpole);
    } else {
      const direction = seededRandom(growth.cycleIndex * 9.3 + 2.1) < 0.5 ? "swim-left" : "swim-right";
      const frog = createPondAnimal({
        className: "growth-active growth-frog growth-frog-young",
        src: getAnimalFrame("frog-swim", direction, 1),
        seed: growth.cycleIndex * 19 + 2701,
        frameAction: { group: "frog-swim", action: direction }
      });
      frog.dataset.progress = String(growth.progress);
      fragment.appendChild(frog);
    }
  }

  const count = fragment.childNodes.length;
  elements.fishPond.dataset.density = count <= 8
    ? "sparse"
    : count <= 18
      ? "medium"
      : "dense";
  elements.fishPond.appendChild(fragment);
  elements.fishPond.dataset.growthType = growth.type;
  elements.fishPond.dataset.growthProgress = String(growth.progress);
}

let pondFrame = 0;
window.setInterval(() => {
  pondFrame = (pondFrame + 1) % 4;
  document.querySelectorAll("#fishPond [data-frame-group]").forEach((animal) => {
    const frame = (pondFrame + Number(animal.dataset.frameOffset || 0)) % 4 + 1;
    animal.src = getAnimalFrame(animal.dataset.frameGroup, animal.dataset.frameAction, frame);
  });
}, 220);

function readVisitorState() {
  try {
    const parsed = JSON.parse(getStoredValue(VISITOR_STORAGE_KEY));
    return {
      cat: parsed?.cat || null,
      bird: parsed?.bird || null
    };
  } catch (error) {
    return { cat: null, bird: null };
  }
}

let visitorState = readVisitorState();

function saveVisitorState() {
  setStoredValue(VISITOR_STORAGE_KEY, JSON.stringify(visitorState));
}

function getVisitorAction(type, phase, side) {
  if (type === "cat") {
    if (phase === "idle") return { group: "cat-watch", action: "watch-tail" };
    if (phase === "entering") return side === "left" ? "walk-right" : "walk-left";
    return side === "left" ? "walk-left" : "walk-right";
  }
  if (phase === "idle") return { group: "bird-watch", action: "watch-head" };
  if (phase === "entering") return side === "left" ? "fly-right" : "fly-left";
  return side === "left" ? "fly-left" : "fly-right";
}

function setVisitorPhase(visitor, phase) {
  const type = visitor.dataset.visitorType;
  const side = visitor.dataset.side;
  const frameAction = getVisitorAction(type, phase, side);
  const group = typeof frameAction === "string" ? type : frameAction.group;
  const action = typeof frameAction === "string" ? frameAction : frameAction.action;
  visitor.classList.remove("is-entering", "is-idle", "is-leaving");
  visitor.classList.add(`is-${phase}`);
  visitor.dataset.phase = phase;
  visitor.dataset.frameGroup = group;
  visitor.dataset.action = action;
  visitor.querySelector("img").src = getAnimalFrame(group, action, 1);
}

function createVisitor(type, visit, phase = "idle") {
  const existing = elements.visitorLayer.querySelector(`[data-visitor-type="${type}"]`);
  if (existing) return existing;

  const visitor = document.createElement("div");
  const image = document.createElement("img");
  visitor.className = `rare-visitor visitor-${type} from-${visit.side}`;
  visitor.dataset.visitorType = type;
  visitor.dataset.side = visit.side;
  visitor.dataset.appearedAt = String(visit.appearedAt);
  visitor.dataset.leaveAt = String(visit.leaveAt);
  visitor.dataset.frameOffset = type === "cat" ? "0" : "2";
  image.alt = "";
  image.draggable = false;
  visitor.appendChild(image);
  elements.visitorLayer.appendChild(visitor);
  setVisitorPhase(visitor, phase);

  if (phase === "entering") {
    window.setTimeout(() => {
      if (visitor.isConnected && visitor.dataset.phase === "entering") setVisitorPhase(visitor, "idle");
    }, type === "cat" ? 2800 : 2200);
  }
  return visitor;
}

function startVisitor(type, total, forced = false) {
  const config = VISITOR_CONFIG[type];
  const stayRange = config.maxStay - config.minStay + 1;
  const visit = {
    appearedAt: total,
    leaveAt: total + config.minStay + Math.floor(Math.random() * stayRange),
    side: Math.random() < 0.5 ? "left" : "right",
    forced
  };
  visitorState[type] = visit;
  saveVisitorState();
  createVisitor(type, visit, "entering");
}

function leaveVisitor(type, immediate = false) {
  const visitor = elements.visitorLayer.querySelector(`[data-visitor-type="${type}"]`);
  visitorState[type] = null;
  saveVisitorState();
  if (!visitor) return;
  if (immediate) {
    visitor.remove();
    return;
  }
  setVisitorPhase(visitor, "leaving");
  window.setTimeout(() => visitor.remove(), type === "cat" ? 2800 : 2200);
}

function updateVisitors(total, countAdvanced = false) {
  for (const type of Object.keys(VISITOR_CONFIG)) {
    const visit = visitorState[type];
    if (!visit) continue;
    if (countAdvanced && total >= visit.leaveAt) {
      leaveVisitor(type);
    } else {
      createVisitor(type, visit, "idle");
    }
  }

  if (!countAdvanced) return;
  const candidates = Object.keys(VISITOR_CONFIG)
    .filter((type) => !visitorState[type] && !elements.visitorLayer.querySelector(`[data-visitor-type="${type}"]`))
    .sort(() => Math.random() - 0.5);
  const type = candidates.find((candidate) => Math.random() < VISITOR_CONFIG[candidate].chance);
  if (type) startVisitor(type, total);
}

function forceVisitorForTest(type, total = 0) {
  if (!VISITOR_CONFIG[type]) return;
  leaveVisitor(type, true);
  startVisitor(type, total, true);
}

function clearVisitorsForTest(immediate = false) {
  Object.keys(VISITOR_CONFIG).forEach((type) => leaveVisitor(type, immediate));
}

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let visitorFrame = 0;
window.setInterval(() => {
  if (reducedMotionQuery.matches) return;
  visitorFrame = (visitorFrame + 1) % 4;
  elements.visitorLayer.querySelectorAll(".rare-visitor[data-action]").forEach((visitor) => {
    const frame = (visitorFrame + Number(visitor.dataset.frameOffset || 0)) % 4 + 1;
    visitor.querySelector("img").src = getAnimalFrame(
      visitor.dataset.frameGroup || visitor.dataset.visitorType,
      visitor.dataset.action,
      frame
    );
  });
  elements.peopleLayer.querySelectorAll(".human-character[data-action]").forEach((person) => {
    const frame = (visitorFrame + Number(person.dataset.frameOffset || 0)) % 4 + 1;
    person.querySelector("img").src = getHumanFrame(
      person.dataset.character,
      person.dataset.action,
      frame
    );
  });
}, 240);

const PEOPLE_ENTRY_MS = 3200;
const PEOPLE_VISIT_MIN_MS = 8500;
const PEOPLE_VISIT_MAX_MS = 12500;
const PEOPLE_REAPPEAR_MIN_MS = 9000;
const PEOPLE_REAPPEAR_MAX_MS = 18000;
let peopleVisible = false;
let peopleStage = 0;
let peopleOriginalBackground = ORIGINAL_BACKGROUNDS[0];
let peopleZoomedBackground = BACKGROUNDS[0];
let peopleScheduleTimeoutId = null;
let cameraZoomTimeoutId = null;
const peopleActionTimeoutIds = new Set();

function setPeopleTimeout(callback, delay) {
  const timeoutId = window.setTimeout(() => {
    peopleActionTimeoutIds.delete(timeoutId);
    callback();
  }, delay);
  peopleActionTimeoutIds.add(timeoutId);
  return timeoutId;
}

function clearPeopleActionTimeouts() {
  peopleActionTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
  peopleActionTimeoutIds.clear();
}

function randomDelay(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function setHumanAction(person, action) {
  person.dataset.action = action;
  person.querySelector("img").src = getHumanFrame(person.dataset.character, action, 1);
}

function createHumanCharacter(role, character, index) {
  const person = document.createElement("div");
  const image = document.createElement("img");
  const entrySide = index % 2 === 0 ? "left" : "right";
  person.className = `human-character human-${role} is-offscreen-${entrySide}`;
  person.dataset.character = character;
  person.dataset.action = entrySide === "left" ? "walk" : "walk-left";
  person.dataset.frameOffset = String(index % 4);
  image.src = getHumanFrame(character, person.dataset.action, 1);
  image.alt = "";
  image.draggable = false;
  person.appendChild(image);
  elements.peopleLayer.appendChild(person);

  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    person.classList.remove(`is-offscreen-${entrySide}`);
  }));

  setPeopleTimeout(() => {
    if (!person.isConnected) return;
    setHumanAction(person, role === "woman" ? "idle" : "watch-back");
  }, PEOPLE_ENTRY_MS + index * 180);
}

function renderPeople(stage) {
  const isNight = stage >= 3;
  const people = [
    ["girl", isNight ? "night-girl" : "day-girl"],
    ["boy", isNight ? "night-boy" : "day-boy"]
  ];
  if (stage >= 4) people.push(["woman", "night-woman"]);

  elements.peopleLayer.replaceChildren();
  people.forEach(([role, character], index) => createHumanCharacter(role, character, index));
}

function playCameraZoom(direction) {
  if (cameraZoomTimeoutId !== null) window.clearTimeout(cameraZoomTimeoutId);
  const zoomingOut = direction === "out";
  const zoomClass = zoomingOut ? "is-camera-zooming-out" : "is-camera-zooming-in";
  elements.gameScreen.classList.remove("is-camera-zooming-out", "is-camera-zooming-in");
  elements.cameraTransition.src = zoomingOut ? peopleOriginalBackground : peopleZoomedBackground;
  elements.scene.src = zoomingOut ? peopleZoomedBackground : peopleOriginalBackground;
  elements.gameScreen.classList.toggle("has-people", zoomingOut);
  void elements.gameScreen.offsetWidth;
  elements.gameScreen.classList.add(zoomClass);
  cameraZoomTimeoutId = window.setTimeout(() => {
    elements.gameScreen.classList.remove(zoomClass);
    cameraZoomTimeoutId = null;
  }, 3300);
}

function schedulePeopleVisit(delay = randomDelay(PEOPLE_REAPPEAR_MIN_MS, PEOPLE_REAPPEAR_MAX_MS)) {
  if (peopleVisible || peopleScheduleTimeoutId !== null) return;
  peopleScheduleTimeoutId = window.setTimeout(() => {
    peopleScheduleTimeoutId = null;
    startPeopleVisit();
  }, delay);
}

function startPeopleVisit(force = false) {
  if (peopleVisible) return;
  if (peopleScheduleTimeoutId !== null) {
    window.clearTimeout(peopleScheduleTimeoutId);
    peopleScheduleTimeoutId = null;
  }
  clearPeopleActionTimeouts();
  peopleVisible = true;
  renderPeople(peopleStage);
  playCameraZoom("out");
  const stayDuration = force ? PEOPLE_VISIT_MIN_MS : randomDelay(PEOPLE_VISIT_MIN_MS, PEOPLE_VISIT_MAX_MS);
  setPeopleTimeout(() => endPeopleVisit(), PEOPLE_ENTRY_MS + stayDuration);
}

function endPeopleVisit(immediate = false) {
  if (!peopleVisible) return;
  peopleVisible = false;
  clearPeopleActionTimeouts();
  if (immediate) {
    elements.peopleLayer.replaceChildren();
    elements.gameScreen.classList.remove("has-people", "is-camera-zooming-out", "is-camera-zooming-in");
    elements.scene.src = peopleOriginalBackground;
    schedulePeopleVisit();
    return;
  }

  elements.peopleLayer.querySelectorAll(".human-character").forEach((person, index) => {
    const exitSide = Math.random() < 0.5 ? "left" : "right";
    const isWoman = person.classList.contains("human-woman");
    setHumanAction(person, exitSide === "left" && !isWoman ? "walk-left" : "walk");
    person.classList.toggle("is-facing-left", isWoman && exitSide === "left");
    setPeopleTimeout(() => person.classList.add(`is-leaving-${exitSide}`), index * 160);
  });
  playCameraZoom("in");
  setPeopleTimeout(() => {
    elements.peopleLayer.replaceChildren();
    schedulePeopleVisit();
  }, 3500);
}

function syncPeopleScene(stage, originalBackground, zoomedBackground) {
  const stageChanged = stage !== peopleStage;
  if (stageChanged && peopleVisible) endPeopleVisit(true);
  peopleStage = stage;
  peopleOriginalBackground = originalBackground;
  peopleZoomedBackground = zoomedBackground;
  if (!peopleVisible) elements.scene.src = originalBackground;
  schedulePeopleVisit(stageChanged ? 2200 : undefined);
}

function forcePeopleForTest() {
  if (peopleVisible) endPeopleVisit(true);
  startPeopleVisit(true);
}

function dismissPeopleForTest() {
  endPeopleVisit();
}

function render(data, options = {}) {
  const total = Number(data.total) || 0;
  const qr = Number(data.qr) || 0;
  const sns = Number(data.sns) || 0;
  const stage = getStage(total);
  const growth = getGrowthState(total);

  elements.total.textContent = total.toLocaleString("ja-JP");
  elements.qr.textContent = qr.toLocaleString("ja-JP");
  elements.sns.textContent = sns.toLocaleString("ja-JP");
  elements.stage.textContent = String(stage).padStart(2, "0");
  const background = BACKGROUNDS[Math.min(stage, BACKGROUNDS.length - 1)];
  const originalBackground = ORIGINAL_BACKGROUNDS[Math.min(stage, ORIGINAL_BACKGROUNDS.length - 1)];
  elements.gameScreen.dataset.stage = String(stage);
  elements.gameScreen.style.setProperty("--scene-image", `url("${originalBackground}")`);
  renderBackgroundFireworks(stage);
  syncPeopleScene(stage, originalBackground, background);

  const isFrogGrowth = growth.type === "frog";
  const growthTarget = isFrogGrowth ? FROG_SWIM_START_PROGRESS : GROWTH_CYCLE_LENGTH;
  const displayedProgress = Math.min(growth.progress, growthTarget);
  const displayedComplete = growth.complete || displayedProgress >= growthTarget;
  const growthName = isFrogGrowth
    ? displayedComplete ? "カエル成長完了" : growth.progress >= 6 ? "カエルへ成長中" : "おたまじゃくし"
    : "金魚";
  const completeName = isFrogGrowth ? "カエル成長完了" : "鯉へ進化";
  const accessibleGrowthName = isFrogGrowth && growth.progress >= 6 ? "カエル" : growthName;
  elements.progressLabel.textContent = displayedComplete
    ? `${completeName} ${growthTarget} / ${growthTarget}`
    : `${growthName} ${displayedProgress} / ${growthTarget}`;
  const progressPercent = displayedProgress / growthTarget * 100;
  elements.progressFill.style.width = `${progressPercent}%`;
  const accessiblePercent = Math.floor(progressPercent * 100) / 100;
  elements.progressTrack.setAttribute("aria-valuenow", String(accessiblePercent));
  elements.progressTrack.setAttribute("aria-valuetext", displayedComplete
    ? isFrogGrowth ? "カエルの成長完了、泳いでいます" : completeName
    : `${accessibleGrowthName}の成長 ${displayedProgress}回目、進化まで${growthTarget - displayedProgress}回`);
  renderGrowth(total, options.previousTotal ?? null);
  updateVisitors(total, Boolean(options.countAdvanced));
}

let thankYouTimeoutId = null;

function showThankYou() {
  if (!elements.thankYou) return;

  if (thankYouTimeoutId !== null) window.clearTimeout(thankYouTimeoutId);
  elements.thankYou.classList.remove("is-playing");
  elements.thankYou.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => elements.thankYou.classList.add("is-playing"));
  thankYouTimeoutId = window.setTimeout(() => {
    elements.thankYou.classList.remove("is-playing");
    elements.thankYou.setAttribute("aria-hidden", "true");
    thankYouTimeoutId = null;
  }, 1900);
}

function maybeCelebrate(total, force = false) {
  const reachedMilestone = [...MILESTONES].reverse().find((milestone) => total >= milestone);
  if (!reachedMilestone) return;

  const storageKey = `celebration_shown_${reachedMilestone}`;
  if (!force && hasStoredFlag(storageKey)) return;

  if (!force) storeFlag(storageKey);
  elements.milestoneLabel.textContent = `${reachedMilestone.toLocaleString("ja-JP")} GROWTH!`;
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
  const previousCounter = readCachedCounter();

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
    render(data, {
      countAdvanced: shouldCount && !data.demo,
      previousTotal: previousCounter?.total ?? null
    });
    if (shouldCount && !data.demo) showThankYou();
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
