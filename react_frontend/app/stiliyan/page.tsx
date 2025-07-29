'use client'

import {useEffect, useState, useRef} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {
  Link,
  Container,
  Heading,
  Box,
  VStack,
  Button,
  Center,
  Text
} from '@chakra-ui/react'
import { motion } from 'framer-motion';
import ThemeToggle from '../../src/components/ui/ThemeToggle';

export default function UserPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [darkMode, setDarkMode] = useState(true);
    const [role, setRole] = useState<string>('Unknown');
    const [showRole, setShowRole] = useState(false);
    const [name, setName] = useState<string>('Guest');
    const mismatchCountRef = useRef(0);

    // useEffect(() => {
    //     const stored = localStorage.getItem('recognizedName');
    //     const paramName = searchParams.get('name');

    //     if (stored) 
    //         setName(stored);
    //     else if (paramName) {
    //         setName(paramName);
    //         localStorage.setItem('recognizedName', paramName)
    //     }

    //     fetch('/scripts/data.json')
    //         .then((res) => res.json())
    //         .then((data: PersonData) => {
    //             const person = (paramName || stored)?.toLowerCase();
    //             if (person) {
    //                 const key = data[person];
    //                 if(key?.role) setRole(key.role);
    //             }
    //         });
        
    //     const toggle = setInterval(() => {
    //         setShowRole(prev => !prev);
    //     }, 2000)
    //     const interval = setInterval(async () => {
    //         try {
    //             const res = await fetch('/api/detect');
    //             const data = await res.json();
    //             const seen = data.seen;
    //             const expected = stored;

    //             if (seen !== expected) {
    //                 mismatchCountRef.current += 1;

    //                 if (mismatchCountRef.current >= 1) {
    //                     alert('Logging out');
    //                     clearInterval(interval);
    //                     localStorage.removeItem('recognizedName');
    //                     router.push('/');
    //                 }
    //             } else {
    //                 mismatchCountRef.current = 0;
    //             }
    //         } catch (error) {
    //             console.error('Face detection error:', error);
    //         }
    //     }, 5000)

    //     return () => clearInterval(interval);
    // }, [router, searchParams]);

    const handleLogout = () => {
        localStorage.removeItem('recognizedName');
        router.push('/');
    };

    const MotionBox = motion(Box);
    const MotionText = motion(Text);

    return (
        <Box bg={{ base: "white", _dark: "black" }} color="black" _light={{ color: 'white' }}>
            <header className="fixed w-full pq2 z-20 backdrop-blur-md">
                <div className="max-w-2xl mx-auto">
                    <nav className='flex items-center gap-3 text-base'>
                        <Text fontSize="xl">Welcome, {name}</Text>
                        <ThemeToggle />
                    </nav>
                </div>
            </header>
        <Button onClick={handleLogout}>
            Log out
        </Button>
        </Box>
    );
}