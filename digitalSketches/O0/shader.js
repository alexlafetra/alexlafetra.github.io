let vert = `
  attribute vec3 aPosition;
  
  // P5 provides us with texture coordinates for most shapes
  attribute vec2 aTexCoord;
  
  // This is a varying variable, which in shader terms means that it will be passed from the vertex shader to the fragment shader
  varying vec2 vTexCoord;
  
  void main() {
    // Copy the texcoord attributes into the varying variable
    vTexCoord = aTexCoord;
     
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  
    gl_Position = positionVec4;
  }
`;

let frag = `
precision lowp float;

varying vec2 vTexCoord;
uniform sampler2D tex;
uniform vec2 resolution;
uniform vec2 direction;


// gaussian blur filter modified from Filip S. at intel 
// https://software.intel.com/en-us/blogs/2014/07/15/an-investigation-of-fast-real-time-gpu-based-image-blur-algorithms
// this function takes three parameters, the texture we want to blur, the uvs, and the texelSize
vec3 gaussianBlur( sampler2D t, vec2 texUV, vec2 stepSize ){   
  // a variable for our output                                                                                                                                                                 
  vec3 colOut = vec3( 0.0 );                                                                                                                                   

  // stepCount is 9 because we have 9 items in our array , const means that 9 will never change and is required loops in glsl                                                                                                                                     
  const int stepCount = 9;

  // these weights were pulled from the link above
  float gWeights[stepCount];
      gWeights[0] = 0.10855;
      gWeights[1] = 0.13135;
      gWeights[2] = 0.10406;
      gWeights[3] = 0.07216;
      gWeights[4] = 0.04380;
      gWeights[5] = 0.02328;
      gWeights[6] = 0.01083;
      gWeights[7] = 0.00441;
      gWeights[8] = 0.00157;

  // these offsets were also pulled from the link above
  float gOffsets[stepCount];
      gOffsets[0] = 0.66293;
      gOffsets[1] = 2.47904;
      gOffsets[2] = 4.46232;
      gOffsets[3] = 6.44568;
      gOffsets[4] = 8.42917;
      gOffsets[5] = 10.41281;
      gOffsets[6] = 12.39664;
      gOffsets[7] = 14.38070;
      gOffsets[8] = 16.36501;
  
  // lets loop nine times
  for( int i = 0; i < stepCount; i++ ){  

    // multiply the texel size by the by the offset value                                                                                                                                                               
      vec2 texCoordOffset = gOffsets[i] * stepSize;

    // sample to the left and to the right of the texture and add them together                                                                                                           
      vec3 col = texture2D( t, texUV + texCoordOffset ).xyz + texture2D( t, texUV - texCoordOffset ).xyz; 

    // multiply col by the gaussian weight value from the array
    col *= gWeights[i];

    // add it all up
      colOut +=  col + texture2D( t, texUV).xyz;                                                                                                                               
  }

  // our final value is returned as col out
  return colOut;                                                                                                     
} 



void main() {

  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;
  
  vec2 texel = 1.0 / resolution;
  vec2 stepSize = texel * direction;

  vec3 blur = gaussianBlur(tex, uv, stepSize);
  
  // Send the color to the screen
  gl_FragColor = vec4(blur, 1.0);
}
`;
