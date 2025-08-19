'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, Button, Text, VStack, Center, Input, chakra } from '@chakra-ui/react';
import { motion } from 'framer-motion';

export default function AppClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const [name, setName] = useState<string>('Guest');
  const [displayedName, setDisplayedName] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [detectedPassword, setDetectedPassword] = useState<string | null>(null);
  const [recognized, setRecognized] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          await new Promise<void>((resolve) => {
            const video = videoRef.current!;
            let resolved = false;

            const onLoadedMetadata = () => {
              resolved = true;
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              resolve();
            };

            video.addEventListener('loadedmetadata', onLoadedMetadata);

            setTimeout(() => {
              if (!resolved) {
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                resolve();
              }
            }, 5000);

            video.play().catch(() => {});
          });

          detected();
        }
      } catch {
        setErrorMsg('Cannot access camera');
      }
    }
    startCamera();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function runDetection() {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        detected();
      }
    }

    detectionInterval.current = setInterval(runDetection, 2000);
    return () => {
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    };
  }, [recognized]);

  useEffect(() => {
    if (!name) return;
    let i = 0;
    let current = '';
    setDisplayedName('');
    const interval = setInterval(() => {
      if (i < name.length) {
        current += name[i];
        setDisplayedName(current);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [name]);

    async function captureFrames(video: HTMLVideoElement, totalFrames: number, delayMs: number): Promise<string[]> {
    const frames: string[] = [];

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      await new Promise<void>((resolve) => {
        const onLoaded = () => {
          video.removeEventListener('loadedmetadata', onLoaded);
          resolve();
        };
        video.addEventListener('loadedmetadata', onLoaded);
      });
    }

    for (let i = 0; i < totalFrames; i++) {
      if (video.paused || video.ended || video.videoWidth === 0) break;
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


  async function detected() {
    setLoading(true);
    setErrorMsg('');
    setRecognized(false);
    setDisplayedName('');
    setName('Guest');
    setRequirePassword(false);
    setDetectedPassword(null);
    setPassword('');
    setPasswordError('');
    localStorage.removeItem('recognizedName');

    if (!videoRef.current || !canvasRef.current) {
      setLoading(false);
      setErrorMsg('Video or canvas not ready');
      return;
    }

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    try {
      const frames = await captureFrames(video, 30, 100);
      if (frames.length === 0) {
        setErrorMsg('No valid frames captured');
        setLoading(false);
        return;
      }

      const images = frames;

      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });

      const data = await res.json();

      if (data.seen) {
        setRecognized(true);
        setName(data.seen);
        localStorage.setItem('recognizedName', data.seen);

        if (data.password) {
          setDetectedPassword(data.password);
          setRequirePassword(true);
        } else {
          router.push(`/${data.seen.toLowerCase()}`);
        }
      } else {
        setErrorMsg('Face not recognized. Please try again.');
      }
    } catch (error) {
      setErrorMsg('Error during face detection');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === detectedPassword) {
      setPasswordError('');
      router.push(`/${name.toLowerCase()}`);
    } else {
      setPasswordError('Incorrect password');
    }
  }

  const MotionBox = chakra(motion.div, {
    shouldForwardProp: (prop) =>
      typeof prop === "string" && !prop.startsWith("$"), // let Chakra handle its own props
  });

  const MotionText = chakra(motion.span, {
    shouldForwardProp: (prop) =>
      typeof prop === "string" && !prop.startsWith("$"),
  });

  return (
    <Center minH="100vh" bg="gray.50">
      <MotionBox   animate={{ opacity: 1 }}
        >
        <VStack alignItems="center">
          <Heading size="4xl" mb={10} color={'black'}>Welcome,
            <MotionText
              as="span"
              fontWeight="bold"
              color="blue.500"
              fontSize="6xl"
              ml={1}
            >
              {displayedName}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                |
              </motion.span>
            </MotionText>
          </Heading>

          {recognized ? (
            <Text fontSize="lg" color="green.500">
              Face recognized!
            </Text>
          ) : loading ? (
            <Text fontSize="lg" color="gray.500">
              Scanning face...
            </Text>
          ) : (
            <Text fontSize="lg" color="red.500">
              {errorMsg}
            </Text>
          )}
          <form onSubmit={handleSubmit}>
            {requirePassword ? (
              <>
                <Input
                  autoFocus
                  color="black"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  name="password"
                  required
                  mt={2}
                />
                <Center>
                  <Button
                    borderWidth="0.5px"
                    colorScheme="green"
                    borderColor="green.500"
                    _hover={{ borderColor: "green.600" }}
                    type="submit"
                  >
                    Verify
                  </Button>
                </Center>
              </>
            ) : (
              <Text fontSize="lg" color="red.500">
                {passwordError}
              </Text>
            )}
          </form>

          <Button
            borderWidth="1px"
            colorScheme="blue"
            borderColor="blue.500"
            _hover={{ borderColor: "blue.600" }}
            onClick={() => window.location.reload()}
          >
            Try Detect Again
          </Button>

          <Button
            borderWidth="1px"
            colorScheme="red"
            borderColor="red.500"
            _hover={{ borderColor: "red.600" }}
            onClick={() => router.push(`/register`)}
          >
            Register!
          </Button>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            width={320}
            height={240}
            style={{ position: 'absolute', left: '-9999px' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </VStack>
      </MotionBox>
    </Center>
  );
}