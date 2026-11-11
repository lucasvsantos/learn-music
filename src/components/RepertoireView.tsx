import React, { useState, useMemo } from 'react';
import {
  Disc3,
  Plus,
  Search,
  Music,
  User,
  FolderKanban,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Gauge,
  Edit3,
  Trash2,
  SlidersHorizontal,
  Guitar,
  FileText,
  Youtube,
  Radio,
} from 'lucide-react';
import { RepertoireSong, SongStatus } from '../types/music';
import { SONG_STATUSES, GUITAR_TUNINGS } from '../data/initialData';

interface RepertoireViewProps {
  songs: RepertoireSong[];
  onAddSong: (
    song: Omit<RepertoireSong, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  onUpdateSong: (song: RepertoireSong) => void;
  onDeleteSong: (id: string) => void;
  onUpdateStatus: (id: string, status: SongStatus) => void;
  onSyncMetronomeBpm: (bpm: number) => void;
  onLoadSamples: () => void;
}

type GroupByOption = 'artist' | 'genre' | 'album' | 'status' | 'none';

const STATUS_BADGE_STYLES: Record<SongStatus, string> = {
  'Quero Aprender': 'bg-zinc-800 text-zinc-300 border-zinc-700',
  'Em Andamento': 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  'Aperfeiçoando / Solo': 'bg-purple-500/15 text-purple-300 border-purple-500/40',
  Concluído: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
};

export const RepertoireView: React.FC<RepertoireViewProps> = ({
  songs,
  onAddSong,
  onUpdateSong,
  onDeleteSong,
  onUpdateStatus,
  onSyncMetronomeBpm,
  onLoadSamples,
}) => {
  // Organization / Grouping & Filtering states
  const [groupBy, setGroupBy] = useState<GroupByOption>('artist');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [genreFilter, setGenreFilter] = useState<string>('Todos');
  const [artistFilter, setArtistFilter] = useState<string>('Todos');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<RepertoireSong | null>(null);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState<SongStatus>('Em Andamento');
  const [tuning, setTuning] = useState<string>(GUITAR_TUNINGS[0]);
  const [originalBpm, setOriginalBpm] = useState<number>(140);
  const [currentBpm, setCurrentBpm] = useState<number>(120);
  const [tabUrl, setTabUrl] = useState('');
  const [backingTrackUrl, setBackingTrackUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Extract unique genres and artists for filter dropdowns & datalist suggestions
  const uniqueGenres = useMemo(() => {
    const set = new Set<string>();
    songs.forEach((s) => {
      if (s.genre.trim()) set.add(s.genre.trim());
    });
    return Array.from(set).sort();
  }, [songs]);

  const uniqueArtists = useMemo(() => {
    const set = new Set<string>();
    songs.forEach((s) => {
      if (s.artist.trim()) set.add(s.artist.trim());
    });
    return Array.from(set).sort();
  }, [songs]);

  const uniqueAlbums = useMemo(() => {
    const set = new Set<string>();
    songs.forEach((s) => {
      if (s.album.trim()) set.add(s.album.trim());
    });
    return Array.from(set).sort();
  }, [songs]);

  const openCreateForm = () => {
    setEditingSong(null);
    setTitle('');
    setArtist('');
    setAlbum('');
    setGenre('');
    setStatus('Em Andamento');
    setTuning(GUITAR_TUNINGS[0]);
    setOriginalBpm(150);
    setCurrentBpm(125);
    setTabUrl('');
    setBackingTrackUrl('');
    setVideoUrl('');
    setNotes('');
    setIsFormOpen(true);
  };

  const openEditForm = (song: RepertoireSong) => {
    setEditingSong(song);
    setTitle(song.title);
    setArtist(song.artist);
    setAlbum(song.album);
    setGenre(song.genre);
    setStatus(song.status);
    setTuning(song.tuning || GUITAR_TUNINGS[0]);
    setOriginalBpm(song.originalBpm || 120);
    setCurrentBpm(song.currentBpm || 120);
    setTabUrl(song.tabUrl || '');
    setBackingTrackUrl(song.backingTrackUrl || '');
    setVideoUrl(song.videoUrl || '');
    setNotes(song.notes || '');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    const payload = {
      title: title.trim(),
      artist: artist.trim(),
      album: album.trim() || 'Single / Álbum Desconhecido',
      genre: genre.trim() || 'Rock / Metal',
      status,
      tuning: tuning.trim() || GUITAR_TUNINGS[0],
      originalBpm: Math.max(20, Number(originalBpm) || 120),
      currentBpm: Math.max(20, Number(currentBpm) || 120),
      tabUrl: tabUrl.trim() || undefined,
      backingTrackUrl: backingTrackUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      notes: notes.trim(),
    };

    if (editingSong) {
      onUpdateSong({
        ...editingSong,
        ...payload,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddSong(payload);
    }

    setIsFormOpen(false);
    setEditingSong(null);
  };

  // Filtered songs
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesStatus =
        statusFilter === 'Todos' || song.status === statusFilter;
      const matchesGenre =
        genreFilter === 'Todos' || song.genre === genreFilter;
      const matchesArtist =
        artistFilter === 'Todos' || song.artist === artistFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.album.toLowerCase().includes(q) ||
        song.genre.toLowerCase().includes(q) ||
        song.tuning.toLowerCase().includes(q) ||
        song.notes.toLowerCase().includes(q);

      return matchesStatus && matchesGenre && matchesArtist && matchesSearch;
    });
  }, [songs, statusFilter, genreFilter, artistFilter, searchQuery]);

  // Grouped songs
  const groupedSongs = useMemo(() => {
    if (groupBy === 'none') {
      return [{ groupTitle: 'Todas as Músicas', items: filteredSongs }];
    }

    const map = new Map<string, RepertoireSong[]>();

    filteredSongs.forEach((song) => {
      let key = '';
      if (groupBy === 'artist') key = song.artist || 'Sem Artista';
      else if (groupBy === 'genre') key = song.genre || 'Sem Gênero';
      else if (groupBy === 'album')
        key = `${song.album || 'Sem Álbum'} — ${song.artist}`;
      else if (groupBy === 'status') key = song.status;

      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(song);
    });

    const entries = Array.from(map.entries()).map(([groupTitle, items]) => ({
      groupTitle,
      items,
    }));

    if (groupBy !== 'status') {
      entries.sort((a, b) => a.groupTitle.localeCompare(b.groupTitle));
    }

    return entries;
  }, [filteredSongs, groupBy]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: songs.length,
      concluido: songs.filter((s) => s.status === 'Concluído').length,
      emAndamento: songs.filter(
        (s) =>
          s.status === 'Em Andamento' || s.status === 'Aperfeiçoando / Solo'
      ).length,
      queroAprender: songs.filter((s) => s.status === 'Quero Aprender').length,
    };
  }, [songs]);

  return (
    <div className="space-y-6">
      {/* REPERTOIRE SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block">Total no Repertório</span>
            <span className="text-2xl font-mono font-extrabold text-zinc-100">
              {stats.total}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
            <Disc3 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400/90 block">
              Concluídas / Tiradas
            </span>
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              {stats.concluido}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-400/90 block">
              Em Andamento / Solos
            </span>
            <span className="text-2xl font-mono font-extrabold text-amber-400">
              {stats.emAndamento}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block">Fila (Quero Aprender)</span>
            <span className="text-2xl font-mono font-extrabold text-zinc-300">
              {stats.queroAprender}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Music className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ORGANIZATION BAR: SEARCH, GROUP BY & FILTERS */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar música, banda (ex: Metallica), álbum, afinação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {songs.length === 0 && (
              <button
                type="button"
                onClick={onLoadSamples}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-4 h-4" />
                Carregar Repertório Exemplo
              </button>
            )}
            <button
              type="button"
              onClick={openCreateForm}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-amber-950/30 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Cadastrar Música
            </button>
          </div>
        </div>

        {/* Group By & Filter Selectors */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
          {/* Group By Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1 mr-1">
              <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
              Organizar por:
            </span>
            {(
              [
                { id: 'artist', label: 'Artista / Banda' },
                { id: 'genre', label: 'Gênero' },
                { id: 'album', label: 'Álbum' },
                { id: 'status', label: 'Status' },
                { id: 'none', label: 'Lista Direta' },
              ] as { id: GroupByOption; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setGroupBy(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                  groupBy === opt.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtros:
            </span>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Todos">Status: Todos</option>
              {SONG_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Todos">Gênero: Todos</option>
              {uniqueGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Todos">Artista: Todos</option>
              {uniqueArtists.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT SONG FORM */}
      {isFormOpen && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-zinc-900 border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-zinc-100">
              {editingSong ? 'Editar Música do Repertório' : 'Cadastrar Música no Repertório'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Nome da Música *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Master Of Puppets"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Artista / Banda *
              </label>
              <input
                type="text"
                required
                list="artists-datalist"
                placeholder="Ex: Metallica"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <datalist id="artists-datalist">
                {uniqueArtists.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Álbum
              </label>
              <input
                type="text"
                list="albums-datalist"
                placeholder="Ex: Master of Puppets"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <datalist id="albums-datalist">
                {uniqueAlbums.map((al) => (
                  <option key={al} value={al} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Gênero Musical
              </label>
              <input
                type="text"
                list="genres-datalist"
                placeholder="Ex: Thrash Metal, Heavy Metal..."
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <datalist id="genres-datalist">
                {uniqueGenres.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Status da Música *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SongStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                {SONG_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Afinação da Guitarra
              </label>
              <input
                type="text"
                list="tunings-datalist"
                value={tuning}
                onChange={(e) => setTuning(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <datalist id="tunings-datalist">
                {GUITAR_TUNINGS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                BPM Atual (Dominado)
              </label>
              <input
                type="number"
                min={20}
                max={320}
                value={currentBpm}
                onChange={(e) => setCurrentBpm(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                BPM Original da Gravação
              </label>
              <input
                type="number"
                min={20}
                max={320}
                value={originalBpm}
                onChange={(e) => setOriginalBpm(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Useful Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Link da Tablatura (Songsterr / UG / GP)
              </label>
              <input
                type="url"
                placeholder="https://www.songsterr.com/..."
                value={tabUrl}
                onChange={(e) => setTabUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Link de Backing Track
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/..."
                value={backingTrackUrl}
                onChange={(e) => setBackingTrackUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Link de Vídeo Aula / Referência
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Anotações Técnicas (Partes da música, solos, timbres, dicas)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Riffs em downpicking; solo no minuto 3:12 precisa limpar o sweep..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition"
            >
              {editingSong ? 'Salvar Alterações' : 'Adicionar ao Repertório'}
            </button>
          </div>
        </form>
      )}

      {/* REPERTOIRE GROUPS & CARDS */}
      {filteredSongs.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-amber-400">
            <Disc3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-200">
            {songs.length === 0
              ? 'Seu Repertório está vazio no LocalStorage'
              : 'Nenhuma música encontrada para este filtro'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Cadastre as músicas que você já tirou ou está estudando (ex: "Metallica
            - Master Of Puppets") e organize por artista, gênero, álbum e status.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={openCreateForm}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Primeira Música
            </button>
            {songs.length === 0 && (
              <button
                type="button"
                onClick={onLoadSamples}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 border border-zinc-700 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Carregar Exemplos (Metallica, Megadeth, etc.)
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedSongs.map((group) => {
            const completedInGroup = group.items.filter(
              (s) => s.status === 'Concluído'
            ).length;

            return (
              <div key={group.groupTitle} className="space-y-3">
                {/* Group Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 px-1">
                  <div className="flex items-center gap-2.5">
                    {groupBy === 'artist' && (
                      <User className="w-4 h-4 text-amber-400" />
                    )}
                    {groupBy === 'genre' && (
                      <Music className="w-4 h-4 text-amber-400" />
                    )}
                    {groupBy === 'album' && (
                      <Disc3 className="w-4 h-4 text-amber-400" />
                    )}
                    <h3 className="text-base font-bold text-zinc-100">
                      {group.groupTitle}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-800 text-zinc-300">
                      {group.items.length}{' '}
                      {group.items.length === 1 ? 'música' : 'músicas'}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-zinc-400">
                    {completedInGroup}/{group.items.length} concluídas
                  </span>
                </div>

                {/* Songs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((song) => {
                    const bpmPercent =
                      song.originalBpm > 0
                        ? Math.min(
                            100,
                            Math.round((song.currentBpm / song.originalBpm) * 100)
                          )
                        : 100;

                    return (
                      <div
                        key={song.id}
                        className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex flex-col justify-between gap-4 transition"
                      >
                        <div className="space-y-2.5">
                          {/* Top Row: Genre, Tuning & Status Dropdown */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/80">
                                {song.genre}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-zinc-950 text-amber-300/90 border border-zinc-800 flex items-center gap-1">
                                <Guitar className="w-3 h-3" />
                                {song.tuning}
                              </span>
                            </div>

                            {/* Quick Status Switcher */}
                            <select
                              value={song.status}
                              onChange={(e) =>
                                onUpdateStatus(
                                  song.id,
                                  e.target.value as SongStatus
                                )
                              }
                              className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none ${
                                STATUS_BADGE_STYLES[song.status]
                              }`}
                            >
                              {SONG_STATUSES.map((st) => (
                                <option
                                  key={st}
                                  value={st}
                                  className="bg-zinc-900 text-zinc-100"
                                >
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Song Title, Artist & Album */}
                          <div>
                            <h4 className="text-lg font-bold text-zinc-100 leading-snug">
                              {song.artist} — {song.title}
                            </h4>
                            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                              <Disc3 className="w-3.5 h-3.5 text-zinc-500" />
                              Álbum: <span className="text-zinc-300">{song.album}</span>
                            </p>
                          </div>

                          {/* Notes */}
                          {song.notes && (
                            <p className="text-xs text-zinc-400 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-2.5">
                              {song.notes}
                            </p>
                          )}

                          {/* BPM Progress Bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-zinc-400">
                                Velocidade:{' '}
                                <strong className="text-amber-400">
                                  {song.currentBpm} BPM
                                </strong>{' '}
                                / {song.originalBpm} BPM
                              </span>
                              <span
                                className={
                                  bpmPercent >= 100
                                    ? 'text-emerald-400 font-bold'
                                    : 'text-zinc-400'
                                }
                              >
                                {bpmPercent}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  bpmPercent >= 100
                                    ? 'bg-emerald-400'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${bpmPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Footer: External Links, Metronome Sync & Edit/Delete */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800/80 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => onSyncMetronomeBpm(song.currentBpm)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 transition"
                              title={`Carregar ${song.currentBpm} BPM no Metrônomo`}
                            >
                              <Gauge className="w-3.5 h-3.5" />
                              {song.currentBpm} BPM no Metrônomo
                            </button>

                            {song.tabUrl && (
                              <a
                                href={song.tabUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 transition"
                              >
                                <FileText className="w-3 h-3 text-amber-400" />
                                Tab
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            )}

                            {song.backingTrackUrl && (
                              <a
                                href={song.backingTrackUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 transition"
                              >
                                <Radio className="w-3 h-3 text-emerald-400" />
                                Backing
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            )}

                            {song.videoUrl && (
                              <a
                                href={song.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 transition"
                              >
                                <Youtube className="w-3 h-3 text-rose-400" />
                                Aula
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditForm(song)}
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                              title="Editar Música"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteSong(song.id)}
                              className="p-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950/50 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 transition"
                              title="Excluir Música"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
