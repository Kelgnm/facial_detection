import { notFound } from "next/navigation";
import fs from 'fs/promises';
import path from 'path';

export default async function UserPage({ params }: { params: { username: string } }) {
  const dataJson = path.join(process.cwd(), 'public', 'scripts', 'data.json');
  let userData: { name: string; role?: string; } | null = null;

  try {
    const buffer = await fs.readFile(dataJson, 'utf-8');
    const data = JSON.parse(buffer);

    for (const kluch in data) {
      if (data[kluch].name === params.username) {
        userData = data[kluch];
        break;
      }
    }

    if (!userData) return notFound();
  } catch (error) {
    console.error('Error reading data.json:', error);
    return notFound();
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem" }}>Welcome, {userData.name}!</h1>
      {userData.role && (
        <p><strong>Role:</strong> {userData.role}</p>
      )}
      <a href="/">Log out</a>
    </div>
  );
}
