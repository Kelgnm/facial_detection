'use client'

import {useEffect, useState, useRef} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import NextLink from 'next/link'
import {
  Link,
  Container,
  Heading,
  Box,
  VStack,
  Button,
  Center,
  Text,
  ListItem
} from '@chakra-ui/react'
import { motion } from 'framer-motion';


interface PersonData {
    [key: string]: {
        role: string;
    };
}

export default function UserPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [role, setRole] = useState<string>('Unknown');
    const [showRole, setShowRole] = useState(false);
    const [name, setName] = useState<string>('Guest');
    const mismatchCountRef = useRef(0);

    useEffect(() => {
        const stored = localStorage.getItem('recognizedName');
        const paramName = searchParams.get('name');

        if (stored) 
            setName(stored);
        else if (paramName) {
            setName(paramName);
            localStorage.setItem('recognizedName', paramName)
        }

        fetch('/scripts/data.json')
            .then((res) => res.json())
            .then((data: PersonData) => {
                const person = (paramName || stored)?.toLowerCase();
                if (person) {
                    const key = data[person];
                    if(key?.role) setRole(key.role);
                }
            });
        
        const toggle = setInterval(() => {
            setShowRole(prev => !prev);
        }, 2000)
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/detect');
                const data = await res.json();
                const seen = data.seen;
                const expected = stored;

                if (seen !== expected) {
                    mismatchCountRef.current += 1;

                    if (mismatchCountRef.current >= 1) {
                        alert('Logging out');
                        clearInterval(interval);
                        localStorage.removeItem('recognizedName');
                        router.push('/');
                    }
                } else {
                    mismatchCountRef.current = 0;
                }
            } catch (error) {
                console.error('Face detection error:', error);
            }
        }, 5000)

        return () => clearInterval(interval);
    }, [router, searchParams]);

    const handleLogout = () => {
        localStorage.removeItem('recognizedName');
        router.push('/');
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
                     {showRole ? role : name}
                    <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                      >
                    |
                    </motion.span>
                     </MotionText>
                    </Heading>
        
                    <Button colorScheme="red" onClick={handleLogout}>
                      Log out
                    </Button>
                </VStack>
              </MotionBox>
            </Center>
    );
}