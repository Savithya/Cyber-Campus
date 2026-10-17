import { Mission } from "@/components/game";
export default async function Page({
  params,
}: {
  params: Promise<{ mission: string }>;
}) {
  return <Mission missionId={(await params).mission} />;
}
