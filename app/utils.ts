// app/utils.ts
export interface ChecklistItem {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
}

export interface Tarefa {
  titulo: string;
  responsavel: string;
  status: string;
  linkDrive?: string;
  notificar?: string;
}

export interface AgendaEvent {
  id: string;
  dateStart: string;
  dateEnd?: string;
  tipoEvento: string;
  tarefa?: Tarefa;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  perfil: string;
}

// Função que mapeia as linhas da planilha para eventos
export const mapPlanilhaParaEventos = (sheetData: any[]): AgendaEvent[] => {
  return sheetData.map(row => ({
    id: row.ID || row.Bloco_ID || String(Math.random()),
    dateStart: row.Data_Inicio || row.Data || '',
    dateEnd: row.Data_Fim || '',
    tipoEvento: row.Tipo_Evento || row.Tarefa || 'Evento',
    tarefa: row.Titulo
      ? {
          titulo: row.Titulo,
          responsavel: row.Responsavel || '',
          status: row.Status || 'Pendente',
          linkDrive: row.LinkDrive || '',
          notificar: row.Notificar || ''
        }
      : undefined,
    conteudoPrincipal: row.Conteudo_Principal || '',
    conteudoSecundario: row.Conteudo_Secundario || '',
    perfil: row.Perfil || row.Cliente || ''
  }));
};