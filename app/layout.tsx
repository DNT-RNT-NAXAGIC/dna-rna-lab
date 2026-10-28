import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ԴՆԹ և ՌՆԹ — ինտերակտիվ կենսաբանություն",
  description: "9-րդ դասարանի ինտերակտիվ նախագիծ՝ ԴՆԹ-ի, ՌՆԹ-ի և 3D մոլեկուլների մասին։",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="hy"><body>{children}</body></html>;
}
