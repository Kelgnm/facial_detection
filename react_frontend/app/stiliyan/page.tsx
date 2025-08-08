export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { user } from '../../lib/db';
import StiliyanClient from './client';

export default async function StiliyanPage() {
  const username = 'stiliyan';
  const userData = await user(username);

  if (!userData) return notFound();

  return <StiliyanClient userData={userData} />;
}
