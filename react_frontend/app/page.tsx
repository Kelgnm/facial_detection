'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function App() {
  const [name, setName] = useState<string>('Guest');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('recognizedName');
    if (stored) setName(stored);
  }, []);

  const detected = async () => {
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
    }
  };

  return (
    <div>
      <h1>Welcome, {name}!</h1>
      <button onClick={detected}>Run Face Detection</button>
    </div>
  );
}
