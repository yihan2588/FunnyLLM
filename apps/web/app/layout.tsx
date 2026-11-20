import type { Metadata } from "next";
import "./globals.css";
import "./cowriter/cowriter.css";
import "./funny.css";

export const metadata: Metadata = {
  title: "Your funny meme maker",
  description: "Start with a picture or a thought. Find a funny angle, refine it, and make it yours.",
  formatDetection: { email: false, telephone: false, address: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a>{children}</body></html>;
}
