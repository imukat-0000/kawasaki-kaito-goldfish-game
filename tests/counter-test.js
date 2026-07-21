const TEST_COUNTER_KEY = "goldfish_counter_test_state_v1";

function readTestCounter() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEST_COUNTER_KEY));
    const nfc = Math.max(0, Math.floor(Number(parsed?.nfc ?? (Number(parsed?.qr) || 0) + (Number(parsed?.sns) || 0)) || 0));
    return { nfc, total: nfc };
  } catch (error) {
    return { nfc: 0, total: 0 };
  }
}

let testCounter = readTestCounter();

const testNfcInput = document.querySelector("#testNfcInput");

function syncTestInputs() {
  testNfcInput.value = String(testCounter.nfc);
}

function saveTestCounter() {
  try {
    localStorage.setItem(TEST_COUNTER_KEY, JSON.stringify(testCounter));
  } catch (error) {
    // The test remains usable in memory when storage is unavailable.
  }
}

function applyTestCounter(next, playEffect = true, simulateCount = true) {
  const previousTotal = testCounter.total;
  const previousCelebrationMilestone = getCelebrationMilestone(testCounter.total);
  const nfc = Math.max(0, Math.floor(Number(next.nfc) || 0));
  testCounter = { nfc, total: nfc };
  saveTestCounter();
  const countAdvanced = simulateCount && testCounter.total === previousTotal + 1;
  render(testCounter, { countAdvanced, previousTotal });
  syncTestInputs();
  syncLayoutEditor();

  if (countAdvanced) {
    document.querySelector("#gameScreen").scrollIntoView({ behavior: "smooth", block: "center" });
    showThankYou();
  }

  if (playEffect && getCelebrationMilestone(testCounter.total) !== previousCelebrationMilestone) {
    maybeCelebrate(testCounter.total, true);
  }
}

function setTestTotal(total, playEffect = true, simulateCount = false) {
  const normalizedTotal = Math.max(0, Math.floor(Number(total) || 0));
  applyTestCounter({ nfc: normalizedTotal }, playEffect, simulateCount);
}

document.querySelectorAll("[data-add-nfc]").forEach((button) => {
  button.addEventListener("click", () => {
    applyTestCounter({ nfc: testCounter.nfc + 1 });
  });
});

document.querySelectorAll("[data-add-total]").forEach((button) => {
  button.addEventListener("click", () => {
    const amount = Number(button.dataset.addTotal) || 0;
    applyTestCounter({ nfc: testCounter.nfc + amount });
  });
});

document.querySelectorAll("[data-test-total]").forEach((button) => {
  button.addEventListener("click", () => setTestTotal(button.dataset.testTotal));
});

document.querySelectorAll("[data-growth-total]").forEach((button) => {
  button.addEventListener("click", () => setTestTotal(button.dataset.growthTotal, false));
});

