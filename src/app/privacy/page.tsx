import { getConfig } from "@/lib/repository.server";
import { demoConfig } from "@/lib/config.server";
import { ResearchParticipationPage } from "@/components/research-participation-page";

export const revalidate = 300;

export const metadata = {
  title: "Research & Participation · Cyber Campus",
  description:
    "Explore the academic computing research on the impact of social engineering threats on user privacy among university students in Sri Lanka.",
};

export default async function Page() {
  let config = demoConfig;
  let error = "";
  try {
    config = await getConfig();
  } catch {
    error =
      "The research configuration is unavailable. Collection cannot proceed until it is restored.";
  }

  return <ResearchParticipationPage config={config} error={error} />;
}
