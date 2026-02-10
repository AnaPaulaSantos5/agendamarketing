import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// --- TRAVA DE SEGURANÇA 1: DESLIGAR O CACHE DO SERVIDOR ---
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);

export async function GET() {
  try {
    await doc.loadInfo();
    const agendaSheet = doc.sheetsByTitle['Agenda'];
    const rowsAgenda = await agendaSheet.getRows();
    
    const events = rowsAgenda.map(row => {
        // Pega os dados brutos da linha
        const raw = row.toObject();
        
        // --- TÁTICA "CAÇADORA DE LINK" ---
        // 1. Pega todos os valores escritos na linha
        const valores = Object.values(raw);
        
        // 2. Procura qualquer texto que comece com "http" (independente da coluna!)
        let linkAchado = valores.find(v => typeof v === 'string' && v.trim().startsWith('http'));
        
        // 3. Se não achou "http", tenta achar a coluna "Link" ou "Drive" especificamente
        if (!linkAchado) {
            const keyLink = Object.keys(raw).find(k => k.toLowerCase().includes('link') || k.toLowerCase().includes('drive'));
            if (keyLink) linkAchado = raw[keyLink];
        }

        // Função auxiliar para achar outros campos ignorando maiúsculas
        const getVal = (termo: string) => {
            const k = Object.keys(raw).find(key => key.toLowerCase().includes(termo.toLowerCase()));
            return k ? raw[k] : '';
        };

        const titulo = getVal('Conteudo') || getVal('Titulo');
        const dataIni = getVal('Data_Inicio') || getVal('Data Inicio');
        
        return {
            id: (titulo || '') + (dataIni || ''),
            dataInicio: dataIni,
            dataFim: getVal('Data_Fim') || getVal('Termino'),
            titulo: titulo,
            conteudoSecundario: getVal('Secundario'),
            cor: getVal('Tipo_Evento') || getVal('Cor'),
            tipo: getVal('Tipo'),
            perfil: getVal('Perfil'),
            linkDrive: linkAchado || '' // <--- Aqui vai o link que ele caçou
        };
    });

    // --- PERFIS ---
    const perfilSheet = doc.sheetsByTitle['Perfil'];
    const rowsPerfil = await perfilSheet.getRows();
    const perfis = rowsPerfil.map(row => ({
      nome: row.get('Perfil'),
      chatId: row.get('ChatId'),
      email: row.get('Email')
    }));

    // --- FEED ---
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

    return NextResponse.json({ events, perfis, feed }, { 
        headers: { 'Cache-Control': 'no-store, max-age=0' } 
    });
  } catch (error: any) {
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

    // 2. Salvar na Tarefas (Se externo)
    if (data.tipo && String(data.tipo).toLowerCase().trim() === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      if (tarefasSheet) {
          // Grava usando array para ignorar nomes de colunas errados
          await tarefasSheet.addRow([
             `ID${Date.now()}`,       // A: Bloco_ID
             data.titulo,             // B: Titulo
             data.perfil,             // C: Responsavel
             data.dataInicio,         // D: Data
             'Pendente',              // E: Status
             data.linkDrive || '',    // F: LinkDrive
             'Sim',                   // G: Notificar
             data.chatId              // H: ChatId
          ]);
      }
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
    
    // Busca e deleta
    const rowToDelete = rows.find(row => {
        const raw = row.toObject();
        const getVal = (t: string) => { const k = Object.keys(raw).find(x => x.toLowerCase().includes(t.toLowerCase())); return k ? raw[k] : ''; };
        return ((getVal('Conteudo')||getVal('Titulo')) + (getVal('Data_Inicio')||getVal('Data Inicio'))) === data.id;
    });

    if (rowToDelete) {
        const raw = rowToDelete.toObject();
        const getVal = (t: string) => { const k = Object.keys(raw).find(x => x.toLowerCase().includes(t.toLowerCase())); return k ? raw[k] : ''; };
        
        const tituloSalvo = getVal('Conteudo')||getVal('Titulo');
        const dataSalva = getVal('Data_Inicio')||getVal('Data Inicio');

        await rowToDelete.delete();
        
        // Deletar da Tarefas também
        const tarefasSheet = doc.sheetsByTitle['Tarefas'];
        if (tarefasSheet) {
            const rowsT = await tarefasSheet.getRows();
            // Procura linha que tenha os mesmos dados (aproximado)
            const rowT = rowsT.find(r => {
                const vals = Object.values(r.toObject());
                return vals.includes(tituloSalvo) && vals.includes(dataSalva);
            });
            if (rowT) await rowT.delete();
        }
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
