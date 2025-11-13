# Interactive Liquid Background System

A production-ready, drop-in interactive fluid simulation system for web applications with full WebGL2 support, graceful fallbacks, and comprehensive theming.

## Features

- **Full GPU-Accelerated Fluid Simulation**: WebGL2-based Navier-Stokes solver with ping-pong framebuffers
- **Realistic Visual Effects**: Refraction, Fresnel highlights, chromatic dispersion, foam, and caustics
- **Multi-Touch Interaction**: Pointer/touch input with physics-based splashes and ripples
- **Theme Aware**: Automatically adapts to light/dark mode with configurable color palettes
- **Performance Optimized**: Auto-detection, dynamic resolution scaling, and complexity levels
- **Accessible**: Respects prefers-reduced-motion, ARIA labels, keyboard navigation
- **Production Ready**: Full TypeScript support, comprehensive error handling, WebGL context recovery

## Quick Start

### React Component

```tsx
import { LiquidBackground } from '@/components/LiquidBackground';

function App() {
  return (
    <LiquidBackground 
      complexity="medium"
      interactive={true}
      resolutionScale={1.0}
    >
      {/* Your app content */}
    </LiquidBackground>
  );
}
```

### Direct Engine Usage

```typescript
import { LiquidEngine } from '@/lib/liquid/LiquidEngine';

const canvas = document.getElementById('liquid-canvas') as HTMLCanvasElement;

const engine = new LiquidEngine({
  canvas,
  complexity: 'medium',
  viscosity: 0.003,
  vorticityStrength: 0.6,
  pressureIterations: 24,
});

engine.start();

// Programmatic force injection
engine.applyForceAt(0.5, 0.5, 10, 0.05, [0.3, 0.5, 0.9]);
```

## Configuration

### Complexity Levels

- **`low`**: 256×256 simulation, 16 pressure iterations, reduced vorticity
- **`medium`** (default): 384×384 simulation, 24 pressure iterations
- **`high`**: 512×512 simulation, 32 pressure iterations, enhanced effects

### Props (React Component)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `complexity` | `'low' \| 'medium' \| 'high'` | `'medium'` | Simulation quality level |
| `resolutionScale` | `number` | `1.0` | Resolution multiplier (0.5-1.5) |
| `interactive` | `boolean` | `true` | Enable pointer interaction |
| `pointerInjection` | `boolean` | `true` | Inject forces on pointer move |
| `couplingMode` | `'none' \| 'soft' \| 'two-way'` | `'soft'` | UI coupling mode |
| `onFrame` | `(stats) => void` | - | Performance monitoring callback |

### Engine Parameters

```typescript
{
  viscosity: 0.0005-0.02,         // Default: 0.003
  diffusion: 0.0001-0.01,         // Default: 0.001
  vorticityStrength: 0.1-2.0,     // Default: 0.6
  pressureIterations: 16-40,      // Default: 24
  dyeDecay: 0.99-0.995,           // Default: 0.992
  refractionStrength: 0.005-0.07, // Default: 0.02
  foamThreshold: 0.08-0.25,       // Default: 0.12
}
```

## Architecture

### Layer 1: WebGL2 Fluid Simulation

**Shader Passes:**
1. **Advection** (`advect.frag.glsl`) - Semi-Lagrangian transport
2. **Divergence** (`divergence.frag.glsl`) - Velocity field divergence
3. **Jacobi Iteration** (`jacobi.frag.glsl`) - Pressure solve (Poisson equation)
4. **Gradient Subtract** (`gradientSubtract.frag.glsl`) - Pressure projection
5. **Vorticity Confinement** (`vorticity.frag.glsl`) - Small-scale rotation restoration
6. **Splat** (`splat.frag.glsl`) - Force/dye injection
7. **Normal Computation** (`normal.frag.glsl`) - Surface normal from height field
8. **Render** (`render.frag.glsl`) - Final composite with refraction/Fresnel/foam

**Framebuffer Architecture:**
- Double-buffered FBOs for ping-pong: velocity, pressure, dye
- Single-buffered: divergence, vorticity, normal map
- Format: RGBA16F (fallback to RGBA8 if unavailable)

### Layer 2: Renderer & Effects

**Visual Features:**
- Refractive displacement with chromatic aberration
- Fresnel-based edge highlighting
- Anisotropic specular highlights
- Foam generation at velocity gradients
- Ambient caustics effect
- Theme-adaptive color tinting

### Layer 3: JavaScript Runtime API

**Core Engine (`LiquidEngine.ts`):**
- WebGL2 context management
- Shader compilation and program linking
- Framebuffer creation and ping-pong swapping
- Simulation step orchestration
- Input processing and force injection

**React Component (`LiquidBackground.tsx`):**
- Declarative React wrapper
- Theme integration via `useTheme` hook
- Pointer event handling
- Automatic resize and cleanup
- Performance monitoring

## Theming

### CSS Variables

```css
:root {
  --liquid-bg-base: hsl(210, 50%, 92%);
  --liquid-bg-accent: hsl(220, 60%, 70%);
  --liquid-intensity: 0.75;
  --liquid-refraction-strength: 0.02;
  --liquid-glass-opacity: 0.36;
}

[data-theme="dark"] {
  --liquid-bg-base: hsl(220, 40%, 8%);
  --liquid-intensity: 0.85;
}
```

### Runtime Theme Updates

The engine automatically responds to theme changes via the `useTheme` hook:

```typescript
useEffect(() => {
  if (engineRef.current) {
    engineRef.current.config.themeMix = theme === 'dark' ? 1 : 0;
  }
}, [theme]);
```

## Performance

### Optimization Strategies

1. **Dynamic Resolution Scaling**: Automatically adjusts sim resolution based on device
2. **Complexity Tiers**: Three preset quality levels
3. **Framerate Monitoring**: Degrades quality if FPS drops below threshold
4. **Reduced Motion Support**: Freezes simulation when `prefers-reduced-motion` is set
5. **WebGL Context Recovery**: Gracefully handles context loss

### Recommended Settings by Device

**Mobile:**
```typescript
{
  complexity: 'low',
  resolutionScale: 0.5,
  pressureIterations: 16,
}
```

**Desktop:**
```typescript
{
  complexity: 'high',
  resolutionScale: 1.0,
  pressureIterations: 32,
}
```

## Integration Examples

### Global Background

```tsx
// App.tsx
import { LiquidBackground } from '@/components/LiquidBackground';

function App() {
  return (
    <div className="relative min-h-screen">
      <LiquidBackground complexity="medium" />
      <Header />
      <Routes />
      <Footer />
    </div>
  );
}
```

### UI Component Integration

```tsx
// Inject force on modal open
const openModal = () => {
  if (liquidEngineRef.current) {
    liquidEngineRef.current.applyForceAt(
      0.5, 0.5,      // center position
      15,            // force strength
      0.1,           // radius
      [0.3, 0.6, 0.9] // color (RGB)
    );
  }
  setModalOpen(true);
};
```

### Glass Panel Styling

```tsx
<div className="liquid-glass-panel liquid-glass-panel-hover p-6 rounded-lg">
  <h2>Content with glass morphism</h2>
</div>
```

## API Reference

### LiquidEngine

#### Constructor
```typescript
new LiquidEngine(config: LiquidEngineConfig)
```

#### Methods

**`start()`**  
Starts the simulation loop

**`stop()`**  
Stops the simulation loop

**`update(time: number)`**  
Updates simulation state (called automatically in loop)

**`render()`**  
Renders current frame (called automatically in loop)

**`resize(width: number, height: number)`**  
Resizes canvas and maintains aspect ratio

**`addPointer(pointer: Pointer)`**  
Registers a new pointer for interaction

**`updatePointer(id: number, x: number, y: number)`**  
Updates pointer position

**`removePointer(id: number)`**  
Removes pointer from tracking

**`applyForceAt(x, y, force, radius, color)`**  
Programmatically injects force and dye at position

**`destroy()`**  
Cleans up all WebGL resources

### Types

```typescript
interface Pointer {
  id: number;
  x: number;           // Normalized [0,1]
  y: number;           // Normalized [0,1]
  dx: number;          // Delta x
  dy: number;          // Delta y
  down: boolean;       // Is pointer pressed
  color: [number, number, number]; // RGB [0,1]
}
```

## Browser Support

- **Modern browsers** with WebGL2 support (Chrome 56+, Firefox 51+, Safari 15+, Edge 79+)
- Graceful degradation on older browsers
- Mobile: iOS Safari 15+, Chrome Android

## Accessibility

- Respects `prefers-reduced-motion`
- Canvas marked with `aria-hidden="true"`
- Keyboard navigation unaffected
- Focus management preserved
- Color contrast checked dynamically

## Performance Metrics

Target performance on typical hardware:

- **LCP**: < 2.5s (with LQIP preload)
- **CLS**: < 0.05
- **FPS**: 60fps on desktop, 30fps on mobile
- **Bundle Size**: ~45KB gzipped (shaders + engine)

## Troubleshooting

### Canvas Not Rendering

1. Check WebGL2 support: `canvas.getContext('webgl2')`
2. Check console for shader compilation errors
3. Verify framebuffer completeness status

### Low Performance

1. Reduce `complexity` to `'low'`
2. Lower `resolutionScale` to 0.5
3. Decrease `pressureIterations`
4. Disable `vorticityStrength` (set to 0)

### Memory Leaks

- Always call `engine.destroy()` in cleanup
- Remove all pointer listeners
- Cancel animation frames properly

## Contributing

Shader modifications should maintain compatibility with WebGL2 spec. Test on:
- Desktop: Chrome, Firefox, Safari
- Mobile: iOS Safari, Chrome Android
- GPU: Integrated (Intel) and Discrete (NVIDIA/AMD)

## License

MIT License - See project root for details.
