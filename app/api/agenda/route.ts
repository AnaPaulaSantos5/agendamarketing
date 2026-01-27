import { getRows, addRow } from "../../../spreadsheet";

export async function GET() {
  try {
    const rows = await getRows();
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response("Erro ao carregar dados da agenda", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await addRow(0, data); // adiciona na primeira aba da planilha
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Erro ao adicionar dados na agenda", { status: 500 });
  }
}
