precision highp float;

uniform vec4 uColorPallette[7]; 
uniform sampler2D uTexture;

uniform float uResolution;

varying vec2 vTexCoord;

uniform bool uPetriDish;


// //borrowed from https://openprocessing.org/sketch/496452/
vec4 getShading(float val){
    val = clamp(val, 0.0, 0.99999);
    float lum_steps = val * 6.0;
    float frac = fract(lum_steps);
    int id = int(floor(lum_steps));
    if(id == 0) return mix(uColorPallette[0], uColorPallette[1], frac);
    if(id == 1) return mix(uColorPallette[1], uColorPallette[2], frac);
    if(id == 2) return mix(uColorPallette[2], uColorPallette[3], frac);
    if(id == 3) return mix(uColorPallette[3], uColorPallette[4], frac);
    if(id == 4) return mix(uColorPallette[4], uColorPallette[5], frac);
    if(id == 5) return mix(uColorPallette[5], uColorPallette[6], frac);
    return uColorPallette[6];
}

void main(){
    vec2 val = texture2D(uTexture,vTexCoord.xy).rg;
    vec2 pixel = vTexCoord.xy;
    //putting it in a petri dish
    float dist = distance(pixel,vec2(0.5));
    if(uPetriDish && dist>0.48){
        float d1 = 2.0 - 0.48/(dist*dist);
        gl_FragColor = vec4(uColorPallette[0].r+d1,uColorPallette[0].g+d1,uColorPallette[0].b+d1,1.0-50.0*(dist-0.48));
        return;
    }
    gl_FragColor = getShading(val.r*val.r);
}