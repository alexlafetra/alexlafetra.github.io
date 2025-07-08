const glsl = x => x;

class FlowCanvas{
    constructor(w,h,img,canvas,noiseOffset,viewOffset){
        this.mainCanvas = canvas;
        this.height = h;
        this.width = w;
        //holds the flow field
        this.flowFieldCanvas = createFramebuffer({ width: w, height: h, textureFiltering: NEAREST, format: FLOAT});
        this.outputCanvas = createFramebuffer({ width: w, height: h, textureFiltering: NEAREST, format: FLOAT});
        this.targetImage = img;
        this.flowFieldShader = this.createFlowFieldShader();
        this.outputShader = this.createOutputShader();
        this.warpAmount = {x:0.0,y:0.0};

        this.noiseScaleSlider = createSlider(0.0,5.0,1.0,0.001);
        this.imageScaleSlider = createSlider(0.0,2.0,0.1,0.01);
        this.noiseFrequencySlider = createSlider(0.0,5.0,0.0,0.01);
        this.erosionSlider = createSlider(0.0,0.1,0.0,0.001);
        this.gridThicknessSlider = createSlider(0.0,0.05,0.001,0.001);

        this.noiseOffset = noiseOffset;
        this.viewOffset = viewOffset;
    }
    loadImage(im){
        this.targetImage.begin();
        clear();
        image(im,-im.width/2,-im.height/2,im.width,im.height);
        this.targetImage.end();
    }
    loadText(t){
        //set font settings
        textFont(font);
        fill(255,0,0);
        noStroke();
        textSize(200);
        textAlign(CENTER);

        //get text bounds
        const bounds = font.textBounds(t);
        if(bounds.h > bounds.w){
            bounds.w = bounds.h;
        }
        else{
            bounds.h = bounds.w;
        }
        this.targetImage = createFramebuffer({ width: bounds.w+100, height: bounds.h+100, textureFiltering: NEAREST, format: FLOAT});
        this.targetImage.begin();
        clear();
        text(t,0,0);
        this.targetImage.end();
    }
    render(){
        this.flowFieldCanvas.begin();
        clear();
        shader(this.flowFieldShader);
        this.flowFieldShader.setUniform('uErosionAmplitude',this.erosionSlider.value());
        this.flowFieldShader.setUniform('uHighFrequencyNoiseCoefficient',this.noiseFrequencySlider.value());
        this.flowFieldShader.setUniform('uViewOffset',[this.viewOffset.offset.x/this.width,this.viewOffset.offset.y/this.height]);
        this.flowFieldShader.setUniform('uNoiseScale',this.noiseScaleSlider.value());
        this.flowFieldShader.setUniform('uNoiseOffset',[this.noiseOffset.offset.x/this.width,this.noiseOffset.offset.y/this.height]);
        rect(-this.flowFieldCanvas.width / 2, -this.flowFieldCanvas.height / 2, this.flowFieldCanvas.width, this.flowFieldCanvas.height);
        this.flowFieldCanvas.end();
        this.outputCanvas.begin();
        clear();
        shader(this.outputShader);
        this.outputShader.setUniform('uTargetImage',this.targetImage);
        this.outputShader.setUniform('uImageScale',this.imageScaleSlider.value());
        // this.outputShader.setUniform('uImageScale',0.1);
        this.outputShader.setUniform('uImageWidth',this.targetImage.width/this.outputCanvas.width);
        this.outputShader.setUniform('uFlowTexture',this.flowFieldCanvas);
        this.outputShader.setUniform('uGridSize',10.0);
        this.outputShader.setUniform('uViewOffset',[this.viewOffset.offset.x/this.width,this.viewOffset.offset.y/this.height]);
        this.outputShader.setUniform('uGridThickness',this.gridThicknessSlider.value());
        // this.outputShader.setUniform('uWarpAmount',[8.0,8.0]);
        this.outputShader.setUniform('uWarpAmount',[this.noiseScaleSlider.value(),this.noiseScaleSlider.value()]);
        rect(-this.outputCanvas.width / 2, -this.outputCanvas.height / 2, this.outputCanvas.width, this.outputCanvas.height);
        this.outputCanvas.end();
        clear();
        image(this.outputCanvas,-this.mainCanvas.width/2,-this.mainCanvas.height/2,this.mainCanvas.width,this.mainCanvas.height);
    }
    createFlowFieldShader(){
        const shaderSource = {
            vertexShader:glsl`#version 300 es
            precision highp float;

            //screen position attribute
            in vec3 aPosition;
            //screen position varying that gets passed to the fragment shader
            out vec2 vPosition;

            void main(){
                vPosition = vec2(aPosition.x,aPosition.y);
                gl_Position = vec4(aPosition*2.0-1.0,1.0);
            }
            `,

            //stole the noise algos from: https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
            fragmentShader:glsl`#version 300 es
            precision highp float;

            uniform float uNoiseScale;
            uniform vec2 uNoiseOffset;
            uniform vec2 uViewOffset;
            uniform float uHighFrequencyNoiseCoefficient;
            uniform float uErosionAmplitude;
            in vec2 vPosition;
            out vec4 fragColor;

            float hash(float n) { return fract(sin(n) * 1e4); }
            float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
            float noise(vec2 x) {
                vec2 i = floor(x);
                vec2 f = fract(x);

                // Four corners in 2D of a tile
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));

                // Simple 2D lerp using smoothstep envelope between the values.
                // return vec3(mix(mix(a, b, smoothstep(0.0, 1.0, f.x)),
                //			mix(c, d, smoothstep(0.0, 1.0, f.x)),
                //			smoothstep(0.0, 1.0, f.y)));

                // Same code, with the clamps in smoothstep and common subexpressions
                // optimized away.
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            void main() {
                fragColor = vec4(noise(vPosition + uNoiseOffset) + noise(vPosition*uHighFrequencyNoiseCoefficient + uNoiseOffset)+ uErosionAmplitude*noise(vPosition*500.0 + uNoiseOffset) - uErosionAmplitude/2.0,noise(vPosition.yx + uNoiseOffset.yx)+noise(vPosition.yx*uHighFrequencyNoiseCoefficient + uNoiseOffset.yx)+uErosionAmplitude*noise(vPosition.yx*500.0 + uNoiseOffset.yx)- uErosionAmplitude/2.0,0.0,1.0);
            }
            `
        }
        return createShader(shaderSource.vertexShader, shaderSource.fragmentShader);
    }
    createOutputShader(){
            const shaderSource = {
            vertexShader:glsl`#version 300 es
            precision highp float;
            precision highp sampler2D;

            //screen position attribute
            in vec3 aPosition;
            //screen position varying that gets passed to the fragment shader
            out vec2 vPosition;

            void main(){
                vPosition = vec2(aPosition.x,aPosition.y);
                gl_Position = vec4(aPosition*2.0-1.0,1.0);
            }
            `,
            fragmentShader:glsl`#version 300 es
            precision highp float;
            precision highp sampler2D;

            in vec2 vPosition;
            uniform sampler2D uFlowTexture;
            uniform sampler2D uTargetImage;
            uniform vec2 uWarpAmount;
            uniform vec2 uViewOffset;
            out vec4 fragColor;

            uniform float uImageScale;
            uniform float uImageWidth;

            uniform float uGridSize;
            uniform float uGridThickness;

            void main() {
                vec4 sampleCoordinates = texture(uFlowTexture,vPosition) - 0.5 + vec4(uViewOffset,1.0,1.0);
                vec2 warpedCoordinates = vec2(vPosition.x+sampleCoordinates.x * uWarpAmount.x,vPosition.y+sampleCoordinates.y * uWarpAmount.y);
                vec2 adjustedCoordinates = (warpedCoordinates - 0.5)/uImageScale + 0.5;
                //check if it's on a grid coordinate
                float alpha = max(max(1.0 / uGridSize - mod(warpedCoordinates.x,1.0/uGridSize),mod(warpedCoordinates.x,1.0/uGridSize)),max(1.0 / uGridSize - mod(warpedCoordinates.y,1.0/uGridSize),mod(warpedCoordinates.y,1.0/uGridSize)));
                vec4 gridColor = vec4(0.0,0.0,1.0,1.0);
                vec4 imageColor = texture(uTargetImage,adjustedCoordinates);
                if(imageColor.a != 0.0){
                    fragColor = imageColor;
                }
                else{
                    // if(alpha < (1.0 / uGridSize - uGridThickness)){
                    //     fragColor = imageColor;
                    // }
                    // else{
                    //     fragColor = gridColor+imageColor;
                    // }
                    fragColor = mix(gridColor,vec4(1.0),1.0 - (alpha * alpha * uGridSize));
                    // fragColor = gridColor;
                    // discard;
                }
            }
            `
        }
        return createShader(shaderSource.vertexShader, shaderSource.fragmentShader);
    }
}