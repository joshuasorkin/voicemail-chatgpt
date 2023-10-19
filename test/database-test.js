//note that these functions rely heavily on mongo implementation, so
//todo: make test database-agnostic

//todo: make these into unit tests that either return true (passed) or false (failed)
//todo: move tests related to Call and PersonalityCache into their respective [class]-test.js files

import dotenv from 'dotenv';
dotenv.config();

import Database from '../Database.js';

const database = new Database();

const dictDoc1 = {
    name: "blue canary in the outlet by the lightswitch",
    field: "where is the string that Theseus laid?"
}
const dictDoc2 = {
    name: "who watches over you?",
    field: "find me out this labyrinth place"
}

const arrayAdd1 = 'a123';
const arrayAdd2 = 'b455';
const arrayUpdate1 = 'ur2'

async function initialize(){
    console.log("Initializing Database with 'test' collection....");
    await database.initialize('test');
    console.log("Database initialized");
}

async function reset_test(){
    console.log("resetting collection");
    await database.resetCollection("dictionaryTest");
    console.log("collection reset");
}

async function getValue_test(){
    const result = await database.getValue(callSid,valueName);
    console.log(`${valueName}: ${result}`);
}


async function getAllCallSids_test(){
    const result = await database.getAllCallSids();
    result.forEach(callSid => {
        console.log("callSid",callSid);
    })
}

async function getCollectionAsDictionary_test(){
    await database.createDocument('dictionaryTest',dictDoc1);
    await database.createDocument('dictionaryTest',dictDoc2);
    const result = await database.getCollectionAsDictionary('dictionaryTest','name');
    console.log(result);
}

async function pushToDocumentArray_test(){
    await database.pushToDocumentArray('dictionaryTest','name',dictDoc1.name,'valueArray',arrayAdd1);
    await database.pushToDocumentArray('dictionaryTest','name',dictDoc1.name,'valueArray',arrayAdd2);
    const result = await database.getDocument('dictionaryTest',{name:dictDoc1.name});
    console.log(result);
}

async function updateArray_test(){
    await database.updateArray('dictionaryTest','name',dictDoc1.name,'valueArray',0,arrayUpdate1);
    const result = await database.getDocument('dictionaryTest',{name:dictDoc1.name});
    console.log(result);
}

async function test(){
    await initialize();
    await reset_test();
    await getCollectionAsDictionary_test();
    await pushToDocumentArray_test();
}

test();