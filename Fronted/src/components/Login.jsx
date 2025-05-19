import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
   const apiUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) return;

  //   try {
  //     const res = await axios.post('http://localhost:5000/api/ownerData/login', {
  //       email: formData.email,
  //       password: formData.password,
  //     });

  //     console.log("Login successful:", res.data);
  //     setSubmitted(true);

  //     localStorage.setItem('isAuthenticated', 'true');

  //     setTimeout(() => {
  //       navigate('/home'); // home page
  //     }, 1500);

  //   } catch (error) {
  //     console.error("Login error:", error);
  //     alert(error?.response?.data?.message || "Something went wrong");
  //   }


  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      const res = await axios.post(`${apiUrl}/api/ownerData/login`, {
        email: formData.email,
        password: formData.password,
      });
  
      const data = res.data;
      console.log("Login successful:", res.data);
      setSubmitted(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('role',res.data.role);
  
      setTimeout(() => {
        if (data.role === 'admin') {
          navigate('/home');
        } else {
         sessionStorage.setItem('ownerId', res.data.ownerId);
          navigate('/owner-dashboard'); 
        }
      }, 1500);
  
    } catch (error) {
      console.error("Login error:", error);
      alert(error?.response?.data?.message || "Something went wrong");
    }
  };
  

  return (
    <div className='flex justify-center items-center min-h-screen bg-gradient-to-r from-teal-500 via-green-500 to-lime-500'>
      {!submitted ? (
        <div className='w-full sm:w-96 bg-white p-8 rounded-2xl shadow-xl'>
          <h2 className='text-3xl font-semibold text-center text-gray-800 mb-6'>
            Welcome Back!
          </h2>

          <form onSubmit={handleSubmit}>
            <div className='mb-6'>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='Enter your email'
                className='w-full p-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400'
              />
              {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
            </div>

            <div className='mb-6'>
              <input
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                placeholder='Enter your password'
                className='w-full p-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400'
              />
              {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password}</p>}
            </div>

            <button
              type='submit'
              className='w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-lg'
            >
              Login
            </button>
          </form>

          <p className='text-center text-gray-600 text-sm mt-4'>
            Don't have an account?{' '}
            <Link to='/ownerform' className='text-teal-600 hover:underline'>
              Owner Sign Up
            </Link>

          </p>
         
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center p-10 bg-green-200 rounded-xl'>
          {/* <svg
            className="animate-spin h-10 w-10 text-green-700 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg> */}
          <h3 className='text-xl font-semibold text-green-700'>
            Login Successful! Redirecting...
          </h3>
        </div>

      )}
    </div>
  );
}

export default Login;