class StreamBuilder{
    //pass twilio client to constructor
    constructor(client,twimlBuilder){
        this.client = client;
        this.twimlBuilder = twimlBuilder;
    }

    async getStreams(callSid){
        console.log("Checking for existing stream...");
        const streams = await client.calls(callSid).streams;
        return streams;
    }

    streamExists(streams){
        return streams.length > 1;
    }

    //checks for the existence of a media stream on this callSid
    //if none found (other than the default callSid/accountSid stream)
    //then add twiml instructions for starting a stream
    async startStream(callSid,response){
        const streams = await getStreams(callSid);
        if(!this.streamExists(streams)){
            console.log("no streams found, creating new stream...");
            twimlBuilder.startStream(twiml);
        }
    }
}

export default StreamBuilder;