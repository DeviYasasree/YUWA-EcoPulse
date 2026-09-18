"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type EvidenceImageProps = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
};

export function EvidenceImage({ src, alt = "Submitted evidence", className }: EvidenceImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src) && failedSrc === src;

  if (!src) {
    return (
      <div
        className={cn(
          "flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-border bg-muted px-4 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        No evidence photo provided.
      </div>
    );
  }

  if (failed) {
    return (
      <div
        className={cn(
          "flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-border bg-muted px-4 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Evidence photo could not be loaded. Check that the photo URL is publicly accessible.
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-muted", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        className="mx-auto max-h-80 w-full object-contain"
      />
    </div>
  );
}
