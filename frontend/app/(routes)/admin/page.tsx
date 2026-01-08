"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/charts/StatCard";
import QueueLoadChart from "@/components/charts/QueueLoadChart";
import WaitTimeChart from "@/components/charts/WaitTimeChart";
import TokensServedChart from "@/components/charts/TokensServedChart";
import ServiceEfficiencyChart from "@/components/charts/ServiceEfficiencyChart";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { fetchDashboardSummary, DashboardSummary } from "@/lib/api/admin";

export default function AdminPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load dashboard summary:", err);
        setError("Failed to load dashboard summary");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 xl:ml-72">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 pt-12 lg:pt-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Admin Analytics Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Overview of system performance and metrics
            </p>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-10">
              <p className="text-red-600">{error}</p>
            </div>
          ) : summary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              <StatCard
                title="Active Tokens"
                value={summary.activeTokens.toString()}
                color="blue"
              />
              <StatCard
                title="Served Today"
                value={summary.servedToday.toString()}
                color="green"
              />
              <StatCard
                title="Skipped Tokens"
                value={summary.skippedTokens.toString()}
                color="amber"
              />
              <StatCard
                title="Total Tokens Today"
                value={summary.totalTokensToday.toString()}
                color="blue"
              />
              <StatCard
                title="Peak Hour"
                value={summary.peakHour}
                color="purple"
              />
            </div>
          ) : null}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QueueLoadChart />
            <WaitTimeChart />
            <TokensServedChart />
            <ServiceEfficiencyChart />
          </div>
        </div>
      </main>
    </div>
  );
}
