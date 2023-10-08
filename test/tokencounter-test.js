import TokenCounter from '../TokenCounter.js';

const testString = "For a number of years now, work has been proceeding in order to bring perfection to the crudely conceived idea of a transmission that would not only supply inverse reactive current for use in unilateral phase detractors, but would also be capable of automatically synchronizing cardinal grammeters."

const tokenCounter = new TokenCounter();

function encode_test(){
    const result = tokenCounter.encode(testString);
    console.log({result});
}

function test(){
    encode_test();
}

test();