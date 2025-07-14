import { Providers } from './providers';

export const metadata = {
  title: "Face recognition",
  description: "Face detection site"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}