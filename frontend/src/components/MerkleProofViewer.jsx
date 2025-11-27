import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Layers } from 'lucide-react';

const MerkleProofViewer = ({ apiKey }) => {
    const [eventId, setEventId] = useState('');
    const [proofData, setProofData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!eventId) return;
        
        setLoading(true);
        setError(null);
        setProofData(null);

        try {
            // Här anropar vi backenden. För att detta ska fungera via dashboarden 
            // så använder vi den apiKey som skickas med, eller JWT om din backend kräver det.
            const response = await fetch(`https://auditor-veritas-mvp.onrender.com/api/merkle/proof/${eventId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`, // Om backend kräver Bearer token
                    'x-api-key': apiKey // Som fallback om backend är inställd på key
                }
            });
            
            if (!response.ok) throw new Error('Verification failed. Invalid ID or Server Error.');
            
            const data = await response.json();
            setProofData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <ShieldCheck className="text-purple-600" size={20} />
                <h3 className="font-bold text-slate-800 text-lg">Merkle Proof Verifier</h3>
            </div>
            
            <div className="p-8">
                <p className="text-slate-500 text-sm mb-6">
                    Cryptographically verify the integrity of a specific audit event against your Processor's Root Hash.
                </p>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Event ID (UUID)</label>
                    <input 
                        type="text" 
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
                        placeholder="Paste Event UUID (e.g. 15ce9ec1...)"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>

                <button 
                    onClick={handleVerify}
                    // FIXEN: Vi låser bara knappen om ID saknas eller om det laddar,
                    // vi bryr oss inte om apiKey i frontend-state för att undvika att den fastnar.
                    disabled={!eventId || loading}
                    className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg flex justify-center items-center gap-2
                        ${!eventId || loading 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-500/25 hover:scale-[1.01]'
                        }`}
                >
                    {loading ? 'Verifying on Chain...' : <><CheckCircle2 size={18}/> Verify Integrity</>}
                </button>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                        <XCircle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {proofData && (
                    <div className="mt-8 animate-fade-in-up">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={100} className="text-emerald-500"/></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                                    <CheckCircle2 size={20} />
                                    <span>Cryptographic Verification Successful</span>
                                </div>
                                <p className="text-emerald-600/80 text-xs mb-4">The event hash is mathematically included in the root.</p>
                                
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-emerald-800/50">Merkle Root</div>
                                        <div className="font-mono text-xs text-emerald-900 break-all bg-emerald-100/50 p-2 rounded">{proofData.merkleRoot}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-emerald-800/50">Leaf Hash (Event)</div>
                                        <div className="font-mono text-xs text-emerald-900 break-all bg-emerald-100/50 p-2 rounded">{proofData.leafHash}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MerkleProofViewer;