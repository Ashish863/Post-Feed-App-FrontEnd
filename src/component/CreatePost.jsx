import React, { useState } from 'react'
import axios from 'axios'

function CreatePost({ onPostCreated }) {
    const [caption, setCaption] = useState("")
    const [imageFile, setImageFile] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile || !caption) return alert("Please fill all fields");

        setLoading(true);
        const formData = new FormData();
        formData.append("caption", caption);
        formData.append("image", imageFile); 

        try {
            await axios.post('/web/userPost', formData);
            alert("Post Created Successfully!");
            setCaption("");
            setImageFile(null);
            e.target.reset(); 
            if (onPostCreated) onPostCreated();
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm text-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create a New Post</h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input 
                    type="text" 
                    placeholder="Write a caption..." 
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                
                <div className="w-full p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center hover:bg-gray-100 transition cursor-pointer">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setImageFile(e.target.files[0])} 
                        className="text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-3 text-sm font-semibold text-white rounded-lg transition duration-200 ${
                        loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 shadow-md active:scale-[0.98]'
                    }`}
                >
                    {loading ? "Uploading to Cloudinary..." : "Share Post"}
                </button>
            </form>
        </div>
    )
}

export default CreatePost;
