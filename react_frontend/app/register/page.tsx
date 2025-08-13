'use client';

import dynamic from 'next/dynamic';

const RegisterPageClient = dynamic(() => import('../../components/RegisterPageClient'), { ssr: false });

export default function RegisterPage() {
  return (
    <div>
      Loading...
      <RegisterPageClient />
    </div>
  );
}
