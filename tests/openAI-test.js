import OpenAIUtil from './openAI-util.js';
import dotenv from 'dotenv';
dotenv.config();
const openAIUtil = new OpenAIUtil();
const response = openAIUtil.chatGPTGenerate([{role:'user',content:'I am testing your API.'}]);
console.log(response);