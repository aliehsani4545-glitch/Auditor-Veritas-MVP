import React, { useState } from 'react';
import { Building2, Mail, CreditCard, Rocket, CheckCircle, XCircle } from 'lucide-react';

// Samma tomma sträng som i App.jsx för att proxyn ska funka
const API_BASE_URL = '';

const CreateProcessor = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    plan: 'starter'
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // OBS: Denna endpoint används i det gamla flödet för att skapa en *osynkad* processor.
      // I det nya säkra flödet i App.jsx skickas JWT istället.
      const response = await fetch(`${API_BASE_URL}/api/processors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Hantera specifikt dubblett-fel snyggt
        if (response.status === 409) {
          throw new Error('An account with this email already exists.');
        }
        throw new Error(data.error || 'Failed to create processor');
      }

      setStatus({ type: 'success', message: 'Processor created successfully!' });
      setCreatedApiKey(data.apiKey); // Spara nyckeln för visning
      setFormData({ companyName: '', email: '', plan: 'starter' }); // Rensa formulär
      
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-8 border-b border-gray-100 text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Processor</h2>
          <p className="text-gray-500 mt-2">Start your GDPR-compliant audit trail in seconds.</p>
        </div>

        <div className="p-8">
          
          {/* WARNING: This form is intended for machine-only setup and bypasses user linkage */}
          <div className="mb-6 bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 rounded-lg flex items-center">
             <AlertTriangle className="w-5 h-5 mr-3" />
             <span className="text-sm">This form uses legacy public registration and is not linked to your user account.</span>
          </div>

          {/* Success Message showing API Key */}
          {status.type === 'success' && createdApiKey && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Success!</h3>
              <p className="text-green-700 mb-4">Your processor has been created. Save your API key immediately, it won't be shown again.</p>
              
              <div className="bg-white border-2 border-green-100 rounded-lg p-3 flex items-center justify-between">
                <code className="font-mono text-sm text-green-800 break-all">{createdApiKey}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(createdApiKey)}
                  className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 font-bold"
                >
                  COPY
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {status.type === 'error' && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              {status.message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-gray-400" /> Company Name
              </label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" /> Business Email
              </label>
              <input
                type="email"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your business email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-gray-400" /> Select Plan
              </label>
              <div className="relative">
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                >
                  <option value="starter">Starter - 100 events ($0/mo)</option>
                  <option value="professional">Professional - 50,000 events ($49/mo)</option>
                  <option value="enterprise">Enterprise - 500,000 events ($199/mo)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-bold text-white transition shadow-md ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? 'Creating...' : 'Create Processor'}
            </button>

          </form>
        </div>
      </div>
      
      {/* Footer note */}
      <p className="text-center text-gray-400 text-sm mt-6">
        By creating an account, you agree to our Data Processing Agreement.
      </p>
    </div>
  );
};

export default CreateProcessor;