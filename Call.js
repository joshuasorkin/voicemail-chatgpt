class Call{
    constructor(database,callSid,collectionName = "calls"){
        this.database = database;
        this.callSid = callSid;
        this.userMessages = [];
        this.collectionName = collectionName;
    }

    //returns the document from the calls collection
    async getOrCreate(){
        //should each userMessages entry include an ID, so that we can update the message with a tokens_OpenAI value once we learn
        //that value?
        const newCall = {
            callSid:this.callSid,
            userMessages:[],
        };
        const result = await this.database.getOrCreateDocument(this.collectionName,{callSid:this.callSid},newCall);
        this.userMessages = result.userMessages;
        return result;
    }

    async get(){
        const result = await this.database.getDocument(this.collectionName,{callSid:this.callSid});
        return result;
    }

    async addMessage(role,message,isTest){
        const newElement = {role:role,content:message};
        this.userMessages.push(newElement);
        if(!isTest){
            const result = await this.database.pushToDocumentArray(
                            this.collectionName,
                            "callSid",
                            this.callSid,
                            "userMessages",
                            newElement
            );
            return result;
        }
        else{
            return null;
        }
        
    }

    //todo: the roles probably don't belong hardcoded in the Call class,
    //maybe OpenAIUtility.chatGPTGenerate() should produce an object with the role
    //isTest is used for when we are testing TokenCounter so we can push to the local array
    //without writing to the database
    async addUserMessage(message,isTest=false){
        const result = await this.addMessage('user',message,isTest);
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

}

export default Call;