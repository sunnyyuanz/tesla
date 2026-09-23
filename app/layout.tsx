import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Media library · vvid", description:"A soft little home for every frame. Save and organize your favorite media in your personal library."};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en" className="i18n-ready"><body className="app-ready">{children}</body></html>;}
