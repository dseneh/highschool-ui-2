import { Button } from "@/components/ui/button";

interface SSOButtonProps {
  disabled?: boolean;
  className?: string;
}

export function SSOButton({ disabled, className }: SSOButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      size="lg"
      disabled//={disabled}
      icon={
        <svg 
        className="mr-2 h-4 w-4" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      }
    >
      Login with SSO
    </Button>
  );
}
