import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);

// Função auxiliar para buscar valores sem sofrer com espaços ou maiúsculas
function getVal(row: any, nome: string) {
    const raw = row.toObject();
    const chave = Object.keys(raw).find(k => k.toLowerCase().trim() === nome.toLowerCase().trim());
    return chave ? raw[chave] : '';
}

export async function GET() {
  try {
    await doc.loadInfo();
    
    // 1. Puxa os eventos da aba Agenda
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    
    // 2. Puxa os links da aba Tarefas
    const tarefasSheet = doc.sheetsByTitle['Tarefas'];
    const rowsTarefas = await tarefasSheet.getRows();
    
    const events = rowsAgenda.map(row => {
        const titulo = getVal(row, 'Conteudo_Principal');
        const dataIni = getVal(row, 'Data_Inicio');

        // CRÍTICO: Busca o link correspondente na aba Tarefas
        // Comparamos Titulo e Data para garantir que é o mesmo evento
        const tarefaCorrespondente = rowsTarefas.find(r => {
            const tTitulo = getVal(r, 'Titulo');
            const tData = getVal(r, 'Data');
            return tTitulo === titulo && tData === dataIni;
        });

        return {
            id: (titulo + dataIni).replace(/\s/g, '').toLowerCase(),
            titulo,
            dataInicio: dataIni,
            dataFim: getVal(row, 'Data_Fim'),
            tipo: getVal(row, 'Tipo'),
            cor: getVal(row, 'Tipo_Evento'),
            perfil: getVal(row, 'Perfil'),
            conteudoSecundario: getVal(row, 'Conteudo_Secundario'),
            // PUXA O LINK DA ABA TAREFAS
            linkDrive: tarefaCorrespondente ? getVal(tarefaCorrespondente, 'LinkDrive') : ''
        };
    });

    // Perfis
    const pSheet = doc.sheetsByTitle['Perfil'];
    const pRows = await pSheet.getRows();
    const perfis = pRows.map(r => ({ 
        nome: getVal(r, 'Perfil'), 
        chatId: getVal(r, 'ChatId'), 
        email: getVal(r, 'Email') 
    }));

    // Feed do WhatsApp
    const fSheet = doc.sheetsByTitle['WhatsApp_Feed'];
    const fRows = await fSheet.getRows();
    const feed = fRows.map(r => ({ 
        Tipo: getVal(r, 'Tipo'), 
        Nome: getVal(r, 'Nome'), 
        Evento: getVal(r, 'Evento'), 
        Resposta: getVal(r, 'Resposta'), 
        Data: getVal(r, 'Data') 
    })).reverse().slice(0, 20);

    return NextResponse.json({ events, perfis, feed });
  } catch (error: any) {
    console.error("Erro no GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await doc.loadInfo();

    // 1. Salva na Agenda (Estrutura original)
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    await agendaSheet.addRow({
      'Data_Inicio': data.dataInicio,
      'Data_Fim': data.dataFim,
      'Tipo_Evento': data.cor,
      'Tipo': data.tipo,
      'Conteudo_Principal': data.titulo,
      'Conteudo_Secundario': data.conteudoSecundario || '',
      'Perfil': data.perfil
    });

    // 2. Salva na Tarefas (Onde o LinkDrive reside)
    if (String(data.tipo).toLowerCase().trim() === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      await tarefasSheet.addRow([
          `ID${Date.now()}`, 
          data.titulo, 
          data.perfil, 
          data.dataInicio, 
          'Pendente', 
          data.linkDrive || '', 
          'Sim', 
          data.chatId
      ]);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    await doc.loadInfo();
    
    // 1. Apagar da Agenda
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rows = await agendaSheet.getRows();
    
    const rowToDelete = rows.find(row => {
        const idLinha = (getVal(row, 'Conteudo_Principal') + getVal(row, 'Data_Inicio')).replace(/\s/g, '').toLowerCase();
        return idLinha === data.id;
    });

    if (rowToDelete) {
        const t = getVal(rowToDelete, 'Conteudo_Principal');
        const d = getVal(rowToDelete, 'Data_Inicio');
        
        await rowToDelete.delete();

        // 2. Apagar da Tarefas (Sincronização)
        const tarefasSheet = doc.sheetsByTitle['Tarefas'];
        const rowsT = await tarefasSheet.getRows();
        const rowT = rowsT.find(r => {
            const tTitulo = getVal(r, 'Titulo');
            const tData = getVal(r, 'Data');
            return tTitulo === t && tData === d;
        });
        
        if (rowT) await rowT.delete();
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
