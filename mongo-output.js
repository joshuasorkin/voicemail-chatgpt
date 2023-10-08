import {MongoClient} from 'mongodb';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const outputFileName = 'mongodb-output.json';

async function main() {
    const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(process.env.MONGO_DATABASE_NAME);
    const callsCollection = db.collection('calls');

    // Get all documents, sort by _id in descending order
    const cursor = callsCollection.find({}).sort({ _id: -1 });
    const documents = await cursor.toArray();

    // Write sorted documents to output.json
    fs.writeFileSync(outputFileName, JSON.stringify(documents, null, 2));
    console.log(`Sorted documents written to ${outputFileName}`);
  } finally {
    await client.close();
  }
}

main().catch(console.error);