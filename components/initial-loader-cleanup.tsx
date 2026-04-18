"use client";

import { useEffect } from "react";

export function InitialLoaderCleanup() {
  useEffect(() => {
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.style.transition = "opacity 0.3s ease";
      loader.style.opacity = "0";
      // Hide instead of removing — removing a React-rendered node breaks
      // React's DOM reconciliation and causes "removeChild" errors on navigation.
      setTimeout(() => {
        loader.style.display = "none";
      }, 300);
    }
  }, []);
  return null;
}
