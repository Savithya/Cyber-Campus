"use client";
import { ErrorBox } from "@/components/ui";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="narrow page-space">
      <h1>We couldn’t load this page.</h1>
      <ErrorBox
        message="Your saved draft is still on this device. Please try again."
        retry={reset}
      />
    </div>
  );
}
