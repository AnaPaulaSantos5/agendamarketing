// app/api/agenda/route.ts
export async function GET() {
  const rows = await sheet.getRows();

  const events = rows.map((row, index) => ({
    id: String(index),
    title: `${row.Tipo}: ${row.Conteudo_Principal}`,
    start: row.Data_Inicio,     // YYYY-MM-DD
    end: row.Data_Fim || row.Data_Inicio,
    allDay: true,
    extendedProps: {
      perfil: row.Perfil,
      status: row.Status_Postagem,
      conteudoSecundario: row.Conteudo_Secundario,
      cta: row.CTA,
      tipoEvento: row.Tipo_Evento,
    },
  }));

  return Response.json({ events });
}