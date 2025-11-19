const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const createProcessor = async (processorData) => {
  try {
    // Använd relativ sökväg för Netlify functions
    const response = await fetch('/.netlify/functions/create-processor', {
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