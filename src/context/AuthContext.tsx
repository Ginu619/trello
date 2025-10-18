
"use client";

import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
  signup: (name: string, email: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Mock user data
const MOCK_USER: User = {
  id: "user-1",
  name: "Demo User",
  email: "user@example.com",
  avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Demo%20User"
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate checking for a user session
    try {
      const storedUser = localStorage.getItem("kanban-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from localStorage", error);
      localStorage.removeItem("kanban-user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    (email: string) => {
      setLoading(true);
      setTimeout(() => {
        const loggedInUser = { ...MOCK_USER, email, avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${MOCK_USER.name}` };
        setUser(loggedInUser);
        localStorage.setItem("kanban-user", JSON.stringify(loggedInUser));
        toast({ title: "Login Successful", description: `Welcome back, ${loggedInUser.name}!` });
        router.push("/");
        setLoading(false);
      }, 500);
    },
    [router, toast]
  );

  const signup = useCallback(
    (name: string, email: string) => {
      setLoading(true);
      setTimeout(() => {
        const newUser: User = { id: `user-${Date.now()}`, name, email, avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${name}` };
        setUser(newUser);
        localStorage.setItem("kanban-user", JSON.stringify(newUser));
        toast({ title: "Signup Successful", description: `Welcome to TaskHive, ${name}!` });
        router.push("/");
        setLoading(false);
      }, 500);
    },
    [router, toast]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("kanban-user");
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push("/login");
  }, [router, toast]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
