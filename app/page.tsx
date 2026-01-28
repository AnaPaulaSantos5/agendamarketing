import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Agenda de Marketing</h1>
      <p>Sistema interno de organização de conteúdos, gravações e publicações.</p>
      <div style={{ marginTop: 24 }}>
        <Link href="/agenda">
          <button style={{ padding: '12px 20px', fontSize: 16, cursor: 'pointer' }}>
            Acessar Agenda
          </button>
        </Link>
      </div>
    </main>
  );
}
