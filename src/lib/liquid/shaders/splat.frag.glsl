/**
 * Splat Shader for Force/Dye Injection
 * Adds radial impulse to velocity or dye fields at pointer positions
 */
#version 300 es

precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_targetTex;
uniform vec2 u_resolution;
uniform vec2 u_point;
uniform vec3 u_color;
uniform float u_radius;
uniform float u_strength;

void main() {
    vec4 base = texture(u_targetTex, v_texCoord);
    
    // Compute distance from splat point
    vec2 pixelCoord = v_texCoord * u_resolution;
    vec2 splatCoord = u_point * u_resolution;
    float dist = length(pixelCoord - splatCoord);
    
    // Gaussian splat kernel
    float splat = exp(-dist * dist / u_radius);
    
    // Add splat to base
    vec3 addition = u_color * splat * u_strength;
    
    fragColor = base + vec4(addition, 0.0);
}
