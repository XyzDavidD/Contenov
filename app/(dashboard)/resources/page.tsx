import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle, 
  Mail, 
  MessageCircle,
  CheckCircle,
  Zap,
  Target,
  Users
} from "lucide-react";

export default function ResourcesPage() {
  const gettingStarted = [
    {
      icon: BookOpen,
      title: "How to create your first blog brief",
      description: "Step-by-step guide to generating your first brief",
    },
    {
      icon: Zap,
      title: "Tips for better brief generation",
      description: "Best practices for getting the most out of AI analysis",
    },
    {
      icon: Target,
      title: "Understanding the AI analysis",
      description: "Learn how our AI analyzes top-ranking content",
    },
  ];

  const faqs = [
    {
      question: "How many briefs can I generate?",
      answer: "The number depends on your plan. Starter plan includes 25 briefs per month, Agency plan includes 75 briefs per month, and Enterprise offers unlimited briefs."
    },
    {
      question: "Can I export to Google Docs?",
      answer: "Yes! Agency and Enterprise plans include Google Docs export functionality. You can also export to PDF and send directly to Notion."
    },
    {
      question: "How do credits work?",
      answer: "Credits are used for each brief generation. Each brief costs 1 credit. You can see your remaining credits in the top navigation bar."
    },
    {
      question: "Can I edit generated briefs?",
      answer: "Absolutely! Every brief is fully editable. You can modify the outline, add sections, adjust tone guidelines, and customize any part of the brief."
    },
    {
      question: "What makes a good blog topic input?",
      answer: "Be specific with your topic, include your target audience if relevant, and use natural language. For example: 'best project management tools for small remote teams' works better than just 'project management'."
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary mb-2">Help Center</h1>
        <p className="text-muted-foreground">
          Learn how to get the most out of Contenov
        </p>
      </div>

      {/* Getting Started */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gettingStarted.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50/50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-medium text-secondary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Support Options */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl">Need More Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary">Email Support</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get help from our support team via email. We typically respond within 24 hours.
              </p>
              <a
                href="mailto:support@contenov.com"
                className="text-primary font-medium hover:underline"
              >
                support@contenov.com
              </a>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary">Live Chat</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with our support team in real-time. Available Monday-Friday, 9 AM - 6 PM EST.
              </p>
              <Button variant="outline" size="sm">
                Start Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

