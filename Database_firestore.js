import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore';

class Database{
    constructor(){
        const buffer = Buffer.from(process.env.BASE_64, 'base64');
        const firebaseApp = initializeApp({
            credential: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        }); 
        const db = getFirestore();
        this.calls = db.collection('calls');

    }

    async callExists(callSid){ 
        const snapshot = await this.calls   
                                    .where('callSid','==',callSid)
                                    .get();
        return (!snapshot.empty);
    }
}

export default Database;
  