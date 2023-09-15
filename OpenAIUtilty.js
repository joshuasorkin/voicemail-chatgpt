//include methods addMessage_user() and addMessage_chatGPT()

import {OpenAI} from 'openai';


class OpenAIUtility {
    constructor(personality) {
        this.openai = new OpenAI({
            apiKey:process.env.OPENAI_API_KEY
        });
        this.personality = personality;
    }

    
    async chatGPTGenerate(userMessages) {
        try{
            const messages = this.personality.messages;
            userMessages.forEach(message => {
                messages.push(message);
            })
            console.log(`Messages to be sent:`);
            userMessages.forEach(message => {
                console.log({message});
            })
            console.log(`total messages:`);
            messages.forEach(message => {
                console.log({message});
            });
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