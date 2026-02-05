import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);

export async function GET() {
  try {
    await doc.loadInfo();
    
    // 1. Puxar Eventos da aba Agenda
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    const events = rowsAgenda.map(row => ({
      id: row.get('Conteudo_Principal') + row.get('Data_Inicio'),
      dataInicio: row.get('Data_Inicio'),
      dataFim: row.get('Data_Fim'),
      titulo: row.get('Conteudo_Principal'),
      cor: row.get('Tipo_Evento'),
      tipo: row.get('Tipo'),
      perfil: row.get('Perfil')
    }));

    // 2. Puxar Perfis da aba Perfil
    const perfilSheet = doc.sheetsByTitle['Perfil'];
    const rowsPerfil = await perfilSheet.getRows();
    const perfis = rowsPerfil.map(row => ({
      nome: row.get('Perfil'),
      chatId: row.get('ChatId'),
      email: row.get('Email')
    }));

    return NextResponse.json({ events, perfis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await doc.loadInfo();

    // Salvar na aba Agenda
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    await agendaSheet.addRow({
      Data_Inicio: data.dataInicio,
      Data_Fim: data.dataFim,
      Tipo_Evento: data.cor,
      Tipo: data.tipo,
      Conteudo_Principal: data.titulo,
      Conteudo_Secundario: data.conteudoSecundario,
      Perfil: data.perfil
    });

    // Salvar na aba Tarefas (Se Externo)
    if (data.tipo === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      await tarefasSheet.addRow({
        Bloco_ID: `ID-${Date.now()}`,
        Titulo: data.titulo,
        Responsavel: data.perfil,
        Data: data.dataInicio,
        Status: 'Pendente',
        LinkDrive: data.linkDrive || '',
        Notificar: 'Sim',
        ResponsavelChatId: data.chatId
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
