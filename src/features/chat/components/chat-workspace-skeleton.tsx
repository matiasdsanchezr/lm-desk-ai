import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ChatWorkspaceSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-350 flex-col gap-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="h-9 w-44 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-32 w-full animate-pulse rounded-md bg-muted/50" />
          <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    </div>
  )
}
