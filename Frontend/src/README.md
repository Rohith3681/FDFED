PACK YOUR BAGS
1. Introduction
Pack your bags is a [brief description of your project, e.g., "travel booking platform that allows
users to find hotels and tourist attractions"]. The backend is built using Node.js and Express,
and the frontend uses React. The application features [specific features of your app, e.g., "user
authentication, data retrieval, and management functionalities"].
2. Getting Started
Prerequisites:
• Node.js (v14+)
• MongoDB (if using a database)
• Postman (optional for testing API endpoints)
Installation:
1. Clone the repository:
git clone https://github.com/Rohith3681/FDFED.git
2. Navigate to the project directory:
cd backend/ &
cd frontend/
3. Install the dependencies:
npm install
4. Set up your environment variables in a .env file in the backend:
MONGO_URI='<mongodb://localhost:27017/tours>'
SECRET_KEY='<I am Iron Man>'
Running the Server:
• To run the backend server in development mode:
Nodemon index.js
• To run the frontend server in development mode:
npm run dev

4. Features
• Book Tour: [e.g., Users can sign up, log in, and log out].
• Create Tour: [e.g., Users can add, edit, and delete items].
• Admin Dashboard: [e.g., Admin users can manage other users and the content].

5. API Endpoints Documentation
User Routes:
• POST /register: Register a new user.
• POST /login: Log in a user.
• POST /logout: Log out the logged-in user.

• GET /users: Fetch all users with the role 'user'.
• GET /user/profile/
: Get the user profile, including completed, ongoing, and upcoming bookings.
Admin Routes:
• POST /adminSignup: Register a new admin.
• POST /adminLogin: Log in an admin.
• GET /adminRevenue: Get the revenue of the admin with ID "5150".
• GET /admin/recent-bookings: Fetch bookings from the last 3 months.
Tour Routes:
• GET /tour-info: Get information about total tours and bookings.
• GET /tours: Fetch all available tours.
• GET /tours/
: Get details of a specific tour by its ID.
• POST /create: Create a new tour with an image.
• POST /tours/
/review: Add a review to a specific tour.
• PUT /updateTours/
: Update an existing tour by its ID.
• DELETE /deleteTours/
: Delete a tour by its ID.
• GET /tours/search/
: Search for tours based on location.
Booking Routes:
• POST /book: Book a tour for a user.
Dashboard Routes:
• GET /dashboard/
: Get details of tours created by an employee (creator) and users who booked them.
Utility Routes:
• GET /api/user-employee-counts: Fetch the count of users and employees.
• GET /api/loggedin-names: Get names of users who are currently logged in.

6.Database Schema
User Model
const UserSchema = new mongoose.Schema({
name: String,
email: String,
password: String,
role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

Admin Model:
Const schema = new mongoose.Schema({
name: {
type: String,
required: true
},
password: {
type: String,
required: true
},
id: {
type: String,
required: true,
default: "5150"
},
revenue: {
type: Number,
required: true,
default: 0
},
});

Booking Model:
const bookingSchema = new mongoose.Schema({
name: {
type: String,
required: true,
trim: true,
},
phone: {
type: String,
required: true,
trim: true,
},
startDate: {
type: Date,
required: true,
},
endDate: {
type: Date,
required: true,
},
adults: {
type: Number,
required: true,
min: 1,
},
children: {
type: Number,
default: 0,
min: 0,
},
tour: {

type: mongoose.Schema.Types.ObjectId,
ref: 'Tour',
required: true,
},
createdAt: {
type: Date,
default: Date.now,
},
cost: {
type: Number,
default: 0,
}
});
Tour Model:
const tourSchema = new mongoose.Schema({
title: {
type: String,
required: true
},
city: {
type: String,
required: true
},
address: {
type: String,
required: true
},
distance: {
type: Number,
required: true
},

price: {
type: Number,
required: true
},
desc: {
type: String,
required: true
},
reviews: {
type: [String],
default: []
},
creator: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
required: true
},
image: {
type: String,
required: true
},
count: {
type: Number,
required: true
},
bookedBy: {
type: [mongoose.Schema.Types.ObjectId],
ref: 'User',
default: [],
required: true
}

});
7. Technologies Used
• Backend: Node.js, Express.js
• Frontend: React, React Router
• Database: MongoDB (if applicable)
• Authentication: JSON Web Tokens (JWT)
• Version Control: Git

8.Admin Functionalities
View Data: Admin can view all the Tours created by an Employee.
Manage Users: Admin has access to delete a User.
Manage Employees: Admin has access to delete an Employee

Frontend Documentation for "Pack Your Bags"
Overview
The frontend of the "Pack Your Bags" application is built using React. The app is responsible for
managing users, employees, bookings, tours, and admin functionalities. It interacts with the
backend API to fetch and manipulate data.