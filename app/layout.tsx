import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "peek — peek inside a neural network",
  description:
    "an interactive intro to mechanistic interpretability. train a tiny neural network in your browser, then trace a data point through it, hover any neuron to see what it detects, and watch the decision boundary form.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
