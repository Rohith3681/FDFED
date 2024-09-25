import React, { useState, useEffect } from 'react';

const EmployeesList = () => {
    const [employees, setEmployees] = useState([]);
    const [editMode, setEditMode] = useState(null); // Track which employee is being edited
    const [editEmployeeData, setEditEmployeeData] = useState({ name: '' }); // Data for editing employee (name only)

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Fetch employees from the backend
    const fetchEmployees = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/users');
            const data = await res.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Handle employee deletion
    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/api/users/${id}`, {
                method: 'DELETE',
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
        setEditEmployeeData({ name: employee.name }); // Pre-fill form with employee's name
    };

    // Handle employee update
    const handleUpdate = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editEmployeeData),
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
        <div>
            <h1>Employees List</h1>
            <table>
                <thead>
                    <tr>
                        <th>Employee Name</th>
                    </tr>
                </thead>
                <tbody>
                    {employees
                        .filter(employee => employee.id === '8180') // Filter only employees with id '8180'
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
                                        <>
                                            <button onClick={() => handleUpdate(employee._id)}>Save</button>
                                            <button onClick={() => setEditMode(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEdit(employee._id)}>Edit</button>
                                            <button onClick={() => handleDelete(employee._id)}>Delete</button>
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
