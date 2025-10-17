import Header from "@/components/marketing/header";
import Footer from "@/components/marketing/footer";
import ComingSoonGate from "@/components/marketing/coming-soon-gate";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <ComingSoonGate />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}






