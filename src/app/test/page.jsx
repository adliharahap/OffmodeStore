"use client";
import { useSelector } from "react-redux";

export default function Dashboard() {
  const { user, loading } = useSelector((state) => state.auth);

//   if (loading) return <p>Loading...</p>;
  if (!user) return <p>Silakan login dulu 😢</p>;

  return (
    <div>
      <h1>Selamat datang, {user.user_metadata.full_name} 🌸</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
