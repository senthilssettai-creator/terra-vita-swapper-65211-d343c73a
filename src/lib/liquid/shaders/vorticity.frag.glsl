/**
 * Vorticity Confinement Shader
 * Computes and applies vorticity to restore small-scale rotational features
 * ω = ∇ × u (curl of velocity field)
 */
#version 300 es

precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_velocityTex;
uniform vec2 u_resolution;
uniform float u_vorticityStrength;
uniform float u_dt;
uniform bool u_computeVorticity; // true = compute, false = apply

void main() {
    vec2 texelSize = 1.0 / u_resolution;
    
    if (u_computeVorticity) {
        // Compute vorticity: ω = ∂v/∂x - ∂u/∂y
        float vLeft   = texture(u_velocityTex, v_texCoord - vec2(texelSize.x, 0.0)).y;
        float vRight  = texture(u_velocityTex, v_texCoord + vec2(texelSize.x, 0.0)).y;
        float uBottom = texture(u_velocityTex, v_texCoord - vec2(0.0, texelSize.y)).x;
        float uTop    = texture(u_velocityTex, v_texCoord + vec2(0.0, texelSize.y)).x;
        
        float vorticity = 0.5 * ((vRight - vLeft) - (uTop - uBottom));
        
        fragColor = vec4(vorticity, 0.0, 0.0, 1.0);
    } else {
        // Apply vorticity confinement force
        float wCenter = texture(u_velocityTex, v_texCoord).x; // vorticity stored in velocity tex during compute pass
        
        float wLeft   = texture(u_velocityTex, v_texCoord - vec2(texelSize.x, 0.0)).x;
        float wRight  = texture(u_velocityTex, v_texCoord + vec2(texelSize.x, 0.0)).x;
        float wBottom = texture(u_velocityTex, v_texCoord - vec2(0.0, texelSize.y)).x;
        float wTop    = texture(u_velocityTex, v_texCoord + vec2(0.0, texelSize.y)).x;
        
        // Compute vorticity gradient
        vec2 gradient = 0.5 * vec2(abs(wRight) - abs(wLeft), abs(wTop) - abs(wBottom));
        float len = length(gradient) + 1e-5;
        gradient /= len;
        
        // Compute confinement force: f = ε(N × ω)
        vec2 force = u_vorticityStrength * gradient * wCenter * vec2(1.0, -1.0);
        
        fragColor = vec4(force * u_dt, 0.0, 1.0);
    }
}
