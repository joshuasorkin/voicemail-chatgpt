class StringAnalyzer{
    constructor(){

    }
    splitStringIntoFragments(inputString, N) {
        const fragments = [];
        for (let i = 0; i < inputString.length; i += N) {
            fragments.push(inputString.slice(i, i + N));
        }
        return fragments;
    }
    
    //todo: create a generateQuestion function that asks ChatGPT to create a question based on the last
    //sentence in the text, this function is to be called if the final sentence is not a question
    
    //todo: if colon is in lastSentence, only return the part after the colon
    getFinalQuestion(str){
        const regex = /[^.!?]+[?]+\s*$/;
        const match = str.match(regex);
    
        if (match) {
            const lastSentence = match[0].trim();
            return lastSentence;
        } else {
            return null;
        }
    }
}

export default StringAnalyzer;