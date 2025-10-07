"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Package, CheckCircle, ArrowRight } from "lucide-react";

const packages = [
  {
    id: 1,
    name: "AI Visibility Audit",
    tagline: "Entry Service",
    price: "$3,000-$7,000",
    type: "One-time diagnostic",
    description: "One-time diagnostic to understand your AI presence",
    whatYouDo: [
      "Check if AI chatbots (ChatGPT, Perplexity, etc.) mention their brand at all",
      "See what AI says about them (good, bad, or nothing)",
      "Find out if their competitors show up more than they do",
      "Identify technical problems blocking AI from finding their website",
    ],
    howYouDoIt: {
      intro: "Set up tracking in Profound for their brand + 3-5 competitors",
      steps: [
        "Run Conversation Explorer to see if anyone's asking about their product category",
        "Use Agent Analytics to check if AI bots can even crawl their website",
        "Generate a report showing:",
      ],
      examples: [
        '"You appear in 8% of AI answers, your competitor appears in 43%"',
        '"AI bots are blocked from 60% of your site"',
        '"12,000 people per month ask AI about [their category]"',
      ],
    },
    whatItMeans: "They finally understand if they're invisible in the future of search. It's like discovering half your store is hidden from customers.",
    outcome: "A wake-up call with a clear roadmap.",
  },
  {
    id: 2,
    name: "AI Findability Fix",
    tagline: "Technical Foundation",
    price: "$8,000-$15,000",
    type: "One-time project",
    description: "Fix technical barriers preventing AI from discovering your content",
    whatYouDo: [
      "Fix their website so AI bots can actually read it",
      "Make sure content is structured so AI understands it",
      "Get them 'indexed' in AI search engines",
      "Set up tracking so they can see AI traffic",
    ],
    howYouDoIt: {
      intro: "Agent Analytics integration - Connect their site to Profound to monitor AI crawlers",
      steps: [
        "Technical fixes:",
        "• Remove blocks in robots.txt preventing AI crawlers",
        "• Add structured data (schema markup) so AI knows what products/services are",
        "• Fix JavaScript issues that hide content from bots",
        "• Set up server-side rendering if needed",
        "Submit URLs to AI platforms through Profound",
        "Install tracking so they see AI traffic in Google Analytics",
      ],
    },
    whatItMeans: "Their website goes from invisible to discoverable by AI. Like turning on the lights in that hidden part of the store.",
    outcome: "AI can now find, read, and cite their content.",
  },
  {
    id: 3,
    name: "AI Citation Boost",
    tagline: "Content Optimization",
    price: "$4,000-$10,000/month",
    type: "Monthly retainer",
    description: "Create content that AI chatbots want to cite",
    whatYouDo: [
      "Create/rewrite content that AI chatbots actually want to cite",
      "Target the questions people are asking AI in their industry",
      "Get their brand mentioned more often in AI answers",
      "Track improvements month-over-month",
    ],
    howYouDoIt: {
      intro: "Conversation Explorer research:",
      steps: [
        "Find the top 20-50 questions people ask AI about their industry",
        'Example: "15,000 people/month ask \'best CRM for small business\'"',
        "Content creation using Profound Copilot:",
        "• Write comparison guides, how-to articles, listicles (AI loves these)",
        "• Structure content with clear definitions, bullet points, FAQs",
        "• Use the exact language from Conversation Explorer data",
        "Publish + optimize on their site",
        "Track in Answer Engine Insights:",
        "• Month 1: Mentioned in 8% of answers",
        "• Month 3: Mentioned in 22% of answers (like Ramp's 7x growth)",
      ],
    },
    whatItMeans: "When potential customers ask AI for recommendations, their brand actually shows up. It's like getting recommended by the most trusted salesperson who talks to millions of people.",
    outcome: "More brand mentions = more customers who never even visit Google.",
  },
  {
    id: 4,
    name: "AI Shopping Domination",
    tagline: "E-commerce Only",
    price: "$5,000-$12,000/month",
    type: "Monthly retainer",
    description: "Get your products featured in ChatGPT Shopping results",
    whatYouDo: [
      "Get their products shown in ChatGPT Shopping results",
      "Optimize product pages so AI recommends their stuff over competitors",
      "Track which products AI is pushing and which it's ignoring",
      "Continuously improve product visibility",
    ],
    howYouDoIt: {
      intro: "ChatGPT Shopping setup:",
      steps: [
        "• Ensure product feeds are properly formatted for AI",
        "• Add rich product schema to all product pages",
        "• Optimize product descriptions for conversational queries",
        "Profound Shopping dashboard tracking:",
        "• See which products appear in ChatGPT Shopping",
        "• Monitor competitor products showing up instead",
        "• Track which keywords trigger shopping results",
        "Monthly optimization:",
        "• Refine product copy based on what's working",
        "• Add reviews and social proof AI looks for",
        "• Test different positioning for underperforming products",
      ],
    },
    whatItMeans: 'When someone asks ChatGPT "what\'s the best wireless headphones under $100," their product shows up in the carousel. Direct path from question to purchase, no Google involved.',
    outcome: "New sales channel with zero ad spend.",
  },
  {
    id: 5,
    name: "AI Visibility Command Center",
    tagline: "Full Service",
    price: "$10,000-$25,000/month",
    type: "Monthly retainer",
    description: "Complete AI presence management and strategic control",
    whatYouDo: [
      "Everything above PLUS:",
      "Continuous monitoring of brand reputation in AI",
      "Competitive intelligence (what competitors are doing)",
      "Strategic monthly planning based on trending AI conversations",
      "Crisis management if AI says something wrong about them",
      "Dedicated strategist meetings",
    ],
    howYouDoIt: {
      intro: "Full platform access - Answer Engine Insights, Conversation Explorer, Agent Analytics, Shopping",
      steps: [
        "Weekly monitoring:",
        "• Brand mention volume and sentiment",
        "• New trending questions in their category",
        "• Competitor movements",
        "• Technical issues",
        "Monthly strategy sessions with Profound's AI Search Strategist",
        "Content calendar based on Conversation Explorer data",
        "Rapid response to negative mentions or misinformation",
      ],
    },
    whatItMeans: "They own their AI presence like they own their Google presence. Complete visibility and control over how millions of AI conversations mention their brand.",
    outcome: "Market leadership in the AI-first world.",
  },
  {
    id: 6,
    name: "AI Conversation Intelligence",
    tagline: "Add-on to any package",
    price: "$2,000-$5,000/month",
    type: "Monthly subscription",
    description: "Understand what customers are asking AI about your industry",
    whatYouDo: [
      "Show them exactly what customers are asking AI about their industry",
      "Reveal trends before competitors notice",
      "Give them topic ideas that actually have volume",
      "Help them understand customer problems at scale",
    ],
    howYouDoIt: {
      intro: "Conversation Explorer access with custom queries",
      steps: [
        "Monthly reports:",
        '• "These 10 topics saw 300% volume increase this month"',
        '• "Your customers are asking AI about [new problem]"',
        "• Geographic breakdowns of where demand is highest",
        "Keyword research for their content team",
        "Intent analysis - Are people asking to research, compare, or buy?",
      ],
    },
    whatItMeans: "They see what customers want before competitors do. It's like having a focus group of millions running 24/7, telling you exactly what content to create.",
    outcome: "Data-driven content strategy that matches real demand.",
  },
];

export default function ProductsPage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (packageId: number) => {
    setSelectedPackage(packageId);
    const index = packages.findIndex(p => p.id === packageId);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedPackage(null);
  };

  const nextPackage = () => {
    setCurrentIndex((prev) => (prev + 1) % packages.length);
    setSelectedPackage(packages[(currentIndex + 1) % packages.length].id);
  };

  const prevPackage = () => {
    setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
    setSelectedPackage(packages[(currentIndex - 1 + packages.length) % packages.length].id);
  };

  const currentPackage = packages[currentIndex];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Our Products
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Comprehensive AI visibility solutions for every business need
        </p>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all cursor-pointer group"
            onClick={() => openModal(pkg.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                {pkg.tagline}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {pkg.name}
            </h3>
            <p className="text-sm text-slate-400 mb-4">{pkg.description}</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{pkg.type}</p>
                <p className="text-lg font-bold text-white">{pkg.price}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-slate-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                    {currentPackage.tagline}
                  </span>
                  <span className="text-xs text-slate-400">{currentPackage.type}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{currentPackage.name}</h2>
                <p className="text-xl font-bold text-blue-400 mt-1">{currentPackage.price}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* What You Do */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  What You Do For The Business
                </h3>
                <ul className="space-y-2">
                  {currentPackage.whatYouDo.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* How You Do It */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3">How You + Profound Do This</h3>
                <p className="text-sm text-slate-300 mb-3">{currentPackage.howYouDoIt.intro}</p>
                <ul className="space-y-2">
                  {currentPackage.howYouDoIt.steps?.map((step, idx) => (
                    <li key={idx} className="text-sm text-slate-300">
                      {step}
                    </li>
                  ))}
                </ul>
                {currentPackage.howYouDoIt.examples && (
                  <ul className="space-y-2 mt-3 pl-4">
                    {currentPackage.howYouDoIt.examples.map((example, idx) => (
                      <li key={idx} className="text-sm text-blue-300 italic">
                        {example}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* What It Means */}
              <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-blue-300 mb-2">What This Means For The Business</h3>
                <p className="text-sm text-slate-300 mb-3">{currentPackage.whatItMeans}</p>
                <p className="text-sm font-semibold text-white">
                  <strong>Outcome:</strong> {currentPackage.outcome}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-6 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={prevPackage}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="text-sm text-slate-400">
                Package {currentIndex + 1} of {packages.length}
              </div>

              <button
                onClick={nextPackage}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
