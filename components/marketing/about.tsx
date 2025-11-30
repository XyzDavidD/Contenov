import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary mb-6">
            Why We Built <span className="gradient-text">Contenov</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            The story behind the platform that&apos;s transforming content creation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Founder Story */}
          <div>
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage 
                      src="https://pbs.twimg.com/profile_images/1970736676105318400/MTehzdcA_400x400.jpg" 
                      alt="David Danciu"
                    />
                    <AvatarFallback className="bg-primary text-white text-xl font-bold">
                      DD
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-secondary">David Danciu</h3>
                    <p className="text-muted-foreground">Founder & CEO, Contenov</p>
                  </div>
                </div>

                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    &ldquo;Some while ago, I worked with a business that was generating blogs, and I had to upload them to the website. Before uploading them, there was a very long period of time I had to wait while the content strategist and writer were creating the blog.
                  </p>
                  
                  <p>
                    This delay was frustrating for everyone involved. The business could have published way more blogs and reached a much bigger audience. They were literally leaving money on the table because of how slow the process was.
                  </p>
                  
                  <p>
                    That&apos;s when I realized there had to be a better way. If we had a tool like Contenov back then, the entire process could have been much easier and more efficient.&rdquo;
                  </p>
                  
                  <p className="font-semibold text-secondary">
                    So I built Contenov to solve this exact problem - making content brief creation fast, efficient, and accessible to everyone.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mission & Values */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-secondary mb-4">Our Mission</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To democratize high-quality content strategy by making AI-powered research accessible to every content creator, 
                agency, and business owner.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-secondary mb-4">Why This Matters</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Great content drives business growth, but the research and planning process is broken. 
                We&apos;re fixing it with AI that actually understands what makes content successful.
              </p>
            </div>

            <div className="text-left">
              <p className="text-lg text-secondary italic font-medium">
                &ldquo;I believe that great content should be accessible to everyone, not just big agencies with huge budgets.&rdquo;
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}