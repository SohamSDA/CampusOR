"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/app/services/api";

export default function CreateQueuePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiService.post("/queues", formData, true); // true = include auth
      if (res.success) {
        // Redirect to the dashboard with the new queue ID
        router.push(`/dashboard/operator?queueId=${res.queue.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create queue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create New Queue</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Queue Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            placeholder="e.g., Admin Office A"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            placeholder="e.g., Ground Floor"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Queue"}
        </button>
      </form>
    </div>
  );
}