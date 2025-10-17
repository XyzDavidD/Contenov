import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary mb-4 mt-14">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: October 2025
            </p>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                This Privacy Policy explains how we collect, use, and protect your information when you use Contenov&apos;s AI-powered content brief generation service.
              </p>

              <h2 className="text-xl font-semibold text-secondary">Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Account information (name, email)</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Content you submit for brief generation</li>
                <li>Usage data and service interactions</li>
              </ul>

              <h2 className="text-xl font-semibold text-secondary">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide our AI content brief generation service</li>
                <li>Process payments and manage your account</li>
                <li>Improve our service quality</li>
                <li>Send important service communications</li>
              </ul>

              <h2 className="text-xl font-semibold text-secondary">Information Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share information only with service providers (Stripe, Supabase) or when required by law.
              </p>

              <h2 className="text-xl font-semibold text-secondary">Data Security</h2>
              <p className="text-muted-foreground">
                We use industry-standard security measures including encryption and secure authentication to protect your information.
              </p>

              <h2 className="text-xl font-semibold text-secondary">Your Rights</h2>
              <p className="text-muted-foreground">You can access, correct, or delete your data at any time through your account settings or by contacting us.</p>

              <h2 className="text-xl font-semibold text-secondary">Contact Us</h2>
              <p className="text-muted-foreground">
                Questions about this Privacy Policy? Contact us at: displayourvision@gmail.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
