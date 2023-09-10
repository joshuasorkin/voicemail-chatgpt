//todo: decouple db operations from firebase by separating operations into a 
//DatabaseController class that gets extended as a DatabaseController_Firebase class,
//as suggested by chatGPT here: https://chat.openai.com/share/f0a4417b-481a-462a-8662-5d23434e11e0

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

class Firebase{
    constructor(){
        // Initialize Firebase
        const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
        const firebaseApp = initializeApp(firebaseConfig);
        const database = getDatabase();
        const calls = database.ref("calls");
    }

    callExists(callSid){
        return calls.child(callSid).once("value").then((snapshot) => {
            return snapshot.exists();
        });
    }

    addCall(callSid){
        calls.child(callSid).set({userMessages:[]});
    }
}

export default Firebase;