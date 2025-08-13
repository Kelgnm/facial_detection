'use client';

export const metadata = {
  title: "500 Internal Server Error",
};

export default function InternalServerError() {
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <h1>500</h1>
      <p>SERVER ISSUES FUCK OFF.</p>
    </div>
  );
}