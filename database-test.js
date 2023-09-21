//note that these functions rely heavily on mongo implementation, so
//todo: make test database-agnostic

//todo: make these into unit tests that either return true (passed) or false (failed)

import dotenv from 'dotenv';
dotenv.config();

import Database from './Database.js';

const database = new Database();

const callSid = "123xyz";
const callSid_getOrAdd = "2416256";
const streamSid = "11235813";
const userMessage = "white on white, translucent black capes";
const assistantMessage = "back on the rack";
const valueName = "streamSid";

async function initialize(){
    console.log("Initializing Database with 'test' collection....");
    await database.initialize('test');
    console.log("Database initialized");
}

async function reset_test(){
    console.log("resetting collection");
    await database.resetCollection("test");
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

async function getOrAddCall_test(){
    let call = await database.getCall(callSid_getOrAdd);
    if (call){
        console.log("call exists: ",call);
    }
    else{
        console.log(`call ${callSid_getOrAdd} does not exist`);
    }
    call = await database.getOrAddCall(callSid_getOrAdd);
    console.log(call);
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
    const result = await database.setValue(callSid,"streamSid",streamSid);
    console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);
}

async function getValue_test(){
    const result = await database.getValue(callSid,valueName);
    console.log(`${valueName}: ${result}`);
}

async function getAllPersonalities_test(){
    const result = await database.getAllPersonalities();
    console.log(result["standard"]);
}

async function getPersonalityNameFromPhoneNumber_test(){
    const result = await database.getPersonalityNameFromPhoneNumber("+15107564445");
    console.log(result);
}

async function getAllCallSids_test(){
    const result = await database.getAllCallSids();
    result.forEach(callSid => {
        console.log("callSid",callSid);
    })
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
    await getValue_test();
    await getOrAddCall_test();
    await getAllPersonalities_test();
    await getPersonalityNameFromPhoneNumber_test();
    await getAllCallSids_test();

}

test();