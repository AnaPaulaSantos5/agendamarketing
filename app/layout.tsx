import './globals.css'

export const metadata = {
  title: 'Marketing Agenda',
  description: 'Agenda de marketing e checklist',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

