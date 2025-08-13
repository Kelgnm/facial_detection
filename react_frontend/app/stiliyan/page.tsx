// app/user/stiliyan/page.tsx
import { notFound } from 'next/navigation';
import { user } from '../../lib/db';
import StiliyanClient from '../../components/client';

export const dynamic = 'force-dynamic';

export default async function StiliyanPage() {
  const username = 'stiliyan';
  const userData = await user(username);

  if (!userData) return notFound();

  return <StiliyanClient userData={userData} />;
}
