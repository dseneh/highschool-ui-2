"use client";

import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

function baseIcon(props: IconProps, path: React.ReactNode) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {path}
    </svg>
  );
}

export const Coins = (props: IconProps) =>
  baseIcon(props, (
    <>
      <circle cx="8" cy="8" r="3.5" />
      <circle cx="16" cy="16" r="3.5" />
      <path d="M5 16.5v-4M11 7.5v4M13 10.5h4" />
    </>
  ));

export const Github = (props: IconProps) =>
  baseIcon(props, (
    <path d="M12 2.5c-5.1 0-9.25 4.1-9.25 9.17 0 4.05 2.62 7.48 6.26 8.69.46.08.62-.2.62-.44 0-.22-.01-.96-.01-1.74-2.54.55-3.08-1.09-3.08-1.09-.42-1.05-1.02-1.32-1.02-1.32-.83-.57.06-.56.06-.56.92.06 1.41.95 1.41.95.82 1.4 2.15 1 2.67.76.08-.58.32-.99.58-1.22-2.03-.23-4.16-1.02-4.16-4.54 0-1 .36-1.82.95-2.46-.1-.23-.41-1.16.09-2.42 0 0 .77-.25 2.52.94a8.74 8.74 0 0 1 4.6 0c1.75-1.19 2.52-.94 2.52-.94.5 1.26.18 2.19.09 2.42.6.64.95 1.46.95 2.46 0 3.53-2.13 4.3-4.16 4.53.33.29.62.86.62 1.74 0 1.25-.01 2.26-.01 2.57 0 .24.17.53.63.44 3.64-1.21 6.26-4.64 6.26-8.69C21.25 6.6 17.1 2.5 12 2.5Z" />
  ));

export const PanelLeft = (props: IconProps) =>
  baseIcon(props, (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <path d="M9 4.5v15" />
    </>
  ));

export const LayoutGrid = (props: IconProps) =>
  baseIcon(props, (
    <>
      <rect x="4.5" y="4.5" width="6" height="6" rx="1.5" />
      <rect x="13.5" y="4.5" width="6" height="6" rx="1.5" />
      <rect x="4.5" y="13.5" width="6" height="6" rx="1.5" />
      <rect x="13.5" y="13.5" width="6" height="6" rx="1.5" />
    </>
  ));

export const Columns = (props: IconProps) =>
  baseIcon(props, (
    <>
      <rect x="4.5" y="4.5" width="6.5" height="15" rx="1.5" />
      <rect x="13" y="4.5" width="6.5" height="15" rx="1.5" />
    </>
  ));

export const Rows = (props: IconProps) =>
  baseIcon(props, (
    <>
      <rect x="4.5" y="4.5" width="15" height="6.5" rx="1.5" />
      <rect x="4.5" y="13" width="15" height="6.5" rx="1.5" />
    </>
  ));

export const Table2 = (props: IconProps) =>
  baseIcon(props, (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="M3.5 10.5h17M9 5.5v13M15 5.5v13" />
    </>
  ));

export const ChevronDown = (props: IconProps) =>
  baseIcon(props, <path d="m7 10 5 5 5-5" />);
export const Layout = (props: IconProps) =>
  baseIcon(props, (
    <>
      <rect x="4.5" y="4.5" width="15" height="6" rx="1.5" />
      <rect x="4.5" y="13.5" width="7" height="6" rx="1.5" />
      <rect x="14.5" y="13.5" width="5" height="6" rx="1.2" />
    </>
  ));

export const Search = (props: IconProps) =>
  baseIcon(props, (
    <>
      <circle cx="10.5" cy="10.5" r="5" />
      <path d="m15 15 3.5 3.5" />
    </>
  ));
export const Calendar = (props: IconProps) =>
  baseIcon(props, (
    <>
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M9 3.5v4M15 3.5v4M4 10.5h16" />
    </>
  ));
export const MoreHorizontal = (props: IconProps) =>
  baseIcon(props, <path d="M6 12h.01M12 12h.01M18 12h.01" />);
export const CheckCircle2 = (props: IconProps) =>
  baseIcon(props, (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2 2 4.5-5" />
    </>
  ));
export const Clock = (props: IconProps) =>
  baseIcon(props, (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5L15 14" />
    </>
  ));
export const Loader2 = (props: IconProps) =>
  baseIcon(props, <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5 5.5-2.1-2.1M6.6 6.6 4.5 4.5m13.9 0-2.1 2.1M6.6 17.4 4.5 19.5" />);
export const XCircle = (props: IconProps) =>
  baseIcon(props, (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ));
export const FileInput = (props: IconProps) =>
  baseIcon(props, (
    <>
      <rect x="4.5" y="3.5" width="11" height="17" rx="2" />
      <path d="m15.5 8.5 4 4-4 4v-3h-5v-2h5z" />
    </>
  ));
export const ChevronLeft = (props: IconProps) =>
  baseIcon(props, <path d="m14 6-6 6 6 6" />);
export const ChevronRight = (props: IconProps) =>
  baseIcon(props, <path d="m10 18 6-6-6-6" />);
export const ChevronsLeft = (props: IconProps) =>
  baseIcon(props, (
    <>
      <path d="m13 6-6 6 6 6" />
      <path d="m19 6-6 6 6 6" />
    </>
  ));
export const ChevronsRight = (props: IconProps) =>
  baseIcon(props, (
    <>
      <path d="m11 6 6 6-6 6" />
      <path d="m5 6 6 6-6 6" />
    </>
  ));
export const CircleDot = (props: IconProps) =>
  baseIcon(props, (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3" />
    </>
  ));
