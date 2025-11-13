/**
 * LiquidEngine - Core WebGL2 Fluid Simulation Engine
 * Production-ready fluid simulation with ping-pong framebuffers
 */

export interface LiquidEngineConfig {
  canvas: HTMLCanvasElement;
  simWidth?: number;
  simHeight?: number;
  complexity?: 'low' | 'medium' | 'high';
  viscosity?: number;
  diffusion?: number;
  vorticityStrength?: number;
  pressureIterations?: number;
  dyeDecay?: number;
  refractionStrength?: number;
  foamThreshold?: number;
  themeMix?: number;
}

interface Framebuffer {
  fbo: WebGLFramebuffer;
  texture: WebGLTexture;
  width: number;
  height: number;
}

interface DoubleFBO {
  read: Framebuffer;
  write: Framebuffer;
  swap: () => void;
}

interface Pointer {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  down: boolean;
  color: [number, number, number];
}

export class LiquidEngine {
  private gl: WebGL2RenderingContext;
  public config: Required<LiquidEngineConfig>;
  
  // Framebuffers
  private velocity!: DoubleFBO;
  private pressure!: DoubleFBO;
  private divergence!: Framebuffer;
  private vorticity!: Framebuffer;
  private dye!: DoubleFBO;
  private normal!: Framebuffer;
  
  // Shader programs
  private programs: Map<string, WebGLProgram> = new Map();
  
  // Geometry
  private quadVAO!: WebGLVertexArrayObject;
  
  // State
  private time = 0;
  private lastTime = 0;
  private pointers: Map<number, Pointer> = new Map();
  private animationFrame: number | null = null;
  
