import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Move, Workflow, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Users, Feather } from "lucide-react";

export function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-image");

  const features = [
    {
      icon: <Move className="h-8 w-8 text-primary" />,
      title: "Drag-and-Drop Interface",
      description: "Effortlessly move tasks between columns with a simple drag-and-drop interface.",
    },
    {
      icon: <Workflow className="h-8 w-8 text-primary" />,
      title: "Customizable Workflows",
      description: "Create custom workflows that match your team's unique process.",
    },
    {
      icon: <UsersRound className="h-8 w-8 text-primary" />,
      title: "Real-Time Collaboration",
      description: "Collaborate with your team in real-time with comments, attachments, and notifications.",
    },
  ];

  const testimonials = [
      {
          name: "Sarah K.",
          role: "Product Manager",
          avatar: "https://i.pravatar.cc/150?u=sarahk",
          rating: 5,
          text: "TaskHive has revolutionized how our team manages projects. The intuitive interface and powerful features have made us more efficient than ever before."
      },
      {
          name: "Michael L.",
          role: "Lead Developer",
          avatar: "https://i.pravatar.cc/150?u=michaell",
          rating: 5,
          text: "I've tried many project management tools, and this is by far the best. The customizable workflows are a game-changer for our agile development process."
      }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="relative text-center md:text-left py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">Organize Your Workflow, Unleash Your Productivity</h1>
                <p className="mt-4 max-w-lg mx-auto md:mx-0 text-lg md:text-xl text-muted-foreground">
                    A simple, intuitive, and powerful kanban board for teams of all sizes.
                </p>
                <div className="mt-8 flex justify-center md:justify-start gap-4">
                  <Button asChild size="lg">
                    <Link href="/boards">Get Started For Free</Link>
                  </Button>
                </div>
            </div>
             {heroImage && (
              <div className="relative rounded-lg overflow-hidden shadow-2xl bg-card p-2">
                 <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-md"
                    data-ai-hint={heroImage.imageHint}
                    priority
                  />
              </div>
            )}
          </div>
        </section>

        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
             <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Discover a Better Way to Work</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Our Kanban board is packed with features to help you and your team stay organized and productive.
                </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-background/40 border-border/50 p-6 flex flex-col md:flex-row items-center md:items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Loved by Teams Worldwide</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Don't just take our word for it. Here's what our users have to say about TaskHive.
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                {testimonials.map(testimonial => (
                    <Card key={testimonial.name} className="bg-card p-8">
                        <CardContent className="p-0 flex flex-col items-start gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-0.5">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <blockquote className="text-muted-foreground italic border-l-2 border-primary pl-4">
                                "{testimonial.text}"
                            </blockquote>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-card">
        <div className="container mx-auto px-4 text-muted-foreground">
            <div className="grid md:grid-cols-4 gap-8">
                <div className="col-span-2 md:col-span-1">
                     <Link href="/" className="flex items-center space-x-2 text-lg font-semibold text-foreground mb-2">
                        <Users className="h-6 w-6 text-primary" />
                        <span>TaskHive</span>
                    </Link>
                    <p className="text-sm">Organize anything, together.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-3">Product</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                        <li><Link href="#" className="hover:text-foreground">Integrations</Link></li>
                    </ul>
                 </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-3">Company</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:text-foreground">About Us</Link></li>
                        <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                        <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
                    </ul>
                 </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Follow Us</h4>
                     <div className="flex space-x-4">
                        <Link href="#" className="hover:text-foreground"><Feather className="h-5 w-5" /></Link>
                        <Link href="#" className="hover:text-foreground"><Users className="h-5 w-5" /></Link>
                     </div>
                 </div>
            </div>
            <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} TaskHive. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
