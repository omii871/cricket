import React, { useState } from 'react';
import axios from 'axios';

const Form = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [jerseySize, setJerseySize] = useState('');
  const [shirtNumber, setShirtNumber] = useState('');
  const [file, setFile] = useState('');
  const [playerStyle, setPlayerStyle] = useState('');

  const validateFullName = (name) => {
    const nameParts = name.trim().split(' ');

    return nameParts.length >= 3 && nameParts.every(part => /^[A-Za-z]+$/.test(part));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFullName(name)) {
      alert('आपले पूर्ण नाव टाका 🙏🏻.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('age', age);
    formData.append('playerStyle', playerStyle);
    formData.append('jerseySize', jerseySize);
    formData.append('shirtNumber', shirtNumber);

    if (file) formData.append('file', file);
    try {
      await axios.post('http://localhost:5000/api/formData', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('आपला फॉर्म सबमिट झाला आहे...! 🙏🏻🙏🏻');
      setName('');
      setPhone('');
      setAge('');
      setPlayerStyle('');
      setJerseySize('');
      setShirtNumber('');
      setFile(null);
    } catch (err) {
      alert('Error submitting form');
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white-200">
      <div className='bg-blue-50 rounded-2xl shadow-2xl mt-2 mb-2 '>
        <form onSubmit={handleSubmit} className="p-3 rounded-lg w-full max-w-4xl">
          {/* Form Inputs */}
          <div className="mb-2 max-w-4xl mx-1  rounded-2xl bg-white">

            <div className='rounded-2xl '><img src="ban.jpg" alt="" /> </div>
          </div>

          <div className="mb-2 max-w-4xl rounded-lg bg-white shadow-md m-1">
            <h1 className="text-3xl text-center m-2 mt-2  font-extrabold mb-4 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-serif">
              BHAIRAVNATH CRICKET CLUB AARE (BCC) AYOJEET
            </h1>
            <h6 className="text-2xl text-center mb-1 font-bold text-gray-800 font-serif">

              <i className="fa-solid fa-trophy" style={{ color: 'gold' }}></i>&nbsp;
              PLAYER FORM &nbsp;<i className="fa-solid fa-trophy" style={{ color: 'gold' }}></i>
            </h6>
          </div>


          {/* Name Input */}
          <div className="mb-2 max-w-4xl mx-1 p-6 rounded-lg bg-white shadow-md">
            <label htmlFor="name" className="block text-lg font-semibold mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Phone Input */}
          <div className="mb-2 max-w-4xl mx-1 p-6 rounded-lg bg-white shadow-md">
            <label htmlFor="phone" className="block text-lg font-semibold mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              pattern="[0-9]{10}"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Other Inputs */}
          <div className="mb-2 max-w-4xl mx-1 p-6 rounded-lg bg-white shadow-md">
            <label htmlFor="age" className="block text-lg font-semibold mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter your age"
            />
          </div>

          {/* player style  */}
          <div className="mb-2 max-w-4xl mx-1 p-6 rounded-lg bg-white shadow-md">
            <label htmlFor="playerStyle" className="block text-lg font-semibold mb-2">
              Player Style <span className="text-red-500">*</span>
            </label>
            <select
              id="playerStyle"
              value={playerStyle}
              onChange={(e) => setPlayerStyle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Select Player Style</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-Rounder">All-Rounder</option>
            </select>
          </div>

          {/* Jersey Size Input */}
          <div className="mb-2 max-w-4xl mx-1 p-6 rounded-lg bg-white shadow-md">
            <label htmlFor="jersey-size" className="block text-lg font-semibold mb-2">
              Jersey Size <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="jersey-size"
              value={jerseySize}
              onChange={(e) => setJerseySize(e.target.value)}
              required
              min="00"
              max="70"
              step="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter jersey size (e.g., 30, 40)"
            />
          </div>

          {/* Shirt Number Input */}
          <div className="mb-2 max-w-4xl mx-1 p-6 rounded-lg bg-white shadow-md">
            <label htmlFor="shirt-number" className="block text-lg font-semibold mb-2">
              Shirt Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="shirt-number"
              value={shirtNumber}
              onChange={(e) => setShirtNumber(e.target.value)}
              required
              min="1"
              max="99"
              step="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter your shirt number (e.g., 7, 10, 23)"
            />
          </div>

          {/* File Upload Input */}
          <div className="mb-2 max-w-4xl mx-1 p-6 rounded-lg bg-white shadow-md">
            <label htmlFor="file" className="block text-lg font-semibold mb-2">
              Upload File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
              accept=".jpg, .jpeg, .png, .pdf"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex justify-center items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 mb-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;


