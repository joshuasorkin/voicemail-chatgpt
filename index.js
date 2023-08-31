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
      messages: [{role: 'system', content: 'Your response must be 2000 characters or less.'},
                /*
                {role: 'system', content: 'If I ask you to pretend that you are something, '
                                            +'your response should role-play in the character '+
                                            'I have asked for.'},
                */
                {role: 'system', content: 'Use conversational American English.'},
                 { role: 'user', content: prompt }
                ],
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
        speechTimeout:process.env.TWILIO_SPEECH_TIMEOUT_SECONDS
    });
    twimlBuilder.sayReading(gather,"Hi!  I'm Chat GPT. What would you like to say?");
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
    twiml.enqueue({waitUrl: '/wait'},'holdQueue');
    const absoluteUrl = req.protocol+'://'+req.get('host');
    processCall(callSid,absoluteUrl);
    console.log("enqueue-and-process twiml: ",twiml.toString())
    res.send(twiml.toString());
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
    const userSpeech = callData.userSpeech;
    console.log({userSpeech});
    try {
        const result = await chatGPTGenerate(userSpeech);
        const client = twilio();
        const twiml = twiml_sayRedirect(result,absoluteUrl);
        const call = await client.calls(callSid).fetch();
        if (call.status === 'completed' || call.status === 'canceled'){
            return new VoiceResponse().say("Thank you for using the system.");
        }
        await client.calls(callSid).update({
            twiml:twiml
        });
        console.log("update successful")
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
    
    const gather = twiml.gather({
        action:absoluteUrl+'/twilio-webhook',
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
