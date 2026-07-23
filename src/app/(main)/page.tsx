import { HomeView } from "@/features/home/components/home-view"
import { SettingsDrawer } from "@/features/settings/components/settings-drawer"
import { Suspense } from "react"

export default function Home() {
  return (
    <main className="relative min-h-dvh bg-background font-sans selection:bg-primary/10">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:14px_24px]" />
      <Suspense fallback={null}>
        <SettingsDrawer />
      </Suspense>
      <HomeView />
    </main>
  )
}
