# **Voicemail-ChatGPT**

Voicemail-ChatGPT is an IVR telephony interface for communicating with [ChatGPT](https://chat.openai.com).  It is implemented in Node.js and Twilio Programmable Voice.

# Twilio configuration

You will need a Twilio account so that you can provide your account SID and auth token in `.env`.  You will also need a Twilio phone number.  Details on getting a free phone number are [here](https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account).

Instructions for deploying a Node.js app and configuring Twilio appropriately are [here](https://www.twilio.com/docs/voice/tutorials/how-to-respond-to-incoming-phone-calls/node). Set your Twilio phone number's voice webhook to `[YOUR BASE URL]/twilio-webhook`.  Once the web server is running and the webhook is configured, you can use the service by calling your Twilio phone number from any phone.

# Local deployment

You will need to supply the environment variables with a `.env` file in the root folder.  Environment variables are indicated throughout the code with `process.env.[VARIABLE_NAME]`.

# Space deployment

If you are deploying the app on [Space](deta.space), once you have generated your default `Spacefile`, add the `.env` file's environment variables to your `Spacefile` as follows (assuming `Spacefile` is in the root folder):

`node env-to-spacefile`

Note that if the value of `ABSOLUTE_URL` in `Spacefile` is not already set to the Space domain, it will need to be changed accordingly once you have run `env-to-spacefile`.  Storing your Space domain in another environment variable, such as `SPACE_URL`, may be helpful for making this change.

`Spacefile` will need to include the line `public: true` to allow Twilio's server to make a POST request to your app.

WARNING: running `env-to-spacefile` more than once will result in duplicate environmental variables being appended to `Spacefile`.

# User instructions

When the server is running, users can talk to ChatGPT as follows:

1. User calls the Twilio phone number.
2. User waits for the receiver to say "What would you like to say?"
3. User speaks a prompt (equivalent to typing a prompt into ChatGPT's [text interface](chat.openai.com)).
4. When the user stops speaking for TWILIO_SPEECH_TIMEOUT_SECONDS, their prompt will be sent to ChatGPT.
5. There will be a brief sound as ChatGPT processes the prompt (based on whatever sound is at WAIT_URL).
6. ChatGPT will speak its response.
7. User can press any number key to skip to the end of the message (in case they don't want to wait for the entire response before asking a follow-up prompt).
8. Repeat steps 2-7, until user hangs up.

During each call, the conversation history is re-submitted to ChatGPT each time the user speaks their next prompt, so a single phone call is equivalent to a single "New Chat".
