precision highp float;
precision highp sampler2D;

uniform sampler2D uParticleVel;
uniform sampler2D uParticlePos;

varying vec2 vParticleCoord;

uniform float uScale;
uniform float uAngle;

//sensing
uniform float uSenseAngle;
uniform float uSenseDist;
uniform sampler2D uTrails;

uniform float uFrameCount;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}


//
// Description : GLSL 2D simplex noise function
//      Author : Ian McEwan, Ashima Arts
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License :
//  Copyright (C) 2011 Ashima Arts. All rights reserved.
//  Distributed under the MIT License. See LICENSE file.
//  https://github.com/ashima/webgl-noise
//

// Some useful functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {

    // Precompute values for skewed triangular grid
    const vec4 C = vec4(0.211324865405187,
                        // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,
                        // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,
                        // -1.0 + 2.0 * C.x
                        0.024390243902439);
                        // 1.0 / 41.0

    // First corner (x0)
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other two corners (x1, x2)
    vec2 i1 = vec2(0.0);
    i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
    vec2 x1 = x0.xy + C.xx - i1;
    vec2 x2 = x0.xy + C.zz;

    // Do some permutations to avoid
    // truncation effects in permutation
    i = mod289(i);
    vec3 p = permute(
            permute( i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(
                        dot(x0,x0),
                        dot(x1,x1),
                        dot(x2,x2)
                        ), 0.0);

    m = m*m ;
    m = m*m ;

    // Gradients:
    //  41 pts uniformly over a line, mapped onto a diamond
    //  The ring size 17*17 = 289 is close to a multiple
    //      of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt(a0*a0 + h*h);
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

    // Compute final noise value at P
    vec3 g = vec3(0.0);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
    return 130.0 * dot(m, g);
}


//more basic 4-corner noise
float valueNoise(vec2 coord){
    vec2 i = floor(coord);
    vec2 f = fract(coord);

    //get random val at the corners of a square
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    //smoothly interpolate between them
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) +
        (c - a)* u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

void main(){
    vec4 velocity = texture2D(uParticleVel,vParticleCoord);
    vec4 screenPosition = texture2D(uParticlePos,vParticleCoord);
    // vec3 color = clamp(velocity.xyz+vec3(snoise(screenPosition.xy*10.0))-0.5,-10.0,10.0);

    //simplex noise val will be the new heading of the velocity
    // float theta = uAngle*snoise(screenPosition.xy*uScale);
    // vec2 vel = 1.0*vec2(cos(theta),sin(theta));

    //get current velocity heading
    // float currentAngle = atan(velocity.x,max(velocity.y,0.000000001));
    float currentAngle = acos(dot(vec2(0.0,1.0),normalize(velocity.xy)));

    vec2 sampleHeading1 = vec2(cos(-uSenseAngle+currentAngle),sin(-uSenseAngle+currentAngle));
    vec2 sampleHeading2 = vec2(cos(currentAngle),sin(currentAngle));
    vec2 sampleHeading3 = vec2(cos(uSenseAngle+currentAngle),sin(uSenseAngle+currentAngle));
    //take 3 samples
    vec2 sampleCoord1 = screenPosition.xy+uSenseDist*sampleHeading1;
    vec2 sampleCoord2 = screenPosition.xy+uSenseDist*sampleHeading2;
    vec2 sampleCoord3 = screenPosition.xy+uSenseDist*sampleHeading3;

    //making the sensor coords wrap around
    // sampleCoord1 = mod(sampleCoord1,1.0);
    // sampleCoord2 = mod(sampleCoord2,1.0);
    // sampleCoord3 = mod(sampleCoord3,1.0);

    float val1 = texture2D(uTrails,mod(sampleCoord1,1.0)).x;
    float val2 = texture2D(uTrails,mod(sampleCoord2,1.0)).x;
    float val3 = texture2D(uTrails,mod(sampleCoord3,1.0)).x;

    vec4 turnForce = vec4(0.0);

    // turnForce.xy = sampleHeading2;

    //turn left
    if(val1>val2 && val1>val3){
        turnForce.xy = sampleHeading1;
        velocity+=turnForce;
        velocity/=2.0;
    }
    //turn right
    else if(val3>val2 && val3>val1){
        turnForce.xy = sampleHeading3;
        velocity+=turnForce;
        velocity/=2.0;
    }
    //both the same (head straight)
    else if(val2>val1 && val2>val3){
        turnForce.xy = sampleHeading2;
        // velocity+=turnForce;
    }
    //all three the same (choose randomly)
    else{
        float which = mod(floor(uFrameCount*vParticleCoord.x),3.0);
        // float which = 1.0;
        // if(which == 0.0){
        //     turnForce.xy = sampleHeading1;
        //     velocity+=turnForce;
        //     velocity/=2.0;
        // }
        // else if(which == 2.0){
        //     turnForce.xy = sampleHeading3;
        //     velocity+=turnForce;
        //     velocity/=2.0;
        // }
    }
    gl_FragColor = vec4(velocity.xy,currentAngle/360.0,1.0);
}