"use client";

import { useEffect } from "react";

export function InitialLoaderCleanup() {
  useEffect(() => {
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.style.transition = "opacity 0.3s ease";
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 300);
    }
  }, []);
  return null;
}
