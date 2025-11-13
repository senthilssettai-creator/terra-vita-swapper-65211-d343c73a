/**
 * Semi-Lagrangian Advection Shader
 * Transports velocity/dye along velocity field
 * Used for both velocity self-advection and dye transport
 */
#version 300 es

precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_velocityTex;
uniform sampler2D u_sourceTex;
uniform vec2 u_resolution;
uniform float u_dt;
uniform float u_dissipation;

void main() {
    vec2 texelSize = 1.0 / u_resolution;
    
    // Sample velocity at current position
    vec2 velocity = texture(u_velocityTex, v_texCoord).xy;
    
    // Backtrack position using semi-Lagrangian method
    vec2 backtracePos = v_texCoord - velocity * u_dt * texelSize;
    
    // Clamp to valid texture coordinates
    backtracePos = clamp(backtracePos, texelSize, 1.0 - texelSize);
    
    // Sample source field at backtraced position
    vec4 source = texture(u_sourceTex, backtracePos);
    
    // Apply dissipation/decay
    fragColor = source * u_dissipation;
}
