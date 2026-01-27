// lib/spreadsheet.js
import { GoogleSpreadsheet } from "google-spreadsheet";

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

async function authDoc() {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  });
  await doc.loadInfo();
  return doc;
}

export async function getRows(sheetIndex = 0) {
  const doc = await authDoc();
  const sheet = doc.sheetsByIndex[sheetIndex];
  const rows = await sheet.getRows();
  return rows.map((row) => row._rawData); // retorna apenas os dados puros
}

export async function addRow(sheetIndex = 0, data) {
  const doc = await authDoc();
  const sheet = doc.sheetsByIndex[sheetIndex];
  await sheet.addRow(data);
  return { success: true };
}