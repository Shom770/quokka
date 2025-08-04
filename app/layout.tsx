import type { Metadata } from "next";
import { figtree } from "@/components/fonts";
import "./globals.css";
import LayoutClient from "@/app/layout-client";
import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export const metadata: Metadata = {
  title: "Quokka",
  description: "Mental health app made for students, by students.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`flex flex-col items-center bg-[#FCF4F0] ${figtree.className} antialiased overflow-hidden w-full`}
      >
        <NextIntlClientProvider>
          <LayoutClient>{children}</LayoutClient>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
