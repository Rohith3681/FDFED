import mongoose from "mongoose";

mongoose.connect("mongodb+srv://rohithyadavm22:SHqXRdzu13o7BkQP@cluster0.knztryo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    serverSelectionTimeoutMS: 30000, // Increase timeout from default 10000ms to 30000ms
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("MongoDB Connected Successfully");
})
.catch((error) => {
    console.error("Failed To Connect to MongoDB:", error);
    // Log more details about the error for debugging
    if (error.name === 'MongooseServerSelectionError') {
        console.error("Server Selection Error Details:", error.reason);
    }
});

// Add connection event listeners for better monitoring
const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

db.on('reconnected', () => {
    console.log('MongoDB reconnected');
});