import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './LoginStatus.css';
import UsersList from "../../SubDashboard/UsersList";
import EmployeesList from "../../SubDashboard/EmployeesList";
import UserLogged from '../../SubDashboard/UserLogged';
import EmployeeLogged from '../../SubDashboard/EmployeeLogged';

function Dashboard1() {


    return (
        <div>

            <UserLogged />
            <UsersList />
            <EmployeeLogged />
            <EmployeesList />
        </div>
    );
}

export default Dashboard1;
