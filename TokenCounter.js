import {get_encoding, encoding_for_model} from 'tiktoken';

class TokenCounter{

    constructor(){
        this.enc = get_encoding('cl100k_base');
    }
    encode(str){
        return enc.encode(str);
    }
}

export default TokenCounter;