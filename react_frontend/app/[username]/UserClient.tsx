'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { VStack, Text, Button, useColorMode } from '@chakra-ui/react'

export default function UserClientPage() {
  const router = useRouter()
  const params = useParams()
  const username = params.username

  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState(false)
  const [loggedIn, setLoggedIn] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<NodeJS.Timer | null>(null)
  const mismatchCountRef = useRef(0)

  const { colorMode, toggleColorMode } = useColorMode()

  useEffect(() => {
    if (!username) return
    fetch(`http://localhost:3000/api/user/${username}`)
      .then(res => {
        if (!res.ok) throw new Error('User not found')
        return res.json()
      })
      .then(setUser)
      .catch(() => setError(true))
  }, [username])

  if (error) return <div>User not found</div>
  if (!user) return <div>Loading...</div>

  async function captureFrames(video: HTMLVideoElement, totalFrames: number, delayMs: number): Promise<string[]> {
    const frames: string[] = []
    if (video.paused || video.ended || video.videoWidth === 0 || video.videoHeight === 0) return frames

    for (let i = 0; i < totalFrames; i++) {
      if (video.paused || video.ended || video.videoWidth === 0 || video.videoHeight === 0) break

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) break

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      frames.push(canvas.toDataURL('image/jpeg'))

      await new Promise(res => setTimeout(res, delayMs))
    }
    return frames
  }

  async function detectFace() {
    if (!loggedIn || !videoRef.current) return

    try {
      const frames = await captureFrames(videoRef.current, 10, 100)
      if (frames.length === 0) return

      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: frames }),
      })

      if (!res.ok) return

      const data = await res.json()
      if (data.seen === username) {
        mismatchCountRef.current = 0
      } else {
        mismatchCountRef.current++
        if (mismatchCountRef.current >= 1) {
          handleLogout()
          alert('Face not recognized. Redirecting to login...')
        }
      }
    } catch (err) {
      console.error('Face detection error:', err)
    }
  }

  useEffect(() => {
    let stream: MediaStream

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (err) {
        console.error('Cannot access camera:', err)
      }
    }

    startCamera()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (stream) stream.getTracks().forEach(track => track.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [])

  useEffect(() => {
    if (!loggedIn) return
    intervalRef.current = setInterval(detectFace, 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [username, loggedIn])

  const handleLogout = () => {
    setLoggedIn(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    const video = videoRef.current
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(track => track.stop())
      video.srcObject = null
    }
    router.push('/')
  }

  return (
    <VStack spacing={4} p={4}>
      <Text fontSize="2xl">Hello, {username}!</Text>
      <Text>Role: {user.role}</Text>

      <Button colorScheme="blue" onClick={toggleColorMode}>
        Toggle {colorMode === 'light' ? 'Dark' : 'Light'} Mode
      </Button>

      <Button colorScheme="red" onClick={handleLogout}>
        Logout
      </Button>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: 320, height: 240, visibility: 'hidden' }}
      />
    </VStack>
  )
}
