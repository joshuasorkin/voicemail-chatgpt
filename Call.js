class Call{
    constructor(database,callSid){
        this.database = database;
    }

    async getOrCreate(callSid){
        const newCall = {
            callSid:callSid,
            userMessages:[]
        };
        const result = await database.getOrCreateDocument("calls",{callSid:callSid},newCall);
    }

    async addMessage(callSid,role,message){
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
        const call = await this.getCall(callSid);
        return call.userMessages;
    }

}

export default Call;