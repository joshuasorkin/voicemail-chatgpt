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
        });
        return result;
    }

    //if the call's current token count is > OPENAI_MAX_TOKENS,
    //find how many messages need to be deleted from the beginning of userMessages
    //to lower the token count below the maximum
    findDeletionCutoff(call){

    }
}

export default TokenCounter;