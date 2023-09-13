
//todo: decouple db operations from mongo by separating operations into a 
//DatabaseController class that gets extended as a DatabaseController_Mongo class,
//as suggested by chatGPT here: https://chat.openai.com/share/f0a4417b-481a-462a-8662-5d23434e11e0

import { MongoClient } from 'mongodb';

class Database{

    async initialize(collectionName='calls'){
        try {
            this.client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
            await this.client.connect();
            this.database = this.client.db("voice-chatGPT");
            this.calls = this.database.collection(collectionName);
            console.log("Database connected");
        }
        catch (error){
            console.error("Error in initialize:",error);
            throw error;
        }
    }

    //todo: this will cause an error if the collection does not exist,
    //need to check for collection existence before calling drop()
    async resetCalls(){
        await this.calls.drop();
    }

    async getCall(callSid){
        const query = { callSid: callSid };
        const result = await this.calls.findOne(query);
        return result;
    }

    async addCall(callSid){
        try{
            //todo: create a Call class and get an instance of it here
            const newCall = {
                callSid:callSid,
                userMessages:[]
            };
            const result = await this.calls.insertOne(newCall);
            return result;
        }
        catch(error){
            throw error;
        }
    }

    async addMessage(callSid,role,message){
        const filter = {callSid: callSid};
        const update = { $push: { userMessages: {role:role,content:message}}};
        const result = await this.calls.updateOne(filter,update);
        return result;
    }

    //todo: the roles probably don't belong hardcoded in the database class,
    //maybe OpenAIUtility.chatGPTGenerate() should produce an object with the role
    async addUserMessage(callSid,message){
        const result = await this.addMessage(callSid,'user',message);
        return result;
    }

    async addAssistantMessage(callSid,message){
        const result = await this.addMessage(callSid,'assistant',message);
        return result;
    }

    async getUserMessages(callSid){
        const call = await this.getCall(callSid);
        return call.userMessages;
    }

    async getStreamSid(callSid){
        const call = await this.getCall(callSid);
        return call.streamSid;
    }

    async setStream(callSid,streamSid){
        const filter = {callSid: callSid};
        const update = { $set: { streamSid: streamSid}};
        const result = await this.calls.updateOne(filter,update);
        return result;
    }
}

export default Database;