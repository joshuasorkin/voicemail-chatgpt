import {get_encoding, encoding_for_model} from 'tiktoken';

class TokenCounter{

    constructor(){
        this.enc = get_encoding('cl100k_base');
    }
    
    encode(str){
        return this.enc.encode(str);
    }

    countFromUserMessages(userMessages){
        console.log("entering countFromUserMessages...");
        const analysis = [];
        const initialValue = 0;
        const result = userMessages.reduce((accumulator,currentValue) => {
            console.log({currentValue});
            console.log({accumulator});
            //use OpenAI-provided token count if available, otherwise use tiktoken
            const messageTokenCount = currentValue.token_count ? currentValue.token_count : this.enc.encode(currentValue.content).length;
            return accumulator + messageTokenCount;
        },initialValue);
        console.log("reduce result:",result);
        return result;
    }

    //if the call's current token count is > OPENAI_MAX_TOKENS,
    //find how many messages need to be deleted from the beginning of userMessages
    //to lower the token count below the maximum
    //we use tokensFromPersonality to account for tokens used up by prepending the
    //personality messages
    //todo: get token count from OpenAI, track cumulative tokens vs incremental tokens,
    //todo: use them here
    findDeletionCutoff(userMessages,tokensFromPersonality = 0){
        let tokenCount_remaining = this.countFromUserMessages(userMessages)+tokensFromPersonality;
        let response_max_tokens = (process.env.OPENAI_MAX_TOKENS - tokenCount_remaining);
        console.log({tokensFromPersonality},{tokenCount_remaining});
        let index = 0;
        //iterate through message array while (the remaining token count is greater than model's max)
        //or (our available response tokens are < 0) and we haven't reached the end of the array
        //todo: make these boolean checks into functions to improve readability
        while ((tokenCount_remaining > process.env.OPENAI_MAX_TOKENS || response_max_tokens <= 0) && index < userMessages.length) {
            let tokenCount_message;
            //check if we have an OpenAI-provided token count for this message
            if (userMessages[index].token_count){
                //if it exists, use this count to calculate whether to advance our cutoff index
                tokenCount_message = userMessages[index].token_count;
            }
            else{
                //if not, estimate using tiktoken
                tokenCount_message = this.encode(userMessages[index].content).length;
            }
            console.log("tokenCount_remaining:",{tokenCount_remaining});
            console.log(`token count for message ${index}`,{tokenCount_message});
            tokenCount_remaining -= tokenCount_message;
            response_max_tokens = (process.env.OPENAI_MAX_TOKENS - tokenCount_remaining);
            console.log("tokenCount_remaining after deletion:",{tokenCount_remaining});
            console.log("response_max_tokens after deletion:",{response_max_tokens});
            index++;
        }
        
        //did we find an index of the array at which we were able to delete enough
        //tokens to fall below the maximum?
        if (index < userMessages.length){
            //yes: return this index, we will only send messages from this index forward
            //and we will also provide the maximum response length
            //so that OpenAI won't inadvertently return a response
            //in which prompt_tokens + response_tokens > OPENAI_max_tokens
            //const response_max_tokens = (process.env.OPENAI_MAX_TOKENS - tokenCount_remaining) - tokensFromPersonality;
            return {
                index:index,
                response_max_tokens:response_max_tokens
            }
        }
        else{
            //no: we can't use deletion
            return {
                index:-1,
                response_max_tokens:null
            }
        }
    }
}

export default TokenCounter;