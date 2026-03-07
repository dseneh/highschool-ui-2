import { cn } from "@/lib/utils";
import Image from "next/image";

const MARK_LIGHT = "/img/icon-light.png";
const MARK_DARK = "/img/icon-dark.png";
const WORDMARK_LIGHT = "/img/logo-light-full.png";
const WORDMARK_DARK = "/img/logo-dark-full.png";

function LogoImage({
  lightSrc,
  darkSrc,
  alt,
  className,
}: {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src={lightSrc}
        alt={alt}
        className="block h-full w-full object-contain dark:hidden"
        loading="eager"
        height={500}
        width={500}
      />
      <Image
        src={darkSrc}
        alt={alt}
        className="hidden h-full w-full object-contain dark:block"
        loading="eager"
        height={500}
        width={500}
      />
    </div>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <LogoImage
      lightSrc={MARK_LIGHT}
      darkSrc={MARK_DARK}
      alt="Brand mark"
      className={className}
    />
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <LogoImage
      lightSrc={WORDMARK_LIGHT}
      darkSrc={WORDMARK_DARK}
      alt="EzySchool"
      className={className}
    />
  );
}
