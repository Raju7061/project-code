import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = '/api';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTodos = useCallback(async (term = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/todos/search?q=${encodeURIComponent(term)}`);
      setTodos(res.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos(search);
  }, [search, fetchTodos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await axios.post(`${API_BASE}/todos`, { title, description });
      setTitle('');
      setDescription('');
      setTimeout(() => fetchTodos(search), 600);
    } catch (err) {
      alert('Error creating todo: ' + err.message);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      await axios.put(`${API_BASE}/todos/${id}`, { completed: !currentStatus });
      setTimeout(() => fetchTodos(search), 600);
    } catch (err) {
      alert('Error updating todo: ' + err.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_BASE}/todos/${id}`);
      setTimeout(() => fetchTodos(search), 600);
    } catch (err) {
      alert('Error deleting todo: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 18px rgba(0,0,0,0.08)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ borderBottom: '2px solid #eef2f6', paddingBottom: '16px', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>Event-Driven CDC To-Do App</h1>
        <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>
          <strong>Writes:</strong> PostgreSQL &rarr; <strong>CDC:</strong> Debezium &rarr; <strong>Streaming:</strong> Kafka &rarr; <strong>Reads/Search:</strong> Elasticsearch
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Task title (e.g., Deploy to EKS)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '15px' }}
        />
        <textarea
          placeholder="Task details and acceptance criteria..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
        />
        <button
          type="submit"
          style={{ padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
        >
          Add Task to PostgreSQL
        </button>
      </form>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Full-text search across tasks in Elasticsearch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #94a3b8', background: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#334155' }}>Tasks (Queried via Elasticsearch CQRS)</h3>
          {loading && <span style={{ fontSize: '12px', color: '#64748b' }}>Refreshing...</span>}
        </div>
        {todos.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '8px' }}>
            No tasks found. Add a new task or modify your search term.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todos.map((todo) => (
              <div
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: todo.completed ? '#f8fafc' : '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(todo.completed)}
                    onChange={() => toggleComplete(todo.id, todo.completed)}
                    style={{ marginTop: '4px', cursor: 'pointer' }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: todo.completed ? '#94a3b8' : '#1e293b',
                        textDecoration: todo.completed ? 'line-through' : 'none'
                      }}
                    >
                      {todo.title}
                    </div>
                    {todo.description && (
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                        {todo.description}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
