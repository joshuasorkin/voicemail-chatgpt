

import dotenv from 'dotenv';
dotenv.config();

//package imports
import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import OpenAI from 'openai';

//local file imports
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse.js';
import TwimlBuilder from './twimlBuilder.js';
import OpenAIUtility from './OpenAIUtilty.js';
import StringAnalyzer from './StringAnalyzer.js';
import Database from './Database.js';
import StreamBuilder from './StreamBuilder.js';

// Miscellaneous object initialization
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
const twimlBuilder = new TwimlBuilder();
const stringAnalyzer = new StringAnalyzer();
const openAIUtility = new OpenAIUtility();
const database = new Database();
await database.initialize();
let protocol;


// Twilio configuration
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const streamBuilder = new StreamBuilder(client,twimlBuilder);

//todo: take this out once we confirm that mongo is working on fly.io
// database test function
import { main } from './mongo-test.js';

// GET endpoint for testing database
//todo: take this out once we confirm that mongo is working on fly.io
app.get('/dbtest', async (req,res) => {
    main();
});

//todo: use session to cache call data (e.g. streams, messages) locally,
//and asynchronously push data to database.  should reduce latency,
//high availability of data in db not as important

//todo: add twilio authentication to each of these endpoints (ref. vent-taskrouter)
// GET endpoint for redirect after response with question
app.get('/twilio-webhook', async (req, res) => {
    const callSid = req.query.CallSid;
    const call = database.getOrAddCall(callSid);
    console.log("Entering GET twilio-webhook...");
    const speechResult = req.query.SpeechResult;
    console.log({speechResult});
    const twiml = new twilio.twiml.VoiceResponse();
    if (speechResult && speechResult !== undefined){
        const url = `/enqueue-and-process?SpeechResult=${encodeURIComponent(speechResult)}`;      
        twiml.redirect({method:'GET'},url);
    }
    else{
        let greeting;
        const gather = twiml.gather({
            input:'speech',
            action:'/enqueue-and-process',
            method:'GET',
            speechTimeout:process.env.TWILIO_SPEECH_TIMEOUT_SECONDS,
            timeout:process.env.TWILIO_TIMEOUT_SECONDS,
        });
        if(req.query.question){
            greeting = req.query.question;
        }
        else{
            greeting = "What would you like to say?";
            if(call.userMessages.length === 0){
                greeting = "Hi!  I'm Chat GPT.  " + greeting;
            }
        }
        twimlBuilder.sayReading(gather,greeting);
        const question = req.query.question;
        const url = `/twilio-webhook${question ? `?question=${encodeURIComponent(question)}` : ''}`;
        twiml.redirect({
                method:'GET'
            },
            url
        );
    }
    console.log(twiml.toString());
    res.send(twiml.toString());
});

app.get('/enqueue-and-process', async (req, res) => {
    try{
        console.log("now entering GET enqueue-and-process...")
        const userSpeech = req.query.SpeechResult;
        console.log({userSpeech});
        const callSid = req.query.CallSid;
        await database.addUserMessage(callSid,userSpeech);

        //enqueue call
        const twiml = new VoiceResponse();
        twiml.enqueue({waitUrl: '/wait'},'holdQueue');
        protocol = process.env.PROTOCOL || req.protocol;
        const absoluteUrl = protocol+'://'+req.get('host');
        console.log({absoluteUrl});
        processCall(callSid,absoluteUrl);
        console.log("enqueue-and-process twiml: ",twiml.toString())
        res.send(twiml.toString());
    }
    catch(error){
        console.log(error);
        res.send(`Error occurred during /enqueue-and-process: ${error}`);
    }

});

app.post('/wait', function (req, res) {
    const response = new VoiceResponse();
    response.play(process.env.WAIT_URL);
    console.log(response.toString());
    res.send(response.toString());
});

//while the user is on hold, get a response to their prompt and then dequeue them and say the response
//todo: this should be refactored into getPromptResponse() and dequeue() and sayResponse() or something like that,
//right now the function is doing too much
//also it doesn't belong in index.js, we should just have endpoint handlers here
async function processCall(callSid,absoluteUrl){
    const call = await database.getCall(callSid);
    if (!call){
        console.log("call not found");
        return res.sendStatus(400);
    }
    console.log(call);
    const userMessages = call.userMessages;
    console.log({userMessages});
    //todo: move end of these try catch blocks into a finally block
    try {
        //generate response to user's prompt
        const result = await openAIUtility.chatGPTGenerate(userMessages);
        await database.addAssistantMessage(callSid,result);
        const twiml = twiml_sayRedirect(result,absoluteUrl);
        const call_twilio = await client.calls(callSid).fetch();
        if (call_twilio.status === 'completed' || call_twilio.status === 'canceled'){
            return new VoiceResponse().say("Thank you for using the system.");
        }
        await client.calls(callSid).update({
            twiml:twiml
        });
    }
    catch(error){
        console.log({error});
        const twiml = twiml_sayRedirect("Sorry, there was an error while processing your request.",absoluteUrl);
        const call_twilio = await client.calls(callSid).fetch();
        if (call_twilio.status === 'completed' || call_twilio.status === 'canceled'){
            return new VoiceResponse().say("Thank you for using the system.");
        }
        await client.calls(callSid).update({
            twiml:twiml
        });
    }
}

function twiml_sayRedirect(result,absoluteUrl){
    const twiml = new twilio.twiml.VoiceResponse();
    const question = stringAnalyzer.getFinalQuestion(result);
    const url = absoluteUrl+`/twilio-webhook${question ? `?question=${encodeURIComponent(question)}` : ''}`;
    const gather = twiml.gather({
        input:'dtmf speech',
        speechTimeout:process.env.TWILIO_SPEECH_TIMEOUT_SECONDS,
        method:'GET',
        action:url,
        actionOnEmptyResult:true
    });   
    
    let fragments = stringAnalyzer.splitStringIntoFragments(result,process.env.TWILIO_MAX_RESPONSE_LENGTH)
    console.log({fragments});
    fragments.forEach(fragment => twimlBuilder.say(gather,fragment));
    
    console.log(result);

    return twiml;
}



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
