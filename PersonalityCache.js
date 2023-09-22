class PersonalityCache {
    constructor(){
        this.personalities = null;
        this.phone_personality = null;
    }
    async load(database){
        this.personalities = await database.getAllPersonalities();
        this.phone_personality = await database.getPhone_Personality();
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

    //todo: change this collection's name to 'phone' and store all data unique to that phone #
    async getPersonalityNameFromPhoneNumber(phonenumber){
        const collection = this.database.collection('phone_personality');
        const doc = await collection.findOne({phone:phonenumber});
        return doc.name;
    }
}

export default PersonalityCache;