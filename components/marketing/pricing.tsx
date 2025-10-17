"use client";

import { useRouter } from "next/navigation";
import { Check, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";

const plans = [
  {
    name: "Starter",
    price: "$97",
    period: "per month",
    description: "Perfect for solo creators and small teams",
    features: [
      "20 blog briefs per month",
      "1 user account",
      "PDF export",
      "Email support",
      "Basic AI analysis",
      "Standard templates"
    ],
    cta: "Start Free Trial",
    popular: false,
    savings: "Save $300+ per month"
  },
  {
    name: "Agency",
    price: "$247",
    period: "per month", 
    description: "For agencies and growing content teams",
    features: [
      "100 blog briefs per month",
      "Up to 3 team members",
      "All export formats (PDF, Docs, Notion)",
      "Priority support",
      "Advanced AI analysis",
      "Custom templates",
      "Team collaboration tools",
      "Performance analytics"
    ],
    cta: "Start Free Trial",
    popular: true,
    savings: "Save $1,200+ per month"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large teams with custom needs",
    features: [
      "Unlimited blog briefs",
      "Unlimited team members",
      "All export formats",
      "Dedicated support manager",
      "Custom AI training",
      "White-label options",
      "API access",
      "Custom integrations",
      "SLA guarantee"
    ],
    cta: "Contact Sales",
    popular: false,
    savings: "Save $5,000+ per month"
  },
];

export default function Pricing() {
  const router = useRouter();
  const { user } = useAuth();

  const handlePlanClick = (planName: string) => {
    if (planName === "Enterprise") {
      // For enterprise, redirect to contact page
      window.location.href = '/contact';
      return;
    }

    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary mb-6">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your content production needs. All plans include a 3-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative rounded-2xl ${
                plan.popular
                  ? "border-2 border-primary shadow-xl scale-105"
                  : "border-2"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-2xl font-bold text-secondary mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold gradient-text">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-2 text-lg">
                    {plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground mt-4">{plan.description}</p>
                
                {/* Savings Badge */}
                <div className="mt-4">
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Zap className="h-4 w-4" />
                    {plan.savings}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pb-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <div className="px-6 pb-8">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : plan.name === "Enterprise" ? "secondary" : "outline"}
                  size="lg"
                  onClick={() => handlePlanClick(plan.name)}
                >
                  {plan.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>


        {/* Additional Info */}
        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>3-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

