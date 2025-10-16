import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Briefcase, Users, Feather } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-image");

  const features = [
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: "Visual Boards",
      description: "Easily organize your tasks and workflows on visual boards that are simple to understand and use.",
    },
    {
      icon: <Feather className="h-8 w-8 text-primary" />,
      title: "Easy Drag & Drop",
      description: "Move tasks between lists with a fluid drag-and-drop interface to track progress intuitively.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Collaborate Seamlessly",
      description: "Work with your team in real-time. Assign tasks, leave comments, and stay in sync.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="relative text-center py-20 md:py-32 bg-card">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">Organize anything, together.</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              KanbanFlow is the visual tool that empowers your team to manage any type of project, workflow, or task tracking.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/boards">Get Started - It's Free</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            {heroImage && (
              <div className="relative mb-16 rounded-lg overflow-hidden shadow-2xl">
                 <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                    data-ai-hint={heroImage.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-card py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Ready to Get Organized?</h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
              Join thousands of teams who are already building their best work with KanbanFlow.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" variant="secondary">
                <Link href="/login">Sign Up Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} KanbanFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
