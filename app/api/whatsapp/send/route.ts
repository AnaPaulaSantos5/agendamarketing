import { NextRequest, NextResponse } from 'next/server'
import { buildWhatsAppMessage } from '@/lib/whatsapp/template'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sender'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // 1. Monta o texto da mensagem usando o Template
    const mensagem = buildWhatsAppMessage({
      nome: data.nome,
      conteudoPrincipal: data.conteudoPrincipal,
      conteudoSecundario: data.conteudoSecundario,
      linkDrive: data.linkDrive,
    })

    // 2. Dispara o WhatsApp e já registra no Google Sheets (Aba: WhatsApp_Feed)
    // Passamos 4 argumentos conforme definido no seu sender.ts:
    // chatId, mensagem, nome do responsável e o título do evento
    await sendWhatsAppMessage(
      data.responsavelChatId, 
      mensagem, 
      data.nome, 
      data.conteudoPrincipal
    )

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Erro na Rota de Envio WhatsApp:", err)
    return NextResponse.json(
      { error: 'Erro ao processar envio', details: err.message }, 
      { status: 500 }
    )
  }
}
