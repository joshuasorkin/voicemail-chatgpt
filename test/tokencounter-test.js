import TokenCounter from '../TokenCounter.js';
import Call from '../Call.js';

const testString1 = "For a number of years now, work has been proceeding in order to bring perfection ";
const testString2 = "to the crudely conceived idea of a transmission that would not only supply inverse reactive current for use in unilateral phase detractors, but would also be capable of automatically synchronizing cardinal grammeters."
const testString = testString1.concat(testString2);

const tokenCounter = new TokenCounter();

function encode_test(){
    const result = tokenCounter.encode(testString);
    console.log("encode:",{result});
}

function test(){
    encode_test();
    countFromUserMessages_test();
    findDeletionCutoff_test();
}

function countFromUserMessages_test(){
    const call = new Call();
    call.addUserMessage(testString1,true);
    call.addUserMessage(testString2,true);
    const result = tokenCounter.countFromUserMessages(call);
    console.log("countFromUserMessages:",{result});
}

function findDeletionCutoff_test(){
    const call = new Call();
    for(let x=0;x<100;x++){
        call.addUserMessage(testString);
    }
    const result = tokenCounter.findDeletionCutoff(call);
    console.log("findDeletionCutoff:",{result});
}
test();