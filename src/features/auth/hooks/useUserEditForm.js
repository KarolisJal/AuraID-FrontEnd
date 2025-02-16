import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { userApi } from '../../../services/api';
import { toast } from 'react-toastify';

export const useUserEditForm = (user, onSave) => {
  // Form state
  const [formState, setFormState] = useState({
    values: {
      email: '',
      firstName: '',
      lastName: '',
      country: '',
      roles: [],
      status: '',
      createdAt: '',
      updatedAt: '',
    },
    touched: {},
    errors: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormState(prev => ({
        ...prev,
        values: {
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          country: user.country || '',
          roles: user.roles || [],
          status: user.status || 'ACTIVE',
          createdAt: user.createdAt || '',
          updatedAt: user.updatedAt || ''
        },
        touched: {},
        errors: {},
        isDirty: false
      }));
    }
  }, [user]);

  // Validation functions
  const validateEmail = useCallback(
    debounce(async (email) => {
      if (!email) {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, email: 'Email is required' },
          isValid: false
        }));
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 50) {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, email: 'Invalid email format or too long (max 50 characters)' },
          isValid: false
        }));
        return false;
      }

      try {
        if (email !== user?.email) {
          await userApi.checkEmail(email);
        }
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, email: undefined },
          isValid: Object.values(prev.errors).filter(Boolean).length === 0
        }));
        return true;
      } catch (error) {
        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, email: 'Email is already registered' },
          isValid: false
        }));
        return false;
      }
    }, 500),
    [user]
  );

  const validateName = useCallback((name, field) => {
    if (name === '' || name === null) {
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: undefined },
        isValid: Object.values(prev.errors).filter(Boolean).length === 0
      }));
      return true;
    }

    if (name.length < 2 || name.length > 50) {
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: `${field} must be between 2 and 50 characters` },
        isValid: false
      }));
      return false;
    }

    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: undefined },
      isValid: Object.values(prev.errors).filter(Boolean).length === 0
    }));
    return true;
  }, []);

  // Handle field changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value },
      touched: { ...prev.touched, [name]: true },
      isDirty: true
    }));

    // Validate field
    switch (name) {
      case 'email':
        validateEmail(value);
        break;
      case 'firstName':
      case 'lastName':
        validateName(value, name);
        break;
      default:
        break;
    }
  }, [validateEmail, validateName]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Create update data object with only changed fields
      const updateData = {};
      if (formState.values.firstName !== user.firstName) {
        updateData.firstName = formState.values.firstName;
      }
      if (formState.values.lastName !== user.lastName) {
        updateData.lastName = formState.values.lastName;
      }
      if (formState.values.email !== user.email) {
        updateData.email = formState.values.email;
      }
      if (formState.values.country !== user.country) {
        updateData.country = formState.values.country;
      }

      await onSave(user.username, updateData);
      toast.success('User updated successfully');
      
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        isDirty: false,
        touched: {}
      }));

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
      
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: {
          ...prev.errors,
          submit: error.response?.data?.message || 'Failed to update user'
        }
      }));

      return false;
    }
  }, [formState.values, user, onSave]);

  // Reset form
  const resetForm = useCallback(() => {
    if (user) {
      setFormState({
        values: {
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          country: user.country || '',
          roles: user.roles || [],
          status: user.status || 'ACTIVE',
          createdAt: user.createdAt || '',
          updatedAt: user.updatedAt || ''
        },
        touched: {},
        errors: {},
        isSubmitting: false,
        isValid: true,
        isDirty: false
      });
    }
  }, [user]);

  return {
    formState,
    handleChange,
    handleSubmit,
    resetForm
  };
}; 