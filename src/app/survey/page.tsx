import { Suspense } from "react";
import Survey from "@/components/survey";
import { Loading } from "@/components/ui";
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Survey />
    </Suspense>
  );
}
