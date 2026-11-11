import React from 'react';
import {
  Guitar,
  Dumbbell,
  Disc3,
  BookOpen,
  Download,
  Upload,
  Trash2,
  Sparkles,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export type ActiveTab = 'exercises' | 'repertoire' | 'theory';

interface SidebarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  isCollapsed: boolean; // Desktop: modo compacto (apenas ícones)
  onToggleCollapsed: () => void;
  isMobileOpen: boolean; // Mobile: gaveta aberta/fechada
  onCloseMobile: () => void;
  exercisesCount: number;
  songsCount: number;
  studyNotesCount: number;
  showLoadSamples: boolean;
  showClearStorage: boolean;
  onLoadSamples: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onClearStorage: () => void;
}

const NAV_ITEMS: {
  id: ActiveTab;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'exercises',
    label: 'Exercícios & Timer',
    description: 'Treino cronometrado e evolução de BPM',
    icon: Dumbbell,
  },
  {
    id: 'repertoire',
    label: 'Repertório',
    description: 'Músicas por artista, gênero e álbum',
    icon: Disc3,
  },
  {
    id: 'theory',
    label: 'Teoria & Harmonia',
    description: 'Escalas maiores e campos harmônicos',
    icon: BookOpen,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  isCollapsed,
  onToggleCollapsed,
  isMobileOpen,
  onCloseMobile,
  exercisesCount,
  songsCount,
  studyNotesCount,
  showLoadSamples,
  showClearStorage,
  onLoadSamples,
  onExportBackup,
  onImportBackup,
  onClearStorage,
}) => {
  const counts: Record<ActiveTab, number | null> = {
    exercises: exercisesCount,
    repertoire: songsCount,
    theory: studyNotesCount > 0 ? studyNotesCount : null,
  };

  // No mobile a gaveta sempre aparece expandida, independente do modo compacto
  const compact = isCollapsed && !isMobileOpen;

  const dataActionClass = `w-full flex items-center gap-3 rounded-xl border text-xs font-semibold transition ${
    compact ? 'justify-center p-2.5' : 'px-3 py-2'
  }`;

  return (
    <>
      {/* Overlay escuro do menu no mobile */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed top-0 left-0 bottom-0 z-[60] flex flex-col bg-zinc-950 border-r border-zinc-800/80 transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${compact ? 'lg:w-[76px]' : 'lg:w-64'} w-72`}
      >
        {/* Brand Logo */}
        <div
          className={`flex items-center gap-3 border-b border-zinc-800/80 h-16 shrink-0 ${
            compact ? 'justify-center px-2' : 'px-4'
          }`}
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20">
            <Guitar className="w-6 h-6 stroke-[2.2]" />
          </div>
          {!compact && (
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-extrabold tracking-tight text-zinc-100 leading-tight">
                GuitarLab <span className="text-amber-400">Studio</span>
              </h1>
              <p className="text-[10px] text-zinc-500 truncate">
                Prática • Metrônomo • Teoria
              </p>
            </div>
          )}
          {/* Fechar (apenas mobile) */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegação principal */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {!compact && (
            <span className="block px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Navegação
            </span>
          )}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            const count = counts[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChangeTab(item.id);
                  onCloseMobile();
                }}
                title={compact ? item.label : undefined}
                className={`relative w-full flex items-center gap-3 rounded-xl text-left transition ${
                  compact ? 'justify-center p-2.5' : 'px-3 py-2.5'
                } ${
                  active
                    ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-950/30'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!compact && (
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold truncate">{item.label}</div>
                    <div
                      className={`text-[10px] truncate ${
                        active ? 'text-zinc-900/80' : 'text-zinc-500'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                )}
                {count !== null &&
                  (compact ? (
                    <span
                      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-mono font-bold flex items-center justify-center ${
                        active
                          ? 'bg-zinc-950 text-amber-400'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {count}
                    </span>
                  ) : (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        active
                          ? 'bg-zinc-950/20 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {count}
                    </span>
                  ))}
              </button>
            );
          })}

          {/* Dados */}
          <div className="pt-5 space-y-1.5">
            {!compact ? (
              <span className="block px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Dados
              </span>
            ) : (
              <div className="border-t border-zinc-800/80 mx-2 mb-2" />
            )}

            {showLoadSamples && (
              <button
                type="button"
                onClick={onLoadSamples}
                title="Popular com exemplos de guitarra (Sweep, Downpicking, Metallica, Megadeth...)"
                className={`${dataActionClass} bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                {!compact && <span>Carregar Exemplos</span>}
              </button>
            )}

            <button
              type="button"
              onClick={onExportBackup}
              title="Exportar Backup JSON"
              className={`${dataActionClass} bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-amber-300`}
            >
              <Download className="w-4 h-4 shrink-0" />
              {!compact && <span>Exportar Backup</span>}
            </button>

            <button
              type="button"
              onClick={onImportBackup}
              title="Importar Backup JSON"
              className={`${dataActionClass} bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-amber-300`}
            >
              <Upload className="w-4 h-4 shrink-0" />
              {!compact && <span>Importar Backup</span>}
            </button>

            {showClearStorage && (
              <button
                type="button"
                onClick={onClearStorage}
                title="Apagar todos os dados"
                className={`${dataActionClass} bg-zinc-900 hover:bg-rose-950/50 border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400`}
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                {!compact && <span>Limpar Tudo</span>}
              </button>
            )}
          </div>
        </nav>

        {/* Recolher / Expandir (apenas desktop) */}
        <div className="hidden lg:block px-3 py-3 border-t border-zinc-800/80 shrink-0">
          <button
            type="button"
            onClick={onToggleCollapsed}
            title={compact ? 'Expandir menu' : 'Recolher menu'}
            className={`w-full flex items-center gap-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition ${
              compact ? 'justify-center p-2.5' : 'px-3 py-2'
            }`}
          >
            {compact ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4" />
                <span>Recolher menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
