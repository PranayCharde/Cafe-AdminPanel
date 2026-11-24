import React, { useState, useEffect } from "react";
import { socket } from "../lib/socket";
import { playKitchenChime } from "../lib/audio";
import { Volume2, VolumeX, RefreshCw, Clock } from "lucide-react";

export function Header({ title, subtitle, onRefresh, soundEnabled, setSoundEnabled }) {
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      clearInterval(timer);
    };
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#ebdccd] px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      <div>
        <h2 className="font-display font-bold text-2xl text-[#2e241f] tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-[#786c65] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Real-time Socket Status */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            socketConnected
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              socketConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span>{socketConnected ? "Live Socket Active" : "Reconnecting..."}</span>
        </div>

        {/* Chime Sound Toggle */}
        {setSoundEnabled && (
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playKitchenChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
              soundEnabled
                ? "bg-[#faede3] text-[#b85c1f] border-[#f5d9c2] hover:bg-[#f5d9c2]"
                : "bg-stone-100 text-[#786c65] border-stone-200 hover:bg-stone-200"
            }`}
            title={soundEnabled ? "Audio chime active" : "Audio chime muted"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#b85c1f]" />
                <span>Chime ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                <span>Muted</span>
              </>
            )}
          </button>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl text-[#786c65] hover:text-[#2e241f] hover:bg-[#f5efe6] border border-[#ebdccd] transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Live Clock */}
        <span className="hidden md:inline-flex items-center gap-1.5 font-mono text-xs text-[#786c65] bg-[#f5efe6] px-3 py-1 rounded-xl border border-[#ebdccd]">
          <Clock className="w-3.5 h-3.5 text-[#b85c1f]" />
          {currentTime}
        </span>
      </div>
    </header>
  );
}

export default Header;
