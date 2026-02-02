// app/agenda/page.tsx
'use client';
import { useState } from 'react';
import AgendaCalendar from './components/AgendaCalendar';
import EventModal from './components/EventModal';

export default function AgendaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [perfilSelecionado, setPerfilSelecionado] = useState('Confi');

  const perfis = [
    { nome: 'Confi', foto: '/perfis/confi.png', chatId: '1111' },
    { nome: 'Luiza', foto: '/perfis/luiza.png', chatId: '2222' },
    { nome: 'Júlio', foto: '/perfis/julio.png', chatId: '3333' },
    { nome: 'Cecília', foto: '/perfis/cecilia.png', chatId: '4444' },
  ];

  const clientes = [
    { nome: 'Ana Paula', email: 'ana@exemplo.com', chatId: '5555', foto: '/clientes/ana.png' },
    { nome: 'Carlos', email: 'carlos@exemplo.com', chatId: '6666', foto: '/clientes/carlos.png' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      
      {/* ==================== TOPO ==================== */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#f5f5f5' }}>
        <h1>Agenda</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Seleção de perfil */}
          <select value={perfilSelecionado} onChange={(e) => setPerfilSelecionado(e.target.value)}>
            {perfis.map((p) => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
          </select>
          {/* Fotinha do usuário */}
          <img
            src={perfis.find(p => p.nome === perfilSelecionado)?.foto}
            alt="Perfil"
            style={{ width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}
          />
        </div>
      </header>

      {/* ==================== CORPO ==================== */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* ===== SIDEBAR ESQUERDA ===== */}
        <aside style={{ width: 300, padding: 16, borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {clientes.map(cliente => (
            <div key={cliente.chatId} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, border: '1px solid #eee', borderRadius: 8 }}>
              <img src={cliente.foto} alt={cliente.nome} style={{ width: 50, height: 50, borderRadius: '50%' }} />
              <div>
                <div><strong>{cliente.nome}</strong></div>
                <div>{cliente.email}</div>
                <div>Chat ID: {cliente.chatId}</div>
              </div>
            </div>
          ))}

          {/* Checklist */}
          <div>
            <h3>Checklist</h3>
            <ul>
              <li><input type="checkbox" /> Preparar evento</li>
              <li><input type="checkbox" /> Confirmar cliente</li>
            </ul>
          </div>
        </aside>

        {/* ===== CALENDÁRIO CENTRAL ===== */}
        <main style={{ flex: 1, padding: 16 }}>
          <AgendaCalendar
            onEventClick={(event: any) => {
              setSelectedEvent(event);
              setIsModalOpen(true);
            }}
          />
        </main>

        {/* ===== SIDEBAR DIREITA ===== */}
        <aside style={{ width: 300, padding: 16, borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h3>Playlist Spotify</h3>
            <iframe
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M"
              width="100%"
              height="380"
              allow="encrypted-media"
            ></iframe>
          </div>
          <div id="notificacoes">
            {/* Notificações futuras */}
          </div>
        </aside>
      </div>

      {/* ==================== MODAL ==================== */}
      {isModalOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          perfis={perfis}
          onSave={(data) => { console.log('Salvar evento', data); setIsModalOpen(false); }}
          onDelete={(id) => { console.log('Excluir evento', id); setIsModalOpen(false); }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}