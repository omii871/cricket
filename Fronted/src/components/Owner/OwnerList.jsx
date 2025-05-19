import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const EditOwnerModal = ({ owner, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    _id: owner._id,
    name: owner.name,
    email: owner.email,
    phone: owner.phone,
    age: owner.age,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  useEffect(() => {
    console.log('Selected Owner:', owner);
  }, [owner]);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-1/3">
        <h2 className="text-xl font-bold mb-4">Edit Owner</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-black rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OwnerList = () => {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOwnerData = async () => {
    try {
      console.log("Fetching owner data...");;
      
      const response = await axios.get('http://localhost:5000/api/ownerData');
      console.log('Fetched Owners:', response.data);
      setOwners(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert("Error fetching owner data!")
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const handleEdit = (ownerId) => {
    const owner = owners.find((owner) => owner._id === ownerId);
    console.log('Editing Owner:', owner);
    setSelectedOwner(owner);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedOwner) => {
    console.log('Saving Updated Owner:', updatedOwner);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/ownerData/${updatedOwner._id}`,
        updatedOwner
      );

      if (response.status === 200) {
        console.log('Update success:', response.data);
        setOwners((prevOwners) =>
          prevOwners.map((owner) =>
            owner._id === updatedOwner._id ? { ...owner, ...updatedOwner } : owner
          )
        );
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating owner:', error);
    }
  };

  const handleDelete = async (ownerId) => {
    try {
      await axios.delete(`http://localhost:5000/api/ownerData/${ownerId}`);
      setOwners(owners.filter(owner => owner._id !== ownerId));
    } catch (error) {
      console.error('Error deleting owner:', error);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Owner List', 14, 10);

    const columns = [
      { title: 'Name', dataKey: 'name' },
      { title: 'Email', dataKey: 'email' },
      { title: 'Phone', dataKey: 'phone' },
      { title: 'Age', dataKey: 'age' },
      { title: 'Team', dataKey: 'teamName' },
      { title: 'File', dataKey: 'file' },
    ];

    const rows = owners.map(owner => ({
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      age: owner.age,
      teamName: owner.teamName,
      file: owner.fileUrl ? 'Yes' : 'No',
    }));

    autoTable(doc, {
      head: [columns.map(col => col.title)],
      body: rows.map(row => columns.map(col => row[col.dataKey])),
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], fontSize: 12, halign: 'center' },
      bodyStyles: { fontSize: 10, textColor: [0, 0, 0], halign: 'center' },
      margin: { top: 30, left: 10, right: 10, bottom: 10 },
    });

    doc.save('owner_list.pdf');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">Owner List</h1>

      {/* Download Button */}
      <button
        onClick={downloadPDF}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Download PDF
      </button>

      {loading ? (
        <div className="flex justify-center items-center">
          {/* Bouncing Dots Loader */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-400"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-600"></div>
          </div>
        </div> 
      ) : owners.length > 0 ? (
        <table className="min-w-full table-auto border-separate border-spacing-0.5">
          <thead>
            <tr className="bg-blue-600 text-white text-center">
              <th className="px-6 py-3 rounded-tl-lg">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Age</th>
              <th className="px-6 py-3">Team</th>
              <th className="px-6 py-3">File</th>
              <th className="px-6 py-3 rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner) => (
              <tr key={owner._id} className="hover:bg-gray-100 border-b border-gray-200">
                <td className="px-6 py-4">{owner.name}</td>
                <td className="px-6 py-4">{owner.email}</td>
                <td className="px-6 py-4">{owner.phone}</td>
                <td className="px-6 py-4">{owner.age}</td>
                <td className="px-6 py-4">{owner.teamName}</td>
                <td className="px-0 py-4">
                  {owner.fileUrl && (
                    <a href={owner.fileUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={owner.fileUrl}
                        alt="Uploaded File"
                        className="max-w-full max-h-20 rounded-md"
                      />
                    </a>
                  )}
                </td>

                <td className="px-6 py-4 flex justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(owner._id)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center"
                  >
                    <FaEdit className="text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(owner._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                  >
                    <FaTrash className="text-white" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500">No owners available</p>
      )}

      {isModalOpen && (
        <EditOwnerModal
          owner={selectedOwner}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default OwnerList;
