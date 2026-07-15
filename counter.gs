/**
 * 河﨑海斗「金魚育成ゲーム」簡易カウンターAPI
 *
 * セットアップ:
 * 1. このスクリプトを対象スプレッドシートのApps Scriptへ貼り付ける。
 * 2. setupSheet() を一度だけ手動実行する。
 * 3. 「デプロイ」>「新しいデプロイ」>「ウェブアプリ」を選ぶ。
 * 4. 実行ユーザーを「自分」、アクセスできるユーザーを「全員」にしてデプロイする。
 * 5. WebアプリURLを script.js の API_URL に設定する。
 */

const SHEET_NAME = "counter";
const QR_CELL = "B2";
const SNS_CELL = "B3";

function setupSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty(
    "SPREADSHEET_ID",
    spreadsheet.getId()
  );

  const sheet =
    spreadsheet.getSheetByName(SHEET_NAME) ||
    spreadsheet.insertSheet(SHEET_NAME);
  sheet.getRange("A1:B3").setValues([
    ["source", "count"],
    ["qr_count", 0],
    ["sns_count", 0]
  ]);
  sheet.setFrozenRows(1);
}

function doGet(e) {
  const source = e && e.parameter ? String(e.parameter.src || "").toLowerCase() : "";
  const shouldIncrement = source === "qr" || source === "sns";
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);
    const sheet = getCounterSheet_();

    if (shouldIncrement) {
      const targetCell = source === "qr" ? QR_CELL : SNS_CELL;
      const range = sheet.getRange(targetCell);
      range.setValue(toCount_(range.getValue()) + 1);
      SpreadsheetApp.flush();
    }

    const qr = toCount_(sheet.getRange(QR_CELL).getValue());
    const sns = toCount_(sheet.getRange(SNS_CELL).getValue());
    return json_({ qr: qr, sns: sns, total: qr + sns });
  } catch (error) {
    return json_({ error: error.message || String(error) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function getCounterSheet_() {
  const spreadsheetId = PropertiesService
    .getScriptProperties()
    .getProperty("SPREADSHEET_ID");

  if (!spreadsheetId) {
    throw new Error("先に setupSheet() を実行してください。");
  }

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function toCount_(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : 0;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
