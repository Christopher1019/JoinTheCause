'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/navbar';
import '../globals.css';

interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string;
  bio?: string;
}

interface Comment {
  id: number;
  text: string;
  author: User;
}

interface Post {
  id: number;
  title?: string;
  description: string;
  likes: number;
  comments: Comment[];
  author: User;
  category: string;
  date?: string;
  imageUrl?: string;
}

export default function Userdash() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  useEffect(() => {
    const emailFromLocalStorage = localStorage.getItem("userEmail");
    setLoggedInEmail(emailFromLocalStorage);

    const queryEmail = searchParams.get("email");
    const emailToUse = queryEmail || emailFromLocalStorage;

    if (!emailToUse) {
      setError("No email found. Please log in.");
      return;
    }

    // Fetch user data
    fetch(`http://localhost:8080/api/users/${encodeURIComponent(emailToUse)}`)
      .then(res => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then(data => {
        setUser(data);
        setBioText(data.bio || "");
      })
      .catch(err => {
        console.error("Error fetching user:", err);
        setError("User not found.");
      });

    // Fetch posts by user
    fetch(`http://localhost:8080/api/users/by-user?email=${encodeURIComponent(emailToUse)}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error("Expected an array of posts, got: " + JSON.stringify(data));
        }
        const formatted = data.map((post: any) => ({
          ...post,
          imageUrl: post.imageUrl ? `http://localhost:8080${post.imageUrl}` : "",
        }));
        setUserPosts(formatted);
      })
      .catch(err => console.error("Error fetching user posts:", err));
  }, [searchParams]);

  const isOwnProfile = user && loggedInEmail === user.email;

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;
  
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, and WEBP files are allowed (no GIFs).");
      return;
    }
  
    const formData = new FormData();
    formData.append("image", file);
    formData.append("email", user.email);
  
    try {
      setUploading(true);
      const res = await fetch("http://localhost:8080/api/users/upload-profile", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) throw new Error("Upload failed");
  
      const refreshedUser = await fetch(`http://localhost:8080/api/users/${encodeURIComponent(user.email)}`).then(res => res.json());
      setUser(refreshedUser);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };  

  const handleBioSave = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/users/update-bio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user!.email, bio: bioText }),
      });

      if (!res.ok) throw new Error("Bio update failed");

      const updatedUser = await res.json();
      setUser(updatedUser);
      setEditingBio(false);
    } catch (err) {
      console.error("Error updating bio:", err);
      alert("Failed to update bio.");
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await fetch(`http://localhost:8080/api/posts/${postId}/like`, { method: "POST" });
      setUserPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleComment = async (postId: number, text: string) => {
    if (!text.trim() || !user?.email) return;
    try {
      const res = await fetch(`http://localhost:8080/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, email: user.email })
      });
      if (res.ok) {
        const updated = await res.json();
        setUserPosts(updated);
      }
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        {error && <p className="text-red-600">{error}</p>}
        {!user ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="relative flex flex-col md:flex-row items-center md:items-start p-8 bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-16">
                <div className="relative h-36 w-36 md:h-40 md:w-40 rounded-full overflow-hidden border-2 border-gray-300">
                  <img
                    src={previewUrl || (user.profileImageUrl ? `http://localhost:8080${user.profileImageUrl}` : "/blank.png")}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                {isOwnProfile && (
                  <>
                  <div className="mt-2 text-center">
                    <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPreviewUrl(URL.createObjectURL(file));
                      handleImageChange(e);
                    }
                    }}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:border file:border-gray-300 file:rounded"
                    />
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={() => {
                        localStorage.removeItem("userEmail");
                        window.location.href = "/login";
                      }}                      
                      className="text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded shadow"
                    >
                    Log Out
                    </button>
                  </div>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center md:items-start w-full">
                <div className="flex items-center mb-4">
                  <h1 className="text-2xl md:text-3xl font-light text-gray-800 mr-4">{user.name}</h1>
                  {isOwnProfile && (
                    <button
                      className="px-4 py-1 text-sm font-semibold border rounded text-black border-gray-400 hover:bg-gray-50"
                      onClick={() => setEditingBio(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="text-center md:text-left w-full">
                  <p className="font-semibold text-gray-900">{user.email}</p>
                  {editingBio ? (
                    <>
                      <textarea
                        className="mt-2 w-full border p-2 rounded text-sm"
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                      />
                      <button
                        onClick={handleBioSave}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save Bio
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-700 mt-1">{user.bio || "This is your bio section."}</p>
                  )}
                </div>
              </div>
            </div>

            {/* User's Posts */}
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">Posts by {user.name}</h2>
              {userPosts.map(post => (
                <div key={post.id} className="border p-4 rounded mb-4 bg-white shadow">
                  <p className="text-sm text-gray-600 mb-1">
                    By:{" "}
                    <a href={`/userdash?email=${post.author.email}`} className="text-blue-600 hover:underline">
                      {post.author.name || "Anonymous"}
                    </a>
                  </p>
                  <p className="text-xs text-gray-500 mb-2">{post.category} | {post.date ? new Date(post.date).toLocaleDateString() : ""}</p>
                  <p className="text-md text-black font-bold mb-2">{post.title}</p>
                  {post.imageUrl && <img src={post.imageUrl} alt="Post image" className="mb-2 rounded max-h-64 object-cover" />}
                  <p className="text-base mb-2">{post.description}</p>
                  <button className="text-blue-600 hover:underline mb-2" onClick={() => handleLike(post.id)}>
                    👍 Like ({post.likes})
                  </button>
                  <div>
                    <p className="text-sm font-medium">Comments:</p>
                    <ul className="ml-4 list-disc mb-2">
                      {post.comments.map((c, i) => (
                        <li key={i}>
                          <strong>{c.author?.name || "Anonymous"}:</strong> {c.text}
                        </li>
                      ))}
                    </ul>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const input = (e.currentTarget.elements.namedItem("comment") as HTMLInputElement);
                        if (input.value.trim()) {
                          handleComment(post.id, input.value);
                          input.value = "";
                        }
                      }}
                    >
                      <input
                        name="comment"
                        placeholder="Write a comment..."
                        className="border px-2 py-1 w-full rounded"
                      />
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
