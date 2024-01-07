precision mediump float;

varying vec2 vParticleCoord;
uniform float uRandomSeed;

//taken from the lovely https://thebookofshaders.com/10/
float random(vec2 coord, float seed){
    return fract(sin(dot(coord.xy,vec2(22.9898-seed,78.233+seed)))*43758.5453123*seed);
}

void main(){
    gl_FragColor = vec4(random(vParticleCoord,1.0+uRandomSeed),random(vParticleCoord,2.0+uRandomSeed),1.0,1.0);
}