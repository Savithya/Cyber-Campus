import Consent from "@/components/consent";
import { getConfig } from "@/lib/repository.server";
import { demoConfig, type StudyConfig } from "@/lib/config.server";

export const revalidate = 300;

export const metadata = {
  title: "Join Research · Cyber Campus",
  description:
    "Join our academic cybersecurity research exploring the impact of social engineering threats on user privacy among university students in Sri Lanka.",
};

export default async function JoinPage() {
  let config: StudyConfig = demoConfig;
  try {
    config = await getConfig();
  } catch {
    config = demoConfig;
  }
  return <Consent initialConfig={config} />;
}