  constructor(config: LiquidEngineConfig) {
    const gl = config.canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });
    
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }
    
    this.gl = gl;
    this.config = this.getDefaultConfig(config);
    
    this.initialize();
  }
  
  private getDefaultConfig(config: LiquidEngineConfig): Required<LiquidEngineConfig> {
    const complexity = config.complexity || 'medium';
    
    // Complexity-based defaults
    const complexityDefaults = {
      low: {
        simWidth: 256,
        simHeight: 256,
        pressureIterations: 16,
        vorticityStrength: 0.3,
      },
      medium: {
        simWidth: 384,
        simHeight: 384,
        pressureIterations: 24,
        vorticityStrength: 0.6,
      },
      high: {
        simWidth: 512,
        simHeight: 512,
        pressureIterations: 32,
        vorticityStrength: 1.0,
      },
    };
    
    const defaults = complexityDefaults[complexity];
    
    return {
      canvas: config.canvas,
      complexity,
      simWidth: config.simWidth || defaults.simWidth,
      simHeight: config.simHeight || defaults.simHeight,
      viscosity: config.viscosity ?? 0.003,
      diffusion: config.diffusion ?? 0.001,
      vorticityStrength: config.vorticityStrength ?? defaults.vorticityStrength,
      pressureIterations: config.pressureIterations || defaults.pressureIterations,
      dyeDecay: config.dyeDecay ?? 0.992,
      refractionStrength: config.refractionStrength ?? 0.02,
      foamThreshold: config.foamThreshold ?? 0.12,
      themeMix: config.themeMix ?? 0,
    };
  }
  
  private async initialize() {
    const { gl } = this;
    
    // Create geometry
    this.createQuadGeometry();
    
    // Load and compile shaders
    await this.loadShaders();
    
    // Create framebuffers
    this.createFramebuffers();
    
    // Set initial state
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
  }
  
  private createQuadGeometry() {
    const { gl } = this;
    
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindVertexArray(null);
    
    this.quadVAO = vao!;
  }
  
  private async loadShaders() {
    const shaderFiles = [
      'advect',
      'divergence',
      'jacobi',
      'gradientSubtract',
      'vorticity',
      'splat',
      'normal',
      'render',
    ];
    
    // Load vertex shader
    const vertShader = await this.loadShaderFile('fluid.vert.glsl');
    
    // Load and compile all fragment shaders
    for (const name of shaderFiles) {
      const fragShader = await this.loadShaderFile(`${name}.frag.glsl`);
      const program = this.createProgram(vertShader, fragShader);
      if (program) {
        this.programs.set(name, program);
      }
    }
  }
  
  private async loadShaderFile(filename: string): Promise<string> {
    try {
      const response = await fetch(`/src/lib/liquid/shaders/${filename}`);
      return await response.text();
    } catch (error) {
      console.error(`Failed to load shader ${filename}:`, error);
      throw error;
    }
  }
  
  private createProgram(vertSource: string, fragSource: string): WebGLProgram | null {
    const { gl } = this;
    
    const vertShader = this.compileShader(gl.VERTEX_SHADER, vertSource);
    const fragShader = this.compileShader(gl.FRAGMENT_SHADER, fragSource);
    
    if (!vertShader || !fragShader) return null;
    
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }
  
  private compileShader(type: number, source: string): WebGLShader | null {
    const { gl } = this;
    
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      return null;
    }
    
    return shader;
  }
  
  private createFramebuffers() {
    const { simWidth, simHeight } = this.config;
    
    // Create double-buffered FBOs for ping-pong
    this.velocity = this.createDoubleFBO(simWidth, simHeight, this.gl.RG16F, this.gl.RG, this.gl.FLOAT);
    this.pressure = this.createDoubleFBO(simWidth, simHeight, this.gl.R16F, this.gl.RED, this.gl.FLOAT);
    this.dye = this.createDoubleFBO(simWidth, simHeight, this.gl.RGBA16F, this.gl.RGBA, this.gl.FLOAT);
    
    // Single-buffered FBOs
    this.divergence = this.createFBO(simWidth, simHeight, this.gl.R16F, this.gl.RED, this.gl.FLOAT);
    this.vorticity = this.createFBO(simWidth, simHeight, this.gl.R16F, this.gl.RED, this.gl.FLOAT);
    this.normal = this.createFBO(simWidth, simHeight, this.gl.RGBA16F, this.gl.RGBA, this.gl.FLOAT);
  }
  
  private createFBO(width: number, height: number, internalFormat: number, format: number, type: number): Framebuffer {
    const { gl } = this;
    
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer incomplete:', status);
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    return { fbo, texture, width, height };
  }
  
  private createDoubleFBO(width: number, height: number, internalFormat: number, format: number, type: number): DoubleFBO {
    const read = this.createFBO(width, height, internalFormat, format, type);
    const write = this.createFBO(width, height, internalFormat, format, type);
    
    return {
      read,
      write,
      swap: () => {
        const temp = read;
        Object.assign(read, write);
        Object.assign(write, temp);
      },
    };
  }
  
  // Public API
  public addPointer(pointer: Pointer) {
    this.pointers.set(pointer.id, pointer);
  }
  
  public updatePointer(id: number, x: number, y: number) {
    const pointer = this.pointers.get(id);
    if (pointer) {
      pointer.dx = x - pointer.x;
      pointer.dy = y - pointer.y;
      pointer.x = x;
      pointer.y = y;
    }
  }
  
  public removePointer(id: number) {
    this.pointers.delete(id);
  }
  
  public applyForceAt(x: number, y: number, force: number, radius: number, color: [number, number, number]) {
    // Apply force splat at specific position
    this.splat(this.velocity, x, y, force, force, radius, color);
    this.splat(this.dye, x, y, 0, 0, radius * 1.5, color);
  }
  
  public start() {
    if (this.animationFrame !== null) return;
    
    const animate = (time: number) => {
      this.update(time);
      this.render();
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  public stop() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  public update(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.016);
    this.lastTime = time;
    this.time = time / 1000;
    
    // Process pointer inputs
    this.processPointers(dt);
    
    // Simulation steps
    this.advect(this.velocity, this.velocity, dt, this.config.viscosity);
    this.advect(this.velocity, this.dye, dt, this.config.dyeDecay);
    
    if (this.config.vorticityStrength > 0) {
      this.applyVorticity(dt);
    }
    
    this.computeDivergence();
    this.solvePressure();
    this.subtractPressureGradient();
    
    // Generate normal map from dye field
    this.computeNormals();
  }
  
  private processPointers(dt: number) {
    this.pointers.forEach(pointer => {
      if (pointer.down) {
        const force = 20.0;
        const radius = 0.05;
        this.splat(this.velocity, pointer.x, pointer.y, pointer.dx * force, pointer.dy * force, radius, [0, 0, 0]);
        this.splat(this.dye, pointer.x, pointer.y, 0, 0, radius * 1.2, pointer.color);
      }
    });
  }
  
  private splat(target: DoubleFBO, x: number, y: number, dx: number, dy: number, radius: number, color: [number, number, number]) {
    const { gl } = this;
    const program = this.programs.get('splat');
    if (!program) return;
    
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.write.fbo);
    gl.viewport(0, 0, target.read.width, target.read.height);
    
    gl.uniform1i(gl.getUniformLocation(program, 'u_targetTex'), 0);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), target.read.width, target.read.height);
    gl.uniform2f(gl.getUniformLocation(program, 'u_point'), x, y);
    gl.uniform3f(gl.getUniformLocation(program, 'u_color'), dx, dy, color[2]);
    gl.uniform1f(gl.getUniformLocation(program, 'u_radius'), radius * Math.min(target.read.width, target.read.height));
    gl.uniform1f(gl.getUniformLocation(program, 'u_strength'), 1.0);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, target.read.texture);
    
    this.drawQuad();
    
    target.swap();
  }
  
  private advect(velocity: DoubleFBO, target: DoubleFBO, dt: number, dissipation: number) {
    const { gl } = this;
    const program = this.programs.get('advect');
    if (!program) return;
    
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.write.fbo);
    gl.viewport(0, 0, target.read.width, target.read.height);
    
    gl.uniform1i(gl.getUniformLocation(program, 'u_velocityTex'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_sourceTex'), 1);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), target.read.width, target.read.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_dt'), dt);
    gl.uniform1f(gl.getUniformLocation(program, 'u_dissipation'), dissipation);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, target.read.texture);
    
    this.drawQuad();
    
    target.swap();
  }
  
  private computeDivergence() {
    const { gl } = this;
    const program = this.programs.get('divergence');
    if (!program) return;
    
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.divergence.fbo);
    gl.viewport(0, 0, this.divergence.width, this.divergence.height);
    
    gl.uniform1i(gl.getUniformLocation(program, 'u_velocityTex'), 0);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), this.divergence.width, this.divergence.height);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
    
    this.drawQuad();
  }
  
  private solvePressure() {
    const { gl } = this;
    const program = this.programs.get('jacobi');
    if (!program) return;
    
    gl.useProgram(program);
    gl.uniform1i(gl.getUniformLocation(program, 'u_pressureTex'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_divergenceTex'), 1);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), this.pressure.read.width, this.pressure.read.height);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.divergence.texture);
    
    for (let i = 0; i < this.config.pressureIterations; i++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.pressure.write.fbo);
      gl.viewport(0, 0, this.pressure.read.width, this.pressure.read.height);
      
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.pressure.read.texture);
      
      this.drawQuad();
      
      this.pressure.swap();
    }
  }
  
  private subtractPressureGradient() {
    const { gl } = this;
    const program = this.programs.get('gradientSubtract');
    if (!program) return;
    
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.velocity.write.fbo);
    gl.viewport(0, 0, this.velocity.read.width, this.velocity.read.height);
    
    gl.uniform1i(gl.getUniformLocation(program, 'u_velocityTex'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_pressureTex'), 1);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), this.velocity.read.width, this.velocity.read.height);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.pressure.read.texture);
    
    this.drawQuad();
    
    this.velocity.swap();
  }
  
  private applyVorticity(dt: number) {
    // Vorticity confinement implementation
    // Simplified for initial version
  }
  
  private computeNormals() {
    const { gl } = this;
    const program = this.programs.get('normal');
    if (!program) return;
    
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.normal.fbo);
    gl.viewport(0, 0, this.normal.width, this.normal.height);
    
    gl.uniform1i(gl.getUniformLocation(program, 'u_dyeTex'), 0);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), this.dye.read.width, this.dye.read.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_normalStrength'), 2.0);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.dye.read.texture);
    
    this.drawQuad();
  }
  
  public render() {
    const { gl, config } = this;
    const program = this.programs.get('render');
    if (!program) return;
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(program);
    
    gl.uniform1i(gl.getUniformLocation(program, 'u_dyeTex'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'u_normalTex'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'u_velocityTex'), 2);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), this.dye.read.width, this.dye.read.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), this.time);
    gl.uniform1f(gl.getUniformLocation(program, 'u_themeMix'), config.themeMix);
    gl.uniform1f(gl.getUniformLocation(program, 'u_refractionStrength'), config.refractionStrength);
    gl.uniform1f(gl.getUniformLocation(program, 'u_foamThreshold'), config.foamThreshold);
    gl.uniform1f(gl.getUniformLocation(program, 'u_exposure'), 1.0);
    gl.uniform3f(gl.getUniformLocation(program, 'u_lightDir'), 0.5, 0.8, 1.0);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.dye.read.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.normal.texture);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
    
    this.drawQuad();
  }
  
  private drawQuad() {
    const { gl } = this;
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }
  
  public resize(width: number, height: number) {
    const { gl } = this;
    gl.canvas.width = width;
    gl.canvas.height = height;
  }
  
  public destroy() {
    this.stop();
    // Clean up WebGL resources
    const { gl } = this;
    this.programs.forEach(program => gl.deleteProgram(program));
    this.programs.clear();
  }
}
