"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function LandingPage() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 border-b">
        <h1 className="text-xl font-bold">CampusOR</h1>
        <div className="space-x-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={logout}
                className="text-sm font-medium text-red-600 hover:text-red-700 cursor-pointer"
              >
                Logout
              </button>
              <Link
                href="/dashboard"
                className="bg-black text-white px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium cursor-pointer hover:text-gray-600">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-black text-white px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold max-w-3xl">
          Smart Virtual Queue Management for Large Campuses
        </h2>

        <p className="mt-4 max-w-2xl text-gray-600">
          CampusOR replaces physical queues with a real-time digital experience.
          Track your position, get notified, and save time.
        </p>

        <div className="mt-6 flex gap-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard/user"
              className="bg-black text-white px-6 py-3 rounded-md cursor-pointer hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="bg-black text-white px-6 py-3 rounded-md cursor-pointer hover:bg-gray-800 transition-colors"
              >
                Join Queue
              </Link>
              <button className="border px-6 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors">
                Learn More
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
