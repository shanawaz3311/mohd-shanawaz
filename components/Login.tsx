import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { EmployeeIcon, PartnerIcon, IbaIcon, PrincipalIcon } from './icons';

const Login: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRole && id && password) {
            const success = login(selectedRole, id, password);
            if (!success) {
                setError('Invalid credentials. Please try again.');
            } else {
                setError('');
            }
        } else {
            setError('Please select a role and enter your credentials.');
        }
    };

    const roles = [
        { role: UserRole.EMPLOYEE, Icon: EmployeeIcon },
        { role: UserRole.PARTNER, Icon: PartnerIcon },
        { role: UserRole.IBA, Icon: IbaIcon },
        { role: UserRole.PRINCIPAL, Icon: PrincipalIcon },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md md:max-w-2xl bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="p-8 md:p-12 text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">Let's Get Started!</h1>
                    <p className="text-lg text-gray-300 mb-8">Select how would you like to login?</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {roles.map(({ role, Icon }) => (
                            <div
                                key={role}
                                onClick={() => {
                                    setSelectedRole(role);
                                    setError('');
                                    setId('');
                                    setPassword('');
                                }}
                                className={`group p-4 bg-white/5 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                                    selectedRole === role ? 'border-brand-accent scale-105' : 'border-transparent hover:border-white/50'
                                }`}
                            >
                                <Icon />
                                <span className="mt-2 block font-semibold text-sm">{role}</span>
                            </div>
                        ))}
                    </div>

                    {selectedRole && (
                        <form onSubmit={handleLogin} className="space-y-6 text-left animate-fade-in">
                             <div>
                                <label htmlFor="id" className="block text-sm font-medium text-gray-300">{selectedRole} ID</label>
                                <input
                                    type="text"
                                    id="id"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    className="mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                            <button
                                type="submit"
                                className="w-full bg-brand-accent/50 hover:bg-brand-accent/75 border border-brand-accent/80 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-brand-accent/10 hover:shadow-xl hover:shadow-brand-accent/30"
                            >
                                Login as {selectedRole}
                            </button>
                        </form>
                    )}

                    {selectedRole === UserRole.PARTNER && (
                        <p className="mt-6 text-left animate-fade-in p-4 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">
                            After logging into the Bajaj partner you can access your partner dashboard, manage client information, check application statuses, and track your portfolio of loans and other financial products. The specific features available will depend on the type of partnership you have, such as a debt management, fixed deposit, or business loan partner.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;