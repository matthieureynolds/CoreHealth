import { useEffect, useRef, useState } from 'react';
import { startTiming, endTiming } from '../utils/performance';
import { logDebug } from '../utils/logger';
import config from '../config/environment';

interface PerformanceMetrics {
  mountTime?: number;
  renderCount: number;
  lastRenderTime?: number;
  averageRenderTime?: number;
}

export function usePerformanceTracking(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
  });

  const mountTimeRef = useRef<number>(0);
  const renderTimesRef = useRef<number[]>([]);
  const renderStartRef = useRef<number>(0);
  const isEnabled = config.features.debugMode || config.env === 'development';
  const mountTimingName = `${componentName}-mount`;

  // Track component mount
  useEffect(() => {
    if (!isEnabled) return;

    const mountStart = Date.now();
    mountTimeRef.current = mountStart;
    startTiming(mountTimingName);

    return () => {
      const mountTime = endTiming(mountTimingName, 500);
      if (mountTime) {
        logDebug(`Component ${componentName} total lifecycle: ${mountTime}ms`);
      }
    };
  }, [componentName, isEnabled, mountTimingName]);

  // Track renders
  useEffect(() => {
    if (!isEnabled) return;

    const renderEnd = Date.now();
    if (renderStartRef.current) {
      const renderTime = renderEnd - renderStartRef.current;
      renderTimesRef.current.push(renderTime);

      // Keep only last 10 render times for average
      if (renderTimesRef.current.length > 10) {
        renderTimesRef.current.shift();
      }

      const averageRenderTime =
        renderTimesRef.current.reduce((sum, time) => sum + time, 0) /
        renderTimesRef.current.length;

      setMetrics(prev => ({
        ...prev,
        renderCount: prev.renderCount + 1,
        lastRenderTime: renderTime,
        averageRenderTime: Math.round(averageRenderTime * 100) / 100,
      }));

      // Log slow renders
      if (renderTime > 100) {
        logDebug(`Slow render detected in ${componentName}: ${renderTime}ms`, {
          renderCount: metrics.renderCount + 1,
        });
      }
    }
  }, [isEnabled, componentName, metrics.renderCount]);

  // Start timing before each render
  if (isEnabled) {
    renderStartRef.current = Date.now();
  }

  return {
    metrics,
    isEnabled,
  };
}

// Hook for tracking specific operations within a component
export function useOperationTiming() {
  const isEnabled = config.features.debugMode || config.env === 'development';

  const timeOperation = async <T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: any,
  ): Promise<T> => {
    if (!isEnabled) {
      return await operation();
    }

    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;

      if (duration > 500) {
        logDebug(`Operation '${operationName}' took ${duration}ms`, metadata);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logDebug(`Operation '${operationName}' failed after ${duration}ms`, {
        ...metadata,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  return { timeOperation, isEnabled };
}

// Hook for tracking user interactions
export function useInteractionTracking() {
  const isEnabled = config.features.debugMode || config.env === 'development';

  const trackInteraction = (interactionType: string, metadata?: any) => {
    if (!isEnabled) return;

    logDebug(`User interaction: ${interactionType}`, {
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  };

  return { trackInteraction, isEnabled };
}
