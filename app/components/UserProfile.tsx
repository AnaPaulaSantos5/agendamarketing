'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

type Props = {};

export default function UserProfile({}: Props) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session?.user) return null;

  const isAdmin = session.user.role === 'admin';

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
      <img
        src={session.user.image || '/default-avatar.png'}
        alt={session.user.name || 'Usuário'}
        style={{ width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}
        onClick={() => setOpen(prev => !prev)}
      />

      {open && (
        <div style={{
          position: 'absolute',
          top: 50,
          left: 0,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: 16,
          width: 220,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <p><strong>Nome:</strong> {session.user.name}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p>
            <strong>Responsável Chat ID:</strong>{' '}
            {isAdmin ? (
              <input
                type="text"
                value={session.user.responsavelChatId || ''}
                style={{ width: '100%' }}
                // Aqui você pode adicionar onChange e salvar no backend se quiser
              />
            ) : (
              session.user.responsavelChatId || 'Não disponível'
            )}
          </p>
          {isAdmin && <small style={{ color: '#888' }}>Você pode editar esse campo</small>}
        </div>
      )}
    </div>
  );
}