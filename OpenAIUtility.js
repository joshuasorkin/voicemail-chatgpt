//include methods addMessage_user() and addMessage_chatGPT()

import {OpenAI} from 'openai';
import TokenCounter from './TokenCounter.js';


class OpenAIUtility {
    constructor() {
        this.openai = new OpenAI({
            apiKey:process.env.OPENAI_API_KEY
        });
        this.tokenCounter = new TokenCounter();

    }

    
    async chatGPTGenerate(userMessages,personality) {
        try{
            const messages_preTokenCounter = personality.messages.slice();
            userMessages.forEach(message => {
                messages_preTokenCounter.push(message);
            });
            const startIndex = this.tokenCounter.findDeletionCutoff(messages_preTokenCounter);
            //do we need to drop messages before our starting index?
            let messages;
            if (startIndex >= 0){
                messages = messages_preTokenCounter.slice(startIndex);
            }
            const completion = await this.openai.chat.completions.create({
            messages: messages,
            model: 'gpt-3.5-turbo'
            });
            console.log(`and the response has returned from OpenAI`);
            const response = completion.choices[0].message.content;
            return response;
        }
        catch(error){
            console.log(error);
            return error;
        }
    }
}

export default OpenAIUtility;