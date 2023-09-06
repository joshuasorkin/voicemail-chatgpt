require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const OpenAI = require('openai');
const VoiceResponse = require('twilio/lib/twiml/VoiceResponse');
const TwimlBuilder = require('./twimlBuilder');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
const twimlBuilder = new TwimlBuilder();
let protocol;

const messages_default = [
    {role: 'system', content: 'Your response must be 2000 characters or less.'},
    {role: 'system', content: 'Use conversational American English.'}
]

// Set up your API key and endpoint
const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
});

const callsData = {};


//todo: separate chatGPT-specific functionality into its own class, e.g.
//chatGPTGenerate() and messages_default
//include methods addMessage_user() and addMessage_chatGPT()
async function chatGPTGenerate(userMessages) {
    try{
        const messages = [
            {role: 'system', content: 'Your response must be 2000 characters or less.'},
            {role: 'system', content: 'Use casual, conversational American English.'},
            {role: 'system', content: 'If I do not ask for a specific length of response, limit your response to 3 sentences or less.'},
            {role: 'system', content: 'At the end of your response, always ask me an open-ended question related to our discussion.'}
        ]
        userMessages.forEach(message => {
            messages.push(message);
        })
        console.log(`Messages to be sent: ${userMessages}`);
        const completion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-3.5-turbo'
        });
        console.log(`and the response has returned from OpenAI`);
        response = completion.choices[0].message.content;
        userMessages.push({role:'assistant',content:response})
        console.log({userMessages});
        return response;
    }
    catch(error){
        console.log(error);
        return error;
    }
}



// Twilio configuration
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// GET endpoint for redirect after response with question
app.get('/twilio-webhook', async (req, res) => {
    console.log("Entering GET twilio-webhook...");
    const speechResult = req.query.SpeechResult;
    console.log({speechResult});
    const callSid = req.query.CallSid;
    const twiml = new twilio.twiml.VoiceResponse();

    if (speechResult !== undefined){
        const url = `/enqueue-and-process?SpeechResult=${encodeURIComponent(speechResult)}`;      
        twiml.redirect(url);
    }
    else{
        let greeting;
        const gather = twiml.gather({
            input:'speech',
            action:'/enqueue-and-process',
            speechTimeout:process.env.TWILIO_SPEECH_TIMEOUT_SECONDS,
            timeout:process.env.TWILIO_TIMEOUT_SECONDS,
        });
        if(req.query.question){
            greeting = req.query.question;
        }
        else{
            greeting = "What would you like to say?";
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
    res.send(twiml.toString());
});

// Twilio webhook endpoint
app.post('/twilio-webhook', async (req, res) => {
    const callSid = req.body.CallSid;
    const twiml = new twilio.twiml.VoiceResponse();
    const gather = twiml.gather({
        input:'speech',
        action:'/enqueue-and-process',
        speechTimeout:process.env.TWILIO_SPEECH_TIMEOUT_SECONDS,
        timeout:process.env.TWILIO_TIMEOUT_SECONDS,
    });
    let greeting = "What would you like to say?";
    if(!callsData[callSid] || callsData[callSid].userMessages.length === 0){
        greeting = "Hi!  I'm Chat GPT.  " + greeting;
    }
    twimlBuilder.sayReading(gather,greeting);
    twiml.redirect('/twilio-webhook');
    res.send(twiml.toString());
});

//todo: need to refactor code duplicated between GET/POST endpoints of '/enqueue-and-process' and '/twilio-webhook'

app.get('/enqueue-and-process', async (req, res) => {
    try{
        const userSpeech = req.query.SpeechResult;
        const callSid = req.query.CallSid;
        if (!callsData[callSid]){
            callsData[callSid] = {
                userMessages: [{role:'user',content:userSpeech}]
            }
        }
        else{
            callsData[callSid].userMessages.push({role:'user',content:userSpeech});
        }     

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

})



app.post('/enqueue-and-process', async (req, res) => {
    try{
        const userSpeech = req.body.SpeechResult;
        const callSid = req.body.CallSid;
        if (!callsData[callSid]){
            callsData[callSid] = {
                userMessages: [{role:'user',content:userSpeech}]
            }
        }
        else{
            callsData[callSid].userMessages.push({role:'user',content:userSpeech});
        }     

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

async function processCall(callSid,absoluteUrl){
    const callData = callsData[callSid];
    if (!callData){
        console.log("callData not found");
        return res.sendStatus(400);
    }
    console.log({callData});
    const userMessages = callData.userMessages;
    console.log({userMessages});
    try {
        const result = await chatGPTGenerate(userMessages);
        const client = twilio();
        const twiml = twiml_sayRedirect(result,absoluteUrl);
        const call = await client.calls(callSid).fetch();
        if (call.status === 'completed' || call.status === 'canceled'){
            return new VoiceResponse().say("Thank you for using the system.");
        }
        await client.calls(callSid).update({
            twiml:twiml
        });
    }
    catch(error){
        console.log({error});
        const client = twilio();
        const twiml = twiml_sayRedirect("Sorry, there was an error while processing your request.",absoluteUrl);
        const call = await client.calls(callSid).fetch();
        if (call.status === 'completed' || call.status === 'canceled'){
            return new VoiceResponse().say("Thank you for using the system.");
        }
        await client.calls(callSid).update({
            twiml:twiml
        });
    }
}

function twiml_sayRedirect(result,absoluteUrl){
    const twiml = new twilio.twiml.VoiceResponse();
    const question = getFinalQuestion(result);
    const url = absoluteUrl+`/twilio-webhook${question ? `?question=${encodeURIComponent(question)}` : ''}`;
    const gather = twiml.gather({
        input:'speech',
        speechTimeout:process.env.TWILIO_SPEECH_TIMEOUT_SECONDS,
        method:'GET',
        action:url,
        actionOnEmptyResult:true
    });   
    
    let fragments = splitStringIntoFragments(result,process.env.TWILIO_MAX_RESPONSE_LENGTH)
    console.log({fragments});
    fragments.forEach(fragment => twimlBuilder.say(gather,fragment));
    
    console.log(result);

    return twiml;
}

function splitStringIntoFragments(inputString, N) {
    const fragments = [];

    for (let i = 0; i < inputString.length; i += N) {
        fragments.push(inputString.slice(i, i + N));
    }

    return fragments;
}

function getFinalQuestion(str){
    const regex = /[^.!?]+[?]+\s*$/;
    const match = str.match(regex);

    if (match) {
        const lastSentence = match[0].trim();
        return lastSentence;
    } else {
        return null;
    }
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
