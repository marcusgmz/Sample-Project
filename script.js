// Google Apps Script Web App URL (leave empty to run in test mode)
const GOOGLE_SHEET_URL =
  "https://script.google.com/a/macros/rapide.com.ph/s/AKfycbxT5pSMYA10eSXVU43ZvnvCWNGO68fN8uauOqg_F-cvLnjrrsw2u1rrmjp5Bluk6MnDjA/exec";

const form = document.getElementById("applicantForm");
const submitBtn = document.getElementById("submitBtn");
const statusBox = document.getElementById("status");

// Validation rules for each field
const rules = {
  name: (v) => (v.trim() ? "" : "Name is required."),
  age: (v) => {
    if (!v) return "Age is required.";
    const n = Number(v);
    if (!Number.isInteger(n) || n < 18 || n > 100) return "Age must be between 18 and 100.";
    return "";
  },
  gender: (v) => (v ? "" : "Please select a gender."),
  address: (v) => (v.trim() ? "" : "Address is required."),
  position: (v) => (v.trim() ? "" : "Position is required."),
};

function showError(field, message) {
  const input = form.elements[field];
  const errorEl = form.querySelector(`.error[data-for="${field}"]`);
  errorEl.textContent = message;
  input.classList.toggle("invalid", Boolean(message));
}

function validateForm() {
  let valid = true;
  for (const field in rules) {
    const message = rules[field](form.elements[field].value);
    showError(field, message);
    if (message) valid = false;
  }
  return valid;
}

function getFormData() {
  return {
    name: form.elements.name.value.trim(),
    age: form.elements.age.value,
    gender: form.elements.gender.value,
    address: form.elements.address.value.trim(),
    position: form.elements.position.value.trim(),
  };
}

function setStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = `status ${type || ""}`;
}

// Sends the data to Google Sheets and waits for Google to confirm it was saved.
// Until the URL is set, it just logs the data.
async function sendToGoogleSheet(data) {
  if (!GOOGLE_SHEET_URL) {
    console.log("Test mode - data that would be sent:", data);
    return;
  }

  // "text/plain" avoids an extra permission check that Apps Script doesn't support
  const response = await fetch(GOOGLE_SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(data),
  });

  let reply;
  try {
    reply = await response.json();
  } catch {
    throw new Error("Could not reach Google Sheets. Check the Web App access setting.");
  }
  if (reply.result !== "success") {
    throw new Error(reply.message || "Google Sheets did not save the entry.");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("");

  if (!validateForm()) {
    setStatus("Please fix the highlighted fields.", "fail");
    return;
  }

  const data = getFormData();
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    await sendToGoogleSheet(data);
    setStatus(`Applicant "${data.name}" has been recorded successfully.`, "success");
    form.reset();
  } catch (err) {
    console.error(err);
    // TypeError means the request never reached Google (e.g. no internet)
    const message =
      err instanceof TypeError
        ? "Could not connect to Google Sheets. Check your internet connection and try again."
        : err.message;
    setStatus(message, "fail");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
});

// Clear the error on a field as soon as the user edits it
form.addEventListener("input", (e) => {
  if (rules[e.target.name]) showError(e.target.name, "");
});

form.addEventListener("reset", () => {
  for (const field in rules) showError(field, "");
  setStatus("");
});
