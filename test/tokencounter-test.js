import TokenCounter from '../TokenCounter.js';
import Call from '../Call.js';

const testString1 = "For a number of years now, work has been proceeding in order to bring perfection ";
const testString2 = "to the crudely conceived idea of a transmission that would not only supply inverse reactive current for use in unilateral phase detractors, but would also be capable of automatically synchronizing cardinal grammeters."
const testString = testString1.concat(testString2);

const tokenCounter = new TokenCounter();

function encode_test(){
    const result = tokenCounter.encode(testString);
    console.log({result});
}

function test(){
    encode_test();
}

function analyzeUserMessages_test(){
    const call = new Call();
    call.addUserMessage(testString1);
    call.addUserMessage(testString2);

}
test();