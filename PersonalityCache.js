//note: because the personalities are cached in local storage once they're queried from the db,
//changes to the database will not be reflected in the personality until the server restarts

class PersonalityCache {
    constructor(){
        this.personalities = null;
        this.phone_personality = null;
    }
    async load(database){
        this.personalities = await database.getAllPersonalities();
        this.phone_personality = await database.getPhone_Personality();
    }

    getPersonality(phone){
        const phone_personality = this.phone_personality[phone];
        console.log({phone_personality});
        const personality = this.personalities[phone_personality.name];
        return personality;
    }
}

export default PersonalityCache;