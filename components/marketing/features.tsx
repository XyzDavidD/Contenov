import {
  Brain,
  Target,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const featureGroups = [
  {
    title: "AI-Powered Analysis",
    description: "Advanced AI that analyzes competitor content and extracts winning strategies",
    features: [
      {
        icon: Brain,
        title: "Smart Competitor Analysis",
        description: "AI analyzes top 10-20 ranking articles, extracting patterns, keywords, and winning strategies automatically."
      },
      {
        icon: Target,
        title: "SEO Intelligence",
        description: "Comprehensive keyword research, search intent analysis, and competition data for every topic."
      },
      {
        icon: BarChart3,
        title: "Performance Insights",
        description: "Data-driven recommendations based on what actually ranks and drives traffic in your niche."
      }
    ]
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary mb-6">
            Everything You Need for{" "}
            <span className="gradient-text">Content That Converts</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced AI-powered analysis that transforms your content creation process
          </p>
        </div>

        {/* Feature Groups */}
        <div className="space-y-16">
          {featureGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Group Header */}
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold text-secondary mb-4">
                  {group.title}
                </h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {group.description}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {group.features.map((feature, featureIndex) => (
                  <Card
                    key={featureIndex}
                    className="border-2 hover:border-primary/30 transition-all hover:shadow-lg bg-white"
                  >
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="text-xl font-semibold text-secondary mb-3">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}