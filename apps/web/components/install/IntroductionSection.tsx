"use client"

import BackgroundPaths from "@/components/background-paths"

export default function IntroductionSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-background">
      <BackgroundPaths />
      <div className="relative z-10 w-full max-w-4xl mx-auto mb-8">
        {/* Removed Image */}
      </div>
      <h1 className="relative z-10 text-4xl sm:text-5xl font-bold text-foreground mb-4">Welcome to B.A.B.Y. Code Assistant</h1>
      <p className="relative z-10 text-lg text-muted-foreground max-w-2xl mx-auto">
        Supercharge your coding workflow with AI-powered code analysis, visualization, and productivity tools. Install B.A.B.Y. in your favorite editor and start building smarter, faster, and with more confidence.
      </p>
    </section>
  )
} 