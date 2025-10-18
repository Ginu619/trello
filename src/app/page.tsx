
"use client";

import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Home as LandingPage } from "@/components/LandingPage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function App() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/boards");
    }
  }, [user, loading, router]);


  if (loading || user) {
    return <DashboardSkeleton />;
  }

  return <LandingPage />;
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}
