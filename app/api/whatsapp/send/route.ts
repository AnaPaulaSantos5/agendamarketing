import { NextRequest, NextResponse } from 'next/server';
import { buildWhatsappMessage } from '@/lib/whatsapp/template';

export async function POST(req: NextRequest) {
  try {
    const {
      phone,
      nome,
      conteudoPrincipal,
      conteudoSecundario,
      linkDrive,
    } = await req.json();

    const message = buildWhatsappMessage({
      nome,
      conteudoPrincipal,
      conteudoSecundario,
      linkDrive,
    });

    const res = await fetch(process.env.WAHA_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${phone}@c.us`,
        text: message,
        session: process.env.WAHA_SESSION || 'default',
      }),
    });

    if (!res.ok) {
      throw new Error('Erro ao enviar WhatsApp');
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}