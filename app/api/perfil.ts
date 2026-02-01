// /app/api/perfil/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '';
const SHEET_NAME = 'Tarefas'; // Aba onde estão os perfis

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function PATCH(req: NextRequest) {
  try {
    const { perfil, chatId } = await req.json();

    if (!perfil || !chatId) {
      return NextResponse.json({ error: 'perfil ou chatId ausente' }, { status: 400 });
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Lê todos os dados da aba
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:H`,
    });

    const rows = res.data.values || [];
    const header = rows[0]; // ['Bloco_ID','Titulo','Responsavel','Data','Status','LinkDrive','Notificar','ResponsavelChatId']
    const perfilCol = header.indexOf('Responsavel');
    const chatIdCol = header.indexOf('ResponsavelChatId');

    let updated = false;

    const newRows = rows.map((row, idx) => {
      if (idx === 0) return row; // cabeçalho
      if (row[perfilCol] === perfil) {
        row[chatIdCol] = chatId;
        updated = true;
      }
      return row;
    });

    if (!updated) {
      return NextResponse.json({ error: 'Perfil não encontrado na planilha' }, { status: 404 });
    }

    // Atualiza a planilha
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: 'RAW',
      requestBody: { values: newRows },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao salvar ChatID', details: err }, { status: 500 });
  }
}