"use client";

import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  if (!isLoaded) {
    return <main className="flex items-center justify-center min-h-screen">Loading...</main>;
  }

  if (!isSignedIn) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to MedNexus</h1>
        <p className="text-lg text-gray-600">Please sign in to continue</p>
        <div className="flex gap-4">
          <Button onClick={() => router.push("/sign-in")} size="lg">
            Sign In
          </Button>
          <Button onClick={() => router.push("/sign-up")} variant="outline" size="lg">
            Sign Up
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-between p-6 bg-white shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Mednexus</h1>
        <UserButton />
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
        <p className="text-gray-700">You are signed in! Welcome to MedNexus.</p>
      </div>
    </main>
  );
}
