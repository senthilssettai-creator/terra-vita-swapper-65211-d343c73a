/**
 * Jacobi Iteration Shader for Pressure Solve
 * Solves Poisson equation ∇²p = div(u) iteratively
 * Performs one Jacobi iteration: p^(k+1) = (p_L + p_R + p_B + p_T - div) / 4
 */
#version 300 es

precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_pressureTex;
uniform sampler2D u_divergenceTex;
uniform vec2 u_resolution;

void main() {
    vec2 texelSize = 1.0 / u_resolution;
    
    // Sample neighboring pressure values
    float pLeft   = texture(u_pressureTex, v_texCoord - vec2(texelSize.x, 0.0)).x;
    float pRight  = texture(u_pressureTex, v_texCoord + vec2(texelSize.x, 0.0)).x;
    float pBottom = texture(u_pressureTex, v_texCoord - vec2(0.0, texelSize.y)).x;
    float pTop    = texture(u_pressureTex, v_texCoord + vec2(0.0, texelSize.y)).x;
    
    // Sample divergence at current position
    float divergence = texture(u_divergenceTex, v_texCoord).x;
    
    // Jacobi iteration
    float pressure = 0.25 * (pLeft + pRight + pBottom + pTop - divergence);
    
    fragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
