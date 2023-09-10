import Database from './Database.js';

const database = new Database();

const callSid = "123xyz";
const message = "black on the red"


async function callExists_test(callSid){
console.log(`checking for call ${callSid}...`);
    const result = await database.callExists(callSid);
    if (result){
        console.log("call exists");
    }
    else{
        console.log("call does not exist");
    }
}

callExists(callSid);