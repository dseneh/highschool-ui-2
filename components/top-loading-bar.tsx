"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar";

const TRANSITION_MS = 450;

export function TopLoadingBar() {
  const ref = useRef<LoadingBarRef>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipInitial = useRef(true);

  const search = useMemo(
    () => (searchParams ? searchParams.toString() : ""),
    [searchParams]
  );

  useEffect(() => {
    if (skipInitial.current) {
      skipInitial.current = false;
      return;
    }

    ref.current?.start();
    const timer = window.setTimeout(() => {
      ref.current?.complete();
    }, TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [pathname, search]);

  return (
    <LoadingBar
      ref={ref}
      color="hsl(var(--primary))"
      height={3}
      shadow={false}
      containerStyle={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
      }}
    />
  );
}
