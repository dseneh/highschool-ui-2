import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import acronym from "../ui/acronym";

type AvatarImgProps = {
  src?: string | null;
  alt?: string;
  name?: string;
  className?: string;
  imgClassName?: string;
};
export default function AvatarImg({
  src,
  alt,
  name,
  className,
  imgClassName,
}: AvatarImgProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={src!} alt={alt} className={imgClassName} />
      <AvatarFallback>{acronym(name)}</AvatarFallback>
    </Avatar>
  );
}
