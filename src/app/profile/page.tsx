"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { useState, type FormEvent, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, loading, signup: updateUser } = useAuth();
  const [name, setName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Please log in</h1>
        <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim() && user) {
        setIsUpdating(true);
        // Re-using the signup function as a mock for update
        updateUser(name, user.email);
        setTimeout(() => {
            toast({ title: "Profile Updated", description: "Your name has been updated successfully."});
            setIsUpdating(false);
        }, 500);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Your Profile</h1>
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={user.name}
              />
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span>Profile Settings</span>
          </CardTitle>
          <CardDescription>
            Manage your account settings and personal information.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled />
              <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isUpdating || name === user.name}>
              {isUpdating && <Loader2 className="mr-2 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function ProfileSkeleton() {
    return (
        <div className="max-w-2xl mx-auto">
            <Skeleton className="h-9 w-48 mb-8" />
             <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                </CardHeader>
                 <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                 </CardContent>
                 <CardFooter className="border-t px-6 py-4">
                    <Skeleton className="h-10 w-32" />
                 </CardFooter>
            </Card>
        </div>
    )
}
