"use client";

import React from "react";
import Link, { type LinkProps } from "next/link";

export type FastLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    ref?: React.Ref<HTMLAnchorElement>;
    eager?: boolean;
  };

/**
 * High-performance Link wrapper that enables Next.js background viewport prefetching
 * by default (prefetch={true}) for instantaneous, zero-delay client-side route transitions.
 */
export function FastLink({
  href,
  eager,
  prefetch = true,
  ...rest
}: FastLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      {...rest}
    />
  );
}
