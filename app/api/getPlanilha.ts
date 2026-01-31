import { AgendaEvent } from '@/lib/types';

export const mapPlanilhaParaEventos = (sheetData: any[]): AgendaEvent[] => {
  return sheetData.map(row => ({
    id: row.ID || row.Bloco_ID || String(Math.random()),

    dateStart: row.Data_Inicio || row.Data || '',
    dateEnd: row.Data_Fim || '',

    tipoEvento: row.Tipo || 'Evento',

    tarefa: {
      titulo: row.Titulo || '',
      responsavel: row.Responsavel || '',
      responsavelChatId: row.ResponsavelChatId || '',
      status: row.Status || 'Pendente',
      linkDrive: row.LinkDrive || '',
      notificar: row.Notificar || '',
      cta: row.CTA || '',
    },

    conteudoPrincipal: row.Conteudo_Principal || '',
    conteudoSecundario: row.Conteudo_Secundario || '',
    perfil: row.Perfil || '',
  }));
};