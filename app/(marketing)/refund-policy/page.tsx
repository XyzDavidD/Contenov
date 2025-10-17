import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary mb-4 mt-14">
              Refund Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: October 2025
            </p>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Refund Policy Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                This Refund Policy outlines when Contenov may provide refunds for our AI-powered content brief generation service.
              </p>

              <h2 className="text-xl font-semibold text-secondary">General Policy</h2>
              <p className="text-muted-foreground">
                Due to the digital nature of our service, we generally do not offer refunds for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Used credits or generated briefs</li>
                <li>Unused credits at the end of billing periods</li>
                <li>Service dissatisfaction after brief generation</li>
                <li>Change of mind after subscription activation</li>
              </ul>

              <h2 className="text-xl font-semibold text-secondary">Free Trial</h2>
              <p className="text-muted-foreground">
                All plans include a 3-day free trial with no charges. Cancel before trial ends to avoid billing.
              </p>

              <h2 className="text-xl font-semibold text-secondary">Eligible Refunds</h2>
              <p className="text-muted-foreground">We may consider refunds for:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Service unavailable for more than 24 hours</li>
                <li>Critical bugs preventing brief generation</li>
                <li>Billing errors or duplicate charges</li>
                <li>Significant service misrepresentation</li>
              </ul>

              <h2 className="text-xl font-semibold text-secondary">Refund Process</h2>
              <p className="text-muted-foreground">
                To request a refund, contact us at displayourvision@gmail.com within 7 days of the issue. Include your account email and describe the problem. Allow 5-7 business days for review.
              </p>

              <h2 className="text-xl font-semibold text-secondary">Cancellation</h2>
              <p className="text-muted-foreground">
                You may cancel your subscription anytime through your account settings or Stripe Customer Portal. Cancellation does not automatically result in a refund.
              </p>

              <h2 className="text-xl font-semibold text-secondary">Contact Us</h2>
              <p className="text-muted-foreground">
                Questions about refunds? Contact us at: displayourvision@gmail.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
