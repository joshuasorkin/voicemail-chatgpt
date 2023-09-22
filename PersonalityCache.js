//holds the data related to looking up a personality via phone number
//so that it is available locally rather than via frequent db lookup
class PersonalityCache {
    constructor(){
        this.personalities = null;
        this.phone_personality = null;
    }
    async load(database){
        this.personalities = await this.getAllPersonalities();
        this.phone_personality = await this.getPhone_Personality();
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

    getPersonality(phone){
        const phone_personality = this.phone_personality[phone];
        console.log({phone_personality});
        const personality = this.personalities[phone_personality.name];
        return personality;
    }

    //todo: refactor this into a getCollectionAsDictionary(collectionName,key) function
    async getPhone_Personality(){
        const phone_personality_dictionary = await this.database.getCollectionAsDictionary('phone_personality','phone');
        return phone_personality_dictionary;
    }
}

export default PersonalityCache;