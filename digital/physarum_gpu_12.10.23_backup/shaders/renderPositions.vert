precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vParticleCoord;
varying vec2 gridCoord;

uniform sampler2D uParticlePos;

void main(){
    //getting position data from the texture
    vParticleCoord = aPosition.xy * 2.0 - 1.0;
    vec4 particlePos = texture2D(uParticlePos,aPosition.xy)*2.0 - 1.0;
    vec2 positionVec2 = aPosition.xy * 2.0 - 1.0;
    gl_PointSize = 1.0;
    // gl_Position = vec4(positionVec2.xy,1.0,1.0);
    gl_Position = particlePos;
    // gridCoord = particlePos;
    // gl_Color = vec4(1.0,0.0,0.0,1.0);
}