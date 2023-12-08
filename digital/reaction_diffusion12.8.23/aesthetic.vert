precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

//Varying variable to pass the texture coordinates into the fragment shader
varying vec2 vTexCoord;

uniform sampler2D uComputeTexture;

void main(){
    vec2 positionVec2 = aPosition.xy * 2.0 - 1.0;
    vTexCoord = aPosition.xy;
    //TODO: turn it into a height map
    // vec4 texColor = texture2D(uComputeTexture,positionVec2);
    //always gotta end by setting gl_Position equal to something;
    gl_Position = vec4(positionVec2,aPosition.z,1.0);
}