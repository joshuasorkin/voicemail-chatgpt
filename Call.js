class Call{
    constructor(){
        this.callSid = null;
        this.userMessages = [];
    }

    //can't pass methods as a cookie
    //so here's how we load the cookie data
    //after we create a new Call for a given endpoint
    load(data){
        this.callSid = data.callSid;
        this.userMessages = data.userMessages;
    }

    export(){
        return {
            callSid:this.callSid,
            userMessages:this.userMessages
        }
    }

    //returns the document from the calls collection
    //pass the database in as a parameter instead of making it a class property
    //because we need to serialize the call as a cookie
    //and the MongoDB database object has a circular structure
    async getOrCreate(database){
        const newCall = {
            callSid:this.callSid,
            userMessages:[]
        };
        const result = await database.getOrCreateDocument("calls",{callSid:this.callSid},newCall);
        return result;
    }

    async addMessage(database,role,message){
        this.userMessages.push({role:role,content:message});
        const filter = {callSid: this.callSid};
        const update = { $push: { userMessages: {role:role,content:message}}};
        const result = await database.collection["calls"].updateOne(filter,update);
        return result;
    }

    //todo: the roles probably don't belong hardcoded in the Call class,
    //maybe OpenAIUtility.chatGPTGenerate() should produce an object with the role
    async addUserMessage(database,message){
        const result = await this.addMessage(database,'user',message);
        return result;
    }

    async addAssistantMessage(database,message){
        const result = await this.addMessage(database,'assistant',message);
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