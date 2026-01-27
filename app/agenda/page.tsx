'use client'

import { useEffect, useState } from 'react'

type AgendaItem = {
  data: string
  conteudoPrincipal: string
  conteudoSecundario: string
  tipo: string
  link: string
  alternativa: string
  cta: string
  status: string
}

export default function AgendaPage() {
  const [agenda, setAgenda] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(data => {
        setAgenda(data.agenda || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p>Carregando agenda...</p>

  return (
    <div style={{ padding: 24 }}>
      <h1>Agenda de Conteúdo</h1>

      {agenda.map((item, index) => (
        <div
          key={index}
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <strong>{item.data}</strong> — {item.tipo}

          <p><b>Principal:</b> {item.conteudoPrincipal}</p>
          <p><b>Secundário:</b> {item.conteudoSecundario}</p>

          <p><b>CTA:</b> {item.cta}</p>
          <p><b>Status:</b> {item.status}</p>
        </div>
      ))}
    </div>
  )
}