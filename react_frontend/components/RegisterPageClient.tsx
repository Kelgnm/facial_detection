'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPageClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [password, setPassword] = useState('');
  const [isloading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | ''>('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    let stream: MediaStream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera error:', err);
        setStatus('error');
        setMessage('Camera access denied or unavailable.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');
    setMessage('');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) throw new Error('Camera not ready');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

      const res = await fetch('/api/detect/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          id: Math.floor(Math.random() * 10000),
          role: profession,
          password,
          image: base64Image,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('It worked, recorded 29 pictures');
        setTimeout(() => router.push('/'), 1500);
      } else {
        setStatus('error');
        setMessage(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate loading state with a disabled button and custom text
  const loadingText = isloading ? 'Loading...' : 'Register';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ padding: '2rem', maxWidth: '28rem', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem' }}>
        <form onSubmit={handleRegister}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Register Your Face</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isloading || status === 'success'}
              style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0' }}
            />

            <input
              type="text"
              placeholder="Enter your profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              disabled={isloading || status === 'success'}
              style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0' }}
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isloading || status === 'success'}
              style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0' }}
            />

            {message && (
              <p style={{ color: status === 'success' ? '#38a169' : '#e53e3e', margin: '0.5rem 0' }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3182ce',
                color: '#fff',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: isloading || !name || !profession || !password ? 'not-allowed' : 'pointer',
                opacity: isloading || !name || !profession || !password ? 0.6 : 1,
              }}
              disabled={isloading || !name || !profession || !password}
            >
              {loadingText}
            </button>

            <video
              ref={videoRef}
              autoPlay
              style={{ width: '100%', borderRadius: '0.5rem', marginTop: '1rem' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </form>
      </div>
    </div>
  );
}