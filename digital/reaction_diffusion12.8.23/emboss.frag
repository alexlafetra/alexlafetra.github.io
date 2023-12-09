precision lowp float;

uniform sampler2D uTexture;

uniform float uShineScale;

varying vec2 vTexCoord;

void main(){
    const float offset = 1.0 / 400.0;

    vec4 color0  = texture2D(uTexture, vTexCoord);

    vec4 tl = texture2D(uTexture, vTexCoord + vec2(-offset,  offset));
    vec4 br = texture2D(uTexture, vTexCoord + vec2( offset,  offset));

    vec4 sum=(2.0*tl-color0-br);
    float luminance = clamp(0.299 * sum.r + 0.587 * sum.g + 0.114 * sum.b,0.0,1.0);
    sum = vec4( 0.5, 0.5, 0.5, 1.0 ) + vec4( luminance,luminance,luminance,1.0 );
    // gl_FragColor = vec4(luminance,luminance,luminance,luminance);
    gl_FragColor = vec4(uShineScale * luminance*luminance);
}
