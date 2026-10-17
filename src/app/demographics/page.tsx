import { Suspense } from "react";
import { DemographicsForm } from "@/components/demographics-form";
import { Loading } from "@/components/ui";

export const metadata = {
  title: "Participant Demographics · Cyber Campus Research",
  description: "Anonymous participant demographic profile for cybersecurity research in Sri Lanka higher education.",
};

export default function DemographicsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DemographicsForm />
    </Suspense>
  );
}
