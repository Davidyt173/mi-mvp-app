import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Bell, Sparkles } from 'lucide-react';

interface AndroidStatusBarProps {
  appName?: string;
  isPremium?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ isPremium }) => {
  const [time, setTime] = useState<string>('18:42');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#191C1B] text-[#C4C7C5] px-4 py-1.5 flex items-center justify-between text-xs select-none border-b border-[#2D312E] tracking-tight">
      <div className="flex items-center gap-2 font-medium">
        <span>{time}</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#005047] text-[#70F6E3] font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#70F6E3] animate-pulse"></span>
          Lima, PE
        </span>
      </div>

      <div className="flex items-center gap-2 text-[#E1E3DF]">
        {isPremium ? (
          <span className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-[#006A60] to-[#008779] text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
            <Sparkles className="w-3 h-3 text-[#A3EEDF]" />
            PREMIUM
          </span>
        ) : (
          <span className="text-[10px] bg-[#3F4945]/60 text-[#BFC9C3] px-1.5 py-0.5 rounded">
            Plan Básico
          </span>
        )}
        <Bell className="w-3.5 h-3.5 text-[#89938E]" />
        <Wifi className="w-3.5 h-3.5 text-[#C4C7C5]" />
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono">92%</span>
          <BatteryMedium className="w-4 h-4 text-[#70F6E3]" />
        </div>
      </div>
    </div>
  );
};
