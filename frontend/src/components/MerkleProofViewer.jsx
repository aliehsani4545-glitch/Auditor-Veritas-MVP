import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, GitBranch, Layers, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// API HELPER (Samma som i Dashboard och App)
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

const apiCall = async (endpoint, options = {}, token = null, apiKey = null) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    
    // Auth Logic: Prioritera Token (Människa), fallback till API Key (Maskin)
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (apiKey) headers['x-api-key'] = apiKey;

    const config = { headers, ...options };
    if (options.body) config.body = JSON.stringify(options.body);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (response.status === 204) return null;
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
    return data;
};

const MerkleProofViewer = ({ token, apiKey }) => {
  const [eventId, setEventId] = useState('');
  const [proofResult, setProofResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!eventId) {
      setError('Please provide an Event ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProofResult(null);

    try {
      // HÄR ÄR FIXEN: Vi skickar med 'token' till apiCall
      const data = await apiCall(`/api/merkle/proof/${eventId}`, { method: 'GET' }, token, apiKey);
      setProofResult(data);
    } catch (err) {
      // Bättre felmeddelanden
      if (err.message.includes('404')) {
          setError('Event ID not found in your processor logs.');
      } else if (err.message.includes('401') || err.message.includes('403')) {
          setError('Access denied. Please refresh page.');
      } else {
          setError(`Verification Failed: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderProofStep = (step, index) => (
    <motion.div 
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-start gap-4 p-4 border-b border-slate-100 last:border-b-0 bg-white"
    >
      <div className="p-2 rounded-full bg-slate-100 text-slate-500 shrink-0 mt-0.5 relative">
        <GitBranch size={16} />
        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-blue-600 text-[8px] text-white font-bold">
            {index + 1}
        </span>
      </div>
      <div>
        <p className="font-bold text-sm text-slate-800">Step {proofResult.proof.length - index}: Hashing with {step.position.toUpperCase()} Sibling</p>
        <p className="font-mono text-xs text-slate-500 break-all mt-1">Sibling Hash: {step.hash.substring(0, 30)}...</p>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <Layers className="text-purple-600" size={24} />
        <h2 className="font-bold text-xl text-slate-900">Merkle Proof Verifier</h2>
      </div>
      
      <p className="text-sm text-slate-600">
        Cryptographically verify the integrity of a specific audit event against your Processor's Root Hash.
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event ID (UUID)</label>
          <input
            type="text"
            placeholder="Paste Event ID from Search or Live Logs..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-slate-700"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <ShieldCheck size={18} />}
          {isLoading ? 'Verifying...' : 'Verify Integrity'}
        </button>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </form>

      {proofResult && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className={`mt-6 border rounded-xl overflow-hidden shadow-lg ${proofResult.verified ? 'border-emerald-300' : 'border-red-300'}`}
        >
          {/* Summary Header */}
          <div className={`p-5 flex justify-between items-center ${proofResult.verified ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-3">
              {proofResult.verified ? <CheckCircle2 className="text-emerald-600" size={24} /> : <AlertCircle className="text-red-600" size={24} />}
              <span className="font-bold text-lg text-slate-800">
                {proofResult.verified ? 'Verification SUCCESS' : 'INTEGRITY WARNING'}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono font-bold bg-white/50 px-2 py-1 rounded">Steps: {proofResult.proof.length}</span>
          </div>

          {/* Root Hash & Leaf Hash */}
          <div className="p-5 space-y-3 bg-white">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <span className="text-xs font-bold text-purple-600 uppercase">Merkle Root</span>
              <span className="font-mono text-[10px] text-slate-800 break-all">{proofResult.merkleRoot.substring(0, 40)}...</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs font-bold text-blue-600 uppercase">Event Leaf Hash</span>
              <span className="font-mono text-[10px] text-slate-800 break-all">{proofResult.leafHash.substring(0, 40)}...</span>
            </div>
          </div>

          {/* Proof Path */}
          <div className="bg-slate-50 p-0">
            <h4 className="text-xs font-bold text-slate-600 uppercase p-4 border-b border-slate-100 flex items-center gap-2">
                <Layers size={12}/> Proof Path
            </h4>
            {proofResult.proof.slice().reverse().map(renderProofStep)}
          </div>

        </motion.div>
      )}
    </div>
  );
};

export default MerkleProofViewer;