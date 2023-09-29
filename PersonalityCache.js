<<<<<<< HEAD
//note: because the personalities are cached in local storage once they're queried from the db,
//changes to the database will not be reflected in the personality until the server restarts

=======
//holds the data related to looking up a personality via phone number
//so that it is available locally rather than via frequent db lookup
>>>>>>> 463d71e6052ae3d1f75fa5527110cd6e2746d3be
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
        const name_personality_dictionary = await this.database.getCollectionAsDictionary('personality','name');
        return name_personality_dictionary;
    }

    getPersonality(phone){
        const phone_personality = this.phone_personality[phone];
        console.log({phone_personality});
        const personality = this.personalities[phone_personality.name];
        return personality;
    }

    async getPhone_Personality(){
        const phone_personality_dictionary = await this.database.getCollectionAsDictionary('phone_personality','phone');
        return phone_personality_dictionary;
    }
}

export default PersonalityCache;