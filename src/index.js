const app = require("./app.js")

const connectDB = require("./db/index.js");

const dotenv = require('dotenv')
dotenv.config();


connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, () => {

        app.on("error", (err)=>{
            console.log("Error: ", err);
            throw err;
        })
        
        console.log(`Server is listening on port ${process.env.PORT}`);
    })    
});