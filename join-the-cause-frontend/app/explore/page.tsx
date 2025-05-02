"use client";
import '../globals.css';
import Navbar from '../components/navbar';

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
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

const categories = [
  { label: "Community Service", value: "COMMUNITY_SERVICE" },
  { label: "Volunteering", value: "VOLUNTEERING" },
  { label: "Food Drive", value: "FOOD_DRIVE" },
  { label: "Community Event", value: "COMMUNITY_EVENT" },
  { label: "Donation Drive", value: "DONATION_DRIVE" },
  { label: "Cleanup Event", value: "CLEANUP_EVENT" },
  { label: "Educational Program", value: "EDUCATIONAL_PROGRAM" }
];

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      router.push("/login");
      return;
    }
    setUserEmail(email);
    fetchPosts();
    setIsLoading(false);
  }, [router]);

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/posts");
      if (!res.ok) {
        const text = await res.text();
        console.error("Fetch posts failed:", res.status, text);
        return;
      }
      const data = await res.json();
      console.log("Fetched post data:", data);
      const mapped: Post[] = data.map((post: any) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        likes: post.likes || 0,
        comments: post.comments || [],
        author: post.author,
        category: post.category || "",
        date: post.createdAt || "",
        imageUrl: post.imageUrl ? `http://localhost:8080${post.imageUrl}` : ""
      }));      
      setPosts(mapped);
      setFilteredPosts(mapped);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    let temp = [...posts];
    if (searchTerm) {
      temp = temp.filter(p =>
        (p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filterCategory) {
      temp = temp.filter(p => p.category === filterCategory);
    }
    if (startDate) {
      temp = temp.filter(p => new Date(p.date || "") >= new Date(startDate));
    }
    if (endDate) {
      temp = temp.filter(p => new Date(p.date || "") <= new Date(endDate));
    }
    setFilteredPosts(temp);
  }, [searchTerm, filterCategory, startDate, endDate, posts]);

  const handlePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newCategory || !userEmail) return;
  
    try {
      const formData = new FormData();
      formData.append("title", newTitle);
      formData.append("description", newDescription);
      formData.append("category", newCategory); 
      formData.append("email", userEmail);
      if (image) formData.append("image", image);
  
      const res = await fetch("http://localhost:8080/api/posts/multipart", {
        method: "POST",
        body: formData,
      });
  
      if (res.ok) {
        fetchPosts();
        setNewTitle("");
        setNewDescription("");
        setNewCategory("");
        setImage(null);
      } else {
        const errText = await res.text();
        console.error("Post creation failed:", {
          status: res.status,
          statusText: res.statusText,
          body: errText
        });
      }
    } catch (err) {
      console.error("Post creation error:", err);
    }
  };  

  const handleLike = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/posts/${id}/like`, {
        method: "POST"
      });
      if (res.ok) {
        setPosts(prev =>
          prev.map(p => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
        );
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleComment = async (postId: number, text: string) => {
    if (!text.trim() || !userEmail) return;
    try {
      const res = await fetch(`http://localhost:8080/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, email: userEmail })
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  if (isLoading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <>
    <Navbar/>
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Explore Community Posts</h1>

      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Search posts..."
          className="border p-2 rounded flex-1"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="border p-2 rounded text-black bg-white"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-2 rounded" />
      </div>

      {userEmail && (
        <form onSubmit={handlePost} className="mb-6" encType="multipart/form-data">
          <input
            type="text"
            className="w-full border rounded p-2 mb-2"
            placeholder="Post title..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <textarea
            className="w-full border rounded p-2 mb-2"
            placeholder="Write your post..."
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
          />
          <select
            className="border p-2 rounded text-black bg-white w-full mb-2"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          >
            <option value="">Select a Category</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] || null)}
            className="w-full mb-2"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Post
          </button>
        </form>
      )}

      {filteredPosts.map(post => (
        <div key={post.id} className="border p-4 rounded mb-4">
          <p className="text-sm text-gray-600 mb-1">
            By:{" "}
            <a href={`/userdash?email=${post.author.email}`} className="text-blue-600 hover:underline">
              {post.author?.name || "Anonymous"}
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
  );
}
