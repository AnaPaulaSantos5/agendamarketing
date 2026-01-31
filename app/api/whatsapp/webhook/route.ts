import { NextRequest, NextResponse } from 'next/server'
import { parseResposta } from '@/lib/whatsapp/parser'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const text = body?.message?.text
  const from = body?.message?.from

  const resposta = parseResposta(text)

  if (resposta) {
    // salvar no feed (próxima fase)
    console.log('Resposta recebida:', resposta, from)
  }

  return NextResponse.json({ ok: true })
}