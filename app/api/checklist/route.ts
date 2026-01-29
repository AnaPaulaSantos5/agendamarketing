async function getCombinedChecklist() {
  const sheet = await accessSpreadsheet();

  // Busca todas as abas
  const agendaRows = await sheet.doc.sheetsByTitle['Agenda'].getRows();
  const tarefasRows = await sheet.doc.sheetsByTitle['Tarefas'].getRows();
  const checklistRows = await sheet.doc.sheetsByTitle['Checklist'].getRows();

  const combined: ChecklistItem[] = [];

  // Adiciona itens já existentes da Checklist
  for (const r of checklistRows) {
    combined.push({
      id: r.ID,
      date: r.Data,
      client: r.Cliente,
      task: r.Tarefa,
      done: r.Done === 'Sim',
    });
  }

  // Adiciona tarefas da aba Agenda que ainda não estão no Checklist
  for (const r of agendaRows) {
    if (!r.Tipo_Evento || r.Tipo_Evento === 'nenhum') continue;
    const exists = combined.find(c => c.task === r.Conteudo_Principal && c.date === r.Data_Inicio);
    if (!exists) {
      combined.push({
        id: String(new Date().getTime()) + Math.random(),
        date: r.Data_Inicio,
        client: r.Perfil || 'Confi',
        task: r.Conteudo_Principal || 'Tarefa sem título',
        done: false,
      });
    }
  }

  // Adiciona tarefas da aba Tarefas que ainda não estão no Checklist
  for (const r of tarefasRows) {
    const exists = combined.find(c => c.task === r.Titulo && c.date === r.Data);
    if (!exists) {
      combined.push({
        id: String(new Date().getTime()) + Math.random(),
        date: r.Data,
        client: r.Responsavel || 'Confi',
        task: r.Titulo || 'Tarefa sem título',
        done: r.Status === 'Concluída',
      });
    }
  }

  return combined;
}
