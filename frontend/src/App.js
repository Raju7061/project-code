import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Boxes,
  Check, ChevronDown, CircleHelp, Cloud, Command, Container, Copy, ExternalLink,
  Gauge, GitBranch, HardDrive, Layers3, LockKeyhole, LogOut, Menu, Radio,
  Search, Server, ShieldCheck, Terminal, X
} from 'lucide-react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || '/api';
const AUTH_BASE = process.env.REACT_APP_AUTH_API_URL || '/auth/api/auth';

const tools = [
  { id: 'kubernetes', name: 'Kubernetes', group: 'Infrastructure', description: 'Inspect workloads and cluster state', icon: Boxes, command: 'kubectl get pods -A' },
  { id: 'flux', name: 'Flux CD', group: 'Delivery', description: 'Reconcile GitOps resources', icon: GitBranch, command: 'flux get all -A' },
  { id: 'helm', name: 'Helm', group: 'Delivery', description: 'Review deployed releases', icon: Layers3, command: 'helm list -A' },
  { id: 'docker', name: 'Docker Hub', group: 'Build', description: 'Browse published project images', icon: Container, href: 'https://hub.docker.com/u/2024dock' },
  { id: 'kafka', name: 'Kafka Console', group: 'Data', description: 'Inspect topics and consumer groups', icon: Radio, href: 'http://todo.kowl' },
  { id: 'kibana', name: 'Kibana', group: 'Data', description: 'Explore indexed events and logs', icon: Activity, href: 'http://todo.kibana' },
  { id: 'grafana', name: 'Grafana', group: 'Monitoring', description: 'View dashboards and application metrics', icon: Gauge, href: 'http://grafana.local' },
  { id: 'prometheus', name: 'Prometheus', group: 'Monitoring', description: 'Query metrics and inspect scrape targets', icon: Activity, href: 'http://prometheus.local' },
  { id: 'elasticsearch', name: 'Elasticsearch', group: 'Data', description: 'Check index and cluster health', icon: Search, command: 'curl http://raju-stack-elasticsearch:9200/_cat/indices?v' },
  { id: 'postgres', name: 'PostgreSQL', group: 'Data', description: 'Open a database shell in the pod', icon: HardDrive, command: 'kubectl exec -it -n raju raju-stack-postgres-0 -- psql -U todo_user -d tododb' },
  { id: 'todo', name: 'Todo workspace', group: 'Applications', description: 'Create and track application tasks', icon: Check, internal: true }
];

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isSignup = mode === 'signup';

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${AUTH_BASE}/${isSignup ? 'signup' : 'login'}`, form);
      onAuthenticated(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to connect. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-visual" aria-label="Platform identity">
        <a className="brand" href="/" aria-label="Relay home">
          <span className="brand-mark"><Terminal size={19} strokeWidth={2.4} /></span>
          <span>relay<span className="brand-period">.</span></span>
        </a>
        <div className="auth-visual-copy">
          <span className="eyebrow"><span className="pulse-dot" /> DEVOPS CONTROL PLANE</span>
          <h1>Ship the work.<br /><span>See the whole system.</span></h1>
          <p>Your day-to-day tools, deployment signals, and data services in one focused workspace.</p>
        </div>
        <div className="terminal-panel" aria-hidden="true">
          <div className="terminal-top"><span /><span /><span /><code>cluster / minikube</code><span className="terminal-live"><i /> connected</span></div>
          <div className="terminal-body">
            <p><b>$</b> flux get hr -n raju</p>
            <p className="terminal-muted">NAME&nbsp;&nbsp;&nbsp;&nbsp; REVISION&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; READY</p>
            <p>stack&nbsp;&nbsp;&nbsp; 26.100.15+main&nbsp;&nbsp; <em>True</em></p>
            <p className="terminal-prompt"><b>$</b> <span /></p>
          </div>
        </div>
        <div className="auth-visual-footer"><span>BUILT FOR THE RELEASE LOOP</span><span>01 / 03</span></div>
      </section>

      <section className="auth-form-wrap">
        <div className="auth-mobile-brand"><span className="brand-mark"><Terminal size={19} /></span> relay<span className="brand-period">.</span></div>
        <div className="auth-form-content">
          <div className="auth-heading">
            <span className="eyebrow">{isSignup ? 'CREATE YOUR ACCOUNT' : 'YOUR WORKSPACE AWAITS'}</span>
            <h2>{isSignup ? 'Start with a clean slate.' : 'Good to have you back.'}</h2>
            <p>{isSignup ? 'Set up your account to access the control plane.' : 'Sign in to continue to your DevOps workspace.'}</p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {isSignup && <label>Full name<input autoComplete="name" name="name" value={form.name} onChange={update} placeholder="Alex Morgan" required minLength={2} /></label>}
            <label>Email address<input autoComplete="email" name="email" type="email" value={form.email} onChange={update} placeholder="you@company.com" required /></label>
            <label>Password<input autoComplete={isSignup ? 'new-password' : 'current-password'} name="password" type="password" value={form.password} onChange={update} placeholder="At least 8 characters" required minLength={8} /></label>
            {error && <div className="form-error" role="alert"><CircleHelp size={16} />{error}</div>}
            <button className="primary-button auth-submit" type="submit" disabled={loading}>
              {loading ? 'One moment…' : isSignup ? 'Create account' : 'Sign in'} <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to Relay?'} <button type="button" onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }}> {isSignup ? 'Sign in' : 'Create an account'}</button></p>
          <div className="auth-security"><LockKeyhole size={14} /> Passwords are hashed. Sessions expire automatically.</div>
        </div>
        <div className="auth-copyright">RELAY OPS <span>•</span> LOCAL ENVIRONMENT</div>
      </section>
    </main>
  );
}

function TodoWorkspace({ onBack }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Loading tasks…');
  const [busy, setBusy] = useState(false);

  const loadTodos = async (term = '') => {
    setBusy(true);
    try {
      const response = await axios.get(`${API_BASE}/todos/search?q=${encodeURIComponent(term)}`);
      setTodos(response.data || []);
      setStatus('PostgreSQL connected');
    } catch (error) {
      setStatus('Todo API unavailable');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { loadTodos(search); }, [search]);

  const addTodo = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      await axios.post(`${API_BASE}/todos`, { title, description });
      setTitle('');
      setDescription('');
      loadTodos(search);
    } catch (error) {
      setStatus('Could not create task');
    }
  };

  const updateTodo = async (todo) => {
    await axios.put(`${API_BASE}/todos/${todo.id}`, { completed: !todo.completed });
    loadTodos(search);
  };

  const removeTodo = async (id) => {
    await axios.delete(`${API_BASE}/todos/${id}`);
    loadTodos(search);
  };

  return (
    <section className="todo-workspace">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> All tools</button>
      <div className="section-heading"><div><span className="eyebrow">APPLICATIONS / WORKSPACE</span><h2>Todo board</h2><p>Tasks are stored in PostgreSQL and streamed through the CDC pipeline.</p></div><span className="connection-state"><i />{status}</span></div>
      <form className="todo-create" onSubmit={addTodo}><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to get done?" required /><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a note (optional)" /><button className="primary-button" type="submit">Add task <ArrowRight size={16} /></button></form>
      <div className="todo-toolbar"><div className="search-control"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter tasks" /></div><span>{busy ? 'Refreshing…' : `${todos.length} tasks`}</span></div>
      <div className="todo-list">{todos.length ? todos.map((todo) => <div className="todo-row" key={todo.id}><label className="todo-check"><input type="checkbox" checked={Boolean(todo.completed)} onChange={() => updateTodo(todo)} /><span><Check size={13} /></span></label><div className="todo-copy"><strong className={todo.completed ? 'is-complete' : ''}>{todo.title}</strong>{todo.description && <p>{todo.description}</p>}</div><button className="icon-button todo-remove" title="Delete task" onClick={() => removeTodo(todo.id)}><X size={16} /></button></div>) : <div className="empty-state"><Check size={20} /><p>{busy ? 'Loading tasks…' : 'No tasks match this view.'}</p></div>}</div>
      <p className="todo-token-note"><ShieldCheck size={15} /> Signed in session active</p>
    </section>
  );
}

function Dashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('tools');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const filteredTools = tools.filter((tool) => `${tool.name} ${tool.group} ${tool.description}`.toLowerCase().includes(query.toLowerCase()));

  const openTool = (tool) => {
    if (tool.internal) {
      setActiveView('todo');
    } else if (tool.href) {
      window.open(tool.href, '_blank', 'noopener,noreferrer');
    } else if (tool.command) {
      navigator.clipboard?.writeText(tool.command);
      setCopied(tool.id);
      window.setTimeout(() => setCopied(''), 1800);
    }
  };

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <a className="brand sidebar-brand" href="#home" onClick={(event) => { event.preventDefault(); setActiveView('tools'); }}><span className="brand-mark"><Terminal size={18} /></span><span>relay<span className="brand-period">.</span></span></a>
        <div className="workspace-switch"><span className="workspace-icon">R</span><span><strong>Raju workspace</strong><small>MINIKUBE / DEV</small></span><ChevronDown size={15} /></div>
        <span className="nav-label">WORKSPACE</span>
        <nav className="side-nav"><button className={activeView === 'tools' ? 'nav-active' : ''} onClick={() => { setActiveView('tools'); setMobileMenu(false); }}><Gauge size={17} /> Overview</button><button className={activeView === 'todo' ? 'nav-active' : ''} onClick={() => { setActiveView('todo'); setMobileMenu(false); }}><Check size={17} /> Todo board</button></nav>
        <span className="nav-label nav-label-tools">CONNECTED TOOLS</span>
        <nav className="side-nav tool-nav">{tools.filter((tool) => tool.href).map((tool) => <a key={tool.id} href={tool.href} target="_blank" rel="noreferrer"><tool.icon size={17} />{tool.name}<ExternalLink className="nav-external" size={12} /></a>)}</nav>
        <div className="sidebar-bottom"><div className="cluster-health"><span className="health-ring"><Activity size={15} /></span><span><strong>Cluster online</strong><small>MINIKUBE · 1 NODE</small></span><i /></div><button className="profile-button" onClick={onLogout}><span className="avatar">{(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}</span><span className="profile-name"><strong>{user?.name || user?.email}</strong><small>Workspace member</small></span><LogOut size={16} /></button></div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar"><button className="icon-button mobile-menu-button" title="Open navigation" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={20} /> : <Menu size={20} />}</button><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{activeView === 'todo' ? 'Todo board' : 'Overview'}</strong></div><div className="topbar-actions"><span className="topbar-env"><i /> Development</span><button className="help-button" title="Help"><CircleHelp size={18} /></button><span className="avatar topbar-avatar">{(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}</span></div></header>
        <div className="page-content">
          {activeView === 'todo' ? <TodoWorkspace onBack={() => setActiveView('tools')} /> : <>
            <div className="welcome-row"><div><span className="eyebrow">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' }).format(new Date()).toUpperCase()} <span className="eyebrow-divider">/</span> MINIKUBE</span><h1>Good day, {(user?.name || 'Engineer').split(' ')[0]}<span className="welcome-spark">.</span></h1><p>Your delivery workspace is ready. Pick up where you left off.</p></div><button className="refresh-button" onClick={() => window.location.reload()}><Activity size={16} /> Refresh status</button></div>
            <section className="status-strip" aria-label="Environment status"><div className="status-main"><span className="status-icon"><Cloud size={19} /></span><span><small>ACTIVE ENVIRONMENT</small><strong>Minikube development</strong></span><span className="status-online"><i /> Flux reconciliation enabled</span></div><div className="status-metrics"><div><span>CLUSTER</span><strong>Minikube <small>local</small></strong></div><div><span>RELEASE MODE</span><strong>Flux managed</strong></div><div><span>DEPLOYMENT</span><strong>GitOps <span className="metric-ok">●</span></strong></div></div></section>
            <div className="tools-heading"><div><span className="eyebrow">YOUR TOOLBELT</span><h2>DevOps tools</h2><p>Infrastructure, delivery, and data services in one place.</p></div><label className="tool-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a tool" /><kbd>/</kbd></label></div>
            <div className="tool-grid">{filteredTools.map((tool, index) => <button className={`tool-card ${tool.group === 'Data' ? 'tool-data' : ''}`} key={tool.id} onClick={() => openTool(tool)} style={{ animationDelay: `${index * 45}ms` }}><span className="tool-card-icon"><tool.icon size={19} strokeWidth={1.8} /></span><span className="tool-group">{tool.group.toUpperCase()}</span><strong>{tool.name}</strong><span className="tool-description">{tool.description}</span><span className="tool-card-action">{copied === tool.id ? <><Check size={14} /> Copied</> : tool.command ? <><Copy size={14} /> Copy command</> : tool.internal ? <><ArrowRight size={14} /> Open workspace</> : <><ExternalLink size={14} /> Open tool</>}</span></button>)}</div>
            {!filteredTools.length && <div className="empty-state"><Search size={20} /><p>No tools match “{query}”.</p></div>}
            <footer className="dashboard-footer"><span><Command size={14} /> RELAY OPS</span><span>Connected services <b>09</b></span><span className="footer-version">CONTROL PLANE / 01</span></footer>
          </>}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('relay_session'));
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('relay_session')));

  useEffect(() => {
    if (!token) return;
    axios.get(`${AUTH_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setUser(response.data.user))
      .catch(() => { localStorage.removeItem('relay_session'); setToken(null); })
      .finally(() => setChecking(false));
  }, [token]);

  const completeAuth = (data) => {
    localStorage.setItem('relay_session', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('relay_session');
    setToken(null);
    setUser(null);
  };

  if (checking) return <div className="auth-loading"><span className="brand-mark"><Terminal size={19} /></span><span>Opening your workspace…</span></div>;
  if (!token || !user) return <AuthScreen onAuthenticated={completeAuth} />;
  return <Dashboard user={user} onLogout={logout} />;
}
