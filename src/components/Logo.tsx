"use client";

export default function Logo() {
  const rings = [
    { color: "#0081C8", left: 0 },
    { color: "#FCB131", left: 14 },
    { color: "#333333", left: 28 },
    { color: "#00A651", left: 42 },
    { color: "#EE334E", left: 56 },
  ];

  return (
    <div className="flex flex-col items-center gap-2 py-6 relative">
      {/* Olympic Rings – subtle background */}
      <div className="flex items-center gap-[-4px] mb-1">
        {rings.map((ring, i) => (
          <div
            key={i}
            className="olympic-ring"
            style={{
              borderColor: ring.color,
              marginLeft: i > 0 ? "-4px" : 0,
            }}
          />
        ))}
      </div>

      {/* Main Logo */}
      <h1
        className="text-5xl md:text-6xl font-display tracking-tight metallic-text select-none"
        style={{
          textShadow: "0 2px 20px rgba(0, 229, 255, 0.3)",
          transform: "perspective(500px) rotateX(2deg)",
        }}
      >
        오륜기파
      </h1>

      {/* Subtitle */}
      <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-white/40 font-medium uppercase">
        <span className="w-8 h-px bg-gradient-to-r from-transparent to-white/20" />
        <span>━ SEASON 2026 ━</span>
        <span className="w-8 h-px bg-gradient-to-l from-transparent to-white/20" />
      </div>
    </div>
  );
}
