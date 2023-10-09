//note: because the personalities are cached in local storage once they're queried from the db,
//changes to the database will not be reflected in the personality until the server restarts

//holds the data related to looking up a personality via phone number
//so that it is available locally rather than via frequent db lookup
import TokenCounter from './TokenCounter.js';
import OpenAIUtility from './OpenAIUtility.js';
class PersonalityCache {
    constructor(){
        this.personalities = null;
        this.phone_personality = null;
        this.TokenCounter = new TokenCounter();
    }
    async load(database){
        this.database = database;
        this.personalities = await this.getAllPersonalities();
        this.phone_personality = await this.getPhone_Personality();
        this.OpenAIUtility = new OpenAIUtility();
    }

    async getAllPersonalities(){
        const name_personality_dictionary = await this.database.getCollectionAsDictionary('personality','name');
        //iterate through personalities getting token count
        for (var name in name_personality_dictionary){
            const messages = name_personality_dictionary[name].messages;
            const tokenCount = this.TokenCounter.countFromUserMessages(messages);
            name_personality_dictionary[name].tokenCount = tokenCount;
            //get token count from OpenAI
            const tokenCount_OpenAI = await this.OpenAIUtility.chatGPTGenerate_personalityTokenCheck(messages);
            name_personality_dictionary[name].tokenCount_OpenAI = tokenCount_OpenAI;
        }
        console.log({name_personality_dictionary});
        return name_personality_dictionary;
    }

    //todo: error handling for when phone number is not recognized
    getPersonality(phone){
        console.log("phone:",{phone});
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