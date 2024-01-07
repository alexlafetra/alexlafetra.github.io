precision mediump float;

varying vec2 vTexCoord;

uniform vec2 uPoint1;
uniform vec2 uPoint2;
uniform vec2 uPoint3;
uniform vec2 uPoint4;
uniform vec2 uPoint5;
uniform vec2 uPoint6;
uniform vec2 uPoint7;
uniform vec2 uPoint8;
uniform vec2 uPoint9;
uniform vec2 uPoint10;

void main(){
    
    //get the absolute distance between the pixel and each point
    float d1 = (distance(vec2(uPoint1.x,uPoint1.y),vTexCoord));
    float d2 = (distance(vec2(uPoint2.x,uPoint2.y),vTexCoord));
    float d3 = (distance(vec2(uPoint3.x,uPoint3.y),vTexCoord));
    float d4 = (distance(vec2(uPoint4.x,uPoint4.y),vTexCoord));
    float d5 = (distance(vec2(uPoint5.x,uPoint5.y),vTexCoord));
    float d6 = distance(uPoint6,vTexCoord);
    float d7 = distance(uPoint7,vTexCoord);
    float d8 = distance(uPoint8,vTexCoord);
    float d9 = distance(uPoint9,vTexCoord);
    float d10 = distance(uPoint10,vTexCoord);

    //color should be a (r,g) vector pointing towards a point
    //scaled by the distance to the point
    vec2 c = vec2(0.0);
    c+=(uPoint1.xy-vTexCoord)/(d1*d1*0.001);
    c+=(uPoint2.xy-vTexCoord)/(d2*d2*0.001);
    c+=(uPoint3.xy-vTexCoord)/(d3*d3*0.001);
    c+=(uPoint4.xy-vTexCoord)/(d4*d4*0.001);
    c+=(uPoint5.xy-vTexCoord)/(d5*d5*0.001);
    c+=(uPoint6.xy-vTexCoord)/(d6*d6*0.001);
    c+=(uPoint7.xy-vTexCoord)/(d7*d7*0.001);
    c+=(uPoint8.xy-vTexCoord)/(d8*d8*0.001);
    c+=(uPoint9.xy-vTexCoord)/(d9*d9*0.001);
    c+=(uPoint10.xy-vTexCoord)/(d10*d10*0.001);

    c = normalize(c);

    gl_FragColor = vec4(c.x,c.y,1.0,1.0);
}