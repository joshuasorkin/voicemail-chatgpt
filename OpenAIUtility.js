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

    
    async chatGPTGenerate_personalityTokenCheck(personalityMessages){
        try{
            const completion = await this.openai.chat.completions.create({
                messages: personalityMessages,
                model: 'gpt-3.5-turbo'
            });
            return completion.usage.prompt_tokens;
        }
        catch(exception){
            throw exception;
        }
    }

    async chatGPTGenerate(call,personality) {
        try{
            const userMessages = call.userMessages;
            const tokensFromPersonality = personality.tokenCount_OpenAI;
            const deletionCutoff = this.tokenCounter.findDeletionCutoff(userMessages,tokensFromPersonality);
            console.log({deletionCutoff});
            const startIndex = deletionCutoff.startIndex;
            const messages = personality.messages.slice();
            //start from the index where we will have enough tokens to submit the message
            if (startIndex >= 0){
                for (let index=startIndex;index<userMessages.length;index++){
                    const message = userMessages[index];
                    //OpenAI requires that messages only have `role` and `content` properties
                    messages.push({
                        role:message.role,
                        content:message.content
                    });
                }
            }
            else{
                //we can't get below token count by omitting messages,
                //so don't submit to chatGPT to avoid token-limit-exceeded error,
                //instead return response alerting user that max has been reached
                //and they can call back to start with refreshed memory.
                return personality.response_out_of_memory;
            }
            /*
            userMessages.forEach(message => {
                messages.push(message);
            });
            */
            
            const completion = await this.openai.chat.completions.create({
            messages: messages,
            model: 'gpt-3.5-turbo',
            max_tokens:deletionCutoff.response_max_tokens
            });
            console.log(`and the response has returned from OpenAI`);
            const prompt_tokens = completion.usage.prompt_tokens;
            const completion_tokens = completion.usage.completion_tokens;
            const response = completion.choices[0].message.content;
            console.log({prompt_tokens},{response},{completion_tokens});
            return {
                prompt_tokens:prompt_tokens,
                response:response,
                completion_tokens:completion_tokens
            };
        }
        catch(error){
            console.log(error);
            return error;
        }
    }
}

export default OpenAIUtility;