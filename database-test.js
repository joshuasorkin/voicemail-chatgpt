import dotenv from 'dotenv';
dotenv.config();

import Database from './Database.js';

const database = new Database();

const callSid = "123xyz";
const message = "black on the red"

async function initialize(){
    console.log("Initializing Database....");
    await database.initialize();
    console.log("Database initialized");
}

async function callExists_test(callSid){
console.log(`checking for call ${callSid}...`);
    const call = await database.getCall(callSid);
    if (call){
        console.log("call exists");
    }
    else{
        console.log("call does not exist");
    }
}

async function addCall_test(callSid){
    const result = await database.addCall(callSid);
    console.log("New call added:",{result});
}

async function test(){
    await initialize();
    await database.resetCalls();
    await callExists_test(callSid);
    await addCall_test(callSid);
}

test();