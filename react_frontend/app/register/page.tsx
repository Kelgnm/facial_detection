'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, Button, Text, VStack, Center, Input } from '@chakra-ui/react';

export default function Register() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | ''>('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    setIsLoading(true);
    setStatus('');
    setMessage('');

    try {
        const res = await fetch('/api/detect/register', {
            method: 'POST',
            body: JSON.stringify({ name, id: Math.floor(Math.random() * 10000) }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        if (res.ok) {
            setStatus('success');
            setMessage('It worked, Recorded 6 pictures');
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
      <VStack>
        <Heading>Register Your Face</Heading>
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading || status === 'success'}
        />

        {message && (
          <Text color={status === 'success' ? 'green.500' : 'red.500'}>
            {message}
          </Text>
        )}

        {status === '' && (
          <Button
            onClick={handleRegister}
            colorScheme="blue"
            loading={isLoading}
            disabled={!name}
          >
            Start Registration
          </Button>
        )}

        {status === 'success' && (
          <Button
            colorScheme="green"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
        )}

        {status === 'error' && (
          <Button
            colorScheme="red"
            onClick={handleRegister}
            disabled={!name}
          >
            Retry
          </Button>
        )}
      </VStack>
    </Box>
  );
}