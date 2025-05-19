import React, { useEffect, useState } from 'react';
import { FaDownload, FaEdit, FaTrash } from 'react-icons/fa'; // Import icons
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import axios from 'axios';

const CrudTable = () => {
  const [formData, setFormData] = useState([]);
  const [editingData, setEditingData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/formData');
        setFormData(response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchFormData();
  }, []);

  const groupedByPlayerStyle = formData.reduce((groups, entry) => {
    const style = entry.playerStyle || 'Unknown';
    if (!groups[style]) {
      groups[style] = [];
    }
    groups[style].push(entry);
    return groups;
  }, {});

  const downloadPDF = (data, style) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`${style} Player Data`, doc.internal.pageSize.width / 2, 20, null, null, 'center');

    const headers = ['SR. No.', 'Name', 'Phone', 'Age', 'PlayerStyle', 'Jersey Size', 'Shirt Number'];

    const rows = data.map((entry, index) => [
      index + 1,
      entry.name,
      entry.phone,
      entry.age,
      entry.playerStyle,
      entry.jerseySize,
      entry.shirtNumber,
    ]);

    console.log("Rows:", rows);

    // AutoTable
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      theme: 'grid',
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        halign: 'center',
        valign: 'middle',
        fontSize: 13,
      },
      bodyStyles: {
        fontSize: 12,
        halign: 'center',
        valign: 'middle',
        textColor: 'black',
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 },
      },
      margin: { top: 30, left: 5, right: 2, bottom: 10 },
      didDrawPage: function (data) {
        // Page number
        doc.setFontSize(15);
        const pageNumber = `Page ${data.pageNumber}`;
        const pageWidth = doc.internal.pageSize.width;
        const textWidth = doc.getTextWidth(pageNumber);
        doc.text(pageNumber, (pageWidth - textWidth) / 2, doc.internal.pageSize.height - 10);
      },
    });

    // Save the PDF
    doc.save(`${style}_player_data.pdf`);
  };


  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/formData/${id}`);
      setFormData(formData.filter((item) => item._id !== id)); 
    } catch (err) {
      console.error('Error deleting data:', err);
    }
  };

  const handleEdit = (entry) => {
    setEditingData(entry);
    setModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/formData/${editingData._id}`, editingData);
      setFormData(formData.map(item => item._id === editingData._id ? editingData : item));
      setModalOpen(false);
    } catch (err) {
      console.error('Error updating data:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 rounded-lg bg-white mt-6">
      <div className="flex flex-wrap justify-between items-center mb-3">
        <h2 className="text-2xl text-center mb-0 w-full px-4 py-2">Player Data</h2>
      </div>

      <div className="overflow-x-auto">
        {Object.keys(groupedByPlayerStyle).map((style) => (
          <div key={style}>
            <h3 className="text-xl mt-6 mb-2 font-semibold">{style} Players</h3>
            <button
              type="button"
              className="mb-4 flex items-center bg-blue-500 px-4 py-2 rounded-xl text-white hover:border border-black"
              onClick={() => downloadPDF(groupedByPlayerStyle[style], style)} // Pass group data for download
            >
              Download {style} Players
              <FaDownload className="text-white ml-2" />
            </button>
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-1 py-2 text-center">SR. No.</th>
                  <th className="px-1 py-2 text-center">Name</th>
                  <th className="px-1 py-2 text-center">Phone</th>
                  <th className="px-1 py-2 text-center">Age</th>
                  <th className="px-1 py-2 text-center">Jersey Size</th>
                  <th className="px-1 py-2 text-center">Shirt Number</th>
                  <th className="px-1 py-2 text-center">File</th>
                  <th className="px-1 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedByPlayerStyle[style].map((entry, index) => (
                  <tr key={entry._id} className="border-b">
                    <td className="px-1 py-2 text-center">{index + 1}</td>
                    <td className="px-1 py-2 text-center">{entry.name}</td>
                    <td className="px-1 py-2 text-center">{entry.phone}</td>
                    <td className="px-1 py-2 text-center">{entry.age}</td>
                    <td className="px-1 py-2 text-center">{entry.jerseySize}</td>
                    <td className="px-1 py-2 text-center">{entry.shirtNumber}</td>
                    <td className="px-1 py-2 text-center">
                      {entry.fileUrl ? (
                        <img
                          src={entry.fileUrl}
                          alt="Uploaded file"
                          className="max-w[100px] max-h-[100px] object-contain rounded-4xl" />
                      ) : (
                        'No file uploaded'
                      )}
                    </td>
                    <td className="px-1 py-2 text-center flex flex-wrap justify-center gap-2">
                      <button
                        className="bg-blue-500 text-white p-2 rounded-md"
                        onClick={() => handleEdit(entry)}
                      >
                        <FaEdit className="text-white" />
                      </button>
                      <button
                        className="bg-red-500 text-white p-2 rounded-md"
                        onClick={() => handleDelete(entry._id)}
                      >
                        <FaTrash className="text-white" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Modal for editing */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-11/12 md:w-1/3">
            <h2 className="text-xl mb-4">Edit Player</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={editingData.name}
                  onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Phone</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={editingData.phone}
                  onChange={(e) => setEditingData({ ...editingData, phone: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Age</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={editingData.age}
                  onChange={(e) => setEditingData({ ...editingData, age: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Jersey Size</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={editingData.jerseySize}
                  onChange={(e) => setEditingData({ ...editingData, jerseySize: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Shirt Number</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={editingData.shirtNumber}
                  onChange={(e) => setEditingData({ ...editingData, shirtNumber: e.target.value })}
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-gray-500 text-white p-2 rounded-md"
                  onClick={() => setModalOpen(false)} // Close modal
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudTable;
