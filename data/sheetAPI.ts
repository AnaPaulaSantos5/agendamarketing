import { mapPlanilhaParaEventos } from '../utils/mapPlanilhaParaEventos';

export const getSheetData = async () => {
  // Aqui você faz a integração com Google Sheets, Airtable ou outro
  // Exemplo temporário:
  const rawSheetData = await fetch('https://sua-api-ou-google-sheet-endpoint')
    .then(res => res.json());

  return mapPlanilhaParaEventos(rawSheetData);
};