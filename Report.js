class Report {
    constructor(database, client) {
        this.database = database;
        this.client = client;
    }

    async getAllCallSids(){
        const dictionary = await this.database.getCollectionAsDictionary("calls","callSid");
        return Object.keys(dictionary);
    }

    async getPhoneList() {
        const phoneList = new Set();
        const callSids = await this.getAllCallSids();
        for (const callSid of callSids) {
            try{
                const call = await this.client.calls(callSid).fetch();
                const from = call.from;
                if (!phoneList.has(from)) {
                    phoneList.add(from);
                }
            }
            catch(error){
            }
        }

        return phoneList;
    }

    async getPhoneList_from_count(){
        const phoneList = new Map();
        const callSids = await this.getAllCallSids();
        for (const callSid of callSids) {
            try{
                const call = await this.client.calls(callSid).fetch();
                const from = call.from;
                if (!phoneList.has(from)) {
                    phoneList.set(from,1);
                }
                else{
                    let fromCount = phoneList.get(from);
                    fromCount++;
                    phoneList.set(from,fromCount);
                }
            }
            catch(error){
            }
        }

        return phoneList;
    }

    
}

export default Report;