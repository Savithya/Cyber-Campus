"use client";
import { useEffect } from "react";
import { draftKey } from "@/lib/client";
export default function DraftLifecycle() {
  useEffect(() => {
    function expire() {
      try {
        const draft = JSON.parse(localStorage.getItem(draftKey) ?? "null");
        if (draft && Date.parse(draft.expires) < Date.now())
          localStorage.removeItem(draftKey);
        const receipt = JSON.parse(
          sessionStorage.getItem("cc-receipt") ?? "null",
        );
        if (receipt?.deadline && Date.parse(receipt.deadline) < Date.now())
          sessionStorage.removeItem("cc-receipt");
      } catch {
        /* Browser storage may be disabled; the survey surfaces a saving error. */
      }
    }
    expire();
    const id = setInterval(expire, 60000);
    return () => clearInterval(id);
  }, []);
  return null;
}
