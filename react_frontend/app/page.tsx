'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, Button, Text, VStack, Center, Spinner } from '@chakra-ui/react';
import { motion } from 'framer-motion';

export default function App() {
  const [name, setName] = useState<string>('Guest');
  const [displayedName, setDisplayedName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const stored = localStorage.getItem('recognizedName');
    if (stored) setName(stored);
  }, []);

  useEffect(() => {
    if (!name || name === '') return;

    setDisplayedName('');
    let i = 0;
    const interval = setInterval(() => {
      if (i <= name.length) {
          setDisplayedName((prev) => prev + name.charAt(i))
          i++;
      } else {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [name]);

  const detected = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/detect');
      const data = await res.json();

      if (data.seen) {
        localStorage.setItem('recognizedName', data.seen);
        router.push(`/${data.seen.toLowerCase()}?name=${data.seen}`);
      } else {
        alert('Face not recognized');
      }
    } catch (error) {
      console.error('Detection error:', error);
      alert('Error running Python script');
    } finally {
      setLoading(false);
    }
  };

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
            
            <Button colorScheme="red" 
            onClick={detected}
            disabled={loading}
            className='px-4 py-2 bg-blue-600 text-white rounded'>
              {loading ? "Scanning..." : "Start Detection"}
            </Button>

            <Button colorScheme="red" onClick={() => {
              localStorage.setItem('recognizedName', 'Guest');
              window.location.reload();
            }}>
              Reset
            </Button>
        </VStack>
      </MotionBox>
    </Center>
  );
}
