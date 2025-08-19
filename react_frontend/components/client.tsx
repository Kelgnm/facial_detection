'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Text, useColorMode, VStack } from '@chakra-ui/react';

export default function StiliyanClient({ userData }: { userData: { name: string; role: string } }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [name, setName] = useState(userData.name);
  const [loggedIn, setLoggedIn] = useState(true);
  const mismatchCountRef = useRef(0);
  const { colorMode, toggleColorMode } = useColorMode();

  async function captureFrames(video: HTMLVideoElement, totalFrames: number, delayMs: number): Promise<string[]> {
    const frames: string[] = [];
    if (video.paused || video.ended || video.videoWidth === 0 || video.videoHeight === 0) return frames;

    for (let i = 0; i < totalFrames; i++) {
      if (video.paused || video.ended || video.videoWidth === 0 || video.videoHeight === 0) break;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) break;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL('image/jpeg'));

      await new Promise(res => setTimeout(res, delayMs));
    }
    return frames;
  }

  async function detectFace() {
    if (!loggedIn || !videoRef.current) return;

    try {
      const frames = await captureFrames(videoRef.current, 10, 100);
      if (frames.length === 0) return;

      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: frames }),
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.seen === name) {
        mismatchCountRef.current = 0;
      } else {
        mismatchCountRef.current++;
        if (mismatchCountRef.current >= 1) {
          handleLogout();
          alert('Face not recognized. Redirecting to login...');
        }
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
  }

  useEffect(() => {
    let stream: MediaStream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Cannot access camera:', err);
      }
    }

    startCamera();

    return () => cleanup();

    function cleanup() {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    intervalRef.current = window.setInterval(detectFace, 5000);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [name, loggedIn]);

  const handleLogout = () => {
    setLoggedIn(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }

    router.push('/');
  };

  return (
    <VStack spacing={4} p={4}>
      <Text fontSize="2xl">Hello, {name}!</Text>
      <Text>Role: {userData.role}</Text>

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
  );
}
