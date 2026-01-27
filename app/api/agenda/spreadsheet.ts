import { GoogleSpreadsheet } from "google-spreadsheet";
import creds from "../../service-account.json"; // ajuste o caminho se necessário

export const getSpreadsheet = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!);

  // Autentica usando a service account
  await doc.useServiceAccountAuth({
    client_email: (creds as any).client_email,
    private_key: (creds as any).private_key,
  });

  // Carrega informações da planilha
  await doc.loadInfo();

  return doc;
};