import dotenv from 'dotenv';
dotenv.config();

import Database from './Database.js';
import Report from './Report.js';
import twilio from 'twilio';

const database = new Database();

// Twilio configuration
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const report = new Report(database,client);

async function getPhoneList_test(){
    const phoneList = await report.getPhoneList();
    for (const phone of phoneList) {
        console.log(phone);
    }
}

async function test(){
    await getPhoneList_test();
}

test();