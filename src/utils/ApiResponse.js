class ApiResponse{

    constructor(statuscode,data,message="Success"){
        this.data = data 
        this.statuscode = statuscode;
        this.message = message;
        this.status = statuscode < 400;
    }
}

export {ApiResponse}