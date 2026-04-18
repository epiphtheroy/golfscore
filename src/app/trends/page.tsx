"use client";

import { useMemo } from "react";
import BottomNav from "@/components/BottomNav";
import { useRounds } from "@/lib/useRounds";
import { PLAYERS, formatPoints, PlayerName } from "@/lib/data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TrendsPage() {
  const { rounds } = useRounds();

  // Sort by round_no ascending for charts
  const sortedRounds = useMemo(
    () => [...rounds].sort((a, b) => a.round_no - b.round_no),
    [rounds]
  );

  // Prepare chart data
  const chartData = useMemo(
    () =>
      sortedRounds.map((r) => {
        const entry: Record<string, string | number> = {
          name: `R${String(r.round_no).padStart(2, "0")}`,
          date: r.date.replace(/-/g, "."),
          course: r.course_name,
        };
        r.scores.forEach((s) => {
          entry[`${s.player}_타수`] = s.total_strokes;
          entry[`${s.player}_퍼팅`] = s.total_putts;
          entry[`${s.player}_포인트`] = s.game_points;
        });
        return entry;
      }),
    [sortedRounds]
  );

  // Table data (descending for display)
  const tableRounds = useMemo(
    () =>
      [...rounds].sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.round_no - a.round_no;
      }),
    [rounds]
  );

  if (rounds.length === 0) {
    return (
      <>
        <div className="main-content min-h-screen">
          <div className="px-4 pt-6 pb-4">
            <h1 className="text-2xl font-bold text-white">추이</h1>
          </div>
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📈</div>
            <p className="text-white/30 text-sm">
              라운드 기록이 추가되면 추이 그래프가 표시됩니다
            </p>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="main-content min-h-screen">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-white">추이</h1>
          <p className="text-sm text-white/40 mt-1">시즌 성적 변화</p>
        </div>

        {/* (A) Stroke Chart */}
        <section className="px-4 mb-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white">총타수 추이</h2>
              <span className="text-xs text-[#00E5FF]">↓ 낮을수록 좋음</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    reversed
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    domain={["dataMin - 3", "dataMax + 3"]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A1F2E",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        const p = payload[0].payload;
                        return `${p.date} · ${p.course}`;
                      }
                      return label;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  />
                  {PLAYERS.map((player) => (
                    <Line
                      key={player.name}
                      type="monotone"
                      dataKey={`${player.name}_타수`}
                      name={player.name}
                      stroke={player.color}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: player.color }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* (B) Stroke Table */}
        <section className="px-4 mb-6">
          <DataTable
            rounds={tableRounds}
            metric="total_strokes"
            lowerIsBetter={true}
          />
        </section>

        {/* (C) Putt Chart */}
        <section className="px-4 mb-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white">총 퍼팅수 추이</h2>
              <span className="text-xs text-[#00E5FF]">↓ 낮을수록 좋음</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    reversed
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    domain={["dataMin - 2", "dataMax + 2"]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A1F2E",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        const p = payload[0].payload;
                        return `${p.date} · ${p.course}`;
                      }
                      return label;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  />
                  {PLAYERS.map((player) => (
                    <Line
                      key={player.name}
                      type="monotone"
                      dataKey={`${player.name}_퍼팅`}
                      name={player.name}
                      stroke={player.color}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: player.color }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* (D) Putt Table */}
        <section className="px-4 mb-6">
          <DataTable
            rounds={tableRounds}
            metric="total_putts"
            lowerIsBetter={true}
          />
        </section>

        {/* (E) Points Chart */}
        <section className="px-4 mb-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white">게임포인트 추이</h2>
              <span className="text-xs text-[#FFD54F]">↑ 높을수록 좋음</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A1F2E",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        const p = payload[0].payload;
                        return `${p.date} · ${p.course}`;
                      }
                      return label;
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => {
                      const v = Number(value);
                      return [v > 0 ? `+${v}` : `${v}`, ""];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  />
                  {/* Reference line at 0 */}
                  <CartesianGrid
                    horizontalPoints={[]}
                    verticalPoints={[]}
                  />
                  {PLAYERS.map((player) => (
                    <Line
                      key={player.name}
                      type="monotone"
                      dataKey={`${player.name}_포인트`}
                      name={player.name}
                      stroke={player.color}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: player.color }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* (F) Points Table */}
        <section className="px-4 mb-6">
          <DataTable
            rounds={tableRounds}
            metric="game_points"
            lowerIsBetter={false}
            isPoints={true}
          />
        </section>
      </div>

      <BottomNav />
    </>
  );
}

// ─── Data Table Component ─────────────────────────────
function DataTable({
  rounds,
  metric,
  lowerIsBetter,
  isPoints,
}: {
  rounds: {
    id: string;
    round_no: number;
    date: string;
    course_name: string;
    scores: {
      player: PlayerName;
      total_strokes: number;
      total_putts: number;
      birdies: number;
      game_points: number;
    }[];
  }[];
  metric: "total_strokes" | "total_putts" | "game_points";
  lowerIsBetter: boolean;
  isPoints?: boolean;
}) {
  // Calculate averages per player
  const averages = PLAYERS.map((p) => {
    const values = rounds
      .map((r) => {
        const score = r.scores.find((s) => s.player === p.name);
        return score ? score[metric] : null;
      })
      .filter((v) => v !== null) as number[];
    if (values.length === 0) return null;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  });

  return (
    <div className="glass-card overflow-hidden overflow-x-auto">
      <table className="score-table">
        <thead>
          <tr>
            <th className="text-left pl-4 min-w-[140px]">라운드</th>
            {PLAYERS.map((p) => (
              <th key={p.name}>
                <div className="flex items-center justify-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: p.color }}
                  />
                  <span>{p.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rounds.map((round) => {
            const values = PLAYERS.map((p) => {
              const score = round.scores.find((s) => s.player === p.name);
              return score ? score[metric] : null;
            });
            const validValues = values.filter((v) => v !== null) as number[];
            const bestValue = lowerIsBetter
              ? Math.min(...validValues)
              : Math.max(...validValues);

            return (
              <tr key={round.id}>
                <td className="text-left pl-4 text-xs text-white/50">
                  <div>{round.date.replace(/-/g, ".")}</div>
                  <div className="text-[10px] text-white/30">
                    {round.course_name}
                  </div>
                </td>
                {PLAYERS.map((p, i) => (
                  <td
                    key={p.name}
                    className={`stat-number ${
                      isPoints
                        ? values[i] !== null
                          ? (values[i] as number) >= 0
                            ? values[i] === bestValue
                              ? "best-score-cell"
                              : "positive-points"
                            : "negative-points"
                          : "text-white/30"
                        : values[i] === bestValue
                        ? "best-score-cell"
                        : "text-white"
                    }`}
                  >
                    {values[i] !== null
                      ? isPoints
                        ? formatPoints(values[i] as number)
                        : values[i]
                      : "—"}
                  </td>
                ))}
              </tr>
            );
          })}

          {/* Average Row */}
          <tr className="border-t-2 border-white/10">
            <td className="text-left pl-4 text-xs font-bold text-[#00E5FF]">
              평균
            </td>
            {averages.map((avg, i) => (
              <td
                key={PLAYERS[i].name}
                className={`stat-number text-[#00E5FF] font-bold`}
              >
                {avg !== null
                  ? isPoints
                    ? formatPoints(avg)
                    : avg.toFixed(1)
                  : "—"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
