/**
 * Normal Map Generation Shader
 * Computes surface normals from dye/height field for refraction
 */
#version 300 es

precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_dyeTex;
uniform vec2 u_resolution;
uniform float u_normalStrength;

void main() {
    vec2 texelSize = 1.0 / u_resolution;
    
    // Sample dye intensity (height field)
    float hLeft   = length(texture(u_dyeTex, v_texCoord - vec2(texelSize.x, 0.0)).rgb);
    float hRight  = length(texture(u_dyeTex, v_texCoord + vec2(texelSize.x, 0.0)).rgb);
    float hBottom = length(texture(u_dyeTex, v_texCoord - vec2(0.0, texelSize.y)).rgb);
    float hTop    = length(texture(u_dyeTex, v_texCoord + vec2(0.0, texelSize.y)).rgb);
    
    // Compute gradient (Sobel operator)
    vec2 gradient = vec2(hRight - hLeft, hTop - hBottom) * u_normalStrength;
    
    // Build normal vector
    vec3 normal = normalize(vec3(-gradient.x, -gradient.y, 1.0));
    
    // Pack normal into [0,1] range for storage
    fragColor = vec4(normal * 0.5 + 0.5, 1.0);
}
