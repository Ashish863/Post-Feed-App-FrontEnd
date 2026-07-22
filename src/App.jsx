import React, { useState, useEffect } from 'react';
import CreatePost from './component/CreatePost';
import PostFeed from './component/PostFeed';
import Register from './component/Register';
import Login from './component/Login';
import MyProfile from './component/MyProfile';
import axios from 'axios';

function App() {
    const [view, setView] = useState('feed');
    const [currentUser, setCurrentUser] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [appLoading, setAppLoading] = useState(true); 

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get('/register/me');
                setCurrentUser(response.data.data); 
            } catch (err) {
                setCurrentUser(null); 
            } finally {
                setAppLoading(false); 
            }
        };
        checkSession();
    }, []);

    const handlePostCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleLoginSuccess = (userData) => {
        setCurrentUser(userData); 
        setView('feed'); 
    };

    const handleLogout = async () => {
        try {
            await axios.post('/register/logout'); 
            setCurrentUser(null);
            setView('login');
        } catch (error) {
            console.error("Logout request failed:", error);
            alert("Failed to sign out securely. Try again.");
        }
    };

    if (appLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p className="text-gray-500 font-semibold text-sm animate-pulse">Loading App Context...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 antialiased selection:bg-blue-100">
            
            {/* Global Context Navigation Bar Layout */}
            <nav className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-white border-b border-gray-200 shadow-xs">
                <h2 
                    className="text-xl font-black text-gray-900 tracking-tight cursor-pointer active:scale-95 transition"
                    onClick={() => setView('feed')}
                >
                    SocialApp
                </h2>
                
                <div className="flex items-center gap-4">
                    {currentUser && (
                        <button 
                            onClick={() => setView('profile')} 
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition ${
                                view === 'profile' 
                                ? 'bg-gray-900 border-gray-900 text-white' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            My Dashboard
                        </button>
                    )}

                    {currentUser ? (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-600 hidden sm:inline">
                                Welcome, <span className="font-bold text-blue-600">@{currentUser.userName}</span>
                            </span>
                            <button 
                                onClick={handleLogout} 
                                className="px-3 py-1.5 bg-white border border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-gray-700 font-semibold text-xs rounded-md shadow-2xs transition duration-150"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setView('login')} 
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-xs active:scale-95 transition duration-150"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => setView('register')} 
                                className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-md shadow-2xs active:scale-95 transition duration-150"
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Central Content Panel */}
            <div className="max-w-md mx-auto py-8 px-4 sm:px-0">
                {view === 'register' && <Register />}
                
                {view === 'login' && <Login onLoginSuccess={handleLoginSuccess} />}
                
                {view === 'profile' && <MyProfile currentUser={currentUser} />}

                {view === 'feed' && (
                    <div className="flex flex-col gap-2">
                        {currentUser ? (
                            <CreatePost onPostCreated={handlePostCreated} />
                        ) : (
                            <div className="p-6 border border-gray-200 rounded-xl text-center bg-white shadow-xs mb-4">
                                <p className="text-gray-500 text-sm mb-4">Log in to share your pictures with the community.</p>
                                <button 
                                    onClick={() => setView('login')} 
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-lg font-semibold text-sm shadow-xs transition duration-150"
                                >
                                    Sign In Now
                                </button>
                            </div>
                        )}
                        
                        <PostFeed refreshTrigger={refreshTrigger} currentUser={currentUser} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
