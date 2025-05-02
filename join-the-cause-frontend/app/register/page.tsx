'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        setSuccessMsg('Account created! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMsg('Server error. Please try again.');
    }
  };

  return (
    <>
    <Navbar/>
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-4 text-center font-semibold">Join the Cause — Register</h2>
        {errorMsg && <p className="text-red-500 mb-4 text-center">{errorMsg}</p>}
        {successMsg && <p className="text-green-600 mb-4 text-center">{successMsg}</p>}

        <input type="text" placeholder="Full Name" className="w-full mb-3 px-3 py-2 border rounded" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" className="w-full mb-3 px-3 py-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full mb-4 px-3 py-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Create Account</button>
      </form>
    </div>
    </>
  );
}
