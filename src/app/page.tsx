
"use client";

import { useAuth } from "@/hooks/useAuth";
import { LandingPage } from "@/components/LandingPage";
import { Dashboard } from "@/components/Dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return user ? <Dashboard /> : <LandingPage />;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <Skeleton className="h-6 w-24" />
            <div className="flex-1 flex justify-end">
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
      </header>
      <main className="flex-grow">
          <div className="container mx-auto px-4 py-20">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2 mt-4" />
          </div>
      </main>
    </div>
  )
}
