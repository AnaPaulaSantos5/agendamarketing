import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '';
const SHEET_NAME = 'Tarefas';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });

    if (req.method !== 'PATCH') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    const { perfil, chatId } = req.body;

    if (!perfil || !chatId) {
      return res.status(400).json({ error: 'perfil ou chatId ausente' });
    }

    // Ler todos os dados da aba Tarefas
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:H`,
    });

    const rows = sheetData.data.values || [];
    if (rows.length === 0) return res.status(404).json({ error: 'Planilha vazia' });

    const header = rows[0].map(h => h.trim()); // remove espaços extras
    const perfilCol = header.indexOf('Responsavel');
    const chatIdCol = header.indexOf('ResponsavelChatId');

    if (perfilCol === -1 || chatIdCol === -1) {
      return res.status(500).json({ error: 'Coluna Responsavel ou ResponsavelChatId não encontrada' });
    }

    let updated = false;
    const newRows = rows.map((row, idx) => {
      if (idx === 0) return row; // cabeçalho
      const rowPerfil = (row[perfilCol] || '').trim();
      if (rowPerfil === perfil.trim()) {
        row[chatIdCol] = chatId.trim();
        updated = true;
      }
      return row;
    });

    if (!updated) {
      return res.status(404).json({ error: `Perfil "${perfil}" não encontrado na planilha` });
    }

    // Atualiza a planilha
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: 'RAW',
      requestBody: { values: newRows },
    });

    return res.status(200).json({ ok: true, message: `ChatID do perfil "${perfil}" atualizado com sucesso!` });

  } catch (err: any) {
    console.error('Erro ao salvar ChatID:', err.message || err);
    return res.status(500).json({ error: 'Erro ao salvar ChatID', details: err.message || err });
  }
}