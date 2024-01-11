precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vParticleCoord;
varying vec2 gridCoord;

uniform sampler2D uParticlePos;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

uniform float uWidth;
uniform float uHeight;

void main(){
    vParticleCoord = aPosition.xy;
    //getting position data from the texture and convert from pixel space to clip space
    vec4 particlePos = texture2D(uParticlePos,vParticleCoord)*2.0-1.0;
    particlePos.x *= uWidth;
    particlePos.y *= uHeight;
    //adding in projection matrix so our geometry shows up
    gl_Position = uProjectionMatrix * uModelViewMatrix * particlePos;
}