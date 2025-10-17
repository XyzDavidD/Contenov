import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary mb-4 mt-14">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: October 2025
            </p>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                These Terms govern your use of Contenov's AI-powered content brief generation service. By using our service, you agree to these Terms.
              </p>

              <h2 className="text-xl font-semibold text-secondary">Service Description</h2>
              <p className="text-muted-foreground">
                Contenov provides AI-powered content brief generation services including blog research, SEO analysis, and content structure recommendations.
              </p>

              <h2 className="text-xl font-semibold text-secondary">Account Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate information</li>
                <li>Be at least 18 years old</li>
                <li>Maintain account security</li>
                <li>Accept these Terms and Privacy Policy</li>
              </ul>

              <h2 className="text-xl font-semibold text-secondary">Subscription Plans</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Starter: $97/month, 20 credits</li>
                <li>Pro: $247/month, 100 credits</li>
                <li>Enterprise: Custom pricing</li>
                <li>All plans include 3-day free trial</li>
              </ul>

              <h2 className="text-xl font-semibold text-secondary">Payment Terms</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Payments processed securely through Stripe</li>
                <li>Monthly billing in advance</li>
                <li>No refunds for unused credits</li>
                <li>Credits reset monthly and don't roll over</li>
              </ul>

              <h2 className="text-xl font-semibold text-secondary">Credit System</h2>
              <p className="text-muted-foreground">
                1 credit = 1 content brief generation. Credits are deducted immediately and reset monthly.
              </p>

              <h2 className="text-xl font-semibold text-secondary">Acceptable Use</h2>
              <p className="text-muted-foreground">You agree not to use the service for illegal purposes, share account credentials, or interfere with service operation.</p>

              <h2 className="text-xl font-semibold text-secondary">Termination</h2>
              <p className="text-muted-foreground">
                Either party may terminate at any time. Upon termination, your access will cease and data may be deleted after 30 days.
              </p>

              <h2 className="text-xl font-semibold text-secondary">Contact Us</h2>
              <p className="text-muted-foreground">
                Questions about these Terms? Contact us at: displayourvision@gmail.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
