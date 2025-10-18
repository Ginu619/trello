
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { LayoutGrid, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LoginPage() {
  const { login, signup, loading } = useAuth();
  const [loginEmail, setLoginEmail] = useState("user@example.com");
  const [loginPassword, setLoginPassword] = useState("password");
  const [signupName, setSignupName] = useState("Demo User");
  const [signupEmail, setSignupEmail] = useState("user@example.com");
  const [signupPassword, setSignupPassword] = useState("password");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    login(loginEmail);
  };

  const handleSignup = (e: FormEvent) => {
    e.preventDefault();
    signup(signupName, signupEmail);
  };
  
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-image');

  return (
    <div className="flex min-h-screen items-stretch">
      <div className="absolute top-8 left-8 z-10">
        <Link href="/" className="flex items-center space-x-2 text-lg font-semibold">
          <LayoutGrid className="h-6 w-6 text-primary" />
          <span>KanbanFlow</span>
        </Link>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-8">
        <Tabs defaultValue="login" className="w-full max-w-sm z-10">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className="border-0 shadow-none">
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your boards.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="m@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="border-0 shadow-none">
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create an account to start organizing your work.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Your Name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="m@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="hidden lg:flex lg:w-1/2 bg-muted items-center justify-center p-8">
        {loginImage && (
            <Image 
                src={loginImage.imageUrl} 
                alt={loginImage.description}
                width={600}
                height={600}
                className="w-full h-auto max-w-md object-contain"
                data-ai-hint={loginImage.imageHint}
            />
        )}
      </div>
    </div>
  );
}
