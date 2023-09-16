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
        const personality = this.personalities[phone_personality.name];
        return personality;
    }
}

export default PersonalityCache;