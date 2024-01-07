precision mediump float;

varying vec2 vTexCoord;

uniform vec3 uPoint1;
uniform vec3 uPoint2;
uniform vec3 uPoint3;
uniform vec3 uPoint4;
uniform vec3 uPoint5;


uniform float uPointsAndWeights[15];//5 points x,y and 5 weights

void main(){
    
    //get the absolute distance between the pixel and each point
    float d1 = (distance(vec2(uPoint1.x,uPoint1.y),vTexCoord));
    float d2 = (distance(vec2(uPoint2.x,uPoint2.y),vTexCoord));
    float d3 = (distance(vec2(uPoint3.x,uPoint3.y),vTexCoord));
    float d4 = (distance(vec2(uPoint4.x,uPoint4.y),vTexCoord));
    float d5 = (distance(vec2(uPoint5.x,uPoint5.y),vTexCoord));

    //color should be a (r,g) vector pointing towards a point
    //scaled by the distance to the point
    vec2 c = vec2(0.0);
    c+=(uPoint1.xy-vTexCoord)/(d1*d1);
    c+=(uPoint2.xy-vTexCoord)/(d2*d2);
    c+=(uPoint3.xy-vTexCoord)/(d3*d3);
    c+=(uPoint4.xy-vTexCoord)/(d4*d3);
    c+=(uPoint5.xy-vTexCoord)/(d5*d5);

    c = normalize(c);

    gl_FragColor = vec4(c.x,c.y,0.0,1.0);
}