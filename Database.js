
//todo: decouple db operations from mongo by separating operations into a 
//DatabaseController class that gets extended as a DatabaseController_Mongo class,
//as suggested by chatGPT here: https://chat.openai.com/share/f0a4417b-481a-462a-8662-5d23434e11e0

import { MongoClient } from 'mongodb';

class Database{

    async initialize(){
        try {
            this.client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
            await this.client.connect();
            this.database = this.client.db("voice-chatGPT");
            this.calls = this.database.collection("calls");
            console.log("Database connected");
        }
        catch (error){
            console.error("Error in initialize:",error);
            throw error;
        }
    }

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
            console.log(`Inserted call with doc ID ${result.insertedId}`);
        }
        catch(error){
            throw error;
        }
    }

    async addUserMessage(callSid,message){
        const filter = {callSid: callSid};
        const update = { $push: { userMessages: {role:'user',content:message}}};
        const result = await this.calls.updateOne(filter,update);
        console.log(
            `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
        );
    }

    async getUserMessages(callSid){
        const call = await this.getCall(callSid);
        return call.userMessages;
    }
}

export default Database;