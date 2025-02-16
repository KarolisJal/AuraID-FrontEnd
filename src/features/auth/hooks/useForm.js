import { useState } from 'react';

export const useForm = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData(initialState);
    setError('');
  };

  const setFieldValue = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const setFieldError = (message) => {
    setError(message);
  };

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  return {
    formData,
    loading,
    error,
    handleChange,
    setFieldValue,
    setFieldError,
    resetForm,
    startLoading,
    stopLoading
  };
}; 