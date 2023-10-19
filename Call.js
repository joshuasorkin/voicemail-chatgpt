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
            prompt_tokens_initial:null,
            prompt_tokens_total:null
        };
        const result = await this.database.getOrCreateDocument(this.collectionName,{callSid:this.callSid},newCall);
        this.userMessages = result.userMessages;
        return result;
    }

    async get(){
        const result = await this.database.getDocument(this.collectionName,{callSid:this.callSid});
        return result;
    }

    
    //todo: bundle both of these db updates into a single db call
    async updatePrompt_tokens(prompt_tokens,completion_tokens){
        //based on the prompt_tokens value returned by chatGPT,
        //calculate the token count of user's most recent prompt as:
        //prompt_tokens_mostRecent = prompt_tokens - prompt_tokens_total
        const prompt_tokens_mostRecent = prompt_tokens - this.prompt_tokens_total;
        //update local message array
        await this.updateMessageTokenCount(prompt_tokens_mostRecent);
        //then we update prompt_tokens_total with the latest count as:
        //prompt_tokens_total = prompt_tokens + completion_tokens
        //then make the database update
        this.prompt_tokens_total = prompt_tokens + completion_tokens;
        await this.updatePrompt_tokens_total(this.prompt_tokens_total);
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

    async updatePrompt_tokens_total(token_count){
        await this.database.setValue(this.collectionName,'callSid',this.callSid,'prompt_tokens_total',tokenCount);
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