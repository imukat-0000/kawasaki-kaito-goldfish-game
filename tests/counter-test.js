const TEST_COUNTER_KEY = "goldfish_counter_test_state_v1";

function readTestCounter() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEST_COUNTER_KEY));
    const qr = Math.max(0, Math.floor(Number(parsed?.qr) || 0));
    const sns = Math.max(0, Math.floor(Number(parsed?.sns) || 0));
    return { qr, sns, total: qr + sns };
  } catch (error) {
    return { qr: 0, sns: 0, total: 0 };
  }
}

let testCounter = readTestCounter();

const testQrInput = document.querySelector("#testQrInput");
const testSnsInput = document.querySelector("#testSnsInput");

function syncTestInputs() {
  testQrInput.value = String(testCounter.qr);
  testSnsInput.value = String(testCounter.sns);
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
  const previousStage = getStage(testCounter.total);
  const qr = Math.max(0, Math.floor(Number(next.qr) || 0));
  const sns = Math.max(0, Math.floor(Number(next.sns) || 0));
  testCounter = { qr, sns, total: qr + sns };
  saveTestCounter();
  const countAdvanced = simulateCount && testCounter.total === previousTotal + 1;
  render(testCounter, { countAdvanced, previousTotal });
  syncTestInputs();

  if (countAdvanced) {
    document.querySelector("#gameScreen").scrollIntoView({ behavior: "smooth", block: "center" });
    showThankYou();
  }

  if (playEffect && getStage(testCounter.total) > previousStage) {
    maybeCelebrate(testCounter.total, true);
  }
}

function setTestTotal(total, playEffect = true, simulateCount = false) {
  const normalizedTotal = Math.max(0, Math.floor(Number(total) || 0));
  const qr = Math.floor(normalizedTotal * 0.6);
  applyTestCounter({ qr, sns: normalizedTotal - qr }, playEffect, simulateCount);
}

document.querySelectorAll("[data-add-qr]").forEach((button) => {
  button.addEventListener("click", () => {
    applyTestCounter({ qr: testCounter.qr + 1, sns: testCounter.sns });
  });
});

document.querySelectorAll("[data-add-sns]").forEach((button) => {
  button.addEventListener("click", () => {
    applyTestCounter({ qr: testCounter.qr, sns: testCounter.sns + 1 });
  });
});

document.querySelectorAll("[data-add-total]").forEach((button) => {
  button.addEventListener("click", () => {
    const amount = Number(button.dataset.addTotal) || 0;
    applyTestCounter({ qr: testCounter.qr + amount, sns: testCounter.sns });
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

document.querySelector("#clearTestVisitors").addEventListener("click", () => clearVisitorsForTest());
document.querySelector("#showTestPeople").addEventListener("click", () => {
  forcePeopleForTest();
  document.querySelector("#gameScreen").scrollIntoView({ behavior: "smooth", block: "center" });
});
document.querySelector("#dismissTestPeople").addEventListener("click", () => dismissPeopleForTest());

document.querySelector("#nextMilestoneButton").addEventListener("click", () => {
  const nextMilestone = MILESTONES.find((milestone) => milestone > testCounter.total);
  setTestTotal(nextMilestone || MILESTONES[MILESTONES.length - 1]);
});

document.querySelector("#resetTestButton").addEventListener("click", () => {
  testCounter = { qr: 0, sns: 0, total: 0 };
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
  applyTestCounter({ qr: testQrInput.value, sns: testSnsInput.value });
});

document.querySelector("#sourceNote").textContent = "テストモード";
applyTestCounter(testCounter, false);
