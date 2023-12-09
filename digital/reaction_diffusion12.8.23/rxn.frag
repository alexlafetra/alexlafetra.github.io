
precision lowp float;
//texture coordinates received from vert shader
varying vec2 vTexCoord;

uniform sampler2D uComputeTexture;

uniform vec2 uResolution;

uniform int uFramecount;

uniform vec2 uMouse;
uniform bool uMouseHeld;
uniform bool uPetriDish;
uniform mediump float uBrushRadius;

//reaction constants
uniform float dA;
uniform float dB;
uniform float k;
uniform float f;
uniform float dT;

//kernel for the laplacian convolution
float kernel[9];

//offsets
vec2 offsets[9];
uniform vec2 stepSize;

vec3 laplace(vec2 pos){
    kernel[0] = 0.05; kernel[1] = 0.2;  kernel[2] = 0.05;
    kernel[3] = 0.2;  kernel[4] = -1.0; kernel[5] = 0.2;
    kernel[6] = 0.05; kernel[7] = 0.2;  kernel[8] = 0.05;

    offsets[0] = vec2(-stepSize.x,-stepSize.y);
    offsets[1] = vec2(0.0,-stepSize.y);
    offsets[2] = vec2(stepSize.x,-stepSize.y);

    offsets[3] = vec2(-stepSize.x,0.0);
    offsets[4] = vec2(0.0,0.0);
    offsets[5] = vec2(stepSize.x,0.0);

    offsets[6] = vec2(-stepSize.x,stepSize.y);
    offsets[7] = vec2(0.0,stepSize.y);
    offsets[8] = vec2(stepSize.x,stepSize.y);

    vec3 sum = vec3(0.0,0.0,0.0);
    //get color of surrounding 9 pixels
    for(int i = 0; i<9; i++){
        vec2 tempCoordinate = vec2(pos.x+offsets[i].x,pos.y+offsets[i].y);
        vec4 tempColor = texture2D(uComputeTexture,tempCoordinate);
        sum.r += tempColor.r*kernel[i];
        sum.g += tempColor.g*kernel[i];
        sum.b += tempColor.b*kernel[i];
    }
    return sum;
}

void main() {
  vec2 pixel = gl_FragCoord.xy/uResolution;

  //drawing with the mouse if it's held
  if(uMouseHeld && distance(pixel,uMouse)<uBrushRadius){
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    return;
  }

  //putting it in a petri dish
  if(uPetriDish && distance(pixel,vec2(0.5))>0.48){
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    return;
  }
  
  vec4 textureColor = texture2D(uComputeTexture,pixel);

  float a = textureColor.r;
  float b = textureColor.g;

  //laplacian function (basically, a blur/convolution that brightens edges)
  vec3 lap = laplace(pixel);
  
  //reaction diffusion equation
  //https://karlsims.com/rd.html
  float reaction = a*b*b;
  float newA = a + ((dA * lap.r) - (reaction) + f * (1.0 - a))*dT;
  float newB = b + ((dB * lap.g) + (reaction) - ((k + f) * b ))*dT;

  gl_FragColor = vec4(newA, newB, textureColor.b, 1.0);
}