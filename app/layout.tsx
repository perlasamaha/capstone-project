import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/layout/providers";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DevCommunity",
    template: "%s · DevCommunity",
  },
  description:
    "A developer community platform for learning, sharing and discovering technical content.",
};

// The layout deliberately doesn't read the session. auth() reads cookies, and
// doing that here would make every page dynamic. The parts that depend on the
// user (user menu, join/bookmark buttons...) read it on the client instead.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Header />
              <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">
                {children}
              </main>
              <footer className="border-t border-line px-4 py-6 text-center text-xs text-muted md:px-8">
                DevCommunity — a community for developers, by developers.
              </footer>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
