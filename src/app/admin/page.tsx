import type { Metadata } from "next";
import UtAdmin from "@/components/UtAdmin";

export const metadata: Metadata = { title: "Steadi UT 기록", robots: { index: false, follow: false } };

export default function Admin() {
  return <UtAdmin />;
}
