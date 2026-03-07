"use client";

import { useEffect } from "react";
import { useNavigation } from "@/contexts/navigation-context";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { setMainNavigation } = useNavigation();

  useEffect(() => {
    setMainNavigation();
  }, [setMainNavigation]);

  return children;
}
