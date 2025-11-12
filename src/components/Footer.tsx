'use client'

import { useState, useEffect } from 'react'

export default function Footer() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight
      
      // Only hide if page is scrollable and we're near bottom (within 80px)
      const isScrollable = scrollHeight > clientHeight
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)
      setIsVisible(!isScrollable || distanceFromBottom > 80)
    }

    // Wait for page to load
    setTimeout(handleScroll, 100)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  if (!isVisible) return null

  return (
    <footer className="fixed bottom-4 right-4 text-sm">
      <span className="text-black">made by </span>
      <a
        href="https://achchala.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#ffc0cb] underline hover:text-black"
      >
        @achchala
      </a>
    </footer>
  )
}

