class Call{
    constructor(database){
        this.database = database;
        this.callSid = null;
        this.userMessages = [];
    }

    //returns the document from the calls collection
    async getOrCreate(callSid){
        const newCall = {
            callSid:callSid,
            userMessages:[]
        };
        const result = await this.database.getOrCreateDocument("calls",{callSid:callSid},newCall);
        this.callSid = callSid;
        return result;
    }

    async addMessage(callSid,role,message){
        this.userMessages.push({role:role,content:message});
        const filter = {callSid: callSid};
        const update = { $push: { userMessages: {role:role,content:message}}};
        const result = await this.calls.updateOne(filter,update);
        return result;
    }

    //todo: the roles probably don't belong hardcoded in the Call class,
    //maybe OpenAIUtility.chatGPTGenerate() should produce an object with the role
    async addUserMessage(callSid,message){
        const result = await this.addMessage(callSid,'user',message);
        return result;
    }

    async addAssistantMessage(callSid,message){
        const result = await this.addMessage(callSid,'assistant',message);
        return result;
    }

    async getUserMessages(callSid){
        const call = await this.getorCreateCall(callSid);
        return call.userMessages;
    }

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

}

export default Call;