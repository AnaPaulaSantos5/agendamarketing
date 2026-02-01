'use client';

export default function RightSidebar() {
  return (
    <aside
      style={{
        width: 220,
        padding: 16,
        borderLeft: '1px solid #e5e5e5',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <h4 style={{ marginBottom: 8 }}>Integrações</h4>

      <a
        href="https://web.whatsapp.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        📱 WhatsApp
      </a>

      <a
        href="https://open.spotify.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        🎧 Spotify
      </a>
    </aside>
  );
}