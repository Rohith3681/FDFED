import mongoose from "mongoose";

mongoose.connect("mongodb+srv://rohithyadavm22:SHqXRdzu13o7BkQP@cluster0.knztryo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => {
    console.log("Mongodb Connected")
})
.catch((error) => {
    console.log("Failed To Connect:", error)
});