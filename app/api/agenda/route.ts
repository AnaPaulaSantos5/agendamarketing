import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

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
    
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    const tarefasSheet = doc.sheetsByTitle['Tarefas'];
    const rowsTarefas = await tarefasSheet.getRows();
    
    const events = rowsAgenda.map(row => {
        const titulo = getVal(row, 'Conteudo_Principal');
        const dataIni = getVal(row, 'Data_Inicio');
        const tarefa = rowsTarefas.find(r => getVal(r, 'Titulo').trim() === titulo.trim() && getVal(r, 'Data').trim() === dataIni.trim());

        return {
            id: (titulo + dataIni).replace(/\s/g, '').toLowerCase(),
            titulo,
            dataInicio: dataIni,
            dataFim: getVal(row, 'Data_Fim'),
            tipo: getVal(row, 'Tipo'),
            cor: getVal(row, 'Tipo_Evento'),
            perfil: getVal(row, 'Perfil'),
            conteudoSecundario: getVal(row, 'Conteudo_Secundario'),
            linkDrive: tarefa ? getVal(tarefa, 'LinkDrive') : '',
            chatId: tarefa ? getVal(tarefa, 'ResponsavelChatId') : ''
        };
    });

    const pSheet = doc.sheetsByTitle['Perfil'];
    const pRows = await pSheet.getRows();
    const perfis = pRows.map(r => ({ 
        nome: getVal(r, 'Perfil'), 
        chatId: getVal(r, 'ChatId'), 
        email: getVal(r, 'Email') 
    }));

    const fSheet = doc.sheetsByTitle['WhatsApp_Feed'];
    const fRows = await fSheet.getRows();
    
    const feed = fRows.map(r => ({ 
        Tipo: getVal(r, 'Tipo'), Nome: getVal(r, 'Nome'), Evento: getVal(r, 'Evento'), Resposta: getVal(r, 'Resposta'), Data: getVal(r, 'Data')
    }))
    .filter(item => {
        const res = String(item.Resposta || '').toUpperCase().trim();
        if (res === 'SIM' || res === 'NÃO' || res === 'NAO') { item.Tipo = 'RESPOSTA'; return true; }
        if (String(item.Nome).toLowerCase().includes('confi') && String(item.Evento).length > 3) { item.Tipo = 'ENVIO'; return true; }
        return false;
    })
    .reverse().slice(0, 10);

    return NextResponse.json({ events, perfis, feed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await doc.loadInfo();
    
    // ATUALIZAÇÃO DE PERFIL NA PLANILHA (ADMIN)
    if (data.isPerfilUpdate) {
        const pSheet = doc.sheetsByTitle['Perfil'];
        const pRows = await pSheet.getRows();
        const row = pRows.find(r => getVal(r, 'Email').toLowerCase().trim() === data.email.toLowerCase().trim());
        if (row) {
            row.set('Perfil', data.nome);
            row.set('ChatId', data.chatId);
            await row.save();
            return NextResponse.json({ success: true });
        }
    }

    // SALVAR EVENTO (AGENDA + TAREFAS)
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    const existe = rowsAgenda.find(r => getVal(r, 'Conteudo_Principal').trim() === data.titulo.trim() && getVal(r, 'Data_Inicio').trim() === data.dataInicio.trim());

    if (existe) {
        existe.set('Conteudo_Secundario', data.conteudoSecundario);
        existe.set('Tipo_Evento', data.cor);
        existe.set('Perfil', data.perfil);
        existe.set('Data_Fim', data.dataFim);
        await existe.save();
    } else {
        await agendaSheet.addRow({ 'Data_Inicio': data.dataInicio, 'Data_Fim': data.dataFim, 'Tipo_Evento': data.cor, 'Tipo': data.tipo, 'Conteudo_Principal': data.titulo, 'Conteudo_Secundario': data.conteudoSecundario, 'Perfil': data.perfil });
    }

    const tarefasSheet = doc.sheetsByTitle['Tarefas'];
    const rowsT = await tarefasSheet.getRows();
    const tEx = rowsT.find(r => getVal(r, 'Titulo').trim() === data.titulo.trim() && getVal(r, 'Data').trim() === data.dataInicio.trim());

    if (tEx) {
        tEx.set('LinkDrive', data.linkDrive);
        tEx.set('Responsavel', data.perfil);
        tEx.set('ResponsavelChatId', data.chatId);
        await tEx.save();
    } else {
        await tarefasSheet.addRow([`ID${Date.now()}`, data.titulo, data.perfil, data.dataInicio, 'Pendente', data.linkDrive || '', 'Sim', data.chatId]);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
