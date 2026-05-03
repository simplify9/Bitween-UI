import { useEffect, useRef, useState } from 'react';
import { useSubscriptionQuery } from 'src/client/apis/subscriptionsApi';
import {
  useMappingEditorDispatch,
  autoMatch,
  loadEditorContext,
} from './context/MappingEditorContext';

// Handles the two data-loading effects: clear-on-id-change and populate-on-data-arrive.
// Fully self-contained — callers get no return value.
export function useMappingEditorLoader(subscriptionId: number): void {
  const dispatch = useMappingEditorDispatch();
  const { data: subscriptionData } = useSubscriptionQuery(subscriptionId, {
    skip: !subscriptionId,
    refetchOnMountOrArgChange: true,
  });
  const [, setLoadedForId] = useState<number | null>(null);
  const pendingIdRef = useRef<number | null>(null);

  // Clear Redux state immediately when subscription changes
  useEffect(() => {
    pendingIdRef.current = subscriptionId || null;
    dispatch(loadEditorContext({ subscriptionId: subscriptionId || 0, mapperProperties: [] }));
    setLoadedForId(null);
  }, [subscriptionId]);

  // Populate state once the correct data arrives
  useEffect(() => {
    if (!subscriptionData || !pendingIdRef.current) return;
    if (pendingIdRef.current !== subscriptionId) return;
    dispatch(
      loadEditorContext({
        subscriptionId,
        mapperId: subscriptionData.mapperId,
        mapperProperties: subscriptionData.mapperProperties,
      })
    );
    dispatch(autoMatch());
    setLoadedForId(subscriptionId);
  }, [subscriptionData]);
}
