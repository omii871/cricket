import React, { createContext, useState, useContext } from 'react';

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState([]); 

  const addFormData = (data) => {
    setFormData([...formData, data]);
  };

  const updateFormData = (index, data) => {
    const updatedData = [...formData];
    updatedData[index] = data;
    setFormData(updatedData);
  };

  return (
    <FormContext.Provider value={{ formData, addFormData, updateFormData }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => useContext(FormContext);
