precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTextureCoord;

void main(){
    //super basic, just passing verts directly to the frag shader
    vTextureCoord = aPosition.xy;
    vec2 positionVec2 = aPosition.xy * 2.0 - 1.0;
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(positionVec2,aPosition.z,1.0);
}