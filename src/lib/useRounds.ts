"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RoundWithScores,
  getAllRounds,
  saveRound,
  updateRound,
  deleteRound,
  calculatePlayerStats,
  PlayerStats,
  Round,
  Score,
  TOTAL_ROUNDS,
} from "./data";
import { supabase } from "./supabase";

export function useRounds() {
  const [rounds, setRounds] = useState<RoundWithScores[]>([]);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllRounds();
    data.sort((a, b) => a.round_no - b.round_no);
    setRounds(data);
    setStats(calculatePlayerStats(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    // Supabase Realtime subscription
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rounds" },
        () => refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scores" },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const addRound = useCallback(
    async (roundData: Omit<Round, "id">, scores: Omit<Score, "round_id">[]) => {
      await saveRound(roundData, scores);
      await refresh();
    },
    [refresh]
  );

  const editRound = useCallback(
    async (id: string, roundData: Omit<Round, "id">, scores: Omit<Score, "round_id">[]) => {
      await updateRound(id, roundData, scores);
      await refresh();
    },
    [refresh]
  );

  const removeRound = useCallback(
    async (id: string) => {
      await deleteRound(id);
      await refresh();
    },
    [refresh]
  );

  const completedRounds = rounds.length;
  const progress = completedRounds / TOTAL_ROUNDS;

  return {
    rounds,
    stats,
    completedRounds,
    progress,
    totalRounds: TOTAL_ROUNDS,
    loading,
    addRound,
    editRound,
    removeRound,
    refresh,
  };
}
