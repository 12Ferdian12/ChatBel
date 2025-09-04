import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chat-B3LL",
  description: "A Chat Application",
  icons: {
    icon: "/ICON.png",
    shortcut: "/ICON.png",
    apple: "/ICON.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="bottom-center " />
        {children}
      </body>
    </html>
  );
}
