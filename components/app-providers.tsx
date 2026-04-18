"use client";

import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/theme-context";
import { TopLoadingBar } from "@/components/top-loading-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryClient } from "@/lib/query-client";
import { AuthProvider } from "@/components/portable-auth/src/client";
import { NavigationProvider } from "@/contexts/navigation-context";
import { AuthStoreSync } from "@/components/auth-store-sync";
import { InitialLoaderCleanup } from "@/components/initial-loader-cleanup";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <CustomThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider
              config={{
                sessionUrl: "/api/auth/session",
                loginUrl: "/api/auth/login/",
                logoutUrl: "/api/auth/logout/",
              }}
            >
              <AuthStoreSync />
              <InitialLoaderCleanup />
              <NavigationProvider>
                <Suspense fallback={null}>
                  <TopLoadingBar />
                </Suspense>
                {children}
                <Toaster
                  position="bottom-right"
                  richColors
                  closeButton
                  toastOptions={{
                    duration: 4000,
                    classNames: {
                      toast: "group relative",
                      closeButton:
                        "!absolute !right-2 !top-2 !left-auto !transform-none  !bg-transparent !text-current !opacity-0 group-hover:!opacity-100 transition-opacity",
                    },
                  }}
                />
              </NavigationProvider>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
