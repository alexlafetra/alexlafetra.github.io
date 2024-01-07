precision mediump float;

varying vec2 vParticleCoord;

uniform sampler2D uVelTexture;

void main(){

    vec4 vel = texture2D(uVelTexture,vParticleCoord);
    // gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    gl_FragColor = vec4(vel.xyz,0.2);
}