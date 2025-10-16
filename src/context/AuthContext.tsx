"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

// Mock User Type
interface User {
  id: string;
  name: string;
  email: string;
}

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
  id: "1",
  name: "Demo User",
  email: "user@example.com",
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
        const loggedInUser = { ...MOCK_USER, email };
        setUser(loggedInUser);
        localStorage.setItem("kanban-user", JSON.stringify(loggedInUser));
        toast({ title: "Login Successful", description: `Welcome back, ${loggedInUser.name}!` });
        router.push("/boards");
        setLoading(false);
      }, 500);
    },
    [router, toast]
  );

  const signup = useCallback(
    (name: string, email: string) => {
      setLoading(true);
      setTimeout(() => {
        const newUser = { ...MOCK_USER, name, email };
        setUser(newUser);
        localStorage.setItem("kanban-user", JSON.stringify(newUser));
        toast({ title: "Signup Successful", description: `Welcome to KanbanFlow, ${name}!` });
        router.push("/boards");
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
