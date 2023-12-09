//this shader draws particles to the screen using their position data

precision highp float;

uniform sampler2D uPositionTexture;
varying vec2 vTexCoord;

void main(){
    float dist;
    //this is a very inefficient idea
    for(int x1 = 0; x1<10; x1++){
        for(int y1 = 0; y1<10; y1++){
            vec4 particleLocation = texture2D(uPositionTexture,vec2(x1,y1));
            vec2 pixel = gl_FragCoord.xy;

            //calculate distance from each particle
            dist = distance(particleLocation.xy,pixel)/800.0;
            if(dist<0.10){
                gl_FragColor = vec4(1.0,0.0,0.0,1.0);
                return;
            }
        }
    }
    // gl_FragColor = vec4(0.0,1.0,0.0,1.0);
    gl_FragColor = vec4(dist,dist,dist,1.0);
    // gl_FragColor = vec4(dist/800.0,dist/800.0,dist/800.0,1.0);
}