import React, { useState, useEffect } from 'react';
import './UsersList.css'

const UsersList = () => {
    const [users, setUsers] = useState([]); // Ensure it's an array
    const [editMode, setEditMode] = useState(null); // Track which user is being edited
    const [editUserData, setEditUserData] = useState({ name: '', email: '' }); // Data for editing user (name and email)

    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch users from the backend
    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/users', {
                credentials: 'include', // Include credentials (cookies, etc.)
            });
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Handle user deletion
    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/api/users/${id}`, {
                method: 'DELETE',
                credentials: 'include', // Include credentials (cookies, etc.)
            });

            if (res.ok) {
                setUsers(users.filter(user => user._id !== id)); // Update UI after delete
            } else {
                console.error('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Handle edit mode initiation
    const handleEdit = (id) => {
        const user = users.find(user => user._id === id);
        setEditMode(id); // Set user in edit mode
        setEditUserData({ name: user.name, email: user.email }); // Pre-fill form with user's name and email
    };

    // Handle user update
    const handleUpdate = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editUserData),
                credentials: 'include', // Include credentials (cookies, etc.)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUsers(users.map(user => user._id === id ? updatedUser.user : user)); // Update UI after save
                setEditMode(null); // Exit edit mode
            } else {
                console.error('Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return (
        <div>
            <h1>Users List</h1>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) && users.length > 0 ? (
                        users
                            .filter(user => user.id === '2120') // Filter only users with id '2120'
                            .map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        {editMode === user._id ? (
                                            <input
                                                type="text"
                                                value={editUserData.name}
                                                onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                                            />
                                        ) : (
                                            user.name
                                        )}
                                    </td>
                                    <td>
                                        {editMode === user._id ? (
                                            <input
                                                type="email"
                                                value={editUserData.email}
                                                onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                                            />
                                        ) : (
                                            user.email
                                        )}
                                    </td>
                                    <td>
                                        {editMode === user._id ? (
                                            <>
                                                <button onClick={() => handleUpdate(user._id)}>Save</button>
                                                <button onClick={() => setEditMode(null)}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEdit(user._id)}>Edit</button>
                                                <button className="delete-btn" onClick={() => handleDelete(user._id)}>Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                    ) : (
                        <tr>
                            <td colSpan="3">No users found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UsersList;
