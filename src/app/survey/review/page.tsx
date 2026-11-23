import Review from "@/components/review";
import { scenarios } from "@/content/scenarios.server";

export const metadata = {
  title: "Review & Debrief · Cyber Campus Research",
  description: "Review your responses and study findings on cybersecurity social engineering threats.",
};

export default function Page() {
  return <Review initialScenarios={scenarios} />;
}
