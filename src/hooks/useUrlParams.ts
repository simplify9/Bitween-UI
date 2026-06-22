import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useUrlParams = <T extends Record<string, any>>(
  defaultValues: T,
  excludeKeys: (keyof T)[] = []
): [T, (newParams: Partial<T>) => void, () => void] => {
  const location = useLocation();
  const navigate = useNavigate();

  const parseUrlParams = useCallback(
    (search: string): T => {
      const searchParams = new URLSearchParams(search);
      const params = { ...defaultValues };

      Object.keys(defaultValues).forEach((key) => {
        if (excludeKeys.includes(key)) return;

        const value = searchParams.get(key);
        if (value !== null) {
          const defaultValue = defaultValues[key];

          // Type conversion based on default value type
          if (typeof defaultValue === 'number') {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
              (params as any)[key] = numValue;
            }
          } else if (typeof defaultValue === 'boolean') {
            (params as any)[key] = value === 'true';
          } else if (typeof defaultValue === 'string' || defaultValue === undefined) {
            (params as any)[key] = value;
          } else if (defaultValue === null) {
            // For nullable fields, infer primitive value from URL text.
            if (value === 'true' || value === 'false') {
              (params as any)[key] = value === 'true';
            } else {
              const numValue = Number(value);
              if (!isNaN(numValue) && value.trim() !== '') {
                (params as any)[key] = numValue;
              } else {
                (params as any)[key] = value;
              }
            }
          }
        }
      });

      return params;
    },
    [defaultValues, excludeKeys]
  );

  const [params, setParams] = useState<T>(() => parseUrlParams(location.search));

  // Tracks whether the next location.search change was triggered by us.
  // Prevents the useEffect below from overwriting the already-correct state
  // (and causing a cursor jump) after our own navigate() call.
  const selfNavigateRef = useRef(false);

  // Sync state FROM the URL only for external navigation (back/forward, direct links).
  useEffect(() => {
    if (selfNavigateRef.current) {
      selfNavigateRef.current = false;
      return;
    }
    setParams(parseUrlParams(location.search));
  }, [location.search]);

  const updateUrlParams = useCallback(
    (newParams: Partial<T>) => {
      const searchParams = new URLSearchParams(location.search);

      Object.entries(newParams).forEach(([key, value]) => {
        if (excludeKeys.includes(key)) return;

        if (value !== undefined && value !== null && value !== '') {
          // Don't add default values to URL to keep it clean
          const defaultValue = defaultValues[key];
          if (value !== defaultValue) {
            searchParams.set(key, String(value));
          } else {
            searchParams.delete(key);
          }
        } else {
          searchParams.delete(key);
        }
      });

      const newSearch = searchParams.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;

      // Update state immediately so the input receives its own typed value on
      // the very next render — before React Router's navigate() has settled.
      // This is what prevents the cursor from jumping to the end.
      setParams(parseUrlParams(newSearch ? `?${newSearch}` : ''));
      selfNavigateRef.current = true;
      navigate(newUrl, { replace: true });
    },
    [location.pathname, location.search, navigate, defaultValues, excludeKeys, parseUrlParams]
  );

  const clearUrlParams = useCallback(() => {
    setParams({ ...defaultValues });
    selfNavigateRef.current = true;
    navigate(location.pathname, { replace: true });
  }, [location.pathname, navigate, defaultValues]);

  return [params, updateUrlParams, clearUrlParams];
};
