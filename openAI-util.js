import {OpenAI} from 'openai';


class OpenAIUtil {
    constructor() {
        this.openai = new OpenAI({
            apiKey:process.env.OPENAI_API_KEY
        });
    }

    async chatGPTGenerate(userMessages) {
        try{
            const messages = [
                {role: 'system', content: 'Your response must be 2000 characters or less.'},
                {role: 'system', content: 'Use casual, conversational American English.'},
                {role: 'system', content: 'If I do not ask for a specific length of response, limit your response to 3 sentences or less.'},
                {role: 'system', content: 'At the end of your response, always ask me an open-ended question related to our discussion.'}
            ]
            userMessages.forEach(message => {
                messages.push(message);
            })
            console.log(`Messages to be sent: ${userMessages}`);
            const completion = await this.openai.chat.completions.create({
            messages: messages,
            model: 'gpt-3.5-turbo'
            });
            console.log(`and the response has returned from OpenAI`);
            const response = completion.choices[0].message.content;
            userMessages.push({role:'assistant',content:response})
            console.log({userMessages});
            return response;
        }
        catch(error){
            console.log(error);
            return error;
        }
    }
}

export default OpenAIUtil;