precision highp float;
precision highp sampler2D;

uniform sampler2D uParticleVel;
uniform sampler2D uParticlePos;
uniform sampler2D uFlowFieldTexture;

varying vec2 vParticleCoord;

void main(){
    vec4 screenPosition = texture2D(uParticlePos,vParticleCoord);
    vec4 theta = texture2D(uFlowFieldTexture,screenPosition.xy);
    vec2 vel = 1.0*vec2(theta.x,theta.y);
    gl_FragColor = vec4(vel,1.0,1.0);
}