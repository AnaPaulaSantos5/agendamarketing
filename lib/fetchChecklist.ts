// lib/fetchChecklist.ts
export async function fetchChecklist() {
  const res = await fetch('/api/checklist');
  const data = await res.json();
  return data;
}
