import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealBase | SF Affordable Housing Agent on Base",
  description:
    "Self-sustaining autonomous agent providing San Francisco affordable housing data, powered by Base blockchain.",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/neighborhoods", label: "Neighborhoods" },
  { href: "/api-docs", label: "API" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="699953a526c8104af5f08498" />
      </head>
      <body className="min-h-screen font-mono">
        <nav className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="text-xl font-bold text-white">
              <span className="text-base-blue">Real</span>Base
            </a>
            <div className="hidden md:flex gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Agent Running
            </span>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
