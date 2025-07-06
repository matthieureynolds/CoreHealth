import React from 'react';
import { logPerformance, logWarn } from './logger';
import config from '../config/environment';

interface PerformanceEntry {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: any;
}

class PerformanceMonitor {
  private entries = new Map<string, PerformanceEntry>();
  private isEnabled = config.features.debugMode || config.env === 'development';

  // Start timing an operation
  startTiming(name: string, metadata?: any): void {
    if (!this.isEnabled) return;

    const entry: PerformanceEntry = {
      name,
      startTime: Date.now(),
      metadata,
    };

    this.entries.set(name, entry);
  }

  // End timing and log result
  endTiming(name: string, threshold = 1000): number | null {
    if (!this.isEnabled) return null;

    const entry = this.entries.get(name);
    if (!entry) {
      logWarn(`Performance timing '${name}' was ended but never started`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - entry.startTime;

    entry.endTime = endTime;
    entry.duration = duration;

    // Log if duration exceeds threshold
    if (duration > threshold) {
      logPerformance(name, duration, entry.metadata);
    }

    this.entries.delete(name);
    return duration;
  }

  // Measure a function execution time
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: any,
  ): Promise<T> {
    if (!this.isEnabled) {
      return await fn();
    }

    this.startTiming(name, metadata);
    try {
      const result = await fn();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  // Measure synchronous function execution time
  measureSync<T>(name: string, fn: () => T, metadata?: any): T {
    if (!this.isEnabled) {
      return fn();
    }

    this.startTiming(name, metadata);
    try {
      const result = fn();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  // Get current performance stats
  getStats(): Record<string, any> {
    if (!this.isEnabled) return {};

    const stats = {
      activeTimings: this.entries.size,
      activeOperations: Array.from(this.entries.keys()),
    };

    return stats;
  }

  // Clear all timings
  clear(): void {
    this.entries.clear();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const startTiming = (name: string, metadata?: any) =>
  performanceMonitor.startTiming(name, metadata);

export const endTiming = (name: string, threshold?: number) =>
  performanceMonitor.endTiming(name, threshold);

export const measureAsync = <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: any,
) => performanceMonitor.measureAsync(name, fn, metadata);

export const measureSync = <T>(name: string, fn: () => T, metadata?: any) =>
  performanceMonitor.measureSync(name, fn, metadata);

export const getPerformanceStats = () => performanceMonitor.getStats();

export const clearPerformanceTimings = () => performanceMonitor.clear();

// React component performance helpers
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
) => {
  if (!config.features.debugMode) {
    return Component;
  }

  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name;

    React.useEffect(() => {
      startTiming(`${name}-mount`);
      return () => {
        endTiming(`${name}-mount`, 500); // 500ms threshold for mount time
      };
    }, [name]);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceTracking(${
    componentName || Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

export default performanceMonitor;
