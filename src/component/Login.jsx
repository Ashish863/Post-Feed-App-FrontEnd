import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
    
    const [identifier, setIdentifier] = useState(''); 
    const [password, setPassword] = useState('');
    
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', isError: false });

    const handleLogin = async (e) => {
        e.preventDefault();


        if (!identifier.trim() || !password.trim()) {
            setMessage({ text: "Please enter your username/email and password", isError: true });
            return;
        }

        setLoading(true);
        setMessage({ text: '', isError: false });

        const payload = {
            password,
            userName: identifier.includes('@') ? '' : identifier,
            email: identifier.includes('@') ? identifier : ''
        };

        try {
            
            const response = await axios.post('/register/login', payload);

            setMessage({ text: response.data.message || "Logged in successfully!", isError: false });
            
    
            setIdentifier('');
            setPassword('');

            if (onLoginSuccess) {
                onLoginSuccess(response.data.data); 
            }

        } catch (error) {
            console.error("Login verification breakdown:", error);
            
            const serverError = error.response?.data?.message || "Invalid credentials. Please try again.";
            setMessage({ text: serverError, isError: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign In</h2>

            {/* Dynamic Status Alert Banner */}
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

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Username or Email</label>
                    <input 
                        type="text" 
                        placeholder="Enter username or email address"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
                    <input 
                        type="password" 
                        placeholder="Enter account password"
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
                    {loading ? "Authenticating..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default Login;
