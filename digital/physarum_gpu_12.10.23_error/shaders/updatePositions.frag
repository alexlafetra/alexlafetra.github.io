precision mediump float;

uniform sampler2D uParticleVel;
uniform sampler2D uParticlePos;

uniform float uWidth;
uniform float uHeight;

varying vec2 vParticleCoord;

//taken from the lovely https://thebookofshaders.com/10/
float random(vec2 coord, float seed){
    return fract(sin(dot(coord.xy,vec2(12.9898-seed,78.233+seed)))*43758.5453123*seed);
}

void main(){
    vec4 textureVelocity = texture2D(uParticleVel,vParticleCoord);
    vec2 velocity = textureVelocity.xy * 2.0 - 1.0;//remapping velocities to be within -1.0 and 1.0
    vec4 texturePosition = texture2D(uParticlePos,vParticleCoord);
    vec2 position = vec2(texturePosition.xy);

    vec2 newPos = position + velocity;

    //checking bounds/making positions wrap
    if(newPos.x < 0.0){
        newPos.x = 1.0;
    }
    else if(newPos.x > 1.0){
        newPos.x = -1.0;
    }
    if(newPos.y < 0.0){
        newPos.y = 1.0;
    }
    else if(newPos.y > 1.0){
        newPos.y = -1.0;
    }

    // newPos = (newPos+1.0)/2.0;
    
    gl_FragColor = vec4(newPos.x,newPos.y,1.0,1.0);
}