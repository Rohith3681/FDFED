import React from 'react'
import { useState } from 'react';
import './Login.css'
export const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loggedin, setLoggedin] = useState(false)
  const [employee, setEmployee] = useState(false)

  const handleSubmit = async(event) => {
      event.preventDefault();

      const check = {name, password};

      try{
          const res = await fetch('http://localhost:8000/login', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify(check),
          });
          console.log(res)
          if(res.ok) {
            const data = await res.json();
            console.log('Login successful');
            setName('');
            setPassword('');
            setLoggedin(true);
            if(data.role == 8180){
              setEmployee(true);
            }
          }else{
                const errorMessage = await res.text();
                console.error('Error during login:', res.status, errorMessage);
          }

        }catch(error){
            console.log(error);
        }
    };
  return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        {loggedin? ( <h1>Login Successful !!!</h1> ) :(<h1>Please Login</h1>) }
        {employee? ( <button type="button">Employee Dashboard</button>) : (<div>Hello</div>)}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-2xl mb-4 font-bold text-center">Login</h2>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700">name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  )
};
