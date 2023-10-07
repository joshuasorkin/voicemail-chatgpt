//note that these functions rely heavily on mongo implementation, so
//todo: make test database-agnostic

//todo: rewrite using a unit test framework

import dotenv from 'dotenv';
dotenv.config();

import Database from '../Database.js';
import Call from '../Call.js';

const database = new Database();

const callSid = "123xyz";
const callSid_getOrAdd = "2416256";
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
async function getCall_test(){
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

async function getOrAddCall_test(){
    const call = new Call();
    call.callSid = callSid_getOrAdd;
    const call_document = await call.getOrCreate();
    console.log({call_document});
}

async function addUserMessage_test(){
    const call = new Call();
    call.callSid = callSid;
    const result = await call.addUserMessage(userMessage);
    console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );
}

async function addAssistantMessage_test(){
    const result = await database.addAssistantMessage(assistantMessage);
    console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );
}

async function getUserMessages_test(){
    const result = await database.getUserMessages();
    console.log("userMessages: ",result);
}

/*
async function getStreamSid_test(){
    const result = await database.getStreamSid(callSid);
    console.log("streamSid: ",result);
}
async function setStreamSid_test(){
    const result = await database.setValue(callSid,"streamSid",streamSid);
    console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);
}
*/

async function test(){
    await initialize();
    await reset_test();
    await getCall_test();
    await addCall_test();
    await getCall_test();
    await addUserMessage_test();
    await getCall_test();
    await addAssistantMessage_test();
    await getUserMessages_test();
    await getStreamSid_test();
    await setStreamSid_test();
    await getStreamSid_test();
    await getValue_test();
    await getOrAddCall_test();
    await getAllPersonalities_test();
    await getPersonalityNameFromPhoneNumber_test();
    await getAllCallSids_test();

}

test();