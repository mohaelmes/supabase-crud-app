import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css'; // Importa el archivo CSS

function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', body: '' });
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Posts' }, (payload) => {
        console.log('Change received!', payload);
        fetchPosts();
      })
      .subscribe();

    // Cleanup the subscription when component is unmounted
    return () => {
      channel.unsubscribe(); // Cambiado de removeSubscription a unsubscribe
    };
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('Posts').select('*');
    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingPost) {
      await updatePost(editingPost.id, newPost);
    } else {
      const { data, error } = await supabase.from('Posts').insert([newPost]);
      if (error) console.error(error);
      else setPosts((prevPosts) => [...prevPosts, ...data]);
    }
    setNewPost({ title: '', body: '' });
    setEditingPost(null);
  };

  const updatePost = async (id, updatedPost) => {
    const { data, error } = await supabase
      .from('Posts')
      .update(updatedPost)
      .eq('id', id);
    if (error) console.error(error);
    else setPosts(posts.map((post) => (post.id === id ? data[0] : post)));
  };

  const deletePost = async (id) => {
    const { error } = await supabase.from('Posts').delete().eq('id', id);
    if (error) console.error(error);
    else setPosts(posts.filter((post) => post.id !== id));
  };

  const startEditing = (post) => {
    setNewPost({ title: post.title, body: post.body });
    setEditingPost(post);
  };

  return (
    <div className="App">
      <h1>Posts</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newPost.title}
          onChange={handleChange}
        />
        <textarea
          name="body"
          placeholder="Body"
          value={newPost.body}
          onChange={handleChange}
        />
        <button type="submit">{editingPost ? 'Update Post' : 'Add Post'}</button>
      </form>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.body}</p>
            <button onClick={() => startEditing(post)}>Edit</button>
            <button onClick={() => deletePost(post.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
