// frontend/src/components/CreateProcessor.jsx
import { useState } from 'react';
import { createProcessor } from '../api/client';

function CreateProcessor() {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    plan: 'starter'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await createProcessor(formData);
      console.log('Processor created:', result);
      setResult(result);
      
      // Spara API key i localStorage
      if (result.apiKey) {
        localStorage.setItem('auditorApiKey', result.apiKey);
        localStorage.setItem('auditorProcessor', JSON.stringify({
          id: result.processorId,
          companyName: result.companyName,
          plan: result.plan
        }));
      }
      
      alert(`✅ Success! Your ${result.plan} plan is activated. API Key: ${result.apiKey}`);
      
    } catch (error) {
      console.error('Failed to create processor:', error);
      setError(error.message);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>🚀 Create New Processor</h2>
      <p className="card-description">Start your GDPR-compliant audit trail in seconds</p>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Company Name:</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            placeholder="Enter your company name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter your business email"
            required
          />
        </div>

        <div className="form-group">
          <label>Plan:</label>
          <select 
            value={formData.plan} 
            onChange={(e) => setFormData({...formData, plan: e.target.value})}
          >
            <option value="starter">Starter - 10,000 events ($0/mo)</option>
            <option value="growth">Growth - 100,000 events ($29/mo)</option>
            <option value="enterprise">Enterprise - 1,000,000 events ($99/mo)</option>
          </select>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Creating...' : `Create ${formData.plan} Processor`}
        </button>
      </form>

      {error && (
        <div className="message error">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="message success">
          <h3>✅ Success!</h3>
          <p><strong>Processor ID:</strong> {result.processorId}</p>
          <p><strong>API Key:</strong> {result.apiKey}</p>
          <p><strong>Plan:</strong> {result.plan}</p>
          <p><em>{result.message}</em></p>
        </div>
      )}
    </div>
  );
}

export default CreateProcessor;