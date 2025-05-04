import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EmployeeLogged = () => {
    const [employeeData, setEmployeeData] = useState([]); // For logged-in employees graph
    const [employeeNames, setEmployeeNames] = useState([]); // Logged-in employees' names

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user-employee-counts`, {
                    credentials: 'include', // Include credentials (cookies)
                });
                const data = await response.json();
                const timeLabel = new Date().toLocaleTimeString();

                setEmployeeData((prevData) => [...prevData.slice(-9), { time: timeLabel, loggedInEmployees: data.loggedInEmployees }]);

                // Fetch employee names
                const namesResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/loggedin-names`, {
                    credentials: 'include', // Include credentials (cookies)
                });
                const namesData = await namesResponse.json();
                setEmployeeNames(namesData.loggedInEmployees);
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

    const maxEmployees = employeeData.length > 0 ? Math.max(...employeeData.map(data => data.loggedInEmployees)) : 0;

    return (
        <div>
            <h2>Graph For No Of Employee's Logged vs Time</h2>
            {/* Logged-in Employees Graph */}
            <div className="graph2">
                <ResponsiveContainer align="center" width="80%" height={500}>
                    <LineChart data={employeeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" label={{ value: '', position: 'bottom' }} />
                        <YAxis label={{ value: 'Number of Employees', angle: -90, position: 'insideLeft' }} ticks={generateTicks(maxEmployees)} />
                        <Tooltip />
                        <Legend />
                        <Line className="graph2line" type="monotone" dataKey="loggedInEmployees" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Logged-in Employees Table */}
            <h3>Logged-in Employees</h3>
            <table>
                <thead>
                    <tr>
                        <th>Employee Name</th>
                    </tr>
                </thead>
                <tbody>
                    {employeeNames.map((employee, index) => (
                        <tr key={index}>
                            <td>{employee}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeLogged;
