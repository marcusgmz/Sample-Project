// Paste this into Google Sheets > Extensions > Apps Script (replace everything in Code.gs).

const SHEET_NAME = "Applicants";
const HEADERS = ["Timestamp", "Name", "Age", "Gender", "Address", "Position"];

// Runs when the HTML form sends data (POST request)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const name = String(data.name || "").trim();
    const age = Number(data.age);
    const gender = String(data.gender || "").trim();
    const address = String(data.address || "").trim();
    const position = String(data.position || "").trim();

    // Server-side check, in case someone bypasses the form's validation
    if (!name || !gender || !address || !position) {
      throw new Error("Please fill in all fields.");
    }
    if (!Number.isInteger(age) || age < 18 || age > 100) {
      throw new Error("Age must be between 18 and 100.");
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000); // prevents two submissions writing to the same row
    try {
      getSheet().appendRow([new Date(), name, age, gender, address, position]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ result: "success", name: name });
  } catch (err) {
    return jsonResponse({ result: "error", message: err.message });
  }
}

// Lets you open the web app URL in a browser to check it's running
function doGet() {
  // Bump the version number whenever this file changes, to confirm the new code is live
  return ContentService.createTextOutput("Applicant form web app is running (v2).");
}

// Gets the "Applicants" tab, creating it with headers if it doesn't exist yet
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
