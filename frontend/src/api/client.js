// frontend/src/api/client.js
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const createProcessor = async (processorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-processor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processorData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};