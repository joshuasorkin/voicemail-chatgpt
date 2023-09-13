//todo: decouple db operations from firebase by separating operations into a 
//DatabaseController class that gets extended as a DatabaseController_Firebase class,
//as suggested by chatGPT here: https://chat.openai.com/share/f0a4417b-481a-462a-8662-5d23434e11e0

import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, set } from "firebase/database";
//import firebase from "firebase";

class Database{
    constructor(){
        // Initialize Firebase
        const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
        const firebaseApp = initializeApp(firebaseConfig);
        const db = getDatabase();
        const callsRef = ref(db,"calls");
    }

    async callExists(callSid){
        const snapshot = await get(this.callsRef,callSid);
        return snapshot.exists();
    }

    async addCall(callSid){
        try{
            const callRef = await ref(this.calls,callSid);
            set({userMessages:[]});
        }
        catch(error){
            throw error;
        }
    }

    async addUserMessage(callSid,message){
        const snapshot = await this.calls.child(callSid).once("value");
        const call = snapshot.val();
        call.userMessages.push({role:'user',content:message});
        await this.calls.child(callSid).set(call);
    }

    async getUserMessages(callSid){
        const snapshot = await this.calls.child(callSid).once("value");
        if (!snapshot.exists()){
            throw `CallSid ${callSid} not found in Calls table`
        }
        const call = snapshot.val();
        return call.userMessages;
    }
}

export default Database;