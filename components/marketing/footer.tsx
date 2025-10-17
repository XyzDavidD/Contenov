"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Logo from "@/components/shared/logo";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const scrollToSection = (sectionId: string) => {
    // If we're on the home page, scroll to section
    if (pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If we're on another page, navigate to home with hash
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 mt-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Logo />
            <p className="text-muted-foreground mt-4 max-w-sm">
              AI-powered tool that creates comprehensive SEO blog content briefs
              for your agency. Save hours on every brief.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-secondary mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-secondary mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-12" />

        <div className="flex justify-center items-center mb-14">
          <p className="text-sm text-muted-foreground">
            © 2025 Contenov. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

