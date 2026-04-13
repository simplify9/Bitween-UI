import { useMemo } from 'react';
import { useGlobalAdapterValuesSetsQuery } from 'src/client/apis/globalAdapterValuesSetsApi';
import { ValuesSetMap } from 'src/utils/scribanGenerator';

/**
 * Fetches all global adapter values sets and returns them as a flat lookup map.
 * Shared by index.tsx (template generation on save) and LivePreview.tsx (preview generation).
 */
export function useValuesSetMap(): ValuesSetMap {
  const { data: setsData } = useGlobalAdapterValuesSetsQuery({ offset: 0, limit: 1000 });

  return useMemo(() => {
    const map: ValuesSetMap = {};
    for (const s of setsData?.result ?? []) {
      map[s.id] = s.values;
    }
    return map;
  }, [setsData]);
}
