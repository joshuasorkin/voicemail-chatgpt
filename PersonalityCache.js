class PersonalityCache {
    constructor(){
        this.personalities = null;
        this.phone_personality = null;
    }
    async load(database){
        const personalities = await database.getAllPersonalities(); 
        const phone_personality = await database.getPhone_Personality();
    }

    getPersonality(phone){
        const name = this.phone_personality[phone];
        const personality = this.personalities[name];
        return personality;
    }
}

export default PersonalityCache;