import { cn } from "@/lib/utils"

export interface FeatureCardProps {
  icon: string
  title: string
  description: string
  badge?: string
}

export function FeatureCard({
  icon,
  title,
  description,
  badge,
}: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white hover:shadow-xl hover:shadow-primary/5 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-primary/40 dark:hover:bg-zinc-900">
      <div className="absolute -top-2 -right-2 size-24 rounded-full bg-primary/5 blur-xl transition-all duration-500 group-hover:bg-primary/10" />

      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
          <span className={cn(icon, "size-5")} aria-hidden="true" />
        </div>
        {badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
