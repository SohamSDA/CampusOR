"use client";

import NowServingCard from "@/operator/NowServingCard";
import OperatorControls from "@/operator/OperatorControls";
import OperatorHeader from "@/operator/OperatorHeader";
import TokenList from "@/operator/TokenList";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "@/app/services/api";

// [FIX] Made location required to match OperatorHeader props
type Token = { id: string; number: number; status: string };
type QueueData = { 
  id: string; 
  name: string; 
  status: string; 
  location: string; 
};

export default function OperatorDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queueId = searchParams.get("queueId");

  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueData | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [nowServing, setNowServing] = useState<{ id: string; number: number } | null>(null);

  // Fetch Queue Data
  // Wrapped in useCallback to safely include in useEffect dependency array
  const fetchQueueState = useCallback(async () => {
    if (!queueId) return;
    try {
      const data = await apiService.get(`/queues/${queueId}/operator-view`, true);
      setQueue(data.queue);
      setTokens(data.tokens);
      setNowServing(data.nowServing);
    } catch (error) {
      console.error("Failed to fetch queue state:", error);
    } finally {
      setLoading(false);
    }
  }, [queueId]);

  useEffect(() => {
    if (!queueId) {
      // If no queueId, redirect to create page
      router.push("/dashboard/operator/create");
      return;
    }
    fetchQueueState();
    
    // Optional: Auto-refresh every 10 seconds to keep sync with user actions
    const interval = setInterval(fetchQueueState, 10000);
    return () => clearInterval(interval);
  }, [queueId, router, fetchQueueState]);

  // Actions
  const updateTokenStatus = async (tokenId: string, status: string) => {
    try {
      // [FIX] Now using apiService.patch directly
      await apiService.patch(`/queues/tokens/${tokenId}/status`, { status }, true);
      fetchQueueState(); // Refresh state immediately after action
    } catch (error) {
      alert("Failed to update token status. Please try again.");
    }
  };

  const serveNext = async () => {
    // If we are already serving someone, we might want to finish them first? 
    // Usually "Serve Next" implies finishing the current one (if any) and calling the next.
    // For simplicity, we just pick the first waiting token.
    if (!tokens.length) {
      alert("No tokens in waiting queue.");
      return;
    }
    const nextToken = tokens[0]; 
    await updateTokenStatus(nextToken.id, "served");
  };

  const skipToken = async () => {
    // Logic: Skip the person currently being served (if they are absent)
    if (nowServing) {
      await updateTokenStatus(nowServing.id, "skipped");
      return;
    }
    
    // Fallback: If nobody is being served, skip the next person in line
    if (tokens.length > 0) {
       await updateTokenStatus(tokens[0].id, "skipped");
    }
  };

  const recallToken = () => {
    if (nowServing) {
      alert(`Recalling Token ${nowServing.number} (Announcement)`);
      // In a real app, this might trigger a text-to-speech API or websocket event
    }
  };

  const toggleQueueStatus = async () => {
     alert("Feature coming soon: Pause/Resume Queue");
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!queue) return <div className="p-8 text-center text-red-500">Queue not found.</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <OperatorHeader queue={queue} status={queue.status} />

      <NowServingCard token={nowServing} />

      <TokenList tokens={tokens} />

      <OperatorControls
        onServeNext={serveNext}
        onSkip={skipToken}
        onRecall={recallToken}
        onToggleQueue={toggleQueueStatus}
        queueStatus={queue.status}
      />
    </div>
  );
}