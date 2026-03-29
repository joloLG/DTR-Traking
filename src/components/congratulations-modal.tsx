'use client'

import { useEffect, useState } from 'react'
import { X, Trophy, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CongratulationsModalProps {
  isOpen: boolean
  onClose: () => void
  fullName: string
  ojtHoursRequired: number
  ojtHoursCompleted: number
}

export function CongratulationsModal({
  isOpen,
  onClose,
  fullName,
  ojtHoursRequired,
  ojtHoursCompleted
}: CongratulationsModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiPieces, setConfettiPieces] = useState<Array<{
    left: number
    top: number
    animationDelay: number
    animationDuration: number
    color: string
  }>>([])

  useEffect(() => {
    if (isOpen) {
      // Generate confetti pieces with random properties
      const colors = ['bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-blue-400', 'bg-green-400']
      const pieces = Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 2,
        animationDuration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      }))
      
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setShowConfetti(true)
        setConfettiPieces(pieces)
      }, 0)
      
      // Trigger confetti animation
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full">
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute -top-2 -right-2 z-10 bg-white/90 hover:bg-white rounded-full p-2"
        >
          <X className="w-4 h-4" />
        </Button>

        <Card className="bg-linear-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            {/* Animated icons */}
            <div className="relative">
              <div className="flex justify-center items-center space-x-4">
                <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
                <Star className="w-8 h-8 text-orange-400 animate-pulse" />
                <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
              </div>
              
              {/* Confetti effect */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                  {confettiPieces.map((piece, i) => (
                    <div
                      key={i}
                      className="absolute animate-ping"
                      style={{
                        left: `${piece.left}%`,
                        top: `${piece.top}%`,
                        animationDelay: `${piece.animationDelay}s`,
                        animationDuration: `${piece.animationDuration}s`
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full ${piece.color}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Congratulations message */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold bg-linear-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Congratulations!
              </h1>
              
              <div className="space-y-2">
                <p className="text-lg text-gray-700">
                  <span className="font-semibold text-gray-900">{fullName}</span>
                </p>
                <p className="text-gray-600">
                  For Completing your On the Job Training
                </p>
              </div>

              {/* Hours completion display */}
              <div className="bg-white/70 rounded-lg p-4 border border-yellow-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Required Hours:</span>
                    <span className="font-semibold">{ojtHoursRequired.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed Hours:</span>
                    <span className="font-semibold text-green-600">{ojtHoursCompleted.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                    <div 
                      className="bg-linear-to-r from-green-500 to-green-600 h-3 rounded-full animate-pulse"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Achievement message */}
              <div className="bg-linear-to-r from-yellow-100 to-orange-100 rounded-lg p-4 border border-yellow-300">
                <p className="text-sm font-medium text-gray-800">
                  🎉 Outstanding Achievement! 🎉
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  You have successfully completed your OJT requirements. Your dedication and hard work have paid off!
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={onClose}
                className="flex-1 bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                Continue to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
