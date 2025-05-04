import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, setCart, setLoading } from '../../features/auth/authSlice'; // Adjust the import path based on your structure

const Refresh = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true)); // Set loading to true before fetching

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/refresh`, {
          credentials: 'include', // Ensures cookies are sent with the request
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();

        // Dispatch login action to set user data in Redux store
        dispatch(
          login({
            role: data.role, // Pass role
            username: data.username, // Pass username
          })
        );
        console.log(data.cart);
        // Dispatch setCart action to set cart details from backend
        dispatch(setCart(data.cart || [])); // Ensure cart is passed as an array
      } catch (err) {
        console.error('Error during fetch:', err.message);
        dispatch(logout()); // Log out if the fetch fails
      } finally {
        dispatch(setLoading(false)); // Set loading to false after completion
      }
    };

    // Only call fetchData if not authenticated
    if (!isAuthenticated) {
      fetchData();
    }
  }, [dispatch, isAuthenticated]);

  // Show a loading indicator while fetching data
  if (loading) {
    return <div>Loading...</div>;
  }

  return null; // The component doesn't render anything visible once the loading is complete
};

export default Refresh;
