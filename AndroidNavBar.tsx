import React from 'react';
import { Home, GraduationCap, Sparkles, TrendingUp, User } from 'lucide-react';

export type NavTab = 'inicio' | 'entrenamiento' | 'diagnostico' | 'progreso' | 'perfil';

interface AndroidNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasDiagnosisBadge?: boolean;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  currentTab,
  onSelectTab,
  hasDiagnosisBadge,
}) => {
  const tabs = [
    {
      id: 'inicio' as NavTab,
      label: 'Inicio',
      icon: Home,
    },
    {
      id: 'entrenamiento' as NavTab,
      label: 'Guía Canina',
      icon: GraduationCap,
    },
    {
      id: 'diagnostico' as NavTab,
      label: 'IA Etólogo',
      icon: Sparkles,
      highlight: true,
      badge: hasDiagnosisBadge ? 'WOW' : undefined,
    },
    {
      id: 'progreso' as NavTab,
      label: 'Progreso',
      icon: TrendingUp,
    },
    {
      id: 'perfil' as NavTab,
      label: 'Perfil',
      icon: User,
    },
  ];

  return (
    <nav className="w-full bg-[#1F2321] border-t border-[#2D312E] select-none py-1.5 px-2 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="group flex flex-col items-center justify-center flex-1 py-1 focus:outline-none relative transition-all"
            >
              {/* MD3 Active Indicator Pill */}
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? tab.highlight
                      ? 'bg-gradient-to-r from-[#006A60] to-[#008779] text-white shadow-md shadow-[#006A60]/30 scale-105'
                      : 'bg-[#354B45] text-[#70F6E3]'
                    : 'text-[#89938E] hover:text-[#C4C7C5]'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />

                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 font-extrabold text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Tab label */}
              <span
                className={`text-[11px] mt-1 transition-colors ${
                  isActive
                    ? tab.highlight
                      ? 'text-[#70F6E3] font-bold'
                      : 'text-[#E1E3DF] font-semibold'
                    : 'text-[#89938E] font-normal group-hover:text-[#BFC9C3]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Android Gesture Bar */}
      <div className="w-32 h-1 bg-[#4E5450] rounded-full mx-auto mt-2"></div>
    </nav>
  );
};
