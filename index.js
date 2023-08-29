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

// Set up your API key and endpoint
const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
});

const callsData = {};

async function chatGPTGenerate(prompt) {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });  
    response = completion.choices[0].message.content;
    return response;
}



// Twilio configuration
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Twilio webhook endpoint
app.post('/twilio-webhook', async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    const gather = twiml.gather({
        input:'speech',
        action:'/enqueue-and-process',
        speechTimeout:'auto'
    });
    twimlBuilder.sayReading(gather,"What would you like to say to Chat GPT?");
    twiml.redirect('/twilio-webhook');
    res.send(twiml.toString());
});

app.post('/enqueue-and-process', async (req, res) => {
    const userSpeech = req.body.SpeechResult;
    const callSid = req.body.CallSid;
    callsData[callSid] = {
        userSpeech: userSpeech
    }

    //enqueue call
    const twiml = new VoiceResponse();
    twiml.enqueue('holdQueue',{waitUrl: '/wait', method:'POST'});
    processCall(callSid);
    res.send(twiml.toString());
});

async function processCall(callSid){
    const callData = callsData[callSid];
    if (!callData){
        console.log("callData not found");
        return res.sendStatus(400);
    }
    console.log({callData});
    const userSpeech = callData.userSpeech;
    console.log({userSpeech});
    try {
        const result = await chatGPTGenerate(userSpeech);
        const client = twilio();
        const twiml = twiml_sayRedirect(result);
        await client.calls(callSid).update({
            twiml:twiml
        });
    }
    catch(error){
        const client = twilio();
        const twiml = twiml_sayRedirect("Sorry, there was an error while processing your request.");
        await client.calls(callSid).update({
            twiml:twiml
        });
    }
}

/*
app.post('/completed', async (req, res) => {
    req.setTimeout(process.env.TWILIO_TIMEOUT_SECONDS * 1000);
    prompt = req.body.SpeechResult;
    let result;
    chatGPTGenerate(prompt)
    .then(response => {
        result = response;
        const twiml = twiml_sayRedirect(result);
        res.send(twiml.toString());
    })
    .catch(error => {
        result = error;
        const twiml = twiml_sayRedirect(response);
        res.send(twiml.toString());
    });
});
*/

function twiml_sayRedirect(result){
    const twiml = new twilio.twiml.VoiceResponse();
    
    let fragments = splitStringIntoFragments(result,process.env.TWILIO_MAX_RESPONSE_LENGTH)
    console.log({fragments});
    fragments.forEach(fragment => twimlBuilder.say(twiml,fragment));
    
    console.log(result);
    //twimlBuilder.say(twiml,result);
    twiml.redirect('/twilio-webhook');
    return twiml;
}

function splitStringIntoFragments(inputString, N) {
    const fragments = [];

    for (let i = 0; i < inputString.length; i += N) {
        fragments.push(inputString.slice(i, i + N));
    }

    return fragments;
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
