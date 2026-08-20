import "./globals.css";
import PwaRegister from "./pwa-register";

export const metadata = {
  title: "Sindicato Metropolitano | Demo DigitalTesh",
  description: "Sitio web demo del Sindicato Metropolitano desarrollado por DigitalTesh.",
  manifest: "/manifest.webmanifest",
  icons: { apple: "/icon-192.png" },
  appleWebApp: { capable: true, title: "Sindicato Admin", statusBarStyle: "default" },
};

export default function RootLayout({ children }) {
  return <html lang="es"><head><meta name="theme-color" content="#1769e0" /></head><body><PwaRegister />{children}</body></html>;
}
