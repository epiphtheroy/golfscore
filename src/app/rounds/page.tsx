"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import RoundInputModal from "@/components/RoundInputModal";
import Toast from "@/components/Toast";
import { useRounds } from "@/lib/useRounds";
import {
  PLAYERS,
  formatPoints,
  RoundWithScores,
  Round,
  Score,
} from "@/lib/data";

export default function RoundsPage() {
  const { rounds, editRound, removeRound } = useRounds();
  const [editTarget, setEditTarget] = useState<RoundWithScores | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Sort descending (newest first)
  const sortedRounds = [...rounds].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.round_no - a.round_no;
  });

  const handleEdit = (round: RoundWithScores) => {
    setEditTarget(round);
  };

  const handleEditSave = async (
    roundData: Omit<Round, "id">,
    scores: Omit<Score, "round_id">[]
  ) => {
    if (editTarget) {
      await editRound(editTarget.id, roundData, scores);
      setEditTarget(null);
      setToast(`R${String(roundData.round_no).padStart(2, "0")} 수정 완료 ✅`);
    }
  };

  const handleDelete = async (id: string) => {
    await removeRound(id);
    setDeleteTarget(null);
    setToast("기록이 삭제되었습니다");
  };

  const formatDate = (dateStr: string) => {
    return dateStr.replace(/-/g, ".");
  };

  return (
    <>
      <div className="main-content min-h-screen">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-white">기록</h1>
          <p className="text-sm text-white/40 mt-1">
            {rounds.length > 0
              ? `총 ${rounds.length}개의 라운드`
              : "아직 기록이 없습니다"}
          </p>
        </div>

        {/* Round Cards */}
        <div className="px-4 space-y-3 pb-4">
          {sortedRounds.map((round) => {
            // Find best (lowest) stroke in this round
            const minStrokes = Math.min(
              ...round.scores.map((s) => s.total_strokes)
            );

            return (
              <div key={round.id} className="glass-card overflow-hidden">
                {/* Card Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="stat-number text-sm text-[#00E5FF] font-bold">
                      R{String(round.round_no).padStart(2, "0")}
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-sm text-white/60">
                      {formatDate(round.date)}
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-sm text-white/60">
                      {round.course_name}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(round)}
                      className="text-xs text-white/30 hover:text-white/60 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setDeleteTarget(round.id)}
                      className="text-xs text-white/30 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* Score Table */}
                <table className="score-table">
                  <thead>
                    <tr>
                      <th className="text-left pl-4"></th>
                      <th>타수</th>
                      <th>퍼팅</th>
                      <th>버디</th>
                      <th>포인트</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLAYERS.map((player) => {
                      const score = round.scores.find(
                        (s) => s.player === player.name
                      );
                      if (!score) return null;
                      const isBestStroke =
                        score.total_strokes === minStrokes;

                      return (
                        <tr key={player.name}>
                          <td className="text-left pl-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-1 h-6 rounded-full"
                                style={{ background: player.color }}
                              />
                              <span className="text-sm font-semibold text-white/80">
                                {player.name}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`stat-number ${
                              isBestStroke
                                ? "best-score-cell"
                                : "text-white"
                            }`}
                          >
                            {score.total_strokes}
                          </td>
                          <td className="stat-number text-white/80">
                            {score.total_putts}
                          </td>
                          <td className="stat-number text-[#FFD54F]">
                            {score.birdies}
                          </td>
                          <td
                            className={`stat-number ${
                              score.game_points >= 0
                                ? "positive-points"
                                : "negative-points"
                            }`}
                          >
                            {formatPoints(score.game_points)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}

          {rounds.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-white/30 text-sm">
                아직 기록된 라운드가 없습니다
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Edit Modal */}
      {editTarget && (
        <RoundInputModal
          onSave={handleEditSave}
          onClose={() => setEditTarget(null)}
          editData={{
            id: editTarget.id,
            round: {
              round_no: editTarget.round_no,
              date: editTarget.date,
              course_name: editTarget.course_name,
            },
            scores: editTarget.scores.map((s) => ({
              player: s.player,
              total_strokes: s.total_strokes,
              total_putts: s.total_putts,
              birdies: s.birdies,
              game_points: s.game_points,
            })),
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="confirm-dialog">
          <div className="glass-card p-6 mx-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white text-center">
              기록 삭제
            </h3>
            <p className="text-sm text-white/60 text-center">
              이 라운드 기록을 삭제하시겠습니까?
              <br />
              삭제된 기록은 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white/80 font-semibold text-sm hover:bg-white/15 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/30 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
