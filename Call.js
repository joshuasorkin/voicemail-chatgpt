class Call{
    constructor(database){
        this.database = database;
    }

    async addMessage(callSid,role,message){
        const filter = {callSid: callSid};
        const update = { $push: { userMessages: {role:role,content:message}}};
        const result = await this.calls.updateOne(filter,update);
        return result;
    }

}

export default Call;