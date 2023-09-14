//this class is for building various types of
//frequently used twiml blocks
//the idea is that rather than redirecting to an endpoint that then returns the
//twiml block, instead we just add the twiml block on in whatever endpoint we're already in

import VoiceResponse from 'twilio/lib/twiml/VoiceResponse.js';
import twilio from 'twilio';

class TwimlBuilder{
    constructor(){
        this.voice=process.env.TWILIO_SAY_VOICE;
        this.rate=process.env.TWILIO_SAY_PROSODY_RATE;
    }

    //add a say() in the configured voice and language
    say(response,message){
        const sayObj=response.say({
            voice:this.voice,
        });
        sayObj.prosody({
            rate:this.rate
        },message);

    }

    sayReading(response,message){
        const sayObj=response.say({
            voice:process.env.TWILIO_SAY_VOICE_READING
            //language:this.language
        });
        sayObj.prosody({
            rate:this.rate
        },message);

    }

    playChime(response){
        response.play(process.env.CHIME_URL);
    }

    //todo: make this generic, pulling the AssemblyAI info from a config object parameter
    startStream(response){
        console.log("req.headers.host ",req.headers.host);
        const start = twiml.start();
        start.stream({
            name:'AssemblyAI',
            url: `wss://${req.headers.host}`
        });
    }

}

export default TwimlBuilder;