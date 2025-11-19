// Använd RELATIV sökväg för Netlify functions
const API_BASE_URL = '';

export const createProcessor = async (processorData) => {
  try {
    console.log('Sending request to Netlify function...');
    
    // Använd direkt sökväg till Netlify function
const response = await fetch('/api/processors', {      method: 'POST',
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