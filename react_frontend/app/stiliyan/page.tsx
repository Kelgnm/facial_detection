'use client'

import {useEffect, useState, useRef} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';

interface PersonData {
    [key: string]: {
        role: string;
    };
}

export default function UserPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [role, setRole] = useState<string>('Unknown');
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
                const person = data[paramName.toLowerCase()];
                if (person?.role) setRole(person.role);
            });

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
                        localStorage.removeItem('recognizedName');
                        clearInterval(interval);
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

    return (
        <div>
            <h1>Welcome, {role} {name}!</h1>
            <button onClick={handleLogout}>Log out</button>
        </div>
    );
}