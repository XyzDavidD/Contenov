import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is this just another AI writing tool?",
    answer:
      "No, Contenov is specifically designed for content strategy and brief generation, not writing. We analyze competitor content, extract winning patterns, and create comprehensive briefs that guide your writers. Think of us as your content strategist, not your content writer.",
  },
  {
    question: "Will the AI analysis be accurate for my niche?",
    answer:
      "Yes! Our AI analyzes the actual top-ranking content for your specific topic, not generic templates. It finds and studies the articles that are currently ranking in Google for your keywords, so the insights are always relevant to your niche and current market conditions.",
  },
  {
    question: "How is this different from hiring a content strategist?",
    answer:
      "A senior content strategist costs $75-150/hour and takes 4-6 hours per brief. Contenov does the same analysis in 2 minutes for $5 per brief. You get the same quality insights at 1% of the cost, with consistent results every time.",
  },
  {
    question: "What if I'm not satisfied with the briefs?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not completely satisfied with Contenov within your first 30 days, we'll refund every penny, no questions asked. Plus, you can try it risk-free with our 3-day free trial.",
  },
  {
    question: "Do you store my content ideas or topics?",
    answer:
      "We take privacy seriously. Your topics and briefs are encrypted and stored securely. We never share your content ideas with competitors or use them to train our AI. Your strategies remain confidential.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely! There are no long-term contracts or cancellation fees. You can cancel your subscription anytime from your dashboard, and you'll continue to have access until the end of your billing period.",
  },
  {
    question: "What if my team needs more than 100 briefs per month?",
    answer:
      "Our Agency plan includes 100 briefs, but if you need more, you can upgrade to Enterprise for unlimited briefs. Many agencies find that 100 briefs is actually more than enough since they're saving 80% of their research time.",
  },
  {
    question: "How do you ensure the briefs are high quality?",
    answer:
      "Our AI analyzes the top 10-20 ranking articles for each topic, extracting real patterns and strategies from successful content. We also have quality controls that filter out generic recommendations and ensure each brief is specific to your topic and competitive landscape.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 pb-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary mb-6">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Got questions? We&apos;ve got answers. Here are the most common concerns we hear from agencies.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                <AccordionTrigger className="text-left text-lg font-semibold text-secondary hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still have questions CTA */}
        <div className="text-center mt-16">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-secondary mb-4">
              Still have questions?
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Our team is here to help. Schedule a demo or reach out directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-colors">
                Schedule a Demo
              </button>
              <button className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white px-8 py-3 text-lg font-semibold rounded-lg transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}