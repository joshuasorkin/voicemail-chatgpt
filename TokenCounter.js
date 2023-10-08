import {get_encoding, encoding_for_model} from 'tiktoken';

class TokenCounter{

    constructor(){
        this.enc = get_encoding('cl100k_base');
    }
    
    encode(str){
        return this.enc.encode(str);
    }

    analyzeUserMessages(call){
        const analysis = [];
        call.userMessages.forEach(msg => {
            analysis.push(this.enc.encode(msg.content).length);

        })
    }
}

export default TokenCounter;