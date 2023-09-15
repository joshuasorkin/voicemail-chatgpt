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
            //todo: we have a memory leak because duplicate messages are getting pushed into the
            //total {messages} and this is causing the token limit to be exceeded
            //hypothesis: the problem is that in this line:
            const messages = this.personality.messages;
            //we have a pointer to this.personality.messages,
            //so when we push to {messages} here:
            userMessages.forEach(message => {
                messages.push(message);
            })
            //then we have actually increased the total number of messages in this.personality.messages
            //which then get fed back in on the following response.
            //proposed solution:
            //const messages = COPY OF this.personality.messages
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