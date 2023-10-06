class Call{
    constructor(){
        this.callSid = null;
        this.userMessages = [];
    }

    //returns the document from the calls collection
    //pass the database in as a parameter instead of making it a class property
    //because we need to serialize the call as a cookie
    //and the MongoDB database object has a circular structure
    //
    async getOrCreate(database,callSid){
        const newCall = {
            callSid:callSid,
            userMessages:[]
        };
        const result = await database.getOrCreateDocument("calls",{callSid:callSid},newCall);
        this.callSid = callSid;
        return result;
    }

    async addMessage(database,callSid,role,message){
        this.userMessages.push({role:role,content:message});
        const filter = {callSid: callSid};
        const update = { $push: { userMessages: {role:role,content:message}}};
        const result = await database.calls.updateOne(filter,update);
        return result;
    }

    //todo: the roles probably don't belong hardcoded in the Call class,
    //maybe OpenAIUtility.chatGPTGenerate() should produce an object with the role
    async addUserMessage(database,callSid,message){
        const result = await this.addMessage(database,callSid,'user',message);
        return result;
    }

    async addAssistantMessage(database,callSid,message){
        const result = await this.addMessage(database,callSid,'assistant',message);
        return result;
    }

    async getUserMessages(callSid){
        return this.userMessages;
    }

    /*
    **not needed until stream is implemented**
    ******************************************
    async getStreamSid(callSid){
        const call = await this.getOrCreateCall(callSid);
        if (call && call.streamSid===undefined){
            return null;
        }
        else{
            return call.streamSid;
        }
    }

    async setStreamSid(callSid,streamSid){
        const filter = {callSid: callSid};
        const update = { $set: { streamSid: streamSid}};
        const result = await this.calls.updateOne(filter,update);
        return result;
    }
    */

}

export default Call;