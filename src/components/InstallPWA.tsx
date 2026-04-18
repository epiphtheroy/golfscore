"use client";

import { useState, useEffect } from "react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if iOS
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone: boolean }).standalone;

    if (isStandalone) return; // Already installed

    if (isIOSDevice) {
      setShowButton(true);
      return;
    }

    // Android / Desktop
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promptEvent = deferredPrompt as any;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setShowButton(false);
    }
    setDeferredPrompt(null);
  };

  if (!showButton) return null;

  return (
    <>
      <button
        onClick={handleInstall}
        className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.98] transition-all"
      >
        <span>📲</span>
        <span>홈 화면에 추가</span>
      </button>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div className="confirm-dialog" onClick={() => setShowIOSGuide(false)}>
          <div
            className="glass-card p-6 mx-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white text-center">
              홈 화면에 추가하기
            </h3>
            <div className="space-y-3 text-sm text-white/70">
              <p className="flex items-start gap-2">
                <span className="text-[#00E5FF] font-bold">1.</span>
                <span>
                  Safari 하단의{" "}
                  <span className="text-white font-semibold">공유 버튼</span>{" "}
                  (□↑) 을 탭하세요
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#00E5FF] font-bold">2.</span>
                <span>
                  <span className="text-white font-semibold">
                    &quot;홈 화면에 추가&quot;
                  </span>
                  를 선택하세요
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#00E5FF] font-bold">3.</span>
                <span>
                  <span className="text-white font-semibold">&quot;추가&quot;</span>를
                  탭하면 완료!
                </span>
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] font-semibold text-sm"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
