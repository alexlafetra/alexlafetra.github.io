const rainbowVert = `
  precision lowp float;
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

const rainbowFrag = `

  precision lowp float;
  uniform float brightness;
  uniform float saturation;
  varying vec2 vTexCoord;
  
  // Official HSV to RGB conversion 
  vec3 hsv2rgb( in vec3 c )
  {
      vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
  
    return c.z * mix( vec3(1.0), rgb, c.y);
  }

  
  void main() {
    float theta = atan(vTexCoord.y-0.5,vTexCoord.x-0.5)/(6.28318);
    float dist = sqrt(pow(vTexCoord.x-0.5,2.0)+pow(vTexCoord.y-0.5,2.0))/saturation;
    vec3 hsv = vec3(theta,dist,brightness);
    gl_FragColor = vec4(hsv2rgb(hsv),1.0);
  }
`;
