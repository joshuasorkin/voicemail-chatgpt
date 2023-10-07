class Call{
    constructor(database,collectionName = "calls"){
        this.database = database;
        this.callSid = null;
        this.userMessages = [];
        this.collectionName = collectionName;
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
    async getOrCreate(){
        const newCall = {
            callSid:this.callSid,
            userMessages:[]
        };
        const result = await this.database.getOrCreateDocument(this.collectionName,{callSid:this.callSid},newCall);
        console.log("result in Call.getOrCreate:",{result});
        return result;
    }

    async get(){
        const result = await this.database.getDocument(this.collectionName,{callSid:this.callSid});
        return result;
    }

    async addMessage(role,message){
        const newElement = {role:role,content:message};
        this.userMessages.push(newElement);
        const result = this.database.pushToDocumentArray(
                        this.collectionName,
                        "callSid",
                        this.callSid,
                        "userMessages",
                        newElement
        );
        return result;
    }

    //todo: the roles probably don't belong hardcoded in the Call class,
    //maybe OpenAIUtility.chatGPTGenerate() should produce an object with the role
    async addUserMessage(message){
        const result = await this.addMessage('user',message);
        return result;
    }

    async addAssistantMessage(message){
        const result = await this.addMessage('assistant',message);
        return result;
    }

    //don't need this method anymore, can just use call.userMessages
    async getUserMessages(){
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