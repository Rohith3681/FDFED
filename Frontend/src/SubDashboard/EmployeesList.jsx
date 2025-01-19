import React, { useState, useEffect } from 'react';
import './EmployeesList.css'; 

const EmployeesList = () => {
    const [employees, setEmployees] = useState([]); // Ensure it's an array
    const [editMode, setEditMode] = useState(null); // Track which employee is being edited
    const [editEmployeeData, setEditEmployeeData] = useState({ name: '', email: '' }); // Data for editing employee (name and email)

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Fetch employees from the backend
    const fetchEmployees = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/users', {
                credentials: 'include', // Include credentials (cookies, authorization headers, etc.)
            });
            const data = await res.json();
            console.log('Fetched Employees:', data); // Log the data to check its structure
            setEmployees(Array.isArray(data) ? data : []); // Ensure employees is always an array
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Handle employee deletion
    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/api/users/${id}`, {
                method: 'DELETE',
                credentials: 'include', // Include credentials (cookies, authorization headers, etc.)
            });

            if (res.ok) {
                setEmployees(employees.filter(employee => employee._id !== id)); // Update UI after delete
            } else {
                console.error('Failed to delete employee');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    // Handle edit mode initiation
    const handleEdit = (id) => {
        const employee = employees.find(employee => employee._id === id);
        setEditMode(id); // Set employee in edit mode
        setEditEmployeeData({ name: employee.name, email: employee.email }); // Pre-fill form with employee's name and email
    };

    // Handle employee update
    const handleUpdate = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editEmployeeData),
                credentials: 'include', // Include credentials (cookies, authorization headers, etc.)
            });

            if (res.ok) {
                const updatedEmployee = await res.json();
                setEmployees(employees.map(employee => employee._id === id ? updatedEmployee.employee : employee)); // Update UI after save
                setEditMode(null); // Exit edit mode
            } else {
                console.error('Failed to update employee');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    return (
        <div className="employees-list">
            <h1>Employees List</h1>
            <table>
                <thead>
                    <tr>
                        <th>Employee Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees
                        .filter(employee => employee._id === '8180') // Filter by _id, assuming you want to display employees with this ID
                        .map((employee) => (
                            <tr key={employee._id}>
                                <td>
                                    {editMode === employee._id ? (
                                        <input
                                            type="text"
                                            value={editEmployeeData.name}
                                            onChange={(e) => setEditEmployeeData({ ...editEmployeeData, name: e.target.value })}
                                        />
                                    ) : (
                                        employee.name
                                    )}
                                </td>
                                <td>
                                    {editMode === employee._id ? (
                                        <input
                                            type="email"
                                            value={editEmployeeData.email}
                                            onChange={(e) => setEditEmployeeData({ ...editEmployeeData, email: e.target.value })}
                                        />
                                    ) : (
                                        employee.email
                                    )}
                                </td>
                                <td>
                                    {editMode === employee._id ? (
                                        <>
                                            <button onClick={() => handleUpdate(employee._id)}>Save</button>
                                            <button onClick={() => setEditMode(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEdit(employee._id)}>Edit</button>
                                            <button className="delete-btn" onClick={() => handleDelete(employee._id)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeesList;
