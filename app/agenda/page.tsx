import AgendaCalendar from '../components/AgendaCalendar';
// Aqui você traz os dados da planilha (exemplo mock)
import { sheetDataMock } from '../data/mockSheet';

export default function AgendaPage() {
  return <AgendaCalendar sheetData={sheetDataMock} />;
}