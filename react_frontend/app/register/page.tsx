'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, Button, Text, Stack, Center, Input, Field } from '@chakra-ui/react';

export default function Register() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | ''>('');
  const [message, setMessage] = useState('');
  const [profession, setProfession] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');
    setMessage('');

    try {
      const streaming = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = videoRef.current;
      if (video) {
         video.srcObject = streaming

        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve(null);
        });

        await new Promise((res) => setTimeout(res, 1000));

        const bob = canvasRef.current;
        if (bob) {
          const ctx = bob.getContext('2d');
          bob.width = video.videoWidth;
          bob.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0, bob.width, bob.height);
        }

        // Stop camera
        streaming.getTracks().forEach(track => track.stop());
    }

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");
      const base64Image = canvas.toDataURL('image/jpeg').split(",")[1];

        const res = await fetch('/api/detect/register', {
            method: 'POST',
            body: JSON.stringify({ 
              name,
              id: Math.floor(Math.random() * 10000),
              role: profession,
              password: password,
              image: base64Image,
             }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        if (res.ok) {
            setStatus('success');
            setMessage('It worked, Recorded 29 pictures');
        } else {
            setStatus('error')
            setMessage(data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error(error);
        setStatus('error')
        setMessage('Unexpected error occured. Try again.')
    } finally {
        setIsLoading(false);
    }

    
  };
     return (
        <Box p={8} maxW="md" mx="auto">
          <form onSubmit={handleRegister}>
            <Stack>
              <Heading>Register Your Face</Heading>

              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading || status === 'success'}
              />

              <Input
                placeholder="Enter your profession"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                disabled={isLoading || status === 'success'}
              />

              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || status === 'success'}
              />

              {message && (
                <Text color={status === 'success' ? 'green.500' : 'red.500'}>
                  {message}
                </Text>
              )}

              {status === '' && (
                <Button
                  type="submit"
                  colorScheme="blue"
                  loading={isLoading}
                  disabled={!name}
                >
                  Register!
                </Button>
              )}

              {status === 'success' && (
                <Button colorScheme="green" onClick={() => router.push('/')}>
                  Return to Home
                </Button>
              )}

              {status === 'error' && (
                <Button
                  colorScheme="red"
                  type="submit"
                  disabled={!name}
                  loading={isLoading}
                >
                  Retry
                </Button>
              )}

              <video ref={videoRef} autoPlay style={{ display: 'none' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {message && <p>{message}</p>}
            </Stack>
      </form>
    </Box>

  );
}