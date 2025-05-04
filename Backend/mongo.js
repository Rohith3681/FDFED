import mongoose from "mongoose";

// Set TLS options explicitly
const tlsOptions = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  tlsInsecure: false,
  tlsCAFile: undefined, // Let Node.js use its built-in CA store
  minVersion: 'TLSv1.2', // Enforce minimum TLS version
  maxVersion: 'TLSv1.3'  // Allow up to TLS 1.3
};

// Construct connection string with explicit TLS parameters
const connectionString = "mongodb+srv://rohithyadavm22:SHqXRdzu13o7BkQP@cluster0.knztryo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(connectionString, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    ssl: true,
    sslValidate: true,
    ...tlsOptions
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
    if (error.cause) {
        console.error("Underlying Error:", error.cause);
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

// Add process termination handlers
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});