"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Calendar, Heart } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role === 'admin') {
      router.push("/admin/dashboard");
    } else if (session?.user?.role === 'partner') {
      router.push("/partner/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{session.user?.name || 'Traveler'}</span>!
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Your personalized travel hub awaits.
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* My Bookings Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-bold">My Bookings</CardTitle>
              <Link href="/bookings" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View and manage your upcoming and past trips.
              </p>
              {/* Placeholder for dynamic content, e.g., next trip details */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Next trip: Paris, France (Dec 25, 2024)</p>
                <p>Booking ID: #TRB78901</p>
              </div>
              <Button asChild className="mt-6 w-full">
                <Link href="/bookings">Manage Bookings</Link>
              </Button>
            </CardContent>
          </Card>

          {/* My Profile Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
              <Link href="/profile" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Edit
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Update your personal information and preferences.
              </p>
              {/* Placeholder for dynamic content, e.g., profile completion */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Profile Completion: 75%</p>
                <p>Email: {session.user?.email}</p>
              </div>
              <Button variant="outline" asChild className="mt-6 w-full">
                <Link href="/profile">Go to Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Explore Destinations Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-bold">Explore Destinations</CardTitle>
              <Link href="/packages" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Browse All
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Discover new destinations and exciting travel packages.
              </p>
              {/* Placeholder for dynamic content, e.g., popular destinations */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Popular: Tokyo, Rome, New York</p>
                <p>New Deals Available!</p>
              </div>
              <Button variant="outline" asChild className="mt-6 w-full">
                <Link href="/packages">Find Your Next Adventure</Link>
              </Button>
            </CardContent>
          </Card>

          {/* New Card: Quick Actions */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button asChild variant="secondary">
                <Link href="/book-new-trip">Book a New Trip</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/support">Get Support</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/notifications">View Notifications</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/settings">Account Settings</Link>
              </Button>
            </CardContent>
          </Card>

          {/* New Card: Recent Activity (Placeholder) */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <li>Booked flight to London (Oct 10, 2024)</li>
                <li>Updated profile picture (Oct 08, 2024)</li>
                <li>Viewed "Tropical Getaways" package (Oct 07, 2024)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}