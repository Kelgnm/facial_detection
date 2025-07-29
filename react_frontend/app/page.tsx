'use client';

import { useEffect, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { PasswordInput } from "../src/components/ui/password-input"
import { Box, Heading, Button, Text, VStack, Center, Spinner, Input } from '@chakra-ui/react';
import { motion } from 'framer-motion';

export default function App() {
  const [name, setName] = useState<string>('Guest');
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [detectedPassword, setDetectedPassword] = useState<string | null>(null);
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
    setRequirePassword(false);
    setDetectedPassword(null);
    localStorage.removeItem('recognizedName');

    try {
      const res = await fetch('/api/detect');
      const data = await res.json();
      console.log('Detect response:', data);

      if (data.seen) {
        localStorage.setItem('recognizedName', data.seen);
        setName(data.seen);
        setRecognized(true);

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
      console.error('Detection error:', error);
      setErrorMsg('Error running Python script');
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (password === detectedPassword) {
    setPasswordError('');
    router.push(`/${name.toLowerCase()}`);
  } else {
    setPasswordError('Incorrect password');
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
            ml={1}>
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    name="password"
                    required
                    mt={2}
                  />
                  <Center>
                  <Button mt={4} colorScheme="green" type="submit">
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



            <Button colorScheme="blue" variant="solid" onClick={detected}>
              Try Detect Again
            </Button>
            <Button colorScheme="red" variant="solid" onClick={() => router.push(`/register`)}>
              Register!
            </Button>
        </VStack>
      </MotionBox>
    </Center>
  );
}
