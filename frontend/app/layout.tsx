import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT Organizer",
  description: "Gestão de serviços de TI, do agendamento à entrega.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
