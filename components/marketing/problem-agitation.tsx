import { Clock, DollarSign, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const problems = [
  {
    icon: Clock,
    title: "Hours of Manual Research",
    description: "Your team spends 3-5 hours researching competitors, analyzing top-ranking content, and manually compiling insights for each blog brief."
  },
  {
    icon: DollarSign,
    title: "Expensive Content Teams",
    description: "Hiring experienced content strategists costs $75-150/hour. Most agencies burn through budgets on research instead of actual content creation."
  },
  {
    icon: AlertTriangle,
    title: "Inconsistent Quality",
    description: "Without systematic analysis, your briefs miss key opportunities, use outdated strategies, and fail to match what actually ranks on Google."
  }
];

export default function ProblemAgitation() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary mb-6">
            The Content Brief Problem Every Agency Faces
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Most content teams are stuck with outdated, time-consuming methods that drain resources 
            and produce mediocre results. Here's what's really happening:
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {problems.map((problem, index) => (
            <Card key={index} className="border-2 border-primary/20 hover:border-primary/30 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <problem.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status Quo Solution */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-secondary mb-4">
            The Status Quo: Manual Research & Guesswork
          </h3>
          <p className="text-lg text-muted-foreground mb-6">
            Most agencies still rely on manual competitor analysis, generic templates, and gut feelings. 
            This approach is slow, expensive, and produces inconsistent results.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">5+ Hours</div>
              <div className="text-sm text-muted-foreground">Per brief research time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">$400+</div>
              <div className="text-sm text-muted-foreground">Cost per brief</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">40%</div>
              <div className="text-sm text-muted-foreground">Content that underperforms</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}