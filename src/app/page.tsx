"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"

const MainMap = dynamic(() => import("@/components/MainMap"), { ssr: false })

export default function MapPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <main className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="flex flex-col items-center gap-6">
          <div className="w-40 h-40 rounded-2xl bg-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              repeatType: "reverse",
            }}
            className="text-gray-300 font-medium text-lg tracking-wide"
          >
            Almost Ready
          </motion.p>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-10 h-10 border-4 border-gray-600 border-t-indigo-500 rounded-full"
          />
        </div>
      </main>
    )
  }

  return (
    <main style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <MainMap />
    </main>
  )
}
