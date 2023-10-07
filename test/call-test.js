//note that these functions rely heavily on mongo implementation, so
//todo: make test database-agnostic

//todo: rewrite using a unit test framework

import dotenv from 'dotenv';
dotenv.config();

import Database from '../Database.js';
import Call from '../Call.js';

const database = new Database();

const callSid = "123xyz";
const callSid_getOrCreate = "2416256";
const streamSid = "11235813";
const userMessage = "white on white, translucent black capes";
const assistantMessage = "back on the rack";
const valueName = "streamSid";
const test_collection_name = 'test';
const test_database_name = 'test';
const call = new Call(database,test_collection_name);

async function initialize(){
    console.log(`Initializing Database with '${test_database_name}' collection....`);
    await database.initialize(test_database_name);
    console.log("Database initialized");
}

async function reset_test(){
    console.log("resetting collection");
    await database.resetCollection(test_collection_name);
    console.log("collection reset");
}
async function get_test(){
console.log(`checking for call ${callSid}...`);
    call.callSid = callSid;
    const call_document = await call.get();
    if (call_document){
        console.log("call exists: ",call_document);
    }
    else{
        console.log("call does not exist");
    }
}

async function getOrCreate_test(){
    call.callSid = callSid_getOrCreate;
    const call_document = await call.getOrCreate();
    console.log({call_document});
}

async function addUserMessage_test(){
    call.callSid = callSid_getOrCreate;
    const result = await call.addUserMessage(userMessage);
    console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );
}

async function addAssistantMessage_test(){
    call.callSid = callSid_getOrCreate;
    const result = await call.addAssistantMessage(assistantMessage);
    console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );
}

async function getUserMessages_test(){
    const result = await call.getUserMessages();
    console.log("userMessages: ",result);
}

async function test(){
    await initialize();
    await reset_test();
    await get_test();
    await getOrCreate_test();
    await addUserMessage_test();
    await addAssistantMessage_test();
    await getUserMessages_test();
}

test();