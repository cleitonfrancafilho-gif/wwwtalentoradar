import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCard = () => (
  <div className="glass-card rounded-xl overflow-hidden">
    <Skeleton className="aspect-video w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
