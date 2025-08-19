import UserClientPage from './userClient'

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function Page({ params }: PageProps) {
  const { username } = await params
  return <UserClientPage username={username} />
}
