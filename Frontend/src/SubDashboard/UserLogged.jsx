import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UserLogged = () => {
    const [loginData, setLoginData] = useState([]); // For logged-in users graph
    const [usernames, setUsernames] = useState([]); // Logged-in users' names

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/user-employee-counts'); // Updated endpoint
                const data = await response.json();
                const timeLabel = new Date().toLocaleTimeString();
                
                setLoginData((prevData) => [...prevData.slice(-9), { time: timeLabel, loggedInUsers: data.loggedInUsers }]);

                // Fetch usernames
                const namesResponse = await fetch('http://localhost:8000/api/loggedin-names');
                const namesData = await namesResponse.json();
                setUsernames(namesData.loggedInUsers);
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };

        const intervalId = setInterval(fetchCounts, 1000); // Fetch every second
        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, []);

    // Generate ticks dynamically for the Y-axis
    const generateTicks = (max) => {
        const ticks = [];
        for (let i = 0; i <= max; i++) {
            ticks.push(i);
        }
        return ticks;
    };

    const maxUsers = loginData.length > 0 ? Math.max(...loginData.map(data => data.loggedInUsers)) : 0;

    return (
        <div>
            {/* Logged-in Users Graph */}
            <div className="graph1">
                <ResponsiveContainer align="center" width="80%" height={300}>
                    <LineChart data={loginData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" label={{ value: 'Time', position: 'bottom' }} />
                        <YAxis label={{ value: 'Number of Users', angle: -90, position: 'insideLeft' }} ticks={generateTicks(maxUsers)} />
                        <Tooltip />
                        <Legend />
                        <Line className="graph1line" type="monotone" dataKey="loggedInUsers" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Logged-in Users Table */}
            <h3>Logged-in Users</h3>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                    </tr>
                </thead>
                <tbody>
                    {usernames.map((user, index) => (
                        <tr key={index}>
                            <td>{user}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserLogged;
