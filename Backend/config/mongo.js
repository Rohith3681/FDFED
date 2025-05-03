import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/")
.then(() => {
    console.log("Mongodb Connected")
})
.catch((error) => {
    console.log("Failed To Connect:", error)
});