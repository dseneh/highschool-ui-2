"use client";

import { useTheme, type ColorTheme, type ShapeStyle } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, RefreshIcon, TickDouble02Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Cog, SwatchBook } from "lucide-react";

const colorThemes: Array<{
  value: ColorTheme;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: "ocean",
    label: "Ocean",
    description: "Soft modern teal (default)",
    color: "oklch(0.62 0.15 200)",
  },
  {
    value: "sunset",
    label: "Sunset",
    description: "Warm orange & coral",
    color: "oklch(0.66 0.17 45)",
  },
  {
    value: "forest",
    label: "Forest",
    description: "Fresh green",
    color: "oklch(0.58 0.14 155)",
  },
  {
    value: "royal",
    label: "Royal",
    description: "Rich purple",
    color: "oklch(0.6 0.18 285)",
  },
  {
    value: "slate",
    label: "Slate",
    description: "Neutral gray-blue",
    color: "oklch(0.54 0.08 240)",
  },
];

const shapeStyles: Array<{
  value: ShapeStyle;
  label: string;
  description: string;
}> = [
  {
    value: "rounded",
    label: "Rounded",
    description: "Balanced corners (default)",
  },
  {
    value: "sharp",
    label: "Sharp",
    description: "Minimal rounding",
  },
  {
    value: "pill",
    label: "Pill",
    description: "Maximum rounding",
  },
];

export function ThemeCustomizer() {
  const { theme, setColorTheme, setShapeStyle, toggleDarkMode, resetTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <SwatchBook className="h-4 w-4" />
          <span className="sr-only">Customize theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Color Theme
          </DropdownMenuLabel>
          {colorThemes.map((item) => (
            <DropdownMenuItem
              key={item.value}
              onClick={() => setColorTheme(item.value)}
              className="flex items-center gap-3 py-2.5"
            >
              <div
                className="h-5 w-5 shrink-0 rounded-md border border-border/60 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  {theme.color === item.value && (
                    <HugeiconsIcon
                      icon={TickDouble02Icon}
                      className="h-3.5 w-3.5 text-primary"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Shape Style
          </DropdownMenuLabel>
          {shapeStyles.map((item) => (
            <DropdownMenuItem
              key={item.value}
              onClick={() => setShapeStyle(item.value)}
              className="flex items-center gap-3 py-2.5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  {theme.shape === item.value && (
                    <HugeiconsIcon
                      icon={TickDouble02Icon}
                      className="h-3.5 w-3.5 text-primary"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Display
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={toggleDarkMode}
            className="flex items-center gap-2 py-2"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Dark Mode</span>
                {theme.darkMode && (
                  <HugeiconsIcon
                    icon={TickDouble02Icon}
                    className="h-3.5 w-3.5 text-primary"
                  />
                )}
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem className="p-0">
            <Link href="/settings" className="flex items-center gap-2 w-full px-2 py-1.5">
              <HugeiconsIcon icon={Settings02Icon} className="h-4 w-4" />
              <span className="text-sm">Full Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={resetTheme}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
            Reset to default
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
