import OpenAIUtil from './openAI-util';
const openAIUtil = new OpenAIUtil();
const response = openAI.chatGPTGenerate([{role:'user',content:'I am testing your API.'}]);
console.log(response);