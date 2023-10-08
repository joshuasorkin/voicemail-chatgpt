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
            console.log({msg});
            const encode = this.enc.encode(msg.content);
            console.log({encode});
            analysis.push(this.enc.encode(msg.content).length);

        })
    }
}

export default TokenCounter;