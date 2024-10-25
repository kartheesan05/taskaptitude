import "./globals.css";

export const metadata = {
  title: "Aptitude",
  description: "Forese Aptitude Test Task",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