document.querySelectorAll("[data-force-visitor]").forEach((button) => {
  button.addEventListener("click", () => {
    forceVisitorForTest(button.dataset.forceVisitor, testCounter.total);
    document.querySelector("#gameScreen").scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

document.querySelector("#showAllTestVisitors").addEventListener("click", () => {
  forceVisitorForTest("cat", testCounter.total);
  forceVisitorForTest("bird", testCounter.total);
  document.querySelector("#gameScreen").scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelector("#clearTestVisitors").addEventListener("click", () => clearVisitorsForTest());
document.querySelector("#nextMilestoneButton").addEventListener("click", () => {
  const nextMilestone = CELEBRATION_MILESTONES.find((milestone) => milestone > testCounter.total);
  setTestTotal(nextMilestone || CELEBRATION_MILESTONES[CELEBRATION_MILESTONES.length - 1]);
});

document.querySelector("#resetTestButton").addEventListener("click", () => {
  testCounter = { nfc: 0, total: 0 };
  try {
    localStorage.removeItem(TEST_COUNTER_KEY);
  } catch (error) {
    // The in-memory reset still succeeds.
  }
  clearVisitorsForTest(true);
  render(testCounter);
  syncTestInputs();
});

document.querySelector("#counterTestForm").addEventListener("submit", (event) => {
  event.preventDefault();
  applyTestCounter({ nfc: testNfcInput.value });
});

document.querySelector("#sourceNote").textContent = "テストモード";

const layoutControls = {
  stageLabel: document.querySelector("#layoutStageLabel"),
  left: document.querySelector("#layoutLeft"),
  vertical: document.querySelector("#layoutVertical"),
  verticalLabel: document.querySelector("#layoutVerticalLabel"),
  scale: document.querySelector("#layoutScale"),
  values: document.querySelector("#layoutValues"),
  json: document.querySelector("#layoutJson"),
  routeEditor: document.querySelector("#routeEditor"),
  routeValues: document.querySelector("#routeValues"),
  routeEntry: document.querySelector("#routeSetEntry"),
  routeExit: document.querySelector("#routeSetExit"),
  routeWalkScale: document.querySelector("#routeWalkScale"),
  routeWalkScaleValue: document.querySelector("#routeWalkScaleValue"),
  routeWalkDirection: document.querySelector("#routeWalkDirection")
};
const layoutTargets = [...document.querySelectorAll("[data-layout-role]")];
let selectedLayoutRole = "cat";
let layoutDragActive = false;
let routeEditMode = null;

function currentLayoutStage() {
  return getStage(testCounter.total);
}

function findLayoutElement(role) {
  return document.querySelector(`#gameScreen [data-layout-role="${role}"]`);
}

function measureLayout(role) {
  const screen = document.querySelector("#gameScreen");
  const element = findLayoutElement(role);
  const stored = getStageLayoutForTest(currentLayoutStage(), role) || {};
  const screenRect = screen.getBoundingClientRect();
  if (!element || !screenRect.width || !screenRect.height) {
    return {
      left: Number(stored.left ?? 50),
      vertical: Number(role === "bird" ? stored.top ?? 30 : stored.bottom ?? 0),
      scale: Number(stored.scale ?? (role === "bird" ? 9.6 : role === "cat" ? 24 : 26))
    };
  }
  const styles = getComputedStyle(element);
  return {
    left: Number(stored.left ?? (Number.parseFloat(styles.left) / screenRect.width * 100)),
    vertical: Number(role === "bird"
      ? stored.top ?? (Number.parseFloat(styles.top) / screenRect.height * 100)
      : stored.bottom ?? (Number.parseFloat(styles.bottom) / screenRect.height * 100)),
    scale: Number(stored.scale ?? (element.getBoundingClientRect().width / screenRect.width * 100))
  };
}

function updateLayoutValues(values = measureLayout(selectedLayoutRole)) {
  layoutControls.left.value = String(values.left);
  layoutControls.vertical.value = String(values.vertical);
  layoutControls.scale.value = String(values.scale);
  layoutControls.verticalLabel.textContent = selectedLayoutRole === "bird" ? "上からの高さ" : "下からの高さ";
  const verticalName = selectedLayoutRole === "bird" ? "上" : "下";
  layoutControls.values.textContent = `横 ${values.left.toFixed(1)}% / ${verticalName} ${values.vertical.toFixed(1)}% / 大きさ ${values.scale.toFixed(1)}%`;
}

function isPersonRole(role = selectedLayoutRole) {
  return ["boy", "girl", "woman"].includes(role);
}

function syncRouteEditor() {
  const isPerson = isPersonRole();
  layoutControls.routeEditor.hidden = !isPerson;
  if (!isPerson) return;
  const route = getStageRouteForTest(currentLayoutStage(), selectedLayoutRole);
  const walkScale = Number(route?.walkScale ?? 100);
  layoutControls.routeWalkScale.value = String(walkScale);
  layoutControls.routeWalkScaleValue.textContent = `${walkScale}%`;
  layoutControls.routeWalkDirection.value = route?.walkDirection ?? "auto";
  if (!route) {
    layoutControls.routeValues.textContent = "登場地点・退場地点を指定すると、このステージだけの歩行ルートになります。";
  } else {
    const entry = Number.isFinite(Number(route.entryLeft))
      ? `登場: ${Number(route.entryLeft).toFixed(1)}%, ${Number(route.entryBottom).toFixed(1)}%`
      : "登場: 未指定";
    const exit = Number.isFinite(Number(route.exitLeft))
      ? `退場: ${Number(route.exitLeft).toFixed(1)}%, ${Number(route.exitBottom).toFixed(1)}%`
      : "退場: 未指定";
    layoutControls.routeValues.textContent = `${entry} / ${exit}`;
  }
  layoutControls.routeEntry.classList.toggle("is-armed", routeEditMode === "entry");
  layoutControls.routeExit.classList.toggle("is-armed", routeEditMode === "exit");
}

function markLayoutTarget() {
  document.querySelectorAll(".layout-editing-target").forEach((element) => {
    element.classList.remove("layout-editing-target");
  });
  const target = findLayoutElement(selectedLayoutRole);
  if (target) target.classList.add("layout-editing-target");
}

function syncLayoutEditor() {
  if (!layoutControls.stageLabel) return;
  layoutControls.stageLabel.textContent = `STAGE ${String(currentLayoutStage()).padStart(2, "0")}`;
  layoutTargets.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.layoutRole === selectedLayoutRole));
  });
  updateLayoutValues();
  markLayoutTarget();
  syncRouteEditor();
}

function applyLayoutInputs() {
  const patch = {
    left: Number(layoutControls.left.value),
    scale: Number(layoutControls.scale.value)
  };
  if (selectedLayoutRole === "bird") patch.top = Number(layoutControls.vertical.value);
  else patch.bottom = Number(layoutControls.vertical.value);
  const values = updateStageLayoutForTest(selectedLayoutRole, patch, currentLayoutStage());
  updateLayoutValues({
    left: Number(values.left),
    vertical: Number(selectedLayoutRole === "bird" ? values.top : values.bottom),
    scale: Number(values.scale)
  });
  markLayoutTarget();
}

layoutTargets.forEach((button) => {
  button.addEventListener("click", () => {
    selectedLayoutRole = button.dataset.layoutRole;
    syncLayoutEditor();
  });
});

[layoutControls.left, layoutControls.vertical, layoutControls.scale].forEach((input) => {
  input.addEventListener("input", applyLayoutInputs);
});

document.querySelector("#layoutShowTarget").addEventListener("click", () => {
  if (selectedLayoutRole === "woman" && currentLayoutStage() < 4) {
    layoutControls.values.textContent = "浴衣の女性はステージ4〜6で確認できます。";
    return;
  }
  showLayoutTargetForTest(selectedLayoutRole, testCounter.total);
  window.setTimeout(() => {
    applyStageLayoutsForTest();
    syncLayoutEditor();
  }, 40);
  document.querySelector("#gameScreen").scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelector("#layoutResetTarget").addEventListener("click", () => {
  resetStageLayoutForTest(selectedLayoutRole, currentLayoutStage());
  syncLayoutEditor();
});

document.querySelector("#layoutExport").addEventListener("click", () => {
  layoutControls.json.value = exportStageLayoutsForTest();
  layoutControls.json.focus();
  layoutControls.json.select();
});

document.querySelector("#layoutImport").addEventListener("click", () => {
  try {
    importStageLayoutsForTest(layoutControls.json.value);
    syncLayoutEditor();
  } catch (error) {
    layoutControls.values.textContent = "読み込みに失敗しました。書き出したJSONをそのまま貼り付けてください。";
  }
});

document.querySelector("#routeSetEntry").addEventListener("click", () => {
  routeEditMode = routeEditMode === "entry" ? null : "entry";
  syncRouteEditor();
});

document.querySelector("#routeSetExit").addEventListener("click", () => {
  routeEditMode = routeEditMode === "exit" ? null : "exit";
  syncRouteEditor();
});

document.querySelector("#routePreview").addEventListener("click", () => {
  if (!isPersonRole()) return;
  forcePeopleForTest();
  document.querySelector("#gameScreen").scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(syncLayoutEditor, 80);
});

document.querySelector("#routeReset").addEventListener("click", () => {
  resetStageRouteForTest(selectedLayoutRole, currentLayoutStage());
  routeEditMode = null;
  syncLayoutEditor();
});

layoutControls.routeWalkScale.addEventListener("input", () => {
  const walkScale = Number(layoutControls.routeWalkScale.value);
  updateStageRouteForTest(selectedLayoutRole, { walkScale }, currentLayoutStage());
  layoutControls.routeWalkScaleValue.textContent = `${walkScale}%`;
});

layoutControls.routeWalkDirection.addEventListener("change", () => {
  const value = layoutControls.routeWalkDirection.value;
  updateStageRouteForTest(selectedLayoutRole, { walkDirection: value === "auto" ? null : value }, currentLayoutStage());
});

document.querySelector("#gameScreen").addEventListener("pointerdown", (event) => {
  if (routeEditMode && isPersonRole()) {
    const rect = event.currentTarget.getBoundingClientRect();
    const left = Math.max(-20, Math.min(120, (event.clientX - rect.left) / rect.width * 100));
    const bottom = Math.max(-20, Math.min(80, (rect.bottom - event.clientY) / rect.height * 100));
    const patch = routeEditMode === "entry"
      ? { entryLeft: left, entryBottom: bottom }
      : { exitLeft: left, exitBottom: bottom };
    updateStageRouteForTest(selectedLayoutRole, patch, currentLayoutStage());
    routeEditMode = null;
    syncLayoutEditor();
    event.preventDefault();
    return;
  }
  const target = event.target.closest(`[data-layout-role="${selectedLayoutRole}"]`);
  if (!target) return;
  layoutDragActive = true;
  target.setPointerCapture?.(event.pointerId);
  event.preventDefault();
});

document.addEventListener("pointermove", (event) => {
  if (!layoutDragActive) return;
  const screen = document.querySelector("#gameScreen");
  const rect = screen.getBoundingClientRect();
  const left = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
  const vertical = selectedLayoutRole === "bird"
    ? Math.max(-10, Math.min(70, (event.clientY - rect.top) / rect.height * 100))
    : Math.max(-10, Math.min(70, (rect.bottom - event.clientY) / rect.height * 100));
  layoutControls.left.value = String(left);
  layoutControls.vertical.value = String(vertical);
  applyLayoutInputs();
});

document.addEventListener("pointerup", () => {
  layoutDragActive = false;
});

syncLayoutEditor();
applyTestCounter(testCounter, false);
