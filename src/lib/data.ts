import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────
export type PlayerName = "비비" | "에이블" | "에단" | "제리";

export interface Round {
  id: string;
  round_no: number;
  date: string;
  course_name: string;
}

export interface Score {
  round_id: string;
  player: PlayerName;
  total_strokes: number;
  total_putts: number;
  birdies: number;
  game_points: number;
}

export interface RoundWithScores extends Round {
  scores: Score[];
}

export interface PlayerStats {
  player: PlayerName;
  avgStrokes: number;
  avgPutts: number;
  totalBirdies: number;
  totalPoints: number;
  roundsPlayed: number;
  rank: number;
}

// ─── Player Constants ─────────────────────────────────
export const PLAYERS: {
  name: PlayerName;
  color: string;
  emoji: string;
  targetStrokes: number;
}[] = [
  { name: "비비", color: "#E91E63", emoji: "🌸", targetStrokes: 88 },
  { name: "에이블", color: "#9C27B0", emoji: "💜", targetStrokes: 96 },
  { name: "에단", color: "#1E88E5", emoji: "🌊", targetStrokes: 87 },
  { name: "제리", color: "#43A047", emoji: "🌿", targetStrokes: 90 },
];

export const TOTAL_ROUNDS = 10;

export function getPlayerColor(name: PlayerName): string {
  return PLAYERS.find((p) => p.name === name)?.color || "#888";
}

export function getPlayerEmoji(name: PlayerName): string {
  return PLAYERS.find((p) => p.name === name)?.emoji || "";
}

export function getPlayerTargetStrokes(name: PlayerName): number {
  return PLAYERS.find((p) => p.name === name)?.targetStrokes || 0;
}

// ─── Supabase CRUD ────────────────────────────────────

export async function getAllRounds(): Promise<RoundWithScores[]> {
  const { data: rounds, error: roundsErr } = await supabase
    .from("rounds")
    .select("*")
    .order("round_no", { ascending: true });

  if (roundsErr || !rounds) return [];

  const { data: scores, error: scoresErr } = await supabase
    .from("scores")
    .select("*");

  if (scoresErr || !scores) return [];

  return rounds.map((r) => ({
    id: r.id,
    round_no: r.round_no,
    date: r.date,
    course_name: r.course_name,
    scores: scores
      .filter((s) => s.round_id === r.id)
      .map((s) => ({
        round_id: s.round_id,
        player: s.player as PlayerName,
        total_strokes: s.total_strokes,
        total_putts: s.total_putts,
        birdies: s.birdies,
        game_points: s.game_points,
      })),
  }));
}

export async function saveRound(
  roundData: Omit<Round, "id">,
  scores: Omit<Score, "round_id">[]
): Promise<RoundWithScores | null> {
  // Insert round
  const { data: round, error: roundErr } = await supabase
    .from("rounds")
    .insert({
      round_no: roundData.round_no,
      date: roundData.date,
      course_name: roundData.course_name,
    })
    .select()
    .single();

  if (roundErr || !round) {
    console.error("Error saving round:", roundErr);
    return null;
  }

  // Insert scores
  const scoreRows = scores.map((s) => ({
    round_id: round.id,
    player: s.player,
    total_strokes: s.total_strokes,
    total_putts: s.total_putts,
    birdies: s.birdies,
    game_points: s.game_points,
  }));

  const { error: scoresErr } = await supabase.from("scores").insert(scoreRows);

  if (scoresErr) {
    console.error("Error saving scores:", scoresErr);
    // Rollback round
    await supabase.from("rounds").delete().eq("id", round.id);
    return null;
  }

  return {
    ...round,
    scores: scoreRows.map((s) => ({
      ...s,
      player: s.player as PlayerName,
    })),
  };
}

export async function updateRound(
  id: string,
  roundData: Omit<Round, "id">,
  scores: Omit<Score, "round_id">[]
) {
  // Update round
  await supabase
    .from("rounds")
    .update({
      round_no: roundData.round_no,
      date: roundData.date,
      course_name: roundData.course_name,
    })
    .eq("id", id);

  // Delete old scores and insert new ones
  await supabase.from("scores").delete().eq("round_id", id);

  const scoreRows = scores.map((s) => ({
    round_id: id,
    player: s.player,
    total_strokes: s.total_strokes,
    total_putts: s.total_putts,
    birdies: s.birdies,
    game_points: s.game_points,
  }));

  await supabase.from("scores").insert(scoreRows);
}

export async function deleteRound(id: string) {
  // scores will cascade delete
  await supabase.from("rounds").delete().eq("id", id);
}

export async function getNextRoundNo(): Promise<number> {
  const { data } = await supabase
    .from("rounds")
    .select("round_no")
    .order("round_no", { ascending: true });

  if (!data || data.length === 0) return 1;

  const usedNos = new Set(data.map((r: { round_no: number }) => r.round_no));
  for (let i = 1; i <= TOTAL_ROUNDS; i++) {
    if (!usedNos.has(i)) return i;
  }
  return data.length + 1;
}

export async function getUsedCourseNames(): Promise<string[]> {
  const { data } = await supabase
    .from("rounds")
    .select("course_name");

  if (!data) return [];
  return Array.from(new Set(data.map((r: { course_name: string }) => r.course_name)));
}

// ─── Aggregation ──────────────────────────────────────
export function calculatePlayerStats(rounds: RoundWithScores[]): PlayerStats[] {
  const stats: PlayerStats[] = PLAYERS.map((p) => {
    const playerScores = rounds
      .map((r) => r.scores.find((s) => s.player === p.name))
      .filter(Boolean) as Score[];

    const count = playerScores.length;
    if (count === 0) {
      return {
        player: p.name,
        avgStrokes: 0,
        avgPutts: 0,
        totalBirdies: 0,
        totalPoints: 0,
        roundsPlayed: 0,
        rank: 0,
      };
    }

    return {
      player: p.name,
      avgStrokes:
        Math.round(
          (playerScores.reduce((sum, s) => sum + s.total_strokes, 0) / count) * 10
        ) / 10,
      avgPutts:
        Math.round(
          (playerScores.reduce((sum, s) => sum + s.total_putts, 0) / count) * 10
        ) / 10,
      totalBirdies: playerScores.reduce((sum, s) => sum + s.birdies, 0),
      totalPoints: playerScores.reduce((sum, s) => sum + s.game_points, 0),
      roundsPlayed: count,
      rank: 0,
    };
  });

  // Ranking: 평균타수 오름차순 → 누적버디 내림차순 → 누적포인트 내림차순
  const playedStats = stats.filter((s) => s.roundsPlayed > 0);
  const unplayedStats = stats.filter((s) => s.roundsPlayed === 0);

  playedStats.sort((a, b) => {
    if (a.avgStrokes !== b.avgStrokes) return a.avgStrokes - b.avgStrokes;
    if (a.totalBirdies !== b.totalBirdies) return b.totalBirdies - a.totalBirdies;
    return b.totalPoints - a.totalPoints;
  });

  playedStats.forEach((s, i) => (s.rank = i + 1));
  unplayedStats.forEach((s) => (s.rank = 0));

  return [...playedStats, ...unplayedStats];
}

export function formatPoints(points: number): string {
  if (points > 0) return `+${points}`;
  return `${points}`;
}
