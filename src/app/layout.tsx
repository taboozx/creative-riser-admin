import Link from "next/link";
import "./globals.css";
import AxiosLoggerInit from "../components/AxiosLoggerInit";

export const metadata = {
  title: "Creative Riser",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <AxiosLoggerInit />
        <nav className="bg-gray-900 border-b border-gray-700 p-4 flex gap-6 text-purple-300 text-sm font-medium">
          <Link href="/home" className="hover:text-white">Home</Link>
          <Link href="/setting" className="hover:text-white">Settings</Link>
          <Link href="/contest" className="hover:text-white">Contest</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}