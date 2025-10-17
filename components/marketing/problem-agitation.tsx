import { X, Clock, DollarSign, AlertTriangle, TrendingDown, Users, Zap } from "lucide-react";
import Image from "next/image";

const problems = [
  {
    icon: Clock,
    title: "Hours of Manual Research",
    description: "Your team spends 3-5 hours researching competitors, analyzing top-ranking content, and manually compiling insights for each blog brief.",
    stat: "5+ Hours",
    statLabel: "Per brief"
  },
  {
    icon: DollarSign,
    title: "Expensive Content Teams",
    description: "Hiring experienced content strategists costs $75-150/hour. Most agencies burn through budgets on research instead of actual content creation.",
    stat: "$400+",
    statLabel: "Cost per brief"
  },
  {
    icon: AlertTriangle,
    title: "Inconsistent Quality",
    description: "Without systematic analysis, your briefs miss key opportunities, use outdated strategies, and fail to match what actually ranks on Google.",
    stat: "40%",
    statLabel: "Underperforms"
  }
];

const stopThese = [
  "Manual Research",
  "Generic Templates", 
  "Gut Feelings",
  "Outdated Strategies"
];

export default function ProblemAgitation() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Centered Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            The Problem Every Agency Faces
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Stop Wasting Time on 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600"> Manual Research</span>
          </h2>
          
        </div>

        {/* Stop These Keywords - Centered */}
        <div className="text-center mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {stopThese.map((item, index) => (
              <div key={index} className="flex items-center bg-white border-2 border-red-100 rounded-lg px-4 py-2 shadow-sm">
                <X className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Simplified */}
          <div className="space-y-6">
            {/* Problems with Stats - Simplified */}
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <problem.icon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-base font-semibold text-gray-900">{problem.title}</h4>
                        <div className="text-right">
                          <div className="text-xl font-bold text-red-500">{problem.stat}</div>
                          <div className="text-xs text-gray-500">{problem.statLabel}</div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{problem.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image - Full Width */}
          <div className="relative">
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/assets/images/lp.png"
                alt="Content Brief Problem Visualization"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Status Quo Summary - Centered Under Row */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100 text-center">
            <div className="flex items-center justify-center mb-3">
              <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">The Status Quo: Manual Research & Guesswork</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Most agencies still rely on manual competitor analysis, generic templates, and gut feelings. 
              This approach is slow, expensive, and produces inconsistent results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}