//this shader draws particles to the screen using their position data

precision highp float;

uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;
varying vec2 vTexCoord;

void main(){
    // float dist;
    vec4 particlePosition = texture2D(uPositionTexture,vTexCoord.xy);

    vec4 particleVelocity = texture2D(uVelocityTexture,vTexCoord.xy);

    vec4 newPosition = vec4(particlePosition + (particleVelocity-0.5)/2.0);
    // if(newPosition.x>1.0)
    //     newPosition.x = 0.0;
    // if(newPosition.y>1.0)
    //     newPosition.y = 0.0;
    // if(newPosition.z>1.0)
    //     newPosition.z = 0.0;

    gl_FragColor = vec4(newPosition.x,newPosition.y,newPosition.z,1.0);
}