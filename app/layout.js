import './globals.css';

export const metadata = {
  title: 'AR 3D Hand Gesture',
  description: 'Camera hand gesture detection with procedural 3D hand model',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
