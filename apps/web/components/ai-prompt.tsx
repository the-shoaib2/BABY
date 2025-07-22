"use client"

import AIPromptInput from "@/components/chat/ai-prompt-input"
import AnimatedBg from "./chat/AnimatedBg"

export default function AIPrompt() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <AnimatedBg />
      <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-foreground mb-2">Welcome!</h1>
          <p className="text-muted-foreground">How can I help you today?</p>
        </div>
        <AIPromptInput />
      </div>
    </div>
  )
}
