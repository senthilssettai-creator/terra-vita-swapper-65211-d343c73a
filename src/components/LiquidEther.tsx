import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type ColorInput = string | null;
type UniformValue = { value: any } | any;

interface ICommonParameters {
  width: number;
  height: number;
  dpr: number;
  textureType: THREE.TextureDataType;
  internalFormat: THREE.PixelFormat;
}

class CommonClass {
  container: HTMLDivElement | null = null;
  camera: THREE.OrthographicCamera | null = null;
  scene: THREE.Scene | null = null;
  renderer: THREE.WebGLRenderer | null = null;
  renderTarget: THREE.WebGLRenderTarget | null = null;
  dpr: number = 1;

  constructor(params: ICommonParameters) {
    this.dpr = params.dpr || 1;
    this.setupRenderer(params.width, params.height);
    this.setupScene();
  }

  private setupRenderer(width: number, height: number) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderTarget = new THREE.WebGLRenderTarget(width * this.dpr, height * this.dpr, {
      type: THREE.FloatType,
      format: THREE.RGBAFormat,
      internalFormat: 'RGBA32F',
    });
  }

  private setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  render(scene: THREE.Scene, target?: THREE.WebGLRenderTarget) {
    if (this.renderer && this.camera) {
      if (target) this.renderer.setRenderTarget(target);
      this.renderer.render(scene, this.camera);
      if (target) this.renderer.setRenderTarget(null);
    }
  }

  dispose() {
    this.renderTarget?.dispose();
    this.renderer?.dispose();
  }
}

class MouseClass {
  pos: THREE.Vector2 = new THREE.Vector2(0, 0);
  vel: THREE.Vector2 = new THREE.Vector2(0, 0);
  prevPos: THREE.Vector2 = new THREE.Vector2(0, 0);
  down: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    document.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  private onMouseDown(e: MouseEvent) {
    this.down = true;
    this.pos.set(e.clientX, e.clientY);
    this.prevPos.copy(this.pos);
  }

  private onMouseMove(e: MouseEvent) {
    this.prevPos.copy(this.pos);
    this.pos.set(e.clientX, e.clientY);
    this.vel.subVectors(this.pos, this.prevPos);
  }

  private onMouseUp() {
    this.down = false;
    this.vel.set(0, 0);
  }

  private onTouchStart(e: TouchEvent) {
    this.down = true;
    this.pos.set(e.touches[0].clientX, e.touches[0].clientY);
    this.prevPos.copy(this.pos);
  }

  private onTouchMove(e: TouchEvent) {
    this.prevPos.copy(this.pos);
    this.pos.set(e.touches[0].clientX, e.touches[0].clientY);
    this.vel.subVectors(this.pos, this.prevPos);
  }

  private onTouchEnd() {
    this.down = false;
    this.vel.set(0, 0);
  }
}

class AutoDriver {
  active: boolean = true;
  phase: number = 0;
  frequency: number = 0.0005;
  amplitude: THREE.Vector2 = new THREE.Vector2(150, 100);

  step(mouse: MouseClass) {
    if (mouse.down) {
      this.active = false;
      return;
    }
    this.active = true;
    this.phase += this.frequency;
    mouse.pos.x = window.innerWidth / 2 + Math.sin(this.phase) * this.amplitude.x;
    mouse.pos.y = window.innerHeight / 2 + Math.cos(this.phase) * this.amplitude.y;
  }
}

interface ShaderPassUniformValue {
  value: any;
}

class ShaderPass {
  fsQuad: any;
  uniforms: { [key: string]: ShaderPassUniformValue } = {};
  material: THREE.ShaderMaterial | null = null;
  renderTarget: THREE.WebGLRenderTarget | null = null;

  constructor(
    shader: { uniforms: { [key: string]: any }; fragmentShader: string; vertexShader?: string },
    renderTarget?: THREE.WebGLRenderTarget
  ) {
    this.renderTarget = renderTarget;
    this.uniforms = shader.uniforms;
    const vertexShader = shader.vertexShader || defaultVertexShader;
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: shader.fragmentShader,
    });
  }

  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.OrthographicCamera) {
    if (!this.material) return;
    const quad = this.getFullscreenQuad();
    quad.material = this.material;
    scene.add(quad);
    if (this.renderTarget) renderer.setRenderTarget(this.renderTarget);
    renderer.render(scene, camera);
    if (this.renderTarget) renderer.setRenderTarget(null);
    scene.remove(quad);
  }

  getFullscreenQuad() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, this.material!);
    quad.position.z = 0;
    return quad;
  }

  dispose() {
    this.material?.dispose();
    this.renderTarget?.dispose();
  }
}

const defaultVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const advectionFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform float uDeltaTime;

  void main() {
    vec2 coord = vUv - texture2D(uVelocity, vUv).xy * uDeltaTime;
    gl_FragColor = texture2D(uSource, coord);
  }
`;

const divergenceFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform float uGridScale;

  void main() {
    vec2 left = texture2D(uVelocity, vUv - vec2(uGridScale, 0.0)).xy;
    vec2 right = texture2D(uVelocity, vUv + vec2(uGridScale, 0.0)).xy;
    vec2 bottom = texture2D(uVelocity, vUv - vec2(0.0, uGridScale)).xy;
    vec2 top = texture2D(uVelocity, vUv + vec2(0.0, uGridScale)).xy;

    float divergence = 0.5 * ((right.x - left.x) + (top.y - bottom.y));
    gl_FragColor = vec4(divergence, 0.0, 0.0, 0.0);
  }
`;

const pressureFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  uniform float uGridScale;

  void main() {
    float divergence = texture2D(uDivergence, vUv).x;
    float left = texture2D(uPressure, vUv - vec2(uGridScale, 0.0)).x;
    float right = texture2D(uPressure, vUv + vec2(uGridScale, 0.0)).x;
    float bottom = texture2D(uPressure, vUv - vec2(0.0, uGridScale)).x;
    float top = texture2D(uPressure, vUv + vec2(0.0, uGridScale)).x;

    float pressure = (left + right + bottom + top - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 0.0);
  }
`;

const viscousFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform float uGridScale;

  void main() {
    vec2 left = texture2D(uVelocity, vUv - vec2(uGridScale, 0.0)).xy;
    vec2 right = texture2D(uVelocity, vUv + vec2(uGridScale, 0.0)).xy;
    vec2 bottom = texture2D(uVelocity, vUv - vec2(0.0, uGridScale)).xy;
    vec2 top = texture2D(uVelocity, vUv + vec2(0.0, uGridScale)).xy;
    vec2 center = texture2D(uVelocity, vUv).xy;

    vec2 viscosity = (left + right + bottom + top - 4.0 * center);
    gl_FragColor = vec4(viscosity, 0.0, 0.0);
  }
`;

const gradientFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  uniform float uGridScale;

  void main() {
    float left = texture2D(uPressure, vUv - vec2(uGridScale, 0.0)).x;
    float right = texture2D(uPressure, vUv + vec2(uGridScale, 0.0)).x;
    float bottom = texture2D(uPressure, vUv - vec2(0.0, uGridScale)).x;
    float top = texture2D(uPressure, vUv + vec2(0.0, uGridScale)).x;

    vec2 gradient = vec2(right - left, top - bottom) * 0.5;
    vec2 velocity = texture2D(uVelocity, vUv).xy;

    gl_FragColor = vec4(velocity - gradient, 0.0, 0.0);
  }
`;

const externalForceFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform vec2 uForce;
  uniform vec2 uMousePos;
  uniform float uRadius;

  void main() {
    vec2 dist = vUv - uMousePos;
    float influence = smoothstep(uRadius, 0.0, length(dist));
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    gl_FragColor = vec4(velocity + uForce * influence, 0.0, 0.0);
  }
`;

const colorFragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  void main() {
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    float speed = length(velocity);
    vec3 color = mix(uColor1, uColor2, speed * 2.0);
    color = mix(color, uColor3, speed * 4.0);
    gl_FragColor = vec4(color * (1.0 - speed * 0.5), 0.8);
  }
`;

class Advection extends ShaderPass {
  constructor(renderTarget?: THREE.WebGLRenderTarget) {
    super({
      uniforms: {
        uVelocity: { value: null },
        uSource: { value: null },
        uDeltaTime: { value: 0.016 },
      },
      fragmentShader: advectionFragmentShader,
    }, renderTarget);
  }
}

class Divergence extends ShaderPass {
  constructor(renderTarget?: THREE.WebGLRenderTarget) {
    super({
      uniforms: {
        uVelocity: { value: null },
        uGridScale: { value: 1.0 / 512.0 },
      },
      fragmentShader: divergenceFragmentShader,
    }, renderTarget);
  }
}

class Poisson extends ShaderPass {
  constructor(renderTarget?: THREE.WebGLRenderTarget) {
    super({
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        uGridScale: { value: 1.0 / 512.0 },
      },
      fragmentShader: pressureFragmentShader,
    }, renderTarget);
  }
}

class Pressure extends ShaderPass {
  constructor(renderTarget?: THREE.WebGLRenderTarget) {
    super({
      uniforms: {
        uPressure: { value: null },
        uVelocity: { value: null },
        uGridScale: { value: 1.0 / 512.0 },
      },
      fragmentShader: gradientFragmentShader,
    }, renderTarget);
  }
}

class ExternalForce extends ShaderPass {
  constructor(renderTarget?: THREE.WebGLRenderTarget) {
    super({
      uniforms: {
        uVelocity: { value: null },
        uForce: { value: new THREE.Vector2(0, 0) },
        uMousePos: { value: new THREE.Vector2(0, 0) },
        uRadius: { value: 0.1 },
      },
      fragmentShader: externalForceFragmentShader,
    }, renderTarget);
  }
}

class Viscous extends ShaderPass {
  constructor(renderTarget?: THREE.WebGLRenderTarget) {
    super({
      uniforms: {
        uVelocity: { value: null },
        uGridScale: { value: 1.0 / 512.0 },
      },
      fragmentShader: viscousFragmentShader,
    }, renderTarget);
  }
}

class Output extends ShaderPass {
  constructor(renderTarget?: THREE.WebGLRenderTarget) {
    super({
      uniforms: {
        uVelocity: { value: null },
        uColor1: { value: new THREE.Color(0x5227ff) },
        uColor2: { value: new THREE.Color(0xff9ffc) },
        uColor3: { value: new THREE.Color(0xb19eef) },
      },
      fragmentShader: colorFragmentShader,
    }, renderTarget);
  }
}

class Simulation {
  common: CommonClass;
  mouse: MouseClass;
  autoDriver: AutoDriver;
  width: number;
  height: number;
  dpr: number;

  velocityTarget: THREE.WebGLRenderTarget;
  velocityTarget2: THREE.WebGLRenderTarget;
  divergenceTarget: THREE.WebGLRenderTarget;
  pressureTarget: THREE.WebGLRenderTarget;
  pressureTarget2: THREE.WebGLRenderTarget;

  advection: Advection;
  externalForce: ExternalForce;
  viscous: Viscous;
  divergence: Divergence;
  poisson: Poisson;
  pressure: Pressure;
  output: Output;

  constructor(canvas: HTMLCanvasElement, width: number, height: number, colors: string[]) {
    this.width = width;
    this.height = height;
    this.dpr = window.devicePixelRatio || 1;

    this.common = new CommonClass({
      width,
      height,
      dpr: this.dpr,
      textureType: THREE.FloatType,
      internalFormat: THREE.RGBAFormat,
    });

    this.mouse = new MouseClass(canvas);
    this.autoDriver = new AutoDriver();

    const w = width * this.dpr;
    const h = height * this.dpr;

    this.velocityTarget = new THREE.WebGLRenderTarget(w, h, { type: THREE.FloatType, format: THREE.RGBAFormat });
    this.velocityTarget2 = new THREE.WebGLRenderTarget(w, h, { type: THREE.FloatType, format: THREE.RGBAFormat });
    this.divergenceTarget = new THREE.WebGLRenderTarget(w, h, { type: THREE.FloatType, format: THREE.RGBAFormat });
    this.pressureTarget = new THREE.WebGLRenderTarget(w, h, { type: THREE.FloatType, format: THREE.RGBAFormat });
    this.pressureTarget2 = new THREE.WebGLRenderTarget(w, h, { type: THREE.FloatType, format: THREE.RGBAFormat });

    this.advection = new Advection(this.velocityTarget2);
    this.externalForce = new ExternalForce(this.velocityTarget2);
    this.viscous = new Viscous(this.velocityTarget2);
    this.divergence = new Divergence(this.divergenceTarget);
    this.poisson = new Poisson(this.pressureTarget2);
    this.pressure = new Pressure(this.velocityTarget2);
    this.output = new Output();

    this.setColors(colors);
  }

  setColors(colors: string[]) {
    const c1 = new THREE.Color(colors[0] || '#5227ff');
    const c2 = new THREE.Color(colors[1] || '#ff9ffc');
    const c3 = new THREE.Color(colors[2] || '#b19eef');

    (this.output.uniforms['uColor1'] as UniformValue).value = c1;
    (this.output.uniforms['uColor2'] as UniformValue).value = c2;
    (this.output.uniforms['uColor3'] as UniformValue).value = c3;
  }

  update() {
    this.autoDriver.step(this.mouse);

    const rect = this.common.renderer?.domElement.getBoundingClientRect();
    if (rect) {
      const normalizedX = this.mouse.pos.x / rect.width;
      const normalizedY = 1.0 - this.mouse.pos.y / rect.height;

      (this.externalForce.uniforms['uMousePos'] as UniformValue).value.set(normalizedX, normalizedY);
      (this.externalForce.uniforms['uForce'] as UniformValue).value.copy(this.mouse.vel).multiplyScalar(0.001);
    }

    if (this.common.renderer && this.common.camera && this.common.scene) {
      (this.advection.uniforms['uVelocity'] as UniformValue).value = this.velocityTarget.texture;
      (this.advection.uniforms['uSource'] as UniformValue).value = this.velocityTarget.texture;
      this.advection.render(this.common.renderer, this.common.scene, this.common.camera);

      (this.externalForce.uniforms['uVelocity'] as UniformValue).value = this.velocityTarget2.texture;
      this.externalForce.render(this.common.renderer, this.common.scene, this.common.camera);

      (this.divergence.uniforms['uVelocity'] as UniformValue).value = this.velocityTarget2.texture;
      this.divergence.render(this.common.renderer, this.common.scene, this.common.camera);

      for (let i = 0; i < 20; i++) {
        (this.poisson.uniforms['uPressure'] as UniformValue).value = i % 2 === 0 ? this.pressureTarget.texture : this.pressureTarget2.texture;
        (this.poisson.uniforms['uDivergence'] as UniformValue).value = this.divergenceTarget.texture;
        const target = i % 2 === 0 ? this.pressureTarget2 : this.pressureTarget;
        this.poisson.render(this.common.renderer, this.common.scene, this.common.camera);
      }

      (this.pressure.uniforms['uPressure'] as UniformValue).value = this.pressureTarget.texture;
      (this.pressure.uniforms['uVelocity'] as UniformValue).value = this.velocityTarget2.texture;
      this.pressure.render(this.common.renderer, this.common.scene, this.common.camera);

      (this.output.uniforms['uVelocity'] as UniformValue).value = this.velocityTarget2.texture;
      this.common.render(this.common.scene, this.common.renderTarget);
    }
  }

  render() {
    if (this.common.renderer && this.common.camera && this.common.scene) {
      (this.output.uniforms['uVelocity'] as UniformValue).value = this.velocityTarget2.texture;
      const quad = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        this.output.material!
      );
      this.common.scene.add(quad);
      this.common.renderer.render(this.common.scene, this.common.camera);
      this.common.scene.remove(quad);
    }
  }

  dispose() {
    this.velocityTarget.dispose();
    this.velocityTarget2.dispose();
    this.divergenceTarget.dispose();
    this.pressureTarget.dispose();
    this.pressureTarget2.dispose();

    this.advection.dispose();
    this.externalForce.dispose();
    this.viscous.dispose();
    this.divergence.dispose();
    this.poisson.dispose();
    this.pressure.dispose();
    this.output.dispose();
    this.common.dispose();
  }
}

export default function LiquidEther({
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  style = {},
  className = '',
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simulationRef = useRef<Simulation | null>(null);
  const animationRef = useRef<number | null>(null);
  const visibilityRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let simulation: Simulation | null = null;
    let rafId: number | null = null;

    const resizeObserver = new ResizeObserver(() => {
      if (canvas && simulation) {
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        if (width && height) {
          simulation.dispose();
          simulation = new Simulation(canvas, width, height, colors);
          simulationRef.current = simulation;
        }
      }
    });

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visibilityRef.current = entry.isIntersecting;
    });

    const handleVisibilityChange = () => {
      visibilityRef.current = document.visibilityState === 'visible';
    };

    const initSimulation = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      if (width && height) {
        simulation = new Simulation(canvas, width, height, colors);
        simulationRef.current = simulation;

        if (simulation.common.renderer) {
          canvas.parentElement?.appendChild(simulation.common.renderer.domElement);
          simulation.common.renderer.domElement.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';
        }

        const animate = () => {
          if (visibilityRef.current) {
            simulation!.update();
            simulation!.render();
          }
          rafId = requestAnimationFrame(animate);
        };
        animate();
      }
    };

    initSimulation();
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      simulation?.dispose();
    };
  }, [colors]);

  return <canvas ref={canvasRef} className={className} style={style} />;
}
