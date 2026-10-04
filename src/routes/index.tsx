import { createFileRoute } from "@tanstack/react-router";
import { AshlaneApp } from "@/components/ashlane-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <AshlaneApp />;
}