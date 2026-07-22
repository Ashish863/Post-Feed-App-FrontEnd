import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PostFeed({ refreshTrigger, currentUser }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentInputs, setCommentInputs] = useState({});
    const [activeMenuId, setActiveMenuId] = useState(null);
    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await axios.get('/web/feed');
                setPosts(response.data.data); 
            } catch (err) {
                console.error("Error fetching feed:", err);
                setError(err.response?.data?.message || "Failed to load feed");
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, [refreshTrigger]);


const handleDeleteComment = async (postId, commentId) => {
    try {
        const response = await axios.delete(`/web/comment/${postId}/${commentId}`);
        setActiveMenuId(null); // Close dropdown menu layout

        const remainingComments = response.data?.data;
        if (Array.isArray(remainingComments)) {
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId ? { ...post, comments: remainingComments } : post
                )
            );
        }
    } catch (err) {
        console.error("Failed to delete comment:", err);
        alert(err.response?.data?.message || "Failed to delete comment");
    }
};

   const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    if (!currentUser) {
        alert("You must log in to leave comments!");
        return;
    }

   try {
    const response = await axios.post(`/web/comment/${postId}`, { text: commentText });
    
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));

    // Extract comments array from ApiResponse data field
    const updatedComments = response.data?.data; 

    console.log("Newly received comments array from server:", updatedComments);

    if (Array.isArray(updatedComments)) {
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post._id === postId ? { ...post, comments: updatedComments } : post
            )
        );
    } else {
        console.error("Expected array payload, instead got:", updatedComments);
    }

} catch (err) {
    console.error("Comment submission failed on frontend view:", err);
    alert(err.response?.data?.message || "Failed to submit comment");
}
   }

    // Fast, local UI state updater for toggling hearts instantly
    const handleLikeToggle = async (postId) => {
        if (!currentUser) {
            alert("You must be logged in to like posts!");
            return;
        }

        try {
            // Hits your dynamic parameter backend endpoint route
            const response = await axios.post(`/web/like/${postId}`);
            const { likesArray } = response.data.data;

            // Optimistically update only the matching post card inside local state array
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post._id === postId 
                    ? { ...post, likes: likesArray } 
                    : post
                )
            );
        } catch (err) {
            console.error("Like toggle broken:", err);
            alert("Could not process like action");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <p className="text-gray-500 font-semibold animate-pulse text-sm">Loading community feed...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="max-w-md mx-auto my-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center text-sm font-medium">
                {error}
            </div>
        );
    }

    return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0 pb-12">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6 tracking-tight">Community Feed</h2>
        
        {posts.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-xl shadow-xs">
                <p className="text-gray-500 text-sm">No posts available yet.</p>
            </div>
        ) : (
            <div className="flex flex-col gap-6">
                {posts.map((post) => {
                    // 1. CRITICAL: Check if the current user's ID exists inside this post's likes array
                    const hasLiked = post.likes?.includes(currentUser?._id);

                    return (
                        <div key={post._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                            {/* Card Header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                                    {post.owner?.userName?.charAt(0) || '?'}
                                </div>
                                <span className="font-semibold text-sm text-gray-800">@{post.owner?.userName || "anonymous"}</span>
                            </div>

                            {/* Post Image */}
                            <div className="bg-gray-100 w-full aspect-square overflow-hidden flex items-center justify-center">
                                <img src={post.image} alt="Feed Asset" className="w-full h-full object-cover select-none" loading="lazy" />
                            </div>
                            
                            {/* Interactive Engagement Panel */}
                            <div className="px-4 pt-3 pb-4 bg-white">
                                <div className="flex items-center gap-2 mb-2">
                                    {/* 2. Interactive Toggle Heart Button */}
                                    <button 
                                        onClick={() => handleLikeToggle(post._id)}
                                        className="focus:outline-none transition active:scale-125 transform duration-150 cursor-pointer text-2xl"
                                    >
                                        {hasLiked ? <span>❤️</span> : <span>🤍</span>}
                                    </button>

                                    {/* 3. Text Numbers Counter */}
                                    <span className="text-sm font-bold text-gray-800">
                                        {post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}
                                    </span>
                                </div>

                                {/* Caption Display */}
                                <p className="text-gray-800 text-sm leading-relaxed font-normal break-words">
                                    <span className="font-bold mr-2 text-gray-900">@{post.owner?.userName || "anonymous"}</span>
                                    {post.caption}
                                </p>

                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comments</h4>
                                    
                                    {/* Comments Listing Block */}
                                    <div className="max-h-32 overflow-y-auto flex flex-col gap-2 mb-3">
                                        {post.comments && post.comments.length > 0 ? (
                                            post.comments.map((comments, index) => {
                                                const commentOwnerId = comments.owner?._id || comments.owner;
                                                const isMyComment = commentOwnerId === currentUser?._id;

                                                return (
                                                    <div key={comments._id || index} className="flex items-start justify-between relative text-xs text-gray-700 leading-relaxed break-words pr-2">
                                                        <p className="flex-1 pr-6">
                                                            <span className="font-bold text-gray-950 mr-1.5">
                                                                @{comments.owner?.userName || (isMyComment ? currentUser?.userName : "anonymous")}
                                                            </span>
                                                            {comments.text}
                                                        </p>

                                                        {/* Three-dot menu: only renders if you own this comment */}
                                                        {isMyComment && (
                                                            <div className="relative flex items-center">
                                                                <button 
                                                                    onClick={() => setActiveMenuId(prev => prev === comments._id ? null : comments._id)}
                                                                    className="text-gray-400 hover:text-gray-700 font-bold px-1 cursor-pointer select-none text-sm"
                                                                >
                                                                    ⋮
                                                                </button>

                                                                {activeMenuId === comments._id && (
                                                                    <div className="absolute right-0 top-5 bg-white border border-gray-200 rounded-md shadow-md py-1 z-10 min-w-[70px]">
                                                                        <button
                                                                            onClick={() => handleDeleteComment(post._id, comments._id)}
                                                                            className="w-full text-left text-[11px] text-red-600 hover:bg-red-50 px-2.5 py-1 font-medium cursor-pointer"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No comments yet. Start the conversation!</p>
                                        )}
                                    </div>

                                    {/* New Comment Submission Form Block */}
                                    {currentUser && (
                                        <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex items-center gap-2 mt-2">
                                            <input 
                                                type="text" 
                                                placeholder="Add a comment..."
                                                value={commentInputs[post._id] || ""}
                                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                                className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                                            />
                                            <button 
                                                type="submit"
                                                className="text-xs font-bold text-blue-500 hover:text-blue-700 px-2 cursor-pointer transition active:scale-95"
                                            >
                                                Post
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
);
}

export default PostFeed;
