import React, { useState } from 'react';
import axios from 'axios';

function Register() {
    
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', isError: false });

    const handleSignup = async (e) => {
        e.preventDefault();
        
    
        if (!userName.trim() || !email.trim() || !password.trim()) {
            setMessage({ text: "All fields are required", isError: true });
            return;
        }

        setLoading(true);
        setMessage({ text: '', isError: false });

        try {
        
            const response = await axios.post('http://localhost:3000/register/signUp', {
                userName,
                email,
                password
            });

        
            setMessage({ text: response.data.message || "Registration Successful!", isError: false });
            
            setUserName('');
            setEmail('');
            setPassword('');

        } catch (error) {
            console.error("Signup error detail:", error);
            
    
            const serverErrorMessage = error.response?.data?.message || "Registration failed. Try again.";
            setMessage({ text: serverErrorMessage, isError: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create an Account</h2>
            
            {/* Conditional Status Feedback Banner */}
            {message.text && (
                <div style={{ 
                    padding: '10px', 
                    marginBottom: '15px', 
                    borderRadius: '4px', 
                    backgroundColor: message.isError ? '#ffe3e3' : '#e3fcef', 
                    color: message.isError ? '#e12d2d' : '#107c41',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Username</label>
                    <input 
                        type="text" 
                        placeholder="e.g., ashish123"
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email Address</label>
                    <input 
                        type="email" 
                        placeholder="e.g., name@example.com"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
                    <input 
                        type="password" 
                        placeholder="Choose a strong password"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        padding: '10px', 
                        backgroundColor: loading ? '#ccc' : '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px'
                    }}
                >
                    {loading ? "Signing up..." : "Register"}
                </button>
            </form>
        </div>
    );
}

export default Register;
