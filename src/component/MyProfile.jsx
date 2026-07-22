import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyProfile({ currentUser }) {
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Tracks which post card's three-dot menu is currently open
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Fetch the logged-in user's specific posts on mount
    useEffect(() => {
        const fetchProfilePosts = async () => {
            try {
                const response = await axios.get('/web/getMyPost');
                setMyPosts(response.data.data);
            } catch (err) {
                console.error("Profile fetch failed:", err);
                setError(err.response?.data?.message || "Could not load your profile posts");
            } finally {
                setLoading(false);
            }
        };
        fetchProfilePosts();
    }, []);

    // Optimized Single-Pass Deletion Handler
    const handleDelete = async (postPayload) => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this post?");
        if (!confirmDelete) return;

        try {
            // Sends the entire post data object matching your backend controller's req.body destructuring
            await axios.delete('/web/deletePost', { data: postPayload });
            
            // Instantly wipe it from the UI state array without making a new fetch request
            setMyPosts(prev => prev.filter(post => post._id !== postPayload._id));
            alert("Post deleted successfully!");
        } catch (err) {
            console.error("Deletion failed:", err);
            alert(err.response?.data?.message || "Failed to delete post");
        } finally {
            setActiveMenuId(null); // Close the active dropdown menu overlay
        }
    };

    // Close options menu if clicking anywhere else on screen
    useEffect(() => {
        const closeMenu = () => setActiveMenuId(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    if (loading) return <p style={{ textAlign: 'center', marginTop: '30px' }}>Loading your dashboard...</p>;
    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            
            {/* User Profile Info Header block */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '30px', borderBottom: '1px solid #dbdbdb', marginBottom: '30px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0095f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                    {currentUser?.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#262626' }}>@{currentUser?.userName}</h2>
                    <p style={{ margin: 0, color: '#8e8e8e', fontSize: '14px' }}>{currentUser?.email}</p>
                    <p style={{ margin: '8px 0 0 0', fontWeight: '600', fontSize: '14px', color: '#262626' }}>
                        {myPosts.length} {myPosts.length === 1 ? 'post' : 'posts'} shared
                    </p>
                </div>
            </div>

            {/* Dashboard grid/list timeline cards */}
            <h3 style={{ marginBottom: '20px', color: '#262626' }}>Manage Your Content</h3>
            
            {myPosts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#8e8e8e', marginTop: '40px' }}>You haven't uploaded any posts yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {myPosts.map((post) => (
                        <div key={post._id} style={{ backgroundColor: '#ffffff', border: '1px solid #dbdbdb', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative' }}>
                            
                            {/* Card Header bar with 3-dot management button */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #eee', backgroundColor: '#fafafa' }}>
                                <span style={{ fontWeight: '600', fontSize: '14px', color: '#262626' }}>@{currentUser?.userName}</span>
                                
                                <div style={{ position: 'relative' }}>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Stop global window click event from firing instantly
                                            setActiveMenuId(activeMenuId === post._id ? null : post._id);
                                        }}
                                        style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', color: '#262626', padding: '0 5px' }}
                                    >
                                        •••
                                    </button>

                                    {/* Action Dropdown Overlay Menu */}
                                    {activeMenuId === post._id && (
                                        <div style={{ position: 'absolute', right: 0, top: '25px', backgroundColor: '#ffffff', border: '1px solid #dbdbdb', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 10, width: '120px' }}>
                                            <button 
                                                onClick={() => handleDelete(post)} // Passes whole data block!
                                                style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#ed4956', fontWeight: '600', fontSize: '13px', textAlign: 'left', cursor: 'pointer' }}
                                            >
                                                Delete Post
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rendered Post Image Sourced from Cloudinary */}
                            <img src={post.image} alt="Dashboard post asset" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            
                            <div style={{ padding: '15px' }}>
                                <p style={{ margin: 0, fontSize: '15px', color: '#262626', lineHeight: '1.4' }}>{post.caption}</p>
                                <small style={{ color: '#8e8e8e', fontSize: '11px', display: 'block', marginTop: '10px' }}>
                                    Shared on: {new Date(post.createdAt).toLocaleDateString()}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyProfile;
