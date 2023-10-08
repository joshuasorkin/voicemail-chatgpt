import {get_encoding, encoding_for_model} from 'tiktoken';

class TokenCounter{

    constructor(){
        this.enc = get_encoding('cl100k_base');
    }
    
    encode(str){
        return this.enc.encode(str);
    }

    countFromUserMessages(call){
        const analysis = [];
        const initialValue = 0;
        const result = call.userMessages.reduce((accumulator,currentValue) => {
            const messageTokenCount = this.enc.encode(currentValue.content).length;
            return accumulator + messageTokenCount;
        },initialValue);
        return result;
    }

    exceedsMaximum(call){
        return this.countFromUserMessages(call) > process.env.OPENAI_MAX_TOKENS;
    }
    //if the call's current token count is > OPENAI_MAX_TOKENS,
    //find how many messages need to be deleted from the beginning of userMessages
    //to lower the token count below the maximum
    findDeletionCutoff(call){
        let tokenCount_remaining = this.countFromUserMessages(call);
        let index = 0;
        //iterate while the remaining token count is greater than model's max
        //and we haven't reached the end of the messages array
        while (tokenCount_remaining > process.env.OPENAI_MAX_TOKENS && index < call.userMessages.length){
            //could save this step if we feed in a pre-processed array
            const tokenCount_message = this.encode(call.userMessages[index].content).length;
            console.log("tokenCount_remaining:",{tokenCount_remaining});
            console.log(`token count for message ${index}`,{tokenCount_message});
            tokenCount_remaining -= tokenCount_message;
            console.log("tokenCount_remaining after deletion:",{tokenCount_remaining});
            index++;
        }
        
        //did we find an index of the array at which we were able to delete enough
        //tokens to fall below the maximum?
        if (index < call.userMessages.length){
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