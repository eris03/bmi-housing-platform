import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", axes: ["opsz", "SOFT"] });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "BMI Housing Society", template: "%s · BMI Housing Society" },
  description: "Explore BMI Housing Society projects, view plots and enquire in a few taps.",
};

export const viewport: Viewport = {
  themeColor: "#1f3b2d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="paper-grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
