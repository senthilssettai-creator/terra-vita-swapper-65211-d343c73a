/**
 * Gradient Subtraction Shader (Pressure Projection)
 * Makes velocity field divergence-free: u_new = u - ∇p
 * Final step of pressure projection to enforce incompressibility
 */
#version 300 es

precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_velocityTex;
uniform sampler2D u_pressureTex;
uniform vec2 u_resolution;

void main() {
    vec2 texelSize = 1.0 / u_resolution;
    
    // Sample pressure gradient (central differences)
    float pLeft   = texture(u_pressureTex, v_texCoord - vec2(texelSize.x, 0.0)).x;
    float pRight  = texture(u_pressureTex, v_texCoord + vec2(texelSize.x, 0.0)).x;
    float pBottom = texture(u_pressureTex, v_texCoord - vec2(0.0, texelSize.y)).x;
    float pTop    = texture(u_pressureTex, v_texCoord + vec2(0.0, texelSize.y)).x;
    
    vec2 gradient = 0.5 * vec2(pRight - pLeft, pTop - pBottom);
    
    // Subtract gradient from velocity
    vec2 velocity = texture(u_velocityTex, v_texCoord).xy;
    velocity -= gradient;
    
    fragColor = vec4(velocity, 0.0, 1.0);
}
