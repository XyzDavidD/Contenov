import { Zap, Target, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Zap,
    title: "Lightning-Fast Brief Generation",
    description: "Generate comprehensive, data-driven briefs in 5-10 minutes instead of spending hours on manual research."
  },
  {
    icon: Target,
    title: "AI-Powered Competitor Analysis",
    description: "Our AI analyzes the top 10-20 ranking articles for your topic, extracting winning strategies and content patterns automatically."
  },
  {
    icon: TrendingUp,
    title: "Proven SEO Strategies",
    description: "Every brief includes keyword research, search intent analysis, and structure recommendations based on what actually ranks."
  }
];

export default function Transformation() {
  return (
    <section id="solution" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary mb-6">
            The Contenov Solution: AI-Powered Content Intelligence
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stop wasting time on manual research. Let AI analyze competitor content, 
            extract winning strategies, and generate comprehensive briefs that actually work.
          </p>
        </div>

        {/* How It Works Visual */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-secondary mb-4">
              How Contenov Works
            </h3>
            <p className="text-muted-foreground">
              From topic to comprehensive brief in 3 simple steps
            </p>
          </div>

          <div className="relative">
            {/* Desktop layout with arrows */}
            <div className="hidden md:flex items-center justify-between">
              {/* Step 1 */}
              <div className="text-center flex-1">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h4 className="text-xl font-semibold text-secondary mb-3">Enter Your Topic</h4>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Simply type your blog topic or keyword. Our AI handles the rest.
                </p>
              </div>

              {/* Arrow 1 */}
              <div className="flex items-center justify-center mx-8">
                <div className="w-16 h-0.5 bg-gradient-primary relative">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-primary border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center flex-1">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h4 className="text-xl font-semibold text-secondary mb-3">AI Analysis</h4>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  AI finds and analyzes top-ranking content, extracting winning strategies.
                </p>
              </div>

              {/* Arrow 2 */}
              <div className="flex items-center justify-center mx-8">
                <div className="w-16 h-0.5 bg-gradient-primary relative">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-primary border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center flex-1">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h4 className="text-xl font-semibold text-secondary mb-3">Get Your Brief</h4>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Receive a comprehensive brief with SEO data, structure, and strategy.
                </p>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden space-y-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h4 className="text-xl font-semibold text-secondary mb-3">Enter Your Topic</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Simply type your blog topic or keyword. Our AI handles the rest.
                </p>
              </div>

              {/* Mobile Arrow 1 */}
              <div className="flex justify-center">
                <div className="w-0.5 h-12 bg-gradient-primary"></div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h4 className="text-xl font-semibold text-secondary mb-3">AI Analysis</h4>
                <p className="text-muted-foreground leading-relaxed">
                  AI finds and analyzes top-ranking content, extracting winning strategies.
                </p>
              </div>

              {/* Mobile Arrow 2 */}
              <div className="flex justify-center">
                <div className="w-0.5 h-12 bg-gradient-primary"></div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h4 className="text-xl font-semibold text-secondary mb-3">Get Your Brief</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Receive a comprehensive brief with SEO data, structure, and strategy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-2 border-primary/20 hover:border-primary/30 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
