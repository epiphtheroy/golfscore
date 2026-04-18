"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  PLAYERS,
  PlayerName,
  Round,
  Score,
  getNextRoundNo,
  getUsedCourseNames,
  TOTAL_ROUNDS,
} from "@/lib/data";

interface RoundInputModalProps {
  onSave: (roundData: Omit<Round, "id">, scores: Omit<Score, "round_id">[]) => void;
  onClose: () => void;
  editData?: {
    id: string;
    round: Omit<Round, "id">;
    scores: Omit<Score, "round_id">[];
  };
}

export default function RoundInputModal({
  onSave,
  onClose,
  editData,
}: RoundInputModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [roundNo, setRoundNo] = useState(editData?.round.round_no ?? 1);
  const [date, setDate] = useState(editData?.round.date ?? today);
  const [courseName, setCourseName] = useState(editData?.round.course_name ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // 4 players x 4 stats = 16 inputs
  const [scores, setScores] = useState<Record<PlayerName, { strokes: string; putts: string; birdies: string; points: string }>>(() => {
    const initial: Record<string, { strokes: string; putts: string; birdies: string; points: string }> = {};
    PLAYERS.forEach((p) => {
      const existing = editData?.scores.find((s) => s.player === p.name);
      initial[p.name] = {
        strokes: existing ? String(existing.total_strokes) : "",
        putts: existing ? String(existing.total_putts) : "",
        birdies: existing ? String(existing.birdies) : "",
        points: existing ? String(existing.game_points) : "",
      };
    });
    return initial as Record<PlayerName, { strokes: string; putts: string; birdies: string; points: string }>;
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Load async data
    (async () => {
      if (!editData) {
        const nextNo = await getNextRoundNo();
        setRoundNo(nextNo);
      }
      const names = await getUsedCourseNames();
      setSuggestions(names);
    })();
  }, [editData]);

  const handleScoreChange = (
    player: PlayerName,
    field: "strokes" | "putts" | "birdies" | "points",
    value: string
  ) => {
    if (field === "points") {
      if (value !== "" && value !== "-" && isNaN(Number(value))) return;
    } else {
      if (value !== "" && (isNaN(Number(value)) || Number(value) < 0)) return;
    }
    setScores((prev) => ({
      ...prev,
      [player]: { ...prev[player], [field]: value },
    }));
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      const next = inputRefs.current[index + 1];
      if (next) next.focus();
    }
  };

  const isComplete = useCallback(() => {
    if (!courseName.trim()) return false;
    return PLAYERS.every((p) => {
      const s = scores[p.name];
      return (
        s.strokes !== "" &&
        s.putts !== "" &&
        s.birdies !== "" &&
        s.points !== "" &&
        s.points !== "-"
      );
    });
  }, [courseName, scores]);

  const handleSave = async () => {
    if (!isComplete() || saving) return;
    setSaving(true);
    const roundData: Omit<Round, "id"> = {
      round_no: roundNo,
      date,
      course_name: courseName.trim(),
    };
    const scoreData: Omit<Score, "round_id">[] = PLAYERS.map((p) => ({
      player: p.name,
      total_strokes: Number(scores[p.name].strokes),
      total_putts: Number(scores[p.name].putts),
      birdies: Number(scores[p.name].birdies),
      game_points: Number(scores[p.name].points),
    }));
    onSave(roundData, scoreData);
  };

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(courseName.toLowerCase()) && courseName.length > 0
  );

  let inputIndex = 0;

  return (
    <div className="modal-overlay">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/10"
        style={{ background: "rgba(15, 20, 25, 0.98)" }}
      >
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white text-sm font-medium px-2 py-1"
        >
          ✕ 닫기
        </button>
        <h2 className="text-base font-bold text-white">
          {editData ? "라운드 수정" : "새 라운드 입력"}
        </h2>
        <div className="w-12" />
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto px-4 py-5 space-y-5"
        style={{ background: "var(--background)" }}
      >
        {/* Round Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            회차
          </label>
          <select
            value={roundNo}
            onChange={(e) => setRoundNo(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-semibold focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
          >
            {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n} className="bg-[#1A1F2E] text-white">
                R{String(n).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            날짜
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
          />
        </div>

        {/* Course Name */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            골프장명
          </label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => {
              setCourseName(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="예: 레이크사이드CC"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-[#1A1F2E] border border-white/10 overflow-hidden z-10 shadow-xl">
              {filteredSuggestions.map((s) => (
                <button
                  key={s}
                  className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors"
                  onMouseDown={() => {
                    setCourseName(s);
                    setShowSuggestions(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Score Grid */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            스코어 입력
          </label>

          <div className="glass-card overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-5 text-center text-xs font-semibold text-white/40 py-2.5 border-b border-white/5 bg-white/[0.02]">
              <div></div>
              <div>타수</div>
              <div>퍼팅</div>
              <div>버디</div>
              <div>포인트</div>
            </div>

            {/* Player Rows */}
            {PLAYERS.map((player) => {
              const fields = ["strokes", "putts", "birdies", "points"] as const;
              return (
                <div
                  key={player.name}
                  className="grid grid-cols-5 items-center border-b border-white/5 last:border-b-0"
                >
                  <div className="flex items-center gap-2 px-3 py-3">
                    <div
                      className="w-1 h-8 rounded-full"
                      style={{ background: player.color }}
                    />
                    <span className="text-sm font-semibold text-white/90">
                      {player.name}
                    </span>
                  </div>

                  {fields.map((field) => {
                    const idx = inputIndex++;
                    return (
                      <div key={field} className="px-1 py-2">
                        <input
                          ref={(el) => { inputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          value={scores[player.name][field]}
                          onChange={(e) =>
                            handleScoreChange(player.name, field, e.target.value)
                          }
                          onKeyDown={(e) => handleInputKeyDown(e, idx)}
                          placeholder={field === "points" ? "±" : "0"}
                          className="w-full text-center py-2 rounded-lg bg-white/5 border border-white/10 text-white stat-number text-base placeholder:text-white/15 focus:outline-none focus:border-[#00E5FF]/50 focus:bg-white/[0.08] transition-all"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div
        className="px-4 py-4 border-t border-white/10"
        style={{
          background: "rgba(15, 20, 25, 0.98)",
          paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <button
          onClick={handleSave}
          disabled={!isComplete() || saving}
          className={`w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 ${
            isComplete() && !saving
              ? "bg-gradient-to-r from-[#00E5FF] to-[#0091EA] text-[#0F1419] shadow-lg shadow-[#00E5FF]/20 active:scale-[0.98]"
              : "bg-white/5 text-white/20 cursor-not-allowed"
          }`}
        >
          {saving
            ? "저장 중..."
            : editData
            ? "수정 완료"
            : `R${String(roundNo).padStart(2, "0")} 기록 저장`}
        </button>
      </div>
    </div>
  );
}
