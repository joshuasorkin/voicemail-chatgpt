import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore';

class Database{
    constructor(){
        const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
        const firebaseApp = initializeApp(firebaseConfig); 
        const db = getFirestore();
        this.calls = db.collection('calls');

    }

    async callExists(callSid){ 
        c
        const snapshot = await this.calls   
                                    .where('callSid','==',callSid)
                                    .get();
        return (!snapshot.empty);
    }
}

export default Database;
  