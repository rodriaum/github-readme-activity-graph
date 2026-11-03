import { ActivityGraphBuilder } from "@/components/activity-graph-builder"

export const metadata = {
  title: "GitHub Activity Graph",
  description: "Create a personalized GitHub contribution graph for your profile README."
}

export default function Page() {
  return <ActivityGraphBuilder />
}
