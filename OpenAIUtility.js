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
            const messages = personality.messages.slice();
            userMessages.forEach(message => {
                messages.push(message);
            });
            const startIndex = tokenCounter.findDeletionCutoff(messages);
            //do we need to drop messages before our starting index?
            if (startIndex > 0){
                messages = messages.slice(startIndex);
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