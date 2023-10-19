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
            //const messageTokenCount = this.enc.encode(currentValue.content).length;
            const messageTokenCount = currentValue.token_count ? currentValue.token_count : 0
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
        console.log({tokensFromPersonality},{tokenCount_remaining});
        let index = 0;
        //iterate while the remaining token count is greater than model's max
        //and we haven't reached the end of the messages array
        while (tokenCount_remaining > process.env.OPENAI_MAX_TOKENS && index < userMessages.length){
            //could save this step if we feed in a pre-processed array
            const tokenCount_message = this.encode(userMessages[index].content).length;
            console.log("tokenCount_remaining:",{tokenCount_remaining});
            console.log(`token count for message ${index}`,{tokenCount_message});
            tokenCount_remaining -= tokenCount_message;
            console.log("tokenCount_remaining after deletion:",{tokenCount_remaining});
            index++;
        }
        
        //did we find an index of the array at which we were able to delete enough
        //tokens to fall below the maximum?
        if (index < userMessages.length){
            //yes: return this index, we will only send messages from this index forward
            return index;
        }
        else{
            //no: we can't use deletion
            return -1;
        }
    }
}

export default TokenCounter;