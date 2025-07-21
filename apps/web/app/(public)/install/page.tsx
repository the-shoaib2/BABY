"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code2, Download, Terminal, Globe, Smartphone, Monitor, Copy, Check, Zap, Palette, Sparkles, Layers, Database, Cpu, Smartphone as Mobile, Monitor as Desktop } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

const platforms = [
  {
    name: "VS Code",
    description: "Microsoft's popular code editor",
    icon: <Code2 className="w-6 h-6" />,
    category: "Editor",
    command: "ext install baby.code-assistant",
    featured: true,
    steps: [
      "Open VS Code",
      "Go to Extensions (Ctrl+Shift+X)",
      "Search for 'B.A.B.Y. Code Assistant'",
      "Click Install"
    ]
  },
  {
    name: "Cursor",
    description: "AI-first code editor built on VS Code",
    icon: <Zap className="w-6 h-6" />,
    category: "Editor",
    command: "ext install baby.code-assistant",
    steps: [
      "Open Cursor",
      "Go to Extensions (Ctrl+Shift+X)",
      "Search for 'B.A.B.Y. Code Assistant'",
      "Click Install"
    ]
  },
  {
    name: "VS Code Insiders",
    description: "Early access version of VS Code",
    icon: <Sparkles className="w-6 h-6" />,
    category: "Editor",
    command: "ext install baby.code-assistant",
    steps: [
      "Open VS Code Insiders",
      "Go to Extensions (Ctrl+Shift+X)",
      "Search for 'B.A.B.Y. Code Assistant'",
      "Click Install"
    ]
  },
  {
    name: "Windsurf",
    description: "Modern code editor for web development",
    icon: <Globe className="w-6 h-6" />,
    category: "Editor",
    command: "ext install baby.code-assistant",
    steps: [
      "Open Windsurf",
      "Go to Extensions (Ctrl+Shift+X)",
      "Search for 'B.A.B.Y. Code Assistant'",
      "Click Install"
    ]
  },
  {
    name: "Trae AI",
    description: "AI-powered code editor",
    icon: <Palette className="w-6 h-6" />,
    category: "Editor",
    command: "ext install baby.code-assistant",
    steps: [
      "Open Trae AI",
      "Go to Extensions (Ctrl+Shift+X)",
      "Search for 'B.A.B.Y. Code Assistant'",
      "Click Install"
    ]
  }
]



const quickStart = [
  {
    step: 1,
    title: "Choose Your Platform",
    description: "Select the installation method that works best for your workflow"
  },
  {
    step: 2,
    title: "Install B.A.B.Y.",
    description: "Follow the platform-specific installation instructions"
  },
  {
    step: 3,
    title: "Sign Up or Sign In",
    description: "Create your account or log in to existing account"
  },
  {
    step: 4,
    title: "Start Coding",
    description: "Begin using B.A.B.Y. to analyze and improve your code"
  }
]

export default function InstallPage() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const copyToClipboard = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopiedCommand(command)
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch (err) {
      console.error('Failed to copy command:', err)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge variant="secondary" className="mb-4 animate-pulse">
              <Download className="w-4 h-4 mr-2" />
              Installation Guide
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Install B.A.B.Y. Extension
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              Install B.A.B.Y. in your favorite IDE and start using AI-powered code analysis and visualization.
            </p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
            >
              <Button size="lg" className="w-full sm:w-auto group">
                <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Download Now
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto group">
                <Code2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                View Documentation
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Start */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-muted/30"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Quick Installation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get B.A.B.Y. running in your IDE in just a few simple steps
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStart.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Installation Options */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Popular Code Editors</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Install B.A.B.Y. in your favorite code editor for seamless integration
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className={`h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 ${platform.featured ? 'ring-2 ring-primary' : ''}`}>
                  {platform.featured && (
                    <Badge className="absolute -top-3 left-4 bg-primary">
                      Recommended
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                        {platform.icon}
                      </div>
                      <Badge variant="secondary" className="text-xs">{platform.category}</Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{platform.name}</CardTitle>
                    <CardDescription className="text-sm">{platform.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono text-muted-foreground">{platform.command}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(platform.command)}
                            className="h-8 w-8 p-0"
                          >
                            {copiedCommand === platform.command ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Installation Steps:</h4>
                        <ol className="text-sm text-muted-foreground space-y-1">
                          {platform.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-2">
                              <span className="text-primary font-medium">{stepIndex + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <Button className="w-full group" variant="outline">
                        <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        <span className="group-hover:scale-105 transition-transform">Install {platform.name}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>



      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-primary"
      >
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl sm:text-3xl font-bold mb-4"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90"
          >
            Join thousands of developers who are already using B.A.B.Y. to write better code.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <Button size="lg" variant="secondary" className="w-full sm:w-auto group bg-white text-gray-800 hover:bg-gray-100">
              <span className="group-hover:scale-105 transition-transform">Start Free Trial</span>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-800 w-full sm:w-auto group">
              <span className="group-hover:scale-105 transition-transform">Contact Sales</span>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
} 