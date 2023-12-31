//handles websocket events related to AssemblyAI's transcription
//of Twilio media stream

import WebSocket from 'ws';
import { WebSocketServer } from "ws";
import pkg from 'wavefile';
const {WaveFile} = pkg;
import { createServer } from 'http';
class AssemblyWebsocket{

  //takes Express app object as parameter
  constructor(app){
    this.server = createServer(app);
    this.wss = new WebSocketServer({ server:this.server });
    this.assembly = null;
    this.chunks = [];
  }


  initializeHandlers(){
    this.wss.on("connection", (ws) => {
      console.info("New Connection Initiated");

      ws.on("message", (message) => {
        if (!assembly)
          return console.error("AssemblyAI's WebSocket must be initialized.");

        const msg = JSON.parse(message);

        switch (msg.event) {
          case "connected":
            console.info("A new call has started.");
            assembly.onerror = console.error;
            const texts = {};
            assembly.onmessage = (assemblyMsg) => {
              let msg = '';
              const res = JSON.parse(assemblyMsg.data);
              texts[res.audio_start] = res.text;
              const keys = Object.keys(texts);
              keys.sort((a, b) => a - b);
              for (const key of keys) {
                if (texts[key]) {
                  msg += ` ${texts[key]}`;
                }
              }
              console.log(msg);
            };

            break;

          case "start":
            console.info("Starting media stream...");
            break;

          case "media":       
            const twilioData = msg.media.payload;

            // Here are the current options explored using the WaveFile lib:

            // We build the wav file from scratch since it comes in as raw data
            let wav = new WaveFile();

            // Twilio uses MuLaw so we have to encode for that
            wav.fromScratch(1, 8000, "8m", Buffer.from(twilioData, "base64"));

            // This library has a handy method to decode MuLaw straight to 16-bit PCM
            wav.fromMuLaw();

            // Here we get the raw audio data in base64
            const twilio64Encoded = wav.toDataURI().split("base64,")[1];

            // Create our audio buffer
            const twilioAudioBuffer = Buffer.from(twilio64Encoded, "base64");

            // We send data starting at byte 44 to remove wav headers so our model sees only audio data
            chunks.push(twilioAudioBuffer.slice(44));

            // We have to chunk data b/c twilio sends audio durations of ~20ms and AAI needs a min of 100ms
            if (chunks.length >= 5) {
              // Here we want to concat our buffer to create one single buffer
              const audioBuffer = Buffer.concat(chunks);

              // Re-encode to base64
              const encodedAudio = audioBuffer.toString("base64");

              // Finally send to assembly and clear chunks
              assembly.send(JSON.stringify({ audio_data: encodedAudio }));
              chunks = [];
            }

            break;

          case "stop":
            console.info("Call has ended");
            assembly.send(JSON.stringify({ terminate_session: true }));
            break;
        }
      });
    });
  }

  getAssemblySocket(){
    const assembly = new WebSocket(
      "wss://api.assemblyai.com/v2/realtime/ws?sample_rate=8000",
      { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
    );
    return assembly;
  }

  //this is a placeholder to store the code that was moved from twilio-webhook
  //so we can merge this branch, it's unfinished but will return to after
  //more testing of different streaming approaches
  async getSocketAndUpdateDatabase(call,database){
    let assembly = call.assemblySocket;
    console.log("assemblySocket value from db: ",assembly);
    if(!assembly) {
        console.log("getting socket...");
        assembly = assemblyWebsocket.getAssemblySocket();
        console.log("assemblySocket: ",{assembly});
        call["assemblySocket"] = true;
        console.log("entering socket into db...");
        await database.setValue(callSid,"assemblySocket",true);
    }
  }
}

export default AssemblyWebsocket;