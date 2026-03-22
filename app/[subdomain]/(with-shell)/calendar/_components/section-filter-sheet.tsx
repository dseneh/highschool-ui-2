"use client";

import { useState, useMemo } from "react";
import { Check, Search, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useGradeLevels } from "@/hooks/use-grade-level";

type SectionFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSectionId: string | null;
  onSectionChange: (id: string | null, name: string | null) => void;
};

export function SectionFilterSheet({
  open,
  onOpenChange,
  selectedSectionId,
  onSectionChange,
}: SectionFilterSheetProps) {
  const [search, setSearch] = useState("");
  const { data: gradeLevels = [], isLoading } = useGradeLevels();

  const activeGradeLevels = useMemo(() => {
    return gradeLevels
      .filter((gradeLevel) => gradeLevel.active && gradeLevel.status === "active")
      .map((gradeLevel) => ({
        ...gradeLevel,
        sections: gradeLevel.sections.filter((section) => {
          const activeSection = section as typeof section & {
            active?: boolean;
            status?: string;
          };

          return activeSection.active !== false && activeSection.status !== "disabled";
        }),
      }))
      .filter((gradeLevel) => gradeLevel.sections.length > 0);
  }, [gradeLevels]);

  const filteredGradeLevels = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeGradeLevels;
    return activeGradeLevels
      .map((gl) => ({
        ...gl,
        sections: gl.sections.filter((s) => s.name.toLowerCase().includes(q)),
      }))
      .filter((gl) => gl.sections.length > 0);
  }, [activeGradeLevels, search]);

  const totalSections = useMemo(
    () => activeGradeLevels.reduce((sum, gl) => sum + gl.sections.length, 0),
    [activeGradeLevels]
  );

  function handleSelect(id: string, name: string) {
    onSectionChange(id, name);
    onOpenChange(false);
  }

  function handleClear() {
    onSectionChange(null, null);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 sm:max-w-sm">
        {/* Header */}
        <SheetHeader className="border-b px-4 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-sm font-semibold leading-tight">
                Filter by Classes
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-xs">
                {totalSections} {totalSections === 1 ? "class" : "classes"} available
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Search */}
        <div className="border-b bg-muted/20 px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 pl-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sections…"
            />
          </div>
        </div>

        {/* Section list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {/* All sections option */}
          <button
            onClick={handleClear}
            className={cn(
              "mb-3 flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all hover:bg-muted/40",
              selectedSectionId === null
                ? "border-primary/40 bg-primary/5 shadow-sm"
                : "border-transparent bg-muted/10 hover:border-border/50"
            )}
          >
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                selectedSectionId === null
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}
            >
              {selectedSectionId === null && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            <span
              className={cn(
                "font-medium",
                selectedSectionId === null ? "text-primary" : "text-foreground"
              )}
            >
              All Classes
            </span>
            <Badge
              variant={selectedSectionId === null ? "default" : "secondary"}
              className="ml-auto text-xs"
            >
              School-wide
            </Badge>
          </button>

          {/* Grade-level groups */}
          {isLoading ? (
            <div className="space-y-5 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="mb-2 h-3.5 w-28" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredGradeLevels.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Search className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">No sections match your search</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGradeLevels.map((gradeLevel) => (
                <div key={gradeLevel.id} className="border-b pb-2 hover:bg-acient/50 transition-all duration-500">
                  {/* <div className="flex items-center gap-1.5 px-1">
                    <span className="ftext-[11px] font-semibold fuppercase text-primary tracking-wider ftext-muted-foreground">
                      {gradeLevel.name}
                    </span>
                    <span className="ml-auto text-[11px] text-muted-foreground/60">
                      {gradeLevel.sections.length}
                    </span>
                  </div> */}

                  {/* Sections */}
                  <div className="space-y-1">
                    {gradeLevel.sections.map((section) => {
                      const isSelected = selectedSectionId === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => handleSelect(section.id, section.name)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all hover:bg-muted/40",
                            isSelected
                              ? "border-primary/40 bg-primary/5 shadow-sm"
                              : "border-transparent bg-muted/10 hover:border-border/50"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30"
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "font-medium",
                              isSelected ? "text-primary" : "text-foreground"
                            )}
                          >
                           <span className={cn(!isSelected && "text-muted-foreground")}>{gradeLevel.name}</span> {" "} 
                           <span>{section.name}</span>
                          </span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {section.students}{" "}
                            {section.students === 1 ? "student" : "students"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — clear button when a section is active */}
        {selectedSectionId !== null && (
          <div className="border-t bg-muted/10 px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleClear}
              iconLeft={<X className="h-3.5 w-3.5" />}
            >
              Clear Section Filter
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
