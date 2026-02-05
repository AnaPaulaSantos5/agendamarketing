import { NextRequest, NextResponse } from 'next/server';
import { parseResposta } from '@/lib/whatsapp/parser';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // O WAHA envia o texto da resposta e o número de quem enviou
    const text = body?.payload?.body; 
    const from = body?.payload?.from; // ex: 554199999999@c.us

    const respostaProcessada = parseResposta(text);

    if (respostaProcessada) {
      const auth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
      await doc.loadInfo();
      const feedSheet = doc.sheetsByTitle['WhatsApp_Feed'];

      // Salva a resposta no Feed
      await feedSheet.addRow({
        Tipo: 'RESPOSTA',
        Nome: 'Sistema (Identificação via ID)', // Podemos buscar o nome na aba Perfil depois
        Telefone: from,
        Evento: '-',
        Resposta: respostaProcessada,
        Data: new Date().toLocaleString('pt-BR')
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no Webhook:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
