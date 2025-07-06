import { useCallback, useEffect, useRef, useState } from 'react';
import { logError, logWarn } from '../utils/logger';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface AsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

export function useSafeAsync<T>(options: AsyncOptions = {}) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>, context = 'async operation') => {
      if (!isMountedRef.current) {
        logWarn('Attempted to execute async operation on unmounted component', {
          context,
        });
        return;
      }

      setState({ data: null, loading: true, error: null });
      retryCountRef.current = 0;

      const executeWithRetry = async (): Promise<void> => {
        try {
          const result = await asyncFunction();

          if (isMountedRef.current) {
            setState({ data: result, loading: false, error: null });
            options.onSuccess?.(result);
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));

          if (!isMountedRef.current) {
            logWarn('Async operation completed after component unmounted', {
              context,
              error: err.message,
            });
            return;
          }

          const shouldRetry =
            options.retryAttempts &&
            retryCountRef.current < options.retryAttempts;

          if (shouldRetry) {
            retryCountRef.current++;
            logWarn(
              `Retrying async operation (attempt ${retryCountRef.current}/${options.retryAttempts})`,
              { context, error: err.message },
            );

            globalThis.setTimeout(() => {
              if (isMountedRef.current) {
                executeWithRetry();
              }
            }, options.retryDelay || 1000);
          } else {
            logError(`Async operation failed: ${context}`, err);
            setState({ data: null, loading: false, error: err });
            options.onError?.(err);
          }
        }
      };

      await executeWithRetry();
    },
    [options],
  );

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState({ data: null, loading: false, error: null });
      retryCountRef.current = 0;
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: !state.loading && !state.data && !state.error,
  };
}

// Convenience hook for API calls
export function useSafeApiCall<T>(options: AsyncOptions = {}) {
  return useSafeAsync<T>({
    retryAttempts: 2,
    retryDelay: 1500,
    ...options,
  });
}

// Hook for operations that should not retry
export function useSafeAsyncNoRetry<T>(
  options: Omit<AsyncOptions, 'retryAttempts' | 'retryDelay'> = {},
) {
  return useSafeAsync<T>(options);
}
