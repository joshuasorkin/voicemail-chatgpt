//note that these functions rely heavily on mongo implementation, so
//todo: make test database-agnostic

//todo: make these into unit tests that either return true (passed) or false (failed)
//todo: move tests related to Call and PersonalityCache into their respective [class]-test.js files

import dotenv from 'dotenv';
dotenv.config();

import Database from '../Database.js';

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