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
    // Use auth direto aqui (não getClient)
    const sheets = google.sheets({ version: 'v4', auth });

    if (req.method === 'PATCH') {
      const { perfil, chatId } = req.body;
      if (!perfil || !chatId) return res.status(400).json({ error: 'perfil ou chatId ausente' });

      // Lê todos os dados da aba
      const sheetData = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:H`,
      });

      const rows = sheetData.data.values || [];
      const header = rows[0];
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

      if (!updated) return res.status(404).json({ error: 'Perfil não encontrado na planilha' });

      // Atualiza a planilha
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:H`,
        valueInputOption: 'RAW',
        requestBody: { values: newRows },
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao salvar ChatID', details: err });
  }
}