import React from "react";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";

type RefreshButtonProps = {
  onClick: () => void;
  loading?: boolean;
  size?:
    | "sm"
    | "lg"
    | "icon"
    | "default"
    | "xs"
    | "icon-xs"
    | "icon-sm"
    | "icon-lg"
    | null
    | undefined;
  buttonText?: string;
  tooltip?: string;
  rest?: React.ComponentProps<typeof Button>;
};
export default function RefreshButton({
  onClick,
  loading,
  size = "icon",
  buttonText = "Refresh",
  tooltip = "Refresh page data",
  ...rest
}: RefreshButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      size={size}
      tooltip={loading ? "Refreshing..." : tooltip}
      variant="outline"
      icon={<RefreshCw className={loading ? "animate-spin" : ""} />}
      {...rest}
    >
      {size !== "icon" ? buttonText : null}
    </Button>
  );
}
