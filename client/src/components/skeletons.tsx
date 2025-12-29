import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ServiceCardSkeleton() {
  return (
    <Card className="overflow-hidden border-2 rounded-xl h-full flex flex-col">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="p-5 flex flex-col flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between border-t">
          <div className="space-y-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-2 w-12" />
          </div>
          <Skeleton className="h-9 w-16 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function BookingCardSkeleton() {
  return (
    <Card className="overflow-hidden border shadow-sm p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex justify-between items-center pt-4 border-t">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CategorySkeleton() {
  return (
    <Card className="border-2 rounded-xl p-6 flex flex-col items-center justify-center gap-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-4 w-24" />
    </Card>
  );
}

export function ConversationItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2 w-10" />
        </div>
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}
