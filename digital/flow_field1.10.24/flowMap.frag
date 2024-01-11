precision mediump float;

varying vec2 vTexCoord;

uniform vec3 uAttractors[10];
uniform vec3 uRepulsors[10];

uniform float uStrengthEffect;

void main(){
    vec2 c = vec2(0.0);

    //calculate attractors
    for(int i = 0; i<10; i++){
        float d = distance(uAttractors[i].xy,vTexCoord);
        //add a vector pointing toward the attractor from this pixel
        //scaled by the inverse square of the distance AND the scale factor
        c+=uAttractors[i].z*(uAttractors[i].xy-vTexCoord)/(d*d);
    }

    //calculate repulsors
    for(int i = 0; i<10; i++){
        float d = distance(uRepulsors[i].xy,vTexCoord);
        c+=uRepulsors[i].z*(-uRepulsors[i].xy+vTexCoord)/(d*d);
    }

    c = normalize(c);

    gl_FragColor = vec4(c.x,c.y,1.0,1.0);
}