
//todo: decouple db operations from mongo by separating operations into a 
//DatabaseController class that gets extended as a DatabaseController_Mongo class,
//as suggested by chatGPT here: https://chat.openai.com/share/f0a4417b-481a-462a-8662-5d23434e11e0

//todo: there are a bunch of call-related CRUD here, should those instead be operations in a Call
//class and call generic getValue,insertRecord,setValue,updateRecord operations from that class?
//maybe getValue and setValue shouldn't be dependent on callSid

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
    async resetCollection(collectionName){
        await this.database.collection(collectionName).drop();
    }


    async getDocument(collectionName,query){
        const result = await this.database.collection(collectionName).findOne(query);
        return result;
    }

    async getOrCreateDocument(collectionName,query,data){
        const result = await this.getDocument(collectionName,query);
        if(result && result !== undefined){
            return result;
        }
        else{
            await this.createDocument(collectionName,data);
            return await this.getDocument(collectionName,query);
        }
    }

    //todo: result should be the actual call document, not just the result
    //of insertOne() so we don't have to call getCall()
    async createDocument(collectionName,data){
        try{
            const result = await this.database.collection(collectionName).insertOne({data:data});
            return result;
        }
        catch(error){
            throw error;
        }
    }




    async getStreamSid(callSid){
        const call = await this.getCall(callSid);
        if (call && call.streamSid===undefined){
            return null;
        }
        else{
            return call.streamSid;
        }
    }

    async setStreamSid(callSid,streamSid){
        const filter = {callSid: callSid};
        const update = { $set: { streamSid: streamSid}};
        const result = await this.calls.updateOne(filter,update);
        return result;
    }

    async getValue(callSid,key){
        const call = await this.getCall(callSid);
        if (call && call[key]===undefined){
            return null;
        }
        else{
            return call[key];
        }
    }

    async setValue(callSid, key, value) {
        const filter = { callSid: callSid };
        const update = { $set: {} }; // Initialize an empty update object
      
        // Dynamically set the key in the update object based on the 'key' parameter
        update.$set[key] = value;
      
        const result = await this.calls.updateOne(filter, update);
        return result;
    }

    async getAllPersonalities(){
        const collection = this.database.collection('personality');
        const cursor = await collection.find();
        const documentDictionary = {};
        while (await cursor.hasNext()) {
            const document = await cursor.next();
            const name = document.name;
            documentDictionary[name] = document;
        }
        return documentDictionary;
    }

    async getAllCallSids(){
        const cursor = await this.calls.find();
        const callSidArray = [];
        while (await cursor.hasNext()) {
            const document = await cursor.next();
            const callSid = document.callSid;
            callSidArray.push(callSid);
        }
        return callSidArray;
    }

    //todo: refactor this into a getCollectionAsDictionary(collectionName,key) function
    async getPhone_Personality(){
        const collection = this.database.collection('phone_personality');
        const cursor = await collection.find();
        const documentDictionary = {};
        while (await cursor.hasNext()) {
            const document = await cursor.next();
            const phone = document.phone;
            documentDictionary[phone] = document;
        }
        return documentDictionary;
    }

    //todo: change this collection's name to 'phone' and store all data unique to that phone #
    async getPersonalityNameFromPhoneNumber(phonenumber){
        const collection = this.database.collection('phone_personality');
        const doc = await collection.findOne({phone:phonenumber});
        return doc.name;
    }
}

export default Database;