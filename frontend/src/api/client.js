// frontend/src/api/client.js
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const createProcessor = async (processorData) => {
  try {
    console.log('Sending request to:', `${API_BASE_URL}/.netlify/functions/create-processor`);
    
    const response = await fetch(`${API_BASE_URL}/.netlify/functions/create-processor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processorData)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Response success:', result);
    return result;

  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};