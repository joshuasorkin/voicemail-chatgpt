import Database from './Database.js';

const database = new Database();

const callSid = "123xyz";
const message = "black on the red"


function callExists_test(){
console.log("checking for non-existent call...");
    if(!database.callExists(callSid)){
        console.log("call does not exist");
    }
    else{
        console.log("call exists");
    }
}