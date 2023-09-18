class Report{
    constructor(database){
        this.database = database;
    }

    async getPhoneList(){
        const callSids = await database.getAllCallSids();
        
    }
}