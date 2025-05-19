import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OwnerForm = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;


  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    teamName: "",
    password: "",
  });

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.age) newErrors.age = "Age is required";
    if (!formData.teamName.trim()) newErrors.teamName = "Team name is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!file) newErrors.file = "Photo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataWithFile = new FormData();
    formDataWithFile.append("name", formData.name);
    formDataWithFile.append("phone", formData.phone);
    formDataWithFile.append("email", formData.email);
    formDataWithFile.append("age", formData.age);
    formDataWithFile.append("teamName", formData.teamName);
    formDataWithFile.append("file", file);
    formDataWithFile.append("password", formData.password);

    try {
      const res = await axios.post(`${apiUrl}/api/ownerData`, formDataWithFile);
      console.log("Registration successful:", res.data);

      // const loginRes = await axios.post("http://localhost:5000/api/ownerData/login", {
      //   email: formData.email.trim(),
      //   password: formData.password.trim(),
      // });

      // console.log("Login successful:", loginRes.data);
      setSuccessMessage("Registration & Login successful!");

      // Clear the form
      setFormData({
        name: "",
        phone: "",
        email: "",
        age: "",
        teamName: "",
        password: "",
      });
      setFile(null);

      // setTimeout(() => {
        navigate("/");
      // }, 1500);
    } catch (error) {
      console.error("Error:", error);
      alert(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-lg mt-10 border border-gray-200">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-blue-600">
        Team Registration Form
      </h1>

      {successMessage && (
        <div className="mb-4 text-green-600 font-bold text-center">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Name:</label>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-6 py-3 border rounded-md"
          />
          {errors.name && <p className="text-red-600">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Phone No:</label>
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-6 py-3 border rounded-md"
          />
          {errors.phone && <p className="text-red-600">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Email:</label>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-6 py-3 border rounded-md"
          />
          {errors.email && <p className="text-red-600">{errors.email}</p>}
        </div>

        {/* Age */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Age:</label>
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            required
            className="w-full px-6 py-3 border rounded-md"
          />
          {errors.age && <p className="text-red-600">{errors.age}</p>}
        </div>

        {/* Team */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Select Team:</label>
          <select
            name="teamName"
            value={formData.teamName}
            onChange={handleChange}
            required
            className="w-full px-6 py-3 border rounded-md"
          >
            <option value="">Select Team</option>
            <option value="abc">ABC</option>
            <option value="xyz">XYZ</option>
            <option value="pqr">PQR</option>
          </select>
          {errors.teamName && <p className="text-red-600">{errors.teamName}</p>}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Upload Your Photo:</label>
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            required
            className="w-full px-6 py-3 border rounded-md"
          />
          {errors.file && <p className="text-red-600">{errors.file}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-lg font-medium text-gray-700">Enter Your Password:</label>
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-6 py-3 border rounded-md"
          />
          {errors.password && <p className="text-red-600">{errors.password}</p>}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default OwnerForm;
