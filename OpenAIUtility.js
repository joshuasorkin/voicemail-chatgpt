//include methods addMessage_user() and addMessage_chatGPT()

import {OpenAI} from 'openai';



class OpenAIUtility {
    constructor() {
        this.openai = new OpenAI({
            apiKey:process.env.OPENAI_API_KEY
        });
    }

    
    async chatGPTGenerate(userMessages,personality) {
        try{
            const messages = personality.messages.slice();
            userMessages.forEach(message => {
                messages.push(message);
            })
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