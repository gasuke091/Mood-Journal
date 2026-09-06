import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Smile,
  Filter,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { InteractionRecord, MoodData, AVAILABLE_MOODS } from '../lib/firebase';

interface EmotionalTrendsTrackerProps {
  history: InteractionRecord[];
  activeMoodFilter: string | null;
  onSelectMoodFilter: (moodId: string | null) => void;
  onSelectEntry?: (entry: InteractionRecord) => void;
}

export const EmotionalTrendsTracker: React.FC<EmotionalTrendsTrackerProps> = ({
  history,
  activeMoodFilter,
  onSelectMoodFilter,
  onSelectEntry,
}) => {
  // Extract all entries that have a mood recorded
  const entriesWithMood = useMemo(() => {
    return history.filter((item) => item.mood && typeof item.mood === 'object');
  }, [history]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (entriesWithMood.length === 0) {
      return {
        count: 0,
        avgValence: 0,
        trendDirection: 'neutral' as const,
        trendDelta: 0,
        topMood: null as MoodData | null,
        distribution: {} as Record<string, number>,
      };
    }

    const distribution: Record<string, number> = {};
    let totalValence = 0;

    entriesWithMood.forEach((item) => {
      const m = item.mood!;
      distribution[m.id] = (distribution[m.id] || 0) + 1;
      totalValence += typeof m.valence === 'number' ? m.valence : 0;
    });

    const avgValence = totalValence / entriesWithMood.length;

    // Find most frequent mood
    let topMoodId = '';
    let maxCount = 0;
    Object.entries(distribution).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topMoodId = id;
      }
    });
    const topMood = AVAILABLE_MOODS.find((m) => m.id === topMoodId) || null;

    // Trend comparison: compare latest 50% against older 50%
    let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
    let trendDelta = 0;
    if (entriesWithMood.length >= 2) {
      const half = Math.floor(entriesWithMood.length / 2);
      const recentValence =
        entriesWithMood.slice(0, half).reduce((acc, curr) => acc + (curr.mood?.valence || 0), 0) / half;
      const olderValence =
        entriesWithMood.slice(half).reduce((acc, curr) => acc + (curr.mood?.valence || 0), 0) / (entriesWithMood.length - half);

      trendDelta = recentValence - olderValence;
      if (trendDelta > 0.3) trendDirection = 'up';
      else if (trendDelta < -0.3) trendDirection = 'down';
    }

    return {
      count: entriesWithMood.length,
      avgValence,
      trendDirection,
      trendDelta,
      topMood,
      distribution,
    };
  }, [entriesWithMood]);

  // Chronological list of recent mood points for timeline graph
  const timelinePoints = useMemo(() => {
    const subset = [...entriesWithMood].slice(0, 12).reverse();
    return subset.map((item, idx) => ({
      index: idx,
      record: item,
      mood: item.mood!,
      dateStr: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      valence: item.mood!.valence,
    }));
  }, [entriesWithMood]);

  const getValenceDescriptor = (val: number) => {
    if (val >= 1.2) return { text: 'Elevated & Uplifted', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40' };
    if (val >= 0.4) return { text: 'Grounded & Positive', color: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40' };
    if (val >= -0.4) return { text: 'Balanced & Reflective', color: 'text-slate-300 bg-slate-800/80 border-slate-700' };
    if (val >= -1.2) return { text: 'Navigating Stress', color: 'text-amber-300 bg-amber-950/60 border-amber-500/40' };
    return { text: 'Experiencing Strain', color: 'text-rose-300 bg-rose-950/60 border-rose-500/40' };
  };

  const valenceDesc = getValenceDescriptor(stats.avgValence);

  return (
    <div
      id="emotional-trends-tracker"
      className="bg-[#0c1427]/80 rounded-2xl border border-slate-800/80 p-5 shadow-lg backdrop-blur-md space-y-4 text-slate-200"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Emotional Trends &amp; Mood Trajectory
            </h3>
            <p className="text-[11px] text-slate-400">
              {stats.count > 0
                ? `${stats.count} mood-tagged ${stats.count === 1 ? 'reflection' : 'reflections'} recorded`
                : 'Tag how you feel when writing reflections to uncover emotional patterns over time'}
            </p>
          </div>
        </div>

        {activeMoodFilter && (
          <button
            id="btn-clear-active-mood-filter"
            type="button"
            onClick={() => onSelectMoodFilter(null)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Filter className="w-3 h-3 text-cyan-400" />
            <span>Reset Mood Filter</span>
          </button>
        )}
      </div>

      {stats.count === 0 ? (
        <div
          id="mood-empty-state"
          className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center space-y-2"
        >
          <Smile className="w-6 h-6 text-slate-500 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">No emotional mood tags logged yet</p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
            Select how you are feeling (e.g. 😌 Peaceful, 💡 Inspired, 😊 Joyful) before submitting a reflection to plot your trajectory.
          </p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Average State */}
            <div id="stat-avg-valence" className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Average Emotional Tone
              </span>
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${valenceDesc.color}`}>
                  {valenceDesc.text}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                Score: {stats.avgValence > 0 ? `+${stats.avgValence.toFixed(1)}` : stats.avgValence.toFixed(1)} (scale -2 to +2)
              </span>
            </div>

            {/* Dominant Feeling */}
            <div id="stat-top-mood" className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Dominant Mood
              </span>
              {stats.topMood ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{stats.topMood.emoji}</span>
                  <span className="text-xs font-bold text-white">{stats.topMood.label}</span>
                  <span className="text-[10px] text-slate-400">
                    ({stats.distribution[stats.topMood.id]}x)
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Varied</span>
              )}
              <span className="text-[10px] text-slate-500 mt-1.5 block">
                Most frequent state across journal
              </span>
            </div>

            {/* Trajectory */}
            <div id="stat-trend-direction" className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Recent Trajectory
              </span>
              <div className="flex items-center gap-1.5">
                {stats.trendDirection === 'up' && (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">Shifting Positively</span>
                  </>
                )}
                {stats.trendDirection === 'down' && (
                  <>
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">Processing Challenges</span>
                  </>
                )}
                {stats.trendDirection === 'neutral' && (
                  <>
                    <Minus className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-300">Steady &amp; Centered</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 block">
                Recent vs. historical trend
              </span>
            </div>
          </div>

          {/* Chronological Sparkline Timeline */}
          {timelinePoints.length > 1 && (
            <div id="mood-sparkline-card" className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Emotional Trajectory Timeline (Recent Reflections)
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  Older &rarr; Newest
                </span>
              </div>

              <div className="relative pt-3 pb-2 px-2">
                {/* Horizontal baseline */}
                <div className="absolute top-1/2 left-2 right-2 h-px bg-slate-800 -translate-y-1/2 z-0" />

                <div className="relative z-10 flex items-center justify-between gap-1 overflow-x-auto">
                  {timelinePoints.map((point) => {
                    const isFiltered = activeMoodFilter === point.mood.id;
                    return (
                      <button
                        key={`${point.record.id}-${point.index}`}
                        type="button"
                        onClick={() => onSelectEntry && onSelectEntry(point.record)}
                        className={`group flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all hover:scale-110 cursor-pointer ${
                          isFiltered
                            ? 'bg-cyan-500/20 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                            : 'hover:bg-slate-800'
                        }`}
                        title={`${point.dateStr}: ${point.mood.emoji} ${point.mood.label} - Click to view entry`}
                      >
                        <span className="text-base leading-none group-hover:scale-125 transition-transform">
                          {point.mood.emoji}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400 group-hover:text-cyan-300 whitespace-nowrap">
                          {point.dateStr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Mood Distribution Filter Chips */}
          <div id="mood-distribution-chips" className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Filter Entries by Mood:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {AVAILABLE_MOODS.map((m) => {
                const count = stats.distribution[m.id] || 0;
                if (count === 0 && !activeMoodFilter) return null;
                const isSelected = activeMoodFilter === m.id;

                return (
                  <button
                    key={m.id}
                    id={`btn-filter-mood-${m.id}`}
                    type="button"
                    onClick={() => onSelectMoodFilter(isSelected ? null : m.id)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                      {count}
                    </span>
                  </button>
                );
              })}

              {activeMoodFilter && (
                <button
                  type="button"
                  onClick={() => onSelectMoodFilter(null)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Show all moods
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
