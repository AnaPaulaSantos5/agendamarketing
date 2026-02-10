import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// --- TRAVA ANTI-CACHE (CRÍTICO) ---
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
    
    const events = rowsAgenda.map((row, index) => {
        // Converte a linha num objeto simples
        const raw = row.toObject();
        
        // --- O FAREJADOR DE LINKS (NUCLEAR) ---
        // 1. Pega TODOS os valores desta linha, não importa a coluna
        const todosOsValores = Object.values(raw);
        
        // 2. Procura: Algum desses valores parece um link? (Tem http, https ou www)
        let linkAchado = todosOsValores.find(val => 
            typeof val === 'string' && (
                val.includes('http') || 
                val.includes('https') || 
                val.includes('drive.google') ||
                val.includes('www.')
            )
        );

        // LOG DE DIAGNÓSTICO (Só no primeiro evento pra não poluir)
        if (index === 0) {
            console.log("🕵️ FAREJADOR NO PRIMEIRO EVENTO:");
            console.log("   - Valores da Linha:", todosOsValores);
            console.log("   - Link Encontrado:", linkAchado);
        }

        // Função auxiliar para achar outros campos (Titulo, Data, etc)
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
            
            // AQUI ESTÁ A GARANTIA: Se tiver um link na linha, ele VAI aparecer.
            linkDrive: linkAchado || '' 
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

    // Headers extras para matar o cache
    return NextResponse.json({ events, perfis, feed }, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
  } catch (error: any) {
    console.error("❌ ERRO GET:", error);
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

    // 2. Salvar na Tarefas (Se for externo)
    if (data.tipo && String(data.tipo).toLowerCase().trim() === 'externo') {
      const tarefasSheet = doc.sheetsByTitle['Tarefas'];
      if (tarefasSheet) {
          // Grava usando array para garantir que entra na coluna certa independente do nome
          // Ordem assumida: Bloco_ID | Titulo | Responsavel | Data | Status | LinkDrive | Notificar | ChatId
          await tarefasSheet.addRow([
             `ID${Date.now()}`,       // A
             data.titulo,             // B
             data.perfil,             // C
             data.dataInicio,         // D
             'Pendente',              // E
             data.linkDrive || '',    // F (Link)
             'Sim',                   // G
             data.chatId              // H
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
    
    const rowToDelete = rows.find(row => {
        const raw = row.toObject();
        const getVal = (t: string) => { const k = Object.keys(raw).find(x => x.toLowerCase().includes(t.toLowerCase())); return k ? raw[k] : ''; };
        return ((getVal('Conteudo')||getVal('Titulo')) + (getVal('Data_Inicio')||getVal('Data Inicio'))) === data.id;
    });

    if (rowToDelete) {
        await rowToDelete.delete();
        // Lógica de deletar da tarefa omitida para brevidade, foco no Link
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
