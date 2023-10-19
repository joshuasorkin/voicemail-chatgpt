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
            prompt_tokens:null
        };
        const result = await this.database.getOrCreateDocument(this.collectionName,{callSid:this.callSid},newCall);
        this.userMessages = result.userMessages;
        return result;
    }

    async get(){
        const result = await this.database.getDocument(this.collectionName,{callSid:this.callSid});
        return result;
    }

    async updateMessageTokenCount(token_count){
        const currentMessageIndex = this.userMessages.length-1;
        this.userMessages[currentMessageIndex].token_count = token_count;
        const result = await this.database.updateArray(
            this.collectionName,
            'callSid',
            this.callSid,
            'userMessages',
            currentMessageIndex,
            this.userMessages[currentMessageIndex]);
    }

    async addMessage(role,message,isTest,token_count = null){
        const newElement = {role:role,content:message};
        if (token_count){
            newElement.token_count = token_count;
        }
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
    async addUserMessage(message,isTest=false,token_count = null){
        const result = await this.addMessage('user',message,isTest,token_count);
        return result;
    }

    async addAssistantMessage(message,token_count = null){
        const result = await this.addMessage('assistant',message,token_count = token_count);
        return result;
    }

    //don't need this method anymore, can just use call.userMessages
    async getUserMessages(){
        return this.userMessages;
    }

}

export default Call;