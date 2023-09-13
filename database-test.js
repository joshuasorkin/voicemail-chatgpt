//note that these functions rely heavily on mongo implementation, so
//todo: make test database-agnostic

import dotenv from 'dotenv';
dotenv.config();

import Database from './Database.js';

const database = new Database();

const callSid = "123xyz";
const streamSid = "11235813"
const userMessage = "white on white, translucent black capes" 
const assistantMessage = "back on the rack"

async function initialize(){
    console.log("Initializing Database with 'test' collection....");
    await database.initialize('test');
    console.log("Database initialized");
}

async function reset_test(){
    console.log("resetting collection");
    await database.resetCalls();
    console.log("collection reset");
}
async function getCall_test(){
console.log(`checking for call ${callSid}...`);
    const call = await database.getCall(callSid);
    if (call){
        console.log("call exists: ",call);
    }
    else{
        console.log("call does not exist");
    }
}

async function addCall_test(){
    const result = await database.addCall(callSid);
    console.log(`Inserted call with doc ID ${result.insertedId}`);
}

async function addUserMessage_test(){
    const result = await database.addUserMessage(callSid,userMessage);
    console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );
}

async function addAssistantMessage_test(){
    const result = await database.addAssistantMessage(callSid,assistantMessage);
    console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );
}

async function getUserMessages_test(){
    const result = await database.getUserMessages(callSid);
    console.log("userMessages: ",result);
}

async function getStreamSid_test(){
    const result = await database.getStreamSid(callSid);
    console.log("streamSid: ",result);
}
async function setStreamSid_test(){
    const result = await database.setStreamSid(callSid,streamSid);
    console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);
}

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

}

test();