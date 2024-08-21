const mongoose = require("mongoose");

const DB_NAME = require("../constant.js");


const connectDB = async () => {
    try {
        
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log("DB is connected to the HOST");
 
    } catch (error) {
        console.error("MongoDB Error: ", error);
        throw error;
    }
}

module.exports = connectDB