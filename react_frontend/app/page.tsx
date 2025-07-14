'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, Button, Text, VStack, Center, Spinner } from '@chakra-ui/react';
import { motion } from 'framer-motion';

export default function App() {
  const [name, setName] = useState<string>('Guest');
  const [displayedName, setDisplayedName] = useState('');
  const [recognized, setRecognized] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const detected = async () => {
    setLoading(true);
    setErrorMsg('');
    setRecognized(false);
    setDisplayedName('');
    setName('Guest');
    localStorage.removeItem('recognizedName');
    try {
      const res = await fetch('/api/detect');
      const data = await res.json();

      if (data.seen) {
        localStorage.setItem('recognizedName', data.seen);
        setName(data.seen)
        setRecognized(true);
      } else {
        setErrorMsg('Face not recognized. Please try again.');
      }
    } catch (error) {
      console.error('Detection error:', error);
      setErrorMsg('Error running Python script');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('recognizedName');
    if (stored) {
       setName(stored)  
    }
    const timeout = setTimeout(() => {
      detected();
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!name) return;

    setDisplayedName('');
    let i = 0;

    const interval = setInterval(() => {
      if (i < name.length) {
          setDisplayedName((prev) => prev + name.charAt(i))
          i++;
      } else {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [name]);



const MotionBox = motion(Box);
const MotionText = motion(Text);

  return (
    <Center minH="100vh" bg="gray.50">
      <MotionBox
      transition={{ duration: 0.6 }}
      >
        <VStack alignItems="center">
          <Heading size="6xl" mb={10}>Welcome,
            <MotionText
            as="span"
            fontWeight="bold"
            color="blue.500"
            fontSize="2x1"
            ml={2}>
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
              <Button
                colorScheme="green"
                onClick={() => router.push(`/${name.toLowerCase()}?name=${name}`)}
                size="lg"
              >
                Proceed 
              </Button>
            ) : (
              <>
                {loading ? (
                  <Text fontSize="lg" color="gray.500">
                    Scanning face...
                  </Text>
                ) : (
                  <Text fontSize="lg" color="red.500">
                    {errorMsg}
                  </Text>
                )}
              </>
            )}

            <Button colorScheme="blue" onClick={detected}>
              Try Detect Again
            </Button>
            <Button colorScheme="red" onClick={() => router.push(`/register`)}>
              Register!
            </Button>
        </VStack>
      </MotionBox>
    </Center>
  );
}
