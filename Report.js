class Report {
    constructor(database, client) {
        this.database = database;
        this.client = client;
    }

    async getPhoneList() {
        const phoneList = new Set();
        const callSids = await this.database.getAllCallSids();
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
}

export default Report;