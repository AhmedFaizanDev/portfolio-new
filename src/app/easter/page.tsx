import type { Metadata } from "next";
import { EasterClientPage } from "./components/EasterClientPage";

export const metadata: Metadata = {
  title: "Easter",
  alternates: { canonical: "/easter" },
  robots: { index: false, follow: true },
  description: "A tiny pixel town with a few secrets about Faizan.",
};

export default function EasterPage() {
  return <EasterClientPage />;
}
