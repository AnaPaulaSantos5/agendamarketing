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
    
    // --- 1. LER AGENDA ---
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    
    const events = rowsAgenda.map(row => {
        // ID SIMPLES (Titulo + Data)
        const idGerado = (row.get('Conteudo_Principal') || '') + (row.get('Data_Inicio') || '');

        return {
            id: idGerado,
            dataInicio: row.get('Data_Inicio'),
            dataFim: row.get('Data_Fim'),
            titulo: row.get('Conteudo_Principal'),
            conteudoSecundario: row.get('Conteudo_Secundario'),
            cor: row.get('Tipo_Evento'),
            tipo: row.get('Tipo'),
            perfil: row.get('Perfil'),
            linkDrive: row.get('LinkDrive') || '' 
        };
    });

    // --- 2. LER PERFIL ---
    const perfilSheet = doc.sheetsByTitle['Perfil'];
    const rowsPerfil = await perfilSheet.getRows();
    const perfis = rowsPerfil.map(row => ({
      nome: row.get('Perfil'),
      chatId: row.get('ChatId'),
      email: row.get('Email')
    }));

    // --- 3. LER FEED ---
    const feedSheet = doc.sheetsByTitle['WhatsApp_Feed'];
    const rowsFeed = await feedSheet.getRows();
    const feed = rowsFeed.map(row => ({
      Tipo: row.get('Tipo'),
      Nome: row.get('Nome'),
      Telefone: row.get('Telefone'),
      Evento: row.get('Evento'),
      Resposta: row.get('Resposta'),
      Data: row.get('Data')
    })).reverse().slice(0, 20);

    return NextResponse.json({ events, perfis, feed });
  } catch (error: any) {
    console.error("Erro Geral API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await doc.loadInfo();

    // 1. Salvar na Agenda
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    await agendaSheet.addRow({
      Data_Inicio: data.dataInicio,
      Data_Fim: data.dataFim,
      Tipo_Evento: data.cor,
      Tipo: data.tipo,
      Conteudo_Principal: data.titulo,
      Conteudo_Secundario: data.conteudoSecundario || '',
      Perfil: data.perfil,
      LinkDrive: data.linkDrive || '' 
    });

    // 2. Salvar na Tarefas (AGORA SEM ESPAÇOS!)
    if (data.tipo === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      
      const blocoId = `ID${Date.now()}`;

      await tarefasSheet.addRow({
        'Bloco_ID': blocoId,
        'Titulo': data.titulo,      // Limpo (sem espaço antes)
        'Responsavel': data.perfil,
        'Data': data.dataInicio,    // Limpo (sem espaço antes)
        'Status': 'Pendente',       // Limpo (sem espaço depois)
        'LinkDrive': data.linkDrive || '',
        'Notificar': 'Sim',
        'ResponsavelChatId': data.chatId
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json(); 
    await doc.loadInfo();
    
    // --- APAGAR DA AGENDA ---
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rows = await agendaSheet.getRows();
    
    const rowToDelete = rows.find(row => 
        ((row.get('Conteudo_Principal') || '') + (row.get('Data_Inicio') || '')) === data.id
    );

    if (rowToDelete) {
        const tituloSalvo = rowToDelete.get('Conteudo_Principal');
        const dataSalva = rowToDelete.get('Data_Inicio');

        await rowToDelete.delete();

        // --- APAGAR DA TAREFA ---
        const tarefasSheet = doc.sheetsByTitle['Tarefas'];
        const tarefasRows = await tarefasSheet.getRows();
        
        // Procura na aba Tarefas (usando nomes limpos)
        const tarefaToDelete = tarefasRows.find(row => 
             row.get('Titulo') === tituloSalvo && 
             row.get('Data') === dataSalva
        );
        
        if (tarefaToDelete) {
            await tarefaToDelete.delete();
        }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
