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
        action:'/completed',
        speechTimeout:0
    });
    twimlBuilder.sayReading(gather,"What would you like to say to Chat GPT?");
    res.send(twiml.toString());
});

app.post('/completed', async (req, res) => {
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

function twiml_sayRedirect(result){
    const twiml = new twilio.twiml.VoiceResponse();
    twimlBuilder.say(twiml,result);
    twiml.redirect('/twilio-webhook');
    return twiml;
}


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
