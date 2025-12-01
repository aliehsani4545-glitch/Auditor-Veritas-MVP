// components/TeamManagement.jsx

import React, { useState, useEffect } from 'react';
import { apiCall } from '../App'; // Antag att apiCall exporteras och importeras korrekt
import { UserPlus, Loader2, Mail, Shield, User, XCircle, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const TeamManagement = ({ token, processor, isOwner }) => {
    const [team, setTeam] = useState([]);
    const [pending, setPending] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('reader');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [inviteLoading, setInviteLoading] = useState(false);

    const fetchTeamData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiCall('/api/team', { method: 'GET' }, token);
            setTeam(data.team || []);
            setPending(data.pending || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamData();
    }, [token]);

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!inviteEmail) {
            setError("Email is required.");
            setInviteLoading(false);
            return;
        }

        try {
            await apiCall('/api/team/invite', { 
                method: 'POST', 
                body: { email: inviteEmail, role: inviteRole } 
            }, token);
            
            setSuccessMessage(`Invitation successfully sent to ${inviteEmail} as a ${inviteRole}.`);
            setInviteEmail('');
            await fetchTeamData(); // Uppdatera listan
        } catch (err) {
            setError(err.message || "Failed to send invitation.");
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemoveMember = async (userId, email) => {
        if (!window.confirm(`Are you sure you want to remove ${email}? This action cannot be undone.`)) return;

        try {
            await apiCall(`/api/team/member/${userId}`, { method: 'DELETE' }, token);
            setSuccessMessage(`${email} has been successfully removed.`);
            fetchTeamData();
        } catch (err) {
            setError(err.message || "Failed to remove member.");
        }
    };

    const getRoleColor = (role) => {
        if (role === 'owner' || role === 'admin') return 'bg-red-500';
        if (role === 'editor') return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    if (isLoading) {
        return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-blue-500" /></div>;
    }
    
    // Hantera fall där användaren inte är ägare och inte kan bjuda in
    if (!isOwner) {
        return (
            <div className="p-6 md:p-10 bg-white rounded-xl shadow-lg mt-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Team Members ({processor.companyName})</h2>
                <p className="text-slate-600 mb-6">You are currently a team member ({role.charAt(0).toUpperCase() + role.slice(1)}). Only the Owner can manage and invite new members.</p>
                <TeamList team={team} pending={pending} isOwner={isOwner} getRoleColor={getRoleColor} handleRemoveMember={handleRemoveMember} currentUserId={processor.owner_id} />
            </div>
        );
    }


    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-full">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
                <UserPlus size={28} className="text-blue-600" /> Team Management
            </h1>
            <p className="text-slate-500 mb-8">Manage users who have access to the secure audit ledger for **{processor.companyName}**.</p>
            
            {error && <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-4 flex items-center gap-2"><AlertTriangle size={18} /> {error}</div>}
            {successMessage && <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-4 flex items-center gap-2"><CheckCircle2 size={18} /> {successMessage}</div>}

            {/* --- Inbjudningsformulär --- */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-10">
                <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2"><Mail size={20} className="text-blue-500" /> Invite New Member</h3>
                <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="user@corporate.com"
                            required
                            className="w-full p-3 border border-slate-300 rounded-xl"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-xl bg-white"
                        >
                            <option value="reader">Reader (View only)</option>
                            <option value="editor">Editor (View + Log events)</option>
                            <option value="admin">Admin (Editor + Manage team/keys)</option>
                        </select>
                    </div>
                    <button type="submit" disabled={inviteLoading || !inviteEmail} className="md:col-span-1 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {inviteLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />} Send Invite
                    </button>
                </form>
            </div>

            {/* --- Teamlista --- */}
            <TeamList team={team} pending={pending} isOwner={isOwner} getRoleColor={getRoleColor} handleRemoveMember={handleRemoveMember} currentUserId={processor.owner_id} />

        </div>
    );
};


// Komponent för att rendera listan
const TeamList = ({ team, pending, isOwner, getRoleColor, handleRemoveMember, currentUserId }) => (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
        <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2"><User size={20} className="text-slate-500" /> Active Team Members ({team.length})</h3>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-3">User/Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Status</th>
                        {isOwner && <th className="px-6 py-3">Action</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {team.map((member) => (
                        <tr key={member.email} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 flex items-center gap-2">
                                {member.email}
                                {member.role === 'owner' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold uppercase">Owner</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${getRoleColor(member.role)}`}>
                                    {member.role.toUpperCase()}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                                {member.status}
                            </td>
                            {isOwner && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {member.role !== 'owner' ? (
                                        <button 
                                            onClick={() => handleRemoveMember(member.user_id, member.email)} 
                                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    ) : (
                                        <Shield size={16} className="text-slate-400" title="Cannot remove owner" />
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                    {pending.map((invite) => (
                        <tr key={invite.invited_email} className="opacity-60 italic">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center gap-2">
                                {invite.invited_email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${getRoleColor(invite.role)}`}>
                                    {invite.role.toUpperCase()}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                                {invite.status} (Expires: {new Date(invite.expires_at).toLocaleDateString()})
                            </td>
                            {isOwner && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button 
                                        // I en fullständig app skulle du ha en "Avbryt inbjudan"-funktion här
                                        className="text-slate-400 p-2"
                                        disabled
                                    >
                                        <XCircle size={16} title="Revoke Invitation" />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {team.length === 0 && pending.length === 0 && (
            <div className="text-center py-8 text-slate-500">No active members or pending invitations.</div>
        )}
    </div>
);


export default TeamManagement;