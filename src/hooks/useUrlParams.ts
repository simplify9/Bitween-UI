import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useUrlParams = <T extends Record<string, any>>(
  defaultValues: T,
  excludeKeys: (keyof T)[] = []
): [T, (newParams: Partial<T>) => void, () => void] => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const parseUrlParams = useCallback((): T => {
    const searchParams = new URLSearchParams(location.search);
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
        }
      }
    });
    
    return params;
  }, [location.search]); 

  const [params, setParams] = useState<T>(() => parseUrlParams()); 

  useEffect(() => {
    setParams(parseUrlParams());
  }, [location.search]); 

  const updateUrlParams = useCallback((newParams: Partial<T>) => {
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
    
    navigate(newUrl, { replace: true });
  }, [location.pathname, location.search, navigate, defaultValues, excludeKeys]);

  const clearUrlParams = useCallback(() => {
    navigate(location.pathname, { replace: true });
  }, [location.pathname, navigate]);

  return [params, updateUrlParams, clearUrlParams];
};
