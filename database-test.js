//note that these functions rely heavily on mongo implementation, so
//todo: make test database-agnostic

import dotenv from 'dotenv';
dotenv.config();

import Database from './Database.js';

const database = new Database();

const callSid = "123xyz";
const userMessage = "white on white, translucent black capes" 
const assistantMessage = "back on the rack"

async function initialize(){
    console.log("Initializing Database....");
    await database.initialize('test');
    console.log("Database initialized");
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

async function test(){
    await initialize();
    await database.resetCalls();
    await getCall_test();
    await addCall_test();
    await getCall_test();
    await addUserMessage_test();
    await getCall_test();
    await addUserMessage_test();
    await getUserMessages_test();
    await addAssistantMessage_test();
    await getUserMessages_test();

}

test();