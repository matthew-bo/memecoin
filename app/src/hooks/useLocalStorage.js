import { useState, useEffect } from 'react';

/**
 * Custom hook for managing state that persists in localStorage
 * @param {string} key - The localStorage key to store the value under
 * @param {any} initialValue - The initial value if no value exists in localStorage
 * @returns {[any, function]} - State value and setter function
 */
export function useLocalStorage(key, initialValue) {
  // Create state based on value from localStorage or initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when the state changes
  useEffect(() => {
    try {
      // Save state to localStorage
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
} 