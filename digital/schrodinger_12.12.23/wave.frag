precision highp float;

varying vec2 vTextureCoord;

uniform float uRandomSeed;
uniform float uScale;
uniform float uOpacity;

uniform float uTime;

//taken from the lovely https://thebookofshaders.com/10/
float random(vec2 coord, float seed){
    return fract(sin(dot(coord.xy,vec2(22.9898-seed,78.233+seed)))*43758.5453123*seed);
}

float simpleRand(float a){
    return fract(sin(a)*10000.0);
}



float noiseGen(float x){
    float i = floor(x);  // integer
    float f = fract(x);  // fraction
    // float u = f * f * (3.0 - 2.0 * f ); // custom cubic curve

    return mix(simpleRand(i), simpleRand(i + 1.0), smoothstep(0.0,1.0,f));
}

float noiseGen(vec2 v){
    float i = floor(v.x);  // integer
    float k = floor(v.y);
    float f = fract(v.x);  // fraction
    // float u = f * f * (3.0 - 2.0 * f ); // custom cubic curve

    return mix(simpleRand(i), simpleRand(i + 1.0), smoothstep(0.0,1.0,f));
}

// procedural noise from IQ
vec2 hash( vec2 p )
{
	p = vec2( dot(p,vec2(127.1,311.7)),
			 dot(p,vec2(169.5,183.3)) );
	return vec2(-1.0 + 2.0*fract(sin(p)*43758.5453123));
}

float noise(vec2 p )
{
	const float K1 = 0.366025404; // (sqrt(3)-1)/2;
	const float K2 = 0.211324865; // (3-sqrt(3))/6;
	
	vec2 i = floor( p + (p.x+p.y)*K1 );
	
	vec2 a = p - i + (i.x+i.y)*K2;
	vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
	vec2 b = a - o + K2;
	vec2 c = a - 1.0 + 2.0*K2;
	
	vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	
	vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
	
	return dot( n, vec3(200.0) );
    // return 1.0;
}

void main() {
    vec2 uv = (gl_FragCoord.xy) * 2.0 - 1.0;

    float r = length(uv);  // Radial distance
    float theta = atan(uv.y, uv.x);  // Azimuthal angle

    // Parameters (you may need to adjust these based on your simulation)
    float hbar = 1.0;  // Reduced Planck constant
    float m = 1.0;     // Electron mass
    float e = 1.0;     // Elementary charge
    float l = 2.0;         // Azimuthal quantum number for a higher orbital

    // Potential energy term
    float potential = -e * e / r;

    // Radial Laplacian term
    // float radialLaplacian = -(hbar * hbar / (2.0 * m)) * (1.0 / r) * (1.0 / r) * (1.0 / r) * (r*r * (1.0 / r) * (dFdy(r * r * (1.0 / r)) - dFdx(r * r * (1.0 / r))));
    // // Angular Laplacian term
    // float angularLaplacian = -(hbar * hbar / (2.0 * m)) * l * (l + 1) / (r * r);

    // // Time-independent Schrödinger equation
    // float schrodinger = radialLaplacian + angularLaplacian + potential;

    // // Final result (you may need to handle imaginary parts)
    // vec3 color = vec3(0.5 + 0.5 * sin(schrodinger), 0.5 + 0.5 * cos(schrodinger), 0.5);

    vec4 grain = vec4(random(vTextureCoord,uRandomSeed)*uScale,random(vTextureCoord,uRandomSeed)*uScale,random(vTextureCoord,uRandomSeed)*uScale,1.0);
    gl_FragColor = vec4(grain.xyz, 1.0);
}