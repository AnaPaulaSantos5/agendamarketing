import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const text: string = body?.text?.trim();
    const from: string = body?.from;

    if (!text || !from) {
      return NextResponse.json({ ok: true });
    }

    // Resposta SIM
    if (text === '1' || text.toLowerCase() === 'sim') {
      await fetch(process.env.WAHA_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: `${process.env.MARKETING_PHONE}@c.us`,
          text: `📩 O responsável ${from} pediu contato do Marketing.`,
          session: process.env.WAHA_SESSION || 'default',
        }),
      });
    }

    // Resposta NÃO
    if (text === '2' || text.toLowerCase() === 'não') {
      await fetch(process.env.WAHA_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: from,
          text: 'Ok! Gratidão pela atenção 😊',
          session: process.env.WAHA_SESSION || 'default',
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}