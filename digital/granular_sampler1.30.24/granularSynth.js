/*

Using Tone.js!
https://tonejs.github.io/docs/15.0.4/classes/GrainPlayer.html

*/

class MurmurSynth{
    constructor(){
        this.grainPlayer = new Tone.GrainPlayer({
            // url : "audio/dishes-fall-and-crash-117075.mp3",
            // onload  : Tone.noOp ,
            // overlap  : 0.05 ,
            // grainSize  : 0.1 ,
            // playbackRate  : 8.1 ,
            // detune  : 0 ,
            // loop  : true ,
            // loopStart  : 0 ,
            // loopEnd  : 0 ,
            // reverse  : false
            url : "audio/demo1_chopin.mp3",
            onload  : Tone.noOp ,
            overlap  : 0.05 ,
            grainSize  : 0.1 ,
            playbackRate  : 1 ,
            detune  : 0 ,
            loop  : true ,
            loopStart  : 0 ,
            loopEnd  : 0 ,
            reverse  : false
          }).toMaster();
        
          this.grainPlayer.start();

          console.log(this.grainPlayer);
    }
    setParamsFromStats(settings,stats){

        //reverse
        //try making this flip when birds are flying into/away from orbit
        const xyHeading = createVector(stats.averageVelocity.x,stats.averageVelocity.y);
        if(xyHeading.heading()>PI/2){
            // this.grainPlayer.reverse = true;
        }
        else{
            this.grainPlayer.reverse = false;
        }

        //implement randomness?

        //detune
        // this.grainPlayer.detune = sq(stats.averageDifferenceInBirdPositions*10)-10;
        // this.grainPlayer.detune = sq(stats.averageVelocity.mag());
        this.grainPlayer.detune = stats.averageFlockSize;
        // console.log(this.grainPlayer.detune);

        //grain size
        // this.grainPlayer.grainSize = map(stats.velocityVariance.mag(),0,40,0,1);
        // this.grainPlayer.grainSize = stats.averageVelocity.mag();
        this.grainPlayer.grainSize = max(1/(max(stats.averageFlockSize*100,0.01)),0.01);
        // console.log(this.grainPlayer.grainSize);

        //grain rate
        this.grainPlayer.playbackRate = max(sq(stats.velocityVariance.mag())/stats.birdPopulation,0.01);

    }
}