import { useState, useCallback } from 'react';
import { Clip, FilterState } from '../types';
import { getClips, deleteClip as dbDeleteClip } from '../lib/database';

export function useClips(initialFilter?: FilterState) {
  const [clips, setClips] = useState<Clip[]>(() => getClips(initialFilter));
  const [filter, setFilter] = useState<FilterState>(initialFilter ?? {});

  const refresh = useCallback((newFilter?: FilterState) => {
    const f = newFilter ?? filter;
    setClips(getClips(f));
  }, [filter]);

  const applyFilter = useCallback((newFilter: FilterState) => {
    setFilter(newFilter);
    setClips(getClips(newFilter));
  }, []);

  const removeClip = useCallback((id: string) => {
    dbDeleteClip(id);
    setClips((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { clips, filter, refresh, applyFilter, removeClip };
}
