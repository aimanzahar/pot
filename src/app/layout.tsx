import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "Pot — everyone chips in. The pot fills up.",
  description:
    "Create a bill, share a link, and watch the pot fill as friends chip in. Simple, satisfying split-bill tracker.",
  applicationName: "Pot",
  authors: [{ name: "Pot" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f1e5" },
    { media: "(prefers-color-scheme: dark)", color: "#150f0c" },
  ],
};

const THEME_SCRIPT = `
  (function(){
    try {
      var saved = localStorage.getItem('pot-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var dark = saved ? saved === 'dark' : false; // light by default; respect saved choice
      if (dark) document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
