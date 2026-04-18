"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import BottomNav from "@/components/BottomNav";
import RoundInputModal from "@/components/RoundInputModal";
import Toast from "@/components/Toast";
import InstallPWA from "@/components/InstallPWA";
import { useRounds } from "@/lib/useRounds";
import {
  PlayerStats,
  getPlayerColor,
  getPlayerTargetStrokes,
  formatPoints,
  Round,
  Score,
} from "@/lib/data";

export default function HomePage() {
  const { stats, completedRounds, totalRounds, addRound, loading } = useRounds();
  const [showInput, setShowInput] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSave = async (
    roundData: Omit<Round, "id">,
    scores: Omit<Score, "round_id">[]
  ) => {
    await addRound(roundData, scores);
    setShowInput(false);
    setToast(
      `R${String(roundData.round_no).padStart(2, "0")} 기록 저장 완료 ✨`
    );
  };

  const hasData = !loading && stats.some((s) => s.roundsPlayed > 0);

  return (
    <>
      <div className="main-content min-h-screen">
        {/* (A) Hero */}
        <section className="pt-2 pb-4 px-4">
          <Logo />

          {/* Progress Badge */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="stat-number text-2xl text-[#00E5FF]">
                {completedRounds}
              </span>
              <span className="text-sm text-white/40 font-medium">
                / {totalRounds} ROUNDS
              </span>
            </div>
            <div className="w-48 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full progress-bar transition-all duration-700"
                style={{
                  width: `${(completedRounds / totalRounds) * 100}%`,
                }}
              />
            </div>
          </div>
        </section>

        {hasData ? (
          <>
            {/* (B) Cumulative Stats Table */}
            <section className="px-4 mb-5">
              <div className="glass-card overflow-hidden">
                <table className="score-table">
                  <thead>
                    <tr>
                      <th className="text-left pl-4">플레이어</th>
                      <th>
                        평균타수{" "}
                        <span className="text-[#00E5FF]">↓</span>
                      </th>
                      <th>
                        평균퍼팅{" "}
                        <span className="text-[#00E5FF]">↓</span>
                      </th>
                      <th>
                        누적버디{" "}
                        <span className="text-[#FFD54F]">↑</span>
                      </th>
                      <th>
                        누적포인트{" "}
                        <span className="text-[#FFD54F]">↑</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats
                      .filter((s) => s.roundsPlayed > 0)
                      .map((s) => (
                        <tr
                          key={s.player}
                          className={
                            s.rank === 1 ? "rank-1-highlight" : ""
                          }
                        >
                          <td className="text-left pl-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{
                                  background: getPlayerColor(s.player),
                                }}
                              />
                              <span className="text-white font-semibold text-sm">
                                {s.rank === 1 && "👑 "}
                                {s.player}
                              </span>
                            </div>
                          </td>
                          <td className="stat-number text-white">
                            {s.avgStrokes.toFixed(1)}
                          </td>
                          <td className="stat-number text-white/80">
                            {s.avgPutts.toFixed(1)}
                          </td>
                          <td className="stat-number text-[#FFD54F]">
                            {s.totalBirdies}
                          </td>
                          <td
                            className={`stat-number ${
                              s.totalPoints >= 0
                                ? "positive-points"
                                : "negative-points"
                            }`}
                          >
                            {formatPoints(s.totalPoints)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* (C) Player Cards */}
            <section className="px-4 mb-5">
              <div className="grid grid-cols-2 gap-3">
                {stats
                  .filter((s) => s.roundsPlayed > 0)
                  .map((s) => (
                    <PlayerCard key={s.player} stat={s} />
                  ))}
              </div>
            </section>

            {/* (E) Rules Section */}
            <section className="px-4 mb-6">
              <div className="glass-card p-4">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>📜</span> 시즌 룰
                </h3>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00E5FF] mt-0.5">•</span>
                    <span>퍼팅 스크라치게임 타당 1포인트</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00E5FF] mt-0.5">•</span>
                    <span>로컬룰 적용</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00E5FF] mt-0.5">•</span>
                    <span>타수/퍼팅수 카운트</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00E5FF] mt-0.5">•</span>
                    <span>노멀리건, 노터치</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FFD54F] mt-0.5">•</span>
                    <span>빠질경우 — 대타 세우기 또는 그린피 벌금</span>
                  </li>
                </ul>
              </div>
            </section>
          </>
        ) : loading ? (
          <section className="px-4 py-16 flex flex-col items-center gap-4">
            <div className="text-4xl animate-pulse">⛳</div>
            <p className="text-white/30 text-sm">불러오는 중...</p>
          </section>
        ) : (
          /* Empty State */
          <section className="px-4 py-16 flex flex-col items-center gap-4">
            <div className="text-6xl">⛳</div>
            <p className="text-white/40 text-center text-sm">
              아직 기록이 없습니다
            </p>
            <button
              onClick={() => setShowInput(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#0091EA] text-[#0F1419] font-bold text-sm shadow-lg shadow-[#00E5FF]/20 active:scale-95 transition-transform"
            >
              첫 라운드를 입력하세요 →
            </button>
          </section>
        )}

        {/* PWA Install Button */}
        <section className="px-4 mb-6">
          <InstallPWA />
        </section>
      </div>

      {/* (D) FAB */}
      {hasData && (
        <button
          className="fab-button"
          onClick={() => setShowInput(true)}
          aria-label="새 라운드 추가"
        >
          +
        </button>
      )}

      {/* Bottom Nav */}
      <BottomNav />

      {/* Input Modal */}
      {showInput && (
        <RoundInputModal
          onSave={handleSave}
          onClose={() => setShowInput(false)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}

// ─── Player Card ──────────────────────────────────────
function PlayerCard({ stat }: { stat: PlayerStats }) {
  const color = getPlayerColor(stat.player);
  const isFirst = stat.rank === 1;

  return (
    <div
      className={`glass-card overflow-hidden transition-all duration-300 ${
        isFirst ? "rank-1-highlight rank-1-glow" : ""
      }`}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: `${color}20` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: color }}
          />
          <span className="text-sm font-bold text-white">
            {stat.player}
            <span className="text-[10px] font-medium text-white/40 ml-1">({getPlayerTargetStrokes(stat.player)})</span>
          </span>
        </div>
        <span className="text-xs font-bold text-white/60">
          {isFirst ? "👑" : `${stat.rank}위`}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-1 p-3">
        <StatItem label="평균타수" value={stat.avgStrokes.toFixed(1)} />
        <StatItem label="평균퍼팅" value={stat.avgPutts.toFixed(1)} />
        <StatItem
          label="누적버디"
          value={String(stat.totalBirdies)}
          highlight
        />
        <StatItem
          label="누적포인트"
          value={formatPoints(stat.totalPoints)}
          positive={stat.totalPoints >= 0}
        />
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  highlight,
  positive,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="text-center py-1">
      <div
        className={`stat-number text-xl ${
          highlight
            ? "text-[#FFD54F]"
            : positive !== undefined
            ? positive
              ? "positive-points"
              : "negative-points"
            : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] text-white/30 mt-0.5 font-medium">{label}</div>
    </div>
  );
}
