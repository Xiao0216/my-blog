"use client"

import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const node = ref.current

    if (!node) {
      return
    }

    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

      if (mediaQuery.matches) {
        return
      }
    }

    if (
      typeof IntersectionObserver === "undefined" ||
      typeof window === "undefined"
    ) {
      return
    }

    const rect = node.getBoundingClientRect()
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0

    if (isInViewport) {
      return
    }

    setShouldAnimate(true)
    setVisible(false)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        shouldAnimate && "transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className
      )}
      style={shouldAnimate ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
