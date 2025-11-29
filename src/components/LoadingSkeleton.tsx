import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message = "Loading..." }: LoadingSpinnerProps) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <Sparkles className="w-12 h-12 text-gold mx-auto animate-pulse" />
        <div className="absolute inset-0 w-12 h-12 mx-auto rounded-full bg-gold/20 animate-ping" />
      </div>
      <p className="text-sm font-pixel text-gold mt-4 animate-pulse">{message}</p>
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-card p-6 pixel-border animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-6 w-6 rounded-full bg-muted" />
      <Skeleton className="h-5 w-48 bg-muted" />
    </div>
    <Skeleton className="h-4 w-full mb-2 bg-muted" />
    <Skeleton className="h-4 w-3/4 mb-4 bg-muted" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 bg-muted" />
      <Skeleton className="h-6 w-20 bg-muted" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto">
    <div className="flex justify-between items-center mb-8">
      <Skeleton className="h-10 w-48 bg-muted" />
      <Skeleton className="h-10 w-24 bg-muted" />
    </div>
    <div className="bg-card p-8 pixel-border-gold mb-8 animate-pulse">
      <div className="text-center mb-6">
        <Skeleton className="w-32 h-32 mx-auto mb-4 bg-muted" />
        <Skeleton className="h-8 w-40 mx-auto mb-2 bg-muted" />
        <Skeleton className="h-6 w-24 mx-auto bg-muted" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-4 w-full bg-muted" />
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card p-6 pixel-border animate-pulse">
          <Skeleton className="w-12 h-12 mx-auto mb-4 bg-muted rounded-full" />
          <Skeleton className="h-4 w-16 mx-auto mb-2 bg-muted" />
          <Skeleton className="h-6 w-12 mx-auto bg-muted" />
        </div>
      ))}
    </div>
  </div>
);

export const QuestListSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const LeaderboardSkeleton = () => (
  <div className="space-y-3">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="bg-card p-6 pixel-border animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-8 bg-muted" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2 bg-muted" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16 bg-muted" />
              <Skeleton className="h-4 w-20 bg-muted" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const DungeonMapSkeleton = () => (
  <div className="max-w-4xl mx-auto">
    <Skeleton className="h-8 w-48 mx-auto mb-8 bg-muted" />
    <div className="space-y-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`flex items-center gap-4 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
          <div className="flex-1" />
          <Skeleton className="w-24 h-24 rounded-full bg-muted" />
          <div className="flex-1 max-w-xs">
            <Skeleton className="h-24 w-full bg-muted pixel-border" />
          </div>
          <div className="flex-1" />
        </div>
      ))}
    </div>
  </div>
);
