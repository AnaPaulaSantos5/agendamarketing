// Checklist lateral
const todayChecklist = checklist;

return (
  <div style={{ padding: 10 }}>
    <h3>Checklist Hoje</h3>
    {todayChecklist.length === 0 && <p>Sem tarefas para hoje ✅</p>}
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {todayChecklist.map(item => (
        <li key={item.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
          <span style={{ flex: 1 }}>
            {item.task} ({item.client}) - {item.done ? 'Concluído' : 'Pendente'}
          </span>
          <button
            style={{ marginLeft: 8 }}
            onClick={async () => {
              // Atualiza instantaneamente na tela
              setChecklist(prev => prev.filter(c => c.id !== item.id));

              // Atualiza na planilha
              try {
                await fetch('/api/checklist', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: item.id }),
                });
              } catch (err) {
                console.error(err);
                alert('Erro ao concluir tarefa');
              }
            }}
          >
            ✅
          </button>
        </li>
      ))}
    </ul>
  </div>
);