import React, { ReactNode } from 'react';
import { Smartphone, Monitor, ShieldAlert, Award, FileCode } from 'lucide-react';

interface DeviceFrameProps {
  children: ReactNode;
  isMobileView: boolean;
  onToggleView: () => void;
  onOpenKotlinCode: () => void;
  onOpenQuickSolutions: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  isMobileView,
  onToggleView,
  onOpenKotlinCode,
  onOpenQuickSolutions,
}) => {
  return (
    <div className="min-h-screen bg-[#111413] flex flex-col items-center justify-start text-[#E1E3DF]">
      {/* Top Engineer & Emulator Bar */}
      <header className="w-full bg-[#191C1B] border-b border-[#2D312E] py-2 px-3 md:px-6 flex items-center justify-between z-30 sticky top-0 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#006A60] to-[#70F6E3] flex items-center justify-center shadow-sm">
            <span className="text-stone-900 font-extrabold text-sm">AP</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white">AdiestraPet</h1>
              <span className="text-[10px] bg-[#005047] text-[#70F6E3] font-mono px-1.5 py-0.2 rounded font-semibold">
                Perú v2.4 (Android MD3)
              </span>
            </div>
            <p className="text-[11px] text-[#89938E] hidden sm:block">
              Adiestramiento canino con refuerzo positivo e IA multimodal
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuickSolutions}
            className="flex items-center gap-1.5 text-xs bg-[#2D312E] hover:bg-[#3F4945] text-amber-300 px-2.5 py-1.5 rounded-lg font-medium transition"
            title="Biblioteca de Soluciones Rápidas"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SOS Conducta</span>
          </button>

          <button
            onClick={onOpenKotlinCode}
            className="flex items-center gap-1.5 text-xs bg-[#24322E] hover:bg-[#2C3E39] text-[#70F6E3] border border-[#006A60]/40 px-2.5 py-1.5 rounded-lg font-medium transition"
            title="Ver Arquitectura Kotlin + Jetpack Compose"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Código Android (Kotlin)</span>
          </button>

          <button
            onClick={onToggleView}
            className="flex items-center gap-1.5 text-xs bg-[#006A60] hover:bg-[#008779] text-white px-2.5 py-1.5 rounded-lg font-medium transition shadow-sm"
            title="Alternar entre vista de teléfono Pixel 8 y pantalla completa"
          >
            {isMobileView ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Expandir Pantalla</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Modo Pixel 8</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex items-center justify-center p-0 md:p-4">
        {isMobileView ? (
          <div className="relative w-full max-w-[420px] h-[870px] max-h-[96vh] bg-[#191C1B] rounded-[36px] border-[10px] border-[#2D312E] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
            {/* Front Camera Punch-hole */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#111413] border border-[#2D312E] z-40 pointer-events-none flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1b232a]/80"></div>
            </div>

            {/* Inner App Screen */}
            <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#191C1B]">
              {children}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl min-h-[85vh] bg-[#191C1B] md:rounded-2xl md:border md:border-[#2D312E] shadow-xl flex flex-col overflow-hidden">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
