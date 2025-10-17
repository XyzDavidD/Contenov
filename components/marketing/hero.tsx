"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

export default function Hero() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  return (
    <section className="pt-20 pb-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center">
          {/* Announcement Bar */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            Start your free trial now! 
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-secondary leading-tight mb-6">
            <span className="block font-serif text-secondary">Create, Optimize & Scale</span>
            <span className="block font-sans text-primary">Your Content Strategy</span>
          </h1>

          {/* Product Description */}
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Generate comprehensive SEO blog briefs faster and smarter using Artificial Intelligence. 
            Turn any topic into a winning content strategy in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold"
              onClick={handleGetStarted}
            >
              Try for free →
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary hover:text-white px-8 py-4 text-lg font-semibold"
              onClick={() => window.open('https://cal.com/daviddanciu/15min', '_blank')}
            >
              Book a Demo →
            </Button>
          </div>

          {/* Quick Social Proof/Benefits */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground text-sm mb-12">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-purple-500" />
              <span>Live demo</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-purple-500" />
              <span>3-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-purple-500" />
              <span>Cancel anytime</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

