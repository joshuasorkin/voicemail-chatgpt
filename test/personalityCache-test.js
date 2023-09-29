import dotenv from 'dotenv';
dotenv.config();

import Database from '../Database.js';
import PersonalityCache from '../PersonalityCache.js';

const database = new Database();
const personalityCache = new PersonalityCache();
const phone = "+999";

async function initialize(){
    console.log("Initializing Database with 'test' collection....");
    await database.initialize('test');
    console.log("Database initialized");
    console.log("Loading personalityCache");
    await personalityCache.load(database);
    console.log("personalityCache loaded")
}

async function getPersonality_test(){
    const personality = await personalityCache.getPersonality(phone);
    console.log({personality});
}

async function getAllPersonalities_test(){
    const result = await database.getAllPersonalities();
    console.log(result["standard"]);
}

async function getPersonalityNameFromPhoneNumber_test(){
    const result = await database.getPersonalityNameFromPhoneNumber("+1234567");
    console.log(result);
}

async function test(){
    await initialize();
    await getPersonality_test();
}

test();