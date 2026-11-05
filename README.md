# Sample-Project

Applicant registration form. Entries (Name, Age, Gender, Address, Position) are saved straight to a Google Sheet.

**Live form:** https://marcusgmz.github.io/Sample-Project/

## Files

| File | What it does |
|---|---|
| `index.html` | The form |
| `style.css` | Form styling |
| `script.js` | Checks the entries and sends them to Google Sheets |
| `Code.gs` | Google Apps Script that saves each entry as a row in the sheet |

## How it works

1. The form sends the entry to the Apps Script Web App URL (set at the top of `script.js`).
2. `Code.gs` checks it and adds a row to the **Applicants** tab (created automatically with headers).
3. The form shows "recorded successfully" only after Google confirms the row was saved.

## Setting up the Google Sheet

1. In the Google Sheet, open **Extensions → Apps Script** and paste in `Code.gs`.
2. **Deploy → New deployment → Web app**, Execute as **Me**, Who has access **Anyone**.
3. Copy the Web App URL into `GOOGLE_SHEET_URL` in `script.js`.

After changing `Code.gs`, redeploy with **Deploy → Manage deployments → Edit → New version**. The URL stays the same.

## Publishing

Every push to `main` publishes the site to GitHub Pages through `.github/workflows/static.yml`.
