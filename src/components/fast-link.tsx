"use client";

import React, { useState } from "react";
import Link, { type LinkProps } from "next/link";

export type FastLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    ref?: React.Ref<HTMLAnchorElement>;
    eager?: boolean;
  };

/**
 * Link wrapper that defers Next.js route prefetching until hover, focus, or touch,
 * unless `eager` is enabled for the immediate next/previous journey step.
 */
export function FastLink({
  href,
  eager = false,
  prefetch,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...rest
}: FastLinkProps) {
  const [active, setActive] = useState(false);
  const resolvedPrefetch = prefetch !== undefined ? prefetch : eager || active ? null : false;

  return (
    <Link
      href={href}
      prefetch={resolvedPrefetch}
      onMouseEnter={(e) => {
        if (!active) setActive(true);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        if (!active) setActive(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        if (!active) setActive(true);
        onTouchStart?.(e);
      }}
      {...rest}
    />
  );
}
