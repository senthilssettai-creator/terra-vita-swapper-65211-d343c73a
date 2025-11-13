/**
 * Divergence Computation Shader
 * Computes divergence of velocity field for pressure projection
 * div(u) = ∂u/∂x + ∂v/∂y
 */
#version 300 es

precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_velocityTex;
uniform vec2 u_resolution;

void main() {
    vec2 texelSize = 1.0 / u_resolution;
    
    // Sample neighboring velocity values (central differences)
    float vLeft   = texture(u_velocityTex, v_texCoord - vec2(texelSize.x, 0.0)).x;
    float vRight  = texture(u_velocityTex, v_texCoord + vec2(texelSize.x, 0.0)).x;
    float vBottom = texture(u_velocityTex, v_texCoord - vec2(0.0, texelSize.y)).y;
    float vTop    = texture(u_velocityTex, v_texCoord + vec2(0.0, texelSize.y)).y;
    
    // Compute divergence
    float divergence = 0.5 * ((vRight - vLeft) + (vTop - vBottom));
    
    fragColor = vec4(divergence, 0.0, 0.0, 1.0);
}
