// src/components/MerkleProofViewer.jsx

import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, GitBranch, Zap, Layers, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
// apiCall is expected to be imported from '../App' in a real environment
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';
const apiCall = async (endpoint, options = {}, apiKey = '') => {
    const config = { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, ...options.headers }, ...options };
    if (options.body) config.body = JSON.stringify(options.body);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (response.status === 204) return null;
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
    return data;
};


const MerkleProofViewer = ({ apiKey }) => {
  const [eventId, setEventId] = useState('');
  const [proofResult, setProofResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    // OBS: user_identifier i backend är hashad, men Merkle Proof tar Event ID (UUID).
    if (!eventId || !apiKey) {
      setError('Ange både Event ID och en giltig API Key.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProofResult(null);

    try {
      const data = await apiCall(`/api/merkle/proof/${eventId}`, { method: 'GET' }, apiKey);
      setProofResult(data);
    } catch (err) {
      setError(err.message.includes('404') ? 'Händelse hittades inte eller tillhör inte din Processor.' : `Verifiering misslyckades: ${err.message}`);
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
      <div className="p-2 rounded-full bg-slate-100 text-slate-500 shrink-0 mt-0.5">
        <GitBranch size={16} />
        <span className="absolute top-0 right-0 text-[10px] text-slate-400 font-bold">{index+1}</span>
      </div>
      <div>
        <p className="font-bold text-sm text-slate-800">Steg {proofResult.proof.length - index}: Hashning med {step.position.toUpperCase()} Sibling</p>
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
        Kontrollera den kryptografiska integriteten för en specifik audit-händelse mot din Processor Root Hash.
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event ID</label>
          <input
            type="text"
            placeholder="Ange Event ID (UUID)"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !apiKey}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isLoading ? <RefreshCw className="animate-spin w-4 h-4" /> : <ShieldCheck size={18} />}
          {isLoading ? 'Verifierar...' : 'Verifiera Händelseintegritet'}
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
          className={`mt-6 border rounded-xl overflow-hidden shadow-lg ${proofResult.isValid ? 'border-emerald-300' : 'border-red-300'}`}
        >
          {/* Sammanfattning */}
          <div className={`p-5 flex justify-between items-center ${proofResult.isValid ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-3">
              {proofResult.isValid ? <CheckCircle2 className="text-emerald-600" size={24} /> : <AlertCircle className="text-red-600" size={24} />}
              <span className="font-bold text-lg text-slate-800">
                {proofResult.isValid ? 'Verifiering KLAR' : 'INTEGRITETSVARNING'}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">Steg: {proofResult.proof.length}</span>
          </div>

          {/* Root Hash & Leaf Hash */}
          <div className="p-5 space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-purple-600 uppercase">Merkle Root</span>
              <span className="font-mono text-[10px] text-slate-800 break-all">{proofResult.merkleRoot.substring(0, 40)}...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-600 uppercase">Event Leaf Hash</span>
              <span className="font-mono text-[10px] text-slate-800 break-all">{proofResult.leafHash.substring(0, 40)}...</span>
            </div>
          </div>

          {/* Proof Steps */}
          <div className="bg-slate-50 p-0">
            <h4 className="text-xs font-bold text-slate-600 uppercase p-4 border-b border-slate-100">Bevisväg</h4>
            {proofResult.proof.slice().reverse().map(renderProofStep)}
          </div>

        </motion.div>
      )}
    </div>
  );
};

export default MerkleProofViewer;