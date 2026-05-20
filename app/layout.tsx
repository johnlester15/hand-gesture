import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AR 3D Hand Gesture",
  description: "Camera based hand gesture detection with procedural 3D hand model.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
