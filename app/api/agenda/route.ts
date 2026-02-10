import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// FORÇA A VERCEL A BUSCAR DADOS SEMPRE DO GOOGLE (MATA O CACHE)
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);

function getVal(row: any, nome: string) {
    const raw = row.toObject();
    const chave = Object.keys(raw).find(k => k.toLowerCase().trim() === nome.toLowerCase().trim());
    return chave ? raw[chave] : '';
}

export async function GET() {
  try {
    await doc.loadInfo();
    
    // 1. CARREGA AGENDA E TAREFAS PARA O CALENDÁRIO
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    const tarefasSheet = doc.sheetsByTitle['Tarefas'];
    const rowsTarefas = await tarefasSheet.getRows();
    
    const events = rowsAgenda.map(row => {
        const titulo = getVal(row, 'Conteudo_Principal');
        const dataIni = getVal(row, 'Data_Inicio');
        const tarefaCorrespondente = rowsTarefas.find(r => 
            getVal(r, 'Titulo') === titulo && getVal(r, 'Data') === dataIni
        );

        return {
            id: (titulo + dataIni).replace(/\s/g, '').toLowerCase(),
            titulo,
            dataInicio: dataIni,
            dataFim: getVal(row, 'Data_Fim'),
            tipo: getVal(row, 'Tipo'),
            cor: getVal(row, 'Tipo_Evento'),
            perfil: getVal(row, 'Perfil'),
            conteudoSecundario: getVal(row, 'Conteudo_Secundario'),
            linkDrive: tarefaCorrespondente ? getVal(tarefaCorrespondente, 'LinkDrive') : ''
        };
    });

    // 2. CARREGA PERFIS PARA O SELECTOR
    const pSheet = doc.sheetsByTitle['Perfil'];
    const pRows = await pSheet.getRows();
    const perfis = pRows.map(r => ({ 
        nome: getVal(r, 'Perfil'), 
        chatId: getVal(r, 'ChatId'), 
        email: getVal(r, 'Email') 
    }));

    // 3. CARREGA E FILTRA O FEED (LIMPEZA PROFUNDA)
    const fSheet = doc.sheetsByTitle['WhatsApp_Feed'];
    const fRows = await fSheet.getRows();
    
    const feed = fRows.map(r => ({ 
        Tipo: getVal(r, 'Tipo'), 
        Nome: getVal(r, 'Nome'), 
        Evento: getVal(r, 'Evento'), 
        Resposta: getVal(r, 'Resposta'), 
        Data: getVal(r, 'Data'),
        Telefone: getVal(r, 'Telefone')
    }))
    .filter(item => {
        const tipo = String(item.Tipo || '').toUpperCase().trim();
        const evento = String(item.Evento || '').toLowerCase().trim();
        const resposta = String(item.Resposta || '').toUpperCase().trim();
        const telefone = String(item.Telefone || '').toLowerCase();

        // FILTRO 1: Remove IDs de sistema (@lid) ou telefones vazios
        if (telefone.includes('@lid') || !telefone) return false;

        // FILTRO 2: Se for ENVIO, remove nomes de teste ou caracteres inúteis
        if (tipo === 'ENVIO') {
            const lixo = ['-', '', 'teste', 'tester', 'n tem', 'nenhum', 'teste whatsapp', 'null'];
            if (lixo.includes(evento) || evento.length < 3) return false;
        }

        // FILTRO 3: Se for RESPOSTA, remove se a resposta for um traço ou vazia
        if (tipo === 'RESPOSTA') {
            if (resposta === '-' || resposta === '' || resposta === 'NULL') return false;
        }

        return true;
    })
    .reverse().slice(0, 20);

    return NextResponse.json({ events, perfis, feed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await doc.loadInfo();
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
    if (String(data.tipo).toLowerCase().trim() === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      await tarefasSheet.addRow([`ID${Date.now()}`, data.titulo, data.perfil, data.dataInicio, 'Pendente', data.linkDrive || '', 'Sim', data.chatId]);
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
        const tarefasSheet = doc.sheetsByTitle['Tarefas'];
        const rowsT = await tarefasSheet.getRows();
        const rowT = rowsT.find(r => getVal(r, 'Titulo') === t && getVal(r, 'Data') === d);
        if (rowT) await rowT.delete();
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}