import { NextRequest, NextResponse } from 'next/server'
import { buildWhatsAppMessage } from '@/lib/whatsapp/template'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sender'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Verifica se os dados mínimos existem para não dar erro 500
    if (!data.responsavelChatId || !data.nome) {
        return NextResponse.json({ error: 'Faltando ChatID ou Nome' }, { status: 400 })
    }

    const mensagem = buildWhatsAppMessage({
      nome: data.nome,
      conteudoPrincipal: data.conteudoPrincipal || 'Evento sem título',
      conteudoSecundario: data.conteudoSecundario || '',
      linkDrive: data.linkDrive || '',
    })

    // O sender.ts usa: chatId, mensagem, nome, evento
    await sendWhatsAppMessage(
      data.responsavelChatId, 
      mensagem, 
      data.nome, 
      data.conteudoPrincipal || 'Evento'
    )

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("ERRO CRÍTICO NO ENVIO:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
