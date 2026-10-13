"use client";

import { usePathname } from "next/navigation";
import HomeBackground from "./HomeBackground";

export default function RoutePixelBackground() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return <HomeBackground quality="lite" />;
}
