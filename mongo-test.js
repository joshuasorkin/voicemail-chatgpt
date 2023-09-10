import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const main = async () => {
    const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log("connected");
        const database = client.db("test");
        const collection = database.collection('your-collection-name');

        // Insert a document
        const doc = { message: 'Hello, MongoDB Atlas!' };
        const result = await collection.insertOne(doc);
        console.log(`Inserted ${result.insertedCount} document(s)`);
    
        // Query the document
        const query = { message: 'Hello, MongoDB Atlas!' };
        const foundDoc = await collection.findOne(query);
        console.log(foundDoc);
    } 
    catch(error){
        console.error(error);
    }
    finally {
        // Close the connection when done
        await client.close();
    }
}

main();