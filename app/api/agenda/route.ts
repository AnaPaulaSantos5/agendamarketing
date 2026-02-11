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
    const rowsAgenda = await doc.sheetsByTitle['Agenda'].getRows();
    const rowsTarefas = await doc.sheetsByTitle['Tarefas'].getRows();
    const rowsPerfis = await doc.sheetsByTitle['Perfil'].getRows();

    const perfis = rowsPerfis.map(r => ({ 
        nome: getVal(r, 'Perfil'), 
        chatId: getVal(r, 'ChatId'), 
        email: getVal(r, 'Email') 
    }));
    
    const events = rowsAgenda.map(row => {
        const titulo = getVal(row, 'Conteudo_Principal');
        const dataIni = getVal(row, 'Data_Inicio');
        const nomePerfil = getVal(row, 'Perfil');
        const tarefa = rowsTarefas.find(r => getVal(r, 'Titulo').trim() === titulo.trim() && getVal(r, 'Data').trim() === dataIni.trim());
        
        // Sempre prioriza o ChatID atual da aba Perfil
        const perfilData = perfis.find(p => p.nome === nomePerfil);

        return {
            id: (titulo + dataIni).replace(/\s/g, '').toLowerCase(),
            titulo,
            dataInicio: dataIni,
            dataFim: getVal(row, 'Data_Fim'),
            tipo: getVal(row, 'Tipo'),
            cor: getVal(row, 'Tipo_Evento'),
            perfil: nomePerfil,
            conteudoSecundario: getVal(row, 'Conteudo_Secundario'),
            linkDrive: tarefa ? getVal(tarefa, 'LinkDrive') : '',
            chatId: perfilData?.chatId || (tarefa ? getVal(tarefa, 'ResponsavelChatId') : '')
        };
    });

    const feed = (await doc.sheetsByTitle['WhatsApp_Feed'].getRows()).map(r => ({ 
        Tipo: getVal(r, 'Tipo'), Nome: getVal(r, 'Nome'), Evento: getVal(r, 'Evento'), Resposta: getVal(r, 'Resposta'), Data: getVal(r, 'Data')
    })).filter(item => {
        const res = String(item.Resposta || '').toUpperCase().trim();
        if (res === 'SIM' || res === 'NÃO' || res === 'NAO') { item.Tipo = 'RESPOSTA'; return true; }
        if (String(item.Nome).toLowerCase().includes('confi')) { item.Tipo = 'ENVIO'; return true; }
        return false;
    }).reverse().slice(0, 10);

    return NextResponse.json({ events, perfis, feed });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await doc.loadInfo();
    
    if (data.isPerfilUpdate) {
        const pRows = await doc.sheetsByTitle['Perfil'].getRows();
        const row = pRows.find(r => getVal(r, 'Email').toLowerCase().trim() === data.email.toLowerCase().trim());
        if (row) { row.set('Perfil', data.nome); row.set('ChatId', data.chatId); await row.save(); return NextResponse.json({ success: true }); }
    }

    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsA = await agendaSheet.getRows();
    const exA = rowsA.find(r => getVal(r, 'Conteudo_Principal').trim() === data.titulo.trim() && getVal(r, 'Data_Inicio').trim() === data.dataInicio.trim());

    if (exA) {
        exA.set('Data_Fim', data.dataFim); exA.set('Tipo_Evento', data.cor); exA.set('Perfil', data.perfil); exA.set('Conteudo_Secundario', data.conteudoSecundario || '');
        await exA.save();
    } else {
        await agendaSheet.addRow({ 'Data_Inicio': data.dataInicio, 'Data_Fim': data.dataFim, 'Tipo_Evento': data.cor, 'Tipo': data.tipo, 'Conteudo_Principal': data.titulo, 'Conteudo_Secundario': data.conteudoSecundario || '', 'Perfil': data.perfil });
    }

    const tSheet = doc.sheetsByTitle['Tarefas'];
    const rowsT = await tSheet.getRows();
    const tEx = rowsT.find(r => getVal(r, 'Titulo').trim() === data.titulo.trim() && getVal(r, 'Data').trim() === data.dataInicio.trim());
    if (tEx) { tEx.set('LinkDrive', data.linkDrive || ''); tEx.set('Responsavel', data.perfil); tEx.set('ResponsavelChatId', data.chatId); await tEx.save(); }
    else { await tSheet.addRow([`ID${Date.now()}`, data.titulo, data.perfil, data.dataInicio, 'Pendente', data.linkDrive || '', 'Sim', data.chatId]); }
    
    return NextResponse.json({ success: true });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
