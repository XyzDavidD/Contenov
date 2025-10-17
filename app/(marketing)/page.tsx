import Hero from "@/components/marketing/hero";
import DemoVideo from "@/components/marketing/demo-video";
import ProblemAgitation from "@/components/marketing/problem-agitation";
import Transformation from "@/components/marketing/transformation";
import SocialProof from "@/components/marketing/social-proof";
import Features from "@/components/marketing/features";
import About from "@/components/marketing/about";
import Pricing from "@/components/marketing/pricing";
import FAQ from "@/components/marketing/faq";
import HashNavigation from "@/components/marketing/hash-navigation";

export default function Home() {
  return (
    <>
      <HashNavigation />
      <Hero />
      <DemoVideo />
      <ProblemAgitation />
      <Transformation />
      <SocialProof />
      <About />
      <Pricing />
      <Features />
      <FAQ />
    </>
  );
}




