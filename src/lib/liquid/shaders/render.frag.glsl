/**
 * Final Render Shader with Refraction, Fresnel, and Foam
 * Composites all effects for realistic liquid glass surface
 */
#version 300 es

precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_dyeTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_velocityTex;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_themeMix;
uniform float u_refractionStrength;
uniform float u_foamThreshold;
uniform float u_exposure;
uniform vec3 u_lightDir;

// Unpack normal from [0,1] range
vec3 unpackNormal(vec3 packed) {
    return packed * 2.0 - 1.0;
}

// Fresnel term
float fresnel(vec3 normal, vec3 viewDir, float bias, float power) {
    float base = 1.0 - max(dot(normal, viewDir), 0.0);
    return bias + (1.0 - bias) * pow(base, power);
}

void main() {
    vec2 texelSize = 1.0 / u_resolution;
    
    // Sample normal map
    vec3 normal = unpackNormal(texture(u_normalTex, v_texCoord).rgb);
    
    // Compute refracted UV coordinates
    vec2 refractionOffset = normal.xy * u_refractionStrength;
    
    // Chromatic aberration (dispersion)
    float aberration = 0.003 * u_refractionStrength;
    vec2 uvR = clamp(v_texCoord + refractionOffset + vec2(aberration, 0.0), 0.0, 1.0);
    vec2 uvG = clamp(v_texCoord + refractionOffset, 0.0, 1.0);
    vec2 uvB = clamp(v_texCoord + refractionOffset - vec2(aberration, 0.0), 0.0, 1.0);
    
    // Sample dye with chromatic dispersion
    float r = texture(u_dyeTex, uvR).r;
    float g = texture(u_dyeTex, uvG).g;
    float b = texture(u_dyeTex, uvB).b;
    vec3 refractedColor = vec3(r, g, b);
    
    // View direction (camera looking down)
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    
    // Fresnel effect
    float fresnelTerm = fresnel(normal, viewDir, 0.04, 3.5);
    
    // Specular highlight
    vec3 halfDir = normalize(u_lightDir + viewDir);
    float specular = pow(max(dot(normal, halfDir), 0.0), 32.0) * 0.6;
    
    // Foam/edge detection based on velocity gradient
    float vLeft   = length(texture(u_velocityTex, v_texCoord - vec2(texelSize.x, 0.0)).xy);
    float vRight  = length(texture(u_velocityTex, v_texCoord + vec2(texelSize.x, 0.0)).xy);
    float vBottom = length(texture(u_velocityTex, v_texCoord - vec2(0.0, texelSize.y)).xy);
    float vTop    = length(texture(u_velocityTex, v_texCoord + vec2(0.0, texelSize.y)).xy);
    
    float velocityGradient = abs(vRight - vLeft) + abs(vTop - vBottom);
    float foam = smoothstep(u_foamThreshold, u_foamThreshold * 1.5, velocityGradient);
    
    // Theme-based tinting
    vec3 glassTint = mix(
        vec3(0.98, 0.99, 1.0),  // Light mode
        vec3(0.5, 0.6, 0.75),   // Dark mode
        u_themeMix
    );
    
    // Composite final color
    vec3 finalColor = refractedColor * glassTint * u_exposure;
    finalColor += vec3(fresnelTerm * 0.4) * glassTint;
    finalColor += vec3(specular);
    finalColor += vec3(foam * 0.8);
    
    // Subtle ambient glow
    float glow = (1.0 - length(v_texCoord - 0.5) * 0.6) * 0.1;
    finalColor += glassTint * glow;
    
    // Output with alpha
    float alpha = 0.85 + fresnelTerm * 0.15;
    fragColor = vec4(finalColor, alpha);
}
