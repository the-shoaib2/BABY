import { useEffect, useRef } from "react"
import mermaid from "mermaid"

interface MermaidProps {
  chart: string
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      try {
        mermaid.initialize({ startOnLoad: false })
        mermaid.render("mermaid-diagram", chart, (svgCode) => {
          if (ref.current) ref.current.innerHTML = svgCode
        })
      } catch (e) {
        if (ref.current) ref.current.innerHTML = `<div style='color:red'>Invalid Mermaid diagram</div>`
      }
    }
  }, [chart])

  return <div ref={ref} />
} 