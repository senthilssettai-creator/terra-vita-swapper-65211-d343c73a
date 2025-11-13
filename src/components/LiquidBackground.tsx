/**
 * LiquidBackground - React Component Wrapper for Liquid Engine
 * Drop-in interactive fluid background with full theming support
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { LiquidEngine } from '@/lib/liquid/LiquidEngine';

export interface LiquidBackgroundProps {
  /** Simulation complexity level */
  complexity?: 'low' | 'medium' | 'high';
  /** Resolution scale multiplier (0.5-1.5) */
  resolutionScale?: number;
  /** Enable pointer interaction */
  interactive?: boolean;
  /** Enable pointer injection on move */
  pointerInjection?: boolean;
  /** Coupling mode for UI interactions */
  couplingMode?: 'none' | 'soft' | 'two-way';
  /** Custom className */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
  /** Frame callback for performance monitoring */
  onFrame?: (stats: { fps: number; frameTime: number }) => void;
}

export const LiquidBackground: React.FC<LiquidBackgroundProps> = ({
  complexity = 'medium',
  resolutionScale = 1.0,
  interactive = true,
  pointerInjection = true,
  couplingMode = 'soft',
  className,
  children,
  onFrame,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LiquidEngine | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(0);
  
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(false);
  
  // Get theme color for dye injection
  const getThemeColor = useCallback((): [number, number, number] => {
    if (theme === 'dark') {
      const colors: Array<[number, number, number]> = [
        [0.3, 0.5, 0.9],  // Blue
        [0.6, 0.3, 0.9],  // Purple
        [0.3, 0.8, 0.8],  // Cyan
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    } else {
      const colors: Array<[number, number, number]> = [
        [0.9, 0.6, 0.3],  // Orange
        [0.9, 0.3, 0.6],  // Pink
        [0.6, 0.9, 0.4],  // Green
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  }, [theme]);
  
  // Initialize engine
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio, 2);
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const simResolution = Math.min(rect.width, rect.height) * resolutionScale * 0.5;
    
    try {
      const engine = new LiquidEngine({
        canvas,
        complexity,
        simWidth: Math.floor(simResolution),
        simHeight: Math.floor(simResolution),
        themeMix: theme === 'dark' ? 1 : 0,
      });
      
      engineRef.current = engine;
      engine.start();
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize liquid engine:', error);
    }
    
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [complexity, resolutionScale, theme]);
  
  // Handle pointer events
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!interactive || !engineRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    
    engineRef.current.addPointer({
      id: e.pointerId,
      x,
      y,
      dx: 0,
      dy: 0,
      down: true,
      color: getThemeColor(),
    });
  }, [interactive, getThemeColor]);
  
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!interactive || !pointerInjection || !engineRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    
    engineRef.current.updatePointer(e.pointerId, x, y);
  }, [interactive, pointerInjection]);
  
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!interactive || !engineRef.current) return;
    
    engineRef.current.removePointer(e.pointerId);
  }, [interactive]);
  
  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !engineRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      
      engineRef.current.resize(rect.width * dpr, rect.height * dpr);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Theme updates
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.config.themeMix = theme === 'dark' ? 1 : 0;
    }
  }, [theme]);
  
  return (
    <div
      ref={containerRef}
      className={cn('fixed inset-0 -z-10 overflow-hidden', className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      aria-hidden="true"
    >
      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          touchAction: 'none',
          background: theme === 'dark'
            ? 'linear-gradient(135deg, hsl(220, 40%, 8%), hsl(260, 40%, 12%))'
            : 'linear-gradient(135deg, hsl(210, 50%, 92%), hsl(240, 45%, 95%))',
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children && (
          <div className="pointer-events-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidBackground;
