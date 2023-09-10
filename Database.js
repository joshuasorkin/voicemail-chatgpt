import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore';

class Database{
    constructor(){
        initializeApp({
            credential: applicationDefault()
        }); 
        const db = getFirestore();
        this.calls = db.collection('calls');

    }

    async callExists(callSid){ 
        const snapshot = await this.calls   
                                    .where('callSid','==',callSid)
                                    .get();
        return (!snapshot.empty)
    }
}
  