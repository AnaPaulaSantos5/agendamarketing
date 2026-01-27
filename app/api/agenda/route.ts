import { GoogleSpreadsheet } from 'google-spreadsheet';

export async function GET() {
  try {
    // 1️⃣ Instancia a planilha
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

    // 2️⃣ Autentica via Service Account usando variáveis de ambiente
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    });

    // 3️⃣ Carrega info da planilha
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // 4️⃣ Pega as linhas
    const rows = await sheet.getRows();

    // 5️⃣ Transforma os dados em JSON simples
    const data = rows.map(row => ({
      nome: row.Nome,
      email: row.Email,
      telefone: row.Telefone,
    }));

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Erro ao carregar agenda:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao carregar agenda', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}