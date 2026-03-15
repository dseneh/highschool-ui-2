"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function RootResetPasswordPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const workspace = searchParams?.get("workspace")?.trim();
    const uid = searchParams?.get("uid") ?? "";
    const token = searchParams?.get("token") ?? "";

    if (!workspace) {
      return;
    }

    const currentHost = window.location.host;
    const [hostname, port] = currentHost.split(":");

    if (hostname.startsWith(`${workspace}.`)) {
      return;
    }

    const baseHost =
      hostname === "localhost" || hostname === "127.0.0.1"
        ? `${workspace}.localhost`
        : `${workspace}.${hostname}`;

    const nextHost = port ? `${baseHost}:${port}` : baseHost;
    const nextUrl = new URL(`/reset-password`, window.location.origin);
    nextUrl.host = nextHost;
    if (uid) nextUrl.searchParams.set("uid", uid);
    if (token) nextUrl.searchParams.set("token", token);
    nextUrl.searchParams.set("workspace", workspace);

    window.location.replace(nextUrl.toString());
  }, [searchParams]);

  return null;
}
