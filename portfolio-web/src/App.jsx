import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { portfolioData as fallbackData } from './portfolioData';

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://127.0.0.1:5000'
  : (window.API_SERVER_URL || '');


// Draggable OS Window Panel component
function OSPanel({ id, title, isOpen, isMinimized, isMaximized, activeWindow, zIndex, onHeaderClick, onClose, onMinimize, onMaximize, defaultPosition, children }) {
  const [position, setPosition] = useState(defaultPosition || { x: 100, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);

  if (!isOpen) return null;

  const handlePointerDown = (e) => {
    if (isMaximized) return;
    if (e.target.closest('.os-panel-header')) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      onHeaderClick(id);
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    let newX = e.clientX - dragStart.current.x;
    let newY = e.clientY - dragStart.current.y;
    newX = Math.max(10, Math.min(window.innerWidth - 300, newX));
    newY = Math.max(60, Math.min(window.innerHeight - 200, newY));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      ref={panelRef}
      className={`os-panel ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''}`}
      onClick={() => onHeaderClick(id)}
      style={{
        top: isMaximized ? undefined : position.y,
        left: isMaximized ? undefined : position.x,
        zIndex: zIndex,
        width: isMaximized ? undefined : (id === 'admin' ? '860px' : '580px'),
        height: isMaximized ? undefined : (id === 'admin' ? '560px' : '440px'),
        border: activeWindow === id ? '1px solid var(--cyan)' : '1px solid rgba(255,255,255,0.12)',
        boxShadow: activeWindow === id ? 'var(--shadow-cyan)' : 'var(--shadow)'
      }}
    >
      <div
        className="os-panel-header"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="os-controls">
          <button className="os-dot os-close" onClick={(e) => { e.stopPropagation(); onClose(id); }} title="Close"></button>
          <button className="os-dot os-minimize" onClick={(e) => { e.stopPropagation(); onMinimize(id); }} title="Minimize"></button>
          <button className="os-dot os-maximize" onClick={(e) => { e.stopPropagation(); onMaximize(id); }} title="Maximize"></button>
        </div>
        <p className="os-panel-title">{title}</p>
        <div style={{ width: '40px' }}></div>
      </div>
      <div className="os-panel-body">
        {children}
      </div>
    </div>
  );
}

// 📈 Stock & Portfolio Management Software Interactive Showcase Component
function StockPortfolioAppShowcase({ onBack }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [ipAddress, setIpAddress] = useState('192.168.5.141:82');
  const [ipSavedMessage, setIpSavedMessage] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [activeScreenTab, setActiveScreenTab] = useState('all');

  const initialStocks = [
    { name: 'Alphabet Inc.', price: '$341.68', change: '13.9%', type: 'up' },
    { name: 'Amazon.com Inc.', price: '$249.70', change: '4.1%', type: 'up' },
    { name: 'Apple', price: '$263.40', change: '1.0%', type: 'up' },
    { name: 'BanEcuador', price: '$0.00', change: '0.0%', type: 'neutral' },
    { name: 'Banco de Guayaquil', price: '$2.27', change: '10.7%', type: 'up' },
    { name: 'Banco de Machala', price: '$0.00', change: '0.0%', type: 'neutral' },
    { name: 'Banco del Pichincha', price: '$1.20', change: '9.1%', type: 'up' },
    { name: 'Cerveceria Nacional', price: '$54.00', change: '0.0%', type: 'neutral' },
    { name: 'Continental Tire Andina', price: '$0.00', change: '0.0%', type: 'neutral' },
    { name: 'Cooperativa Gualaquiza', price: '$0.00', change: '0.0%', type: 'neutral' },
    { name: 'Cooperativa JEP', price: '$0.00', change: '0.0%', type: 'neutral' },
    { name: 'Corporacion La Favorita', price: '$2.02', change: '3.6%', type: 'up' },
    { name: 'Facebook Inc', price: '$688.55', change: '20.2%', type: 'up' },
    { name: 'Holcim', price: '$40.00', change: '11.1%', type: 'down' },
    { name: 'Industrias Ales', price: '$0.00', change: '0.0%', type: 'neutral' },
    { name: 'Ingenio San Carlos', price: '$0.51', change: '15.0%', type: 'down' },
    { name: 'Inversancarlos', price: '$2.88', change: '2.4%', type: 'down' },
    { name: 'McDonalds Corporation', price: '$304.85', change: '0.2%', type: 'neutral' },
    { name: 'Microsoft Corp', price: '$415.20', change: '5.4%', type: 'up' },
    { name: 'NVIDIA Corp', price: '$128.50', change: '18.3%', type: 'up' },
    { name: 'Tesla Inc', price: '$218.40', change: '8.7%', type: 'up' }
  ];

  const filteredStocks = initialStocks.filter(stock => {
    const matchesSearch = stock.name.toLowerCase().includes(stockSearch.toLowerCase());
    if (stockFilter === 'gains') return matchesSearch && stock.type === 'up';
    if (stockFilter === 'losses') return matchesSearch && stock.type === 'down';
    if (stockFilter === 'neutral') return matchesSearch && stock.type === 'neutral';
    return matchesSearch;
  });

  const handleSaveIp = () => {
    setIpSavedMessage(`Saved IP: ${ipAddress}`);
    setTimeout(() => setIpSavedMessage(''), 3500);
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!passwordInput) {
      setAuthStatus('Please enter your password');
      return;
    }
    setAuthStatus('Authenticating server session...');
    setTimeout(() => {
      setAuthStatus('Access Granted! Connected to Portfolio Database.');
    }, 800);
  };

  return (
    <div className="stock-app-wrapper">
      <div className="mock-browser-frame">
        {/* Browser Top Navigation Header */}
        <div className="browser-header-bar">
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }} title="Back to Portfolio">←</button>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          </div>
          
          {/* Mock Browser URL Bar */}
          <div className="browser-url-bar">
            <span>🔒</span>
            <span style={{ color: '#38bdf8' }}>valueinvestingsoftwarefree.github.io</span>
            <span style={{ color: '#94a3b8' }}>/PortfolioManagementSoftware/app.html</span>
          </div>

          {/* View selector toggles */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveScreenTab('all')}
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', background: activeScreenTab === 'all' ? '#7c3aed' : 'rgba(255,255,255,0.08)', color: '#FFF' }}
            >
              📱 Side-by-Side View
            </button>
            <button
              onClick={() => setActiveScreenTab('screen1')}
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', background: activeScreenTab === 'screen1' ? '#7c3aed' : 'rgba(255,255,255,0.08)', color: '#FFF' }}
            >
              🔑 Auth
            </button>
            <button
              onClick={() => setActiveScreenTab('screen2')}
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', background: activeScreenTab === 'screen2' ? '#7c3aed' : 'rgba(255,255,255,0.08)', color: '#FFF' }}
            >
              💾 Data Sync
            </button>
            <button
              onClick={() => setActiveScreenTab('screen3')}
              style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', background: activeScreenTab === 'screen3' ? '#7c3aed' : 'rgba(255,255,255,0.08)', color: '#FFF' }}
            >
              📈 Stock List
            </button>
          </div>
        </div>

        {/* Multi-Screen Container */}
        <div className="phone-trio-grid">

          {/* ── SCREEN 1: SIGN IN (AUTHENTICATION) ── */}
          {(activeScreenTab === 'all' || activeScreenTab === 'screen1') && (
            <div className="phone-screen">
              <div className="phone-notch"></div>
              
              {/* Plant & Coins Growth Header Graphic */}
              <div style={{ padding: '20px 20px 10px 20px', textAlign: 'center' }}>
                <img
                  src="/plant_coins_investment.png"
                  alt="Investment Growth Coins Plant"
                  style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', margin: '0 auto', display: 'block', borderRadius: '12px' }}
                />
              </div>

              <div style={{ padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', textAlign: 'center', color: '#1e293b', marginBottom: '24px' }}>
                  Sign in
                </h2>

                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      style={{ width: '100%', padding: '14px 45px 14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '15px', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  {authStatus && (
                    <p style={{ fontSize: '12px', textAlign: 'center', color: authStatus.includes('Granted') ? '#16a34a' : '#dc2626' }}>
                      {authStatus}
                    </p>
                  )}

                  <button type="submit" className="stock-btn-purple">
                    Sign in
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Password change request sent to registered email.')}
                    className="stock-btn-purple"
                  >
                    Change Password
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPasswordInput(''); setAuthStatus(''); }}
                    className="stock-btn-purple"
                  >
                    Exit
                  </button>
                </form>
              </div>

              <div className="watermark-apowermirror">ApowerMirror</div>
            </div>
          )}

          {/* ── SCREEN 2: DATA EXPORT/IMPORT & SERVER IP CONFIG ── */}
          {(activeScreenTab === 'all' || activeScreenTab === 'screen2') && (
            <div className="phone-screen">
              <div className="phone-notch"></div>
              
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                
                {/* Download Buttons Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button className="stock-btn-orange" onClick={() => alert('Downloading CAR data...')}>
                    <span>↓</span> CAR
                  </button>
                  <button className="stock-btn-orange" onClick={() => alert('Downloading COSTS data...')}>
                    <span>↓</span> COSTS
                  </button>
                </div>

                <button className="stock-btn-orange" onClick={() => alert('Downloading PORTFOLIO OF STOCKS data...')}>
                  <span>↓</span> PORTFOLIO OF STOCKS
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button className="stock-btn-blue" onClick={() => alert(`Downloading EXPENSES for ${selectedYear}...`)}>
                    <span>↓</span> EXPENSES
                  </button>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '700', fontSize: '14px', outline: 'none' }}
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>

                <button className="stock-btn-blue" onClick={() => alert('Downloading BANK ACCOUNTS data...')}>
                  <span>↓</span> BANK ACCOUNTS
                </button>

                {/* Server IP Config Row */}
                <div style={{ margin: '14px 0', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: '700', color: '#475569', fontSize: '15px' }}>IP:</span>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={e => setIpAddress(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#1e293b', fontWeight: '600', fontSize: '14px', outline: 'none' }}
                  />
                  <button
                    onClick={handleSaveIp}
                    style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#8b5cf6', color: '#FFF', border: 'none', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Save IP Connection Address"
                  >
                    💾
                  </button>
                </div>

                {ipSavedMessage && (
                  <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', textAlign: 'center', marginTop: '-6px' }}>{ipSavedMessage}</p>
                )}

                {/* Upload Buttons Section */}
                <button className="stock-btn-orange" onClick={() => alert('Uploading CAR MAINTENANCES data...')}>
                  <span>↑</span> CAR MAINTENANCES
                </button>

                <button className="stock-btn-orange" onClick={() => alert('Uploading BANK ACCOUNTS data...')}>
                  <span>↑</span> BANK ACCOUNTS
                </button>

                <button className="stock-btn-orange" onClick={() => alert('Uploading EXPENSES data...')}>
                  <span>↑</span> EXPENSES
                </button>

                <button className="stock-btn-orange" onClick={() => alert('Uploading PORTFOLIO OF STOCKS data...')}>
                  <span>↑</span> PORTFOLIO OF STOCKS
                </button>

              </div>

              <div className="watermark-apowermirror">ApowerMirror</div>
            </div>
          )}

          {/* ── SCREEN 3: STOCK PORTFOLIO LIST TRACKER ── */}
          {(activeScreenTab === 'all' || activeScreenTab === 'screen3') && (
            <div className="phone-screen">
              <div className="phone-notch"></div>
              
              {/* Header Title */}
              <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0, textAlign: 'center' }}>
                  Portfolio of Stocks
                </h3>
                
                {/* Search & Status Filters */}
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="Search stock name..."
                    value={stockSearch}
                    onChange={e => setStockSearch(e.target.value)}
                    style={{ width: '100%', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                  
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setStockFilter('all')}
                      style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: stockFilter === 'all' ? '#0f172a' : '#e2e8f0', color: stockFilter === 'all' ? '#FFF' : '#334155' }}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStockFilter('gains')}
                      style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: stockFilter === 'gains' ? '#16a34a' : '#e2e8f0', color: stockFilter === 'gains' ? '#FFF' : '#334155' }}
                    >
                      Gains ▲
                    </button>
                    <button
                      onClick={() => setStockFilter('losses')}
                      style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: stockFilter === 'losses' ? '#dc2626' : '#e2e8f0', color: stockFilter === 'losses' ? '#FFF' : '#334155' }}
                    >
                      Losses ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* Stocks List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
                {filteredStocks.map((stock, idx) => (
                  <div key={idx} className="stock-row-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={stock.type === 'up' ? 'dot-green' : stock.type === 'down' ? 'dot-red' : 'dot-grey'}></span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{stock.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{stock.price}</span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: stock.type === 'up' ? '#16a34a' : stock.type === 'down' ? '#dc2626' : '#64748b'
                      }}>
                        {stock.type === 'up' ? '▲' : stock.type === 'down' ? '▼' : '■'} {stock.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="watermark-apowermirror">ApowerMirror</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(fallbackData);

  const [theme, setTheme] = useState('dark');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Typing Text State
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const typingStrings = [
    'Software Developer',
    'ASP.NET Core Specialist',
    'FastAPI Python Architect',
    'SQL Server Database Expert'
  ];

  // Windows State Manager
  const [windows, setWindows] = useState({
    terminal: { id: 'terminal', title: '🖥️ Developer Terminal (CLI)', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    playground: { id: 'playground', title: '💻 Live HTML Code Editor', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    scheduler: { id: 'scheduler', title: '📅 Meeting Scheduler', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    recruiter: { id: 'recruiter', title: '💼 Recruiter Hub (60s Summary)', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    admin: { id: 'admin', title: '🔒 Administrative Console', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    chat: { id: 'chat', title: '💬 AI Chat Assistant', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 }
  });
  const [activeWindow, setActiveWindow] = useState('');
  const maxZIndex = useRef(10);

  // Audio greeting Player state
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicStatusText, setMusicStatusText] = useState('Greeting audio off');

  // Voice recognition states
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');

  // Scheduler inputs
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookCompany, setBookCompany] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('10:00 AM - 10:30 AM');
  const [bookNotes, setBookNotes] = useState('');

  // Chatbot states
  const [chatLog, setChatLog] = useState([
    { sender: 'ai', text: "Hello! I am Ajay's digital helper. Ask me about his 'skills', 'projects', or 'experience'!" }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Terminal log state
  const [terminalLog, setTerminalLog] = useState([
    { text: 'Type "help" to display available CLI commands.', type: 'info' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef(null);

  // Playground Code state
  const [htmlCode, setHtmlCode] = useState('<h3>Hello World!</h3>\n<p style="color: cyan;">Type HTML/CSS code here and see it render live...</p>');
  const iframeRef = useRef(null);

  // Admin Modal overlay state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard', 'profile', 'skills', 'projects', 'experience', 'education', 'blogs', 'messages'

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [formStatus, setFormStatus] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Resume Download Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [resumeEmail, setResumeEmail] = useState('');
  const [resumeCompany, setResumeCompany] = useState('');
  const [resumeDesignation, setResumeDesignation] = useState('');

  // Admin dynamic updates
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLinkedIn, setEditLinkedIn] = useState('');
  const [editGitHub, setEditGitHub] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editResumePath, setEditResumePath] = useState('');

  // Editing items IDs state
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editingProjId, setEditingProjId] = useState(null);
  const [editingExpId, setEditingExpId] = useState(null);
  const [editingEduId, setEditingEduId] = useState(null);
  const [editingBlogId, setEditingBlogId] = useState(null);

  // Admin CRUD inputs
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillPercent, setNewSkillPercent] = useState('');

  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjLive, setNewProjLive] = useState('');
  const [newProjGit, setNewProjGit] = useState('');
  const [newProjTags, setNewProjTags] = useState('');

  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');

  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduInstitute, setNewEduInstitute] = useState('');
  const [newEduDuration, setNewEduDuration] = useState('');
  const [newEduScore, setNewEduScore] = useState('');

  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogExcerpt, setNewBlogExcerpt] = useState('');

  // Messages Inbox List
  const [dbMessages, setDbMessages] = useState([]);
  // Database analytics stats
  const [dbStats, setDbStats] = useState({
    totalViews: 384,
    todayViews: 24,
    activeChats: 0,
    downloads: 14,
    chartLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    chartData: [45, 60, 52, 75, 90, 82, 110]
  });

  // Client-side Router Page state
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/admin/login')) return 'admin-login';
    if (path.startsWith('/admin')) return 'admin-dashboard';
    return 'portfolio';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Categories list and edit states
  const [categoriesList, setCategoriesList] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('bi-tag');
  const [newCatOrder, setNewCatOrder] = useState(0);
  const [editingCatId, setEditingCatId] = useState(null);

  // Comments list state
  const [commentsList, setCommentsList] = useState([]);

  // Gallery list and edit states
  const [galleryList, setGalleryList] = useState([]);
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalDesc, setNewGalDesc] = useState('');
  const [newGalType, setNewGalType] = useState('Video');
  const [newGalPath, setNewGalPath] = useState('');
  const [newGalEmbed, setNewGalEmbed] = useState('');
  const [newGalCategory, setNewGalCategory] = useState('');
  const [newGalTags, setNewGalTags] = useState('');
  const [newGalOrder, setNewGalOrder] = useState(0);
  const [newGalFeatured, setNewGalFeatured] = useState(false);
  const [editingGalId, setEditingGalId] = useState(null);

  // Scroll progress bar
  const [scrollProgress, setScrollProgress] = useState(0);

  // Testimonials carousel
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // API Tester simulator
  const [apiMethod, setApiMethod] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiResponse, setApiResponse] = useState('');

  // University study portal filters
  const [selectedUniversity, setSelectedUniversity] = useState('AKTU');
  const [selectedCourse, setSelectedCourse] = useState('B.Tech');
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');
  const [selectedBranch, setSelectedBranch] = useState('CSE-AIML');
  const [activeSyllabusAccordion, setActiveSyllabusAccordion] = useState(null);
  const [activeSubjects, setActiveSubjects] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/study/subjects?university=${selectedUniversity}&course=${selectedCourse}&branch=${selectedBranch}&semester=${selectedSemester}`)
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) {
          setActiveSubjects(resData);
        }
      })
      .catch(err => {
        console.warn("API subjects endpoint offline, using local fallback:", err);
        // Fallback static subjects list
        const fallbackSubjects = [
          { code: 'KCS-501', name: 'Database Management System (DBMS)' },
          { code: 'KCS-503', name: 'Design and Analysis of Algorithms (DAA)' },
          { code: 'KCA-501', name: 'Machine Learning Techniques (MLT)' },
          { code: 'KCS-055', name: 'Compiler Design' },
          { code: 'KNC-501', name: 'Constitution of India (COI)' }
        ];
        setActiveSubjects(fallbackSubjects);
      });
  }, [selectedUniversity, selectedCourse, selectedBranch, selectedSemester]);

  const canvasRef = useRef(null);

  // Fetch Live Portfolio Data from SQL Server
  const fetchPortfolioData = () => {
    fetch(`${API_BASE}/api/portfolio`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(resData => {
        if (resData && typeof resData === 'object') {
          setData(resData);
          syncEditorFields(resData);
        }
      })
      .catch(err => {
        console.warn('Real SQL database backend offline, using local fallback:', err);
      });
  };

  const fetchDbMessages = () => {
    fetch(`${API_BASE}/api/messages`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(resData => setDbMessages(resData))
      .catch(() => {});
  };

  const fetchDbStats = () => {
    fetch(`${API_BASE}/api/stats`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(resData => setDbStats(resData))
      .catch(() => {});
  };

  const fetchDbCategories = () => {
    fetch(`${API_BASE}/api/categories`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(resData => setCategoriesList(resData))
      .catch(() => {});
  };

  const fetchDbComments = () => {
    fetch(`${API_BASE}/api/comments`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(resData => setCommentsList(resData))
      .catch(() => {});
  };

  const fetchDbGallery = () => {
    fetch(`${API_BASE}/api/gallery`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(resData => setGalleryList(resData))
      .catch(() => {});
  };

  // Typing Effect Loop
  useEffect(() => {
    let timer;
    const currentStr = typingStrings[typingIndex];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setTypingText(currentStr.substring(0, typingText.length - 1));
      }, 30);
    } else {
      timer = setTimeout(() => {
        setTypingText(currentStr.substring(0, typingText.length + 1));
      }, 70);
    }

    if (!isDeleting && typingText === currentStr) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && typingText === '') {
      setIsDeleting(false);
      setTypingIndex((typingIndex + 1) % typingStrings.length);
    }

    return () => clearTimeout(timer);
  }, [typingText, isDeleting, typingIndex]);

  // Initial fetch
  useEffect(() => {
    fetchPortfolioData();
    fetchDbMessages();
    fetchDbStats();
    fetchDbCategories();
    fetchDbComments();
    fetchDbGallery();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(height > 0 ? (winScroll / height) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Testimonials auto-cycle
  useEffect(() => {
    const ti = setInterval(() => {
      setTestimonialIndex(prev => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(ti);
  }, []);

  // Theme modifiers
  useEffect(() => {
    document.body.className = '';
    if (theme === 'light') document.body.classList.add('light-theme');
    if (theme === 'blue') document.body.classList.add('blue-theme');
    if (theme === 'purple') document.body.classList.add('purple-theme');
  }, [theme]);

  // Canvas starfield animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const particles = [];
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(0, 212, 255, 0.4)';
      
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      ctx.strokeStyle = theme === 'light' ? 'rgba(0,0,0,0.015)' : 'rgba(124, 58, 237, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [theme]);

  const syncEditorFields = (pData) => {
    setEditName(pData.Profile.Name || '');
    setEditTitle(pData.Profile.Title || '');
    setEditDesc(pData.Profile.Description || '');
    setEditEmail(pData.Profile.Email || '');
    setEditPhone(pData.Profile.Phone || '');
    setEditAddress(pData.Profile.Address || '');
    setEditLinkedIn(pData.Profile.LinkedIn || '');
    setEditGitHub(pData.Profile.GitHub || '');
    setEditPhoto(pData.Profile.Photo || '');
    setEditResumePath(pData.Profile.ResumePath || '');
  };

  // Submit resume download tracking and download PDF from Database configured path
  const handleResumeDownloadSubmit = (e) => {
    e.preventDefault();
    if (!resumeName || !resumeEmail) return;

    // Dynamically retrieve exact resume file path saved in Database Profile
    const rawPath = data?.Profile?.ResumePath || data?.Profile?.ResumeUrl;
    const dbResumePath = (rawPath && rawPath !== '#') ? rawPath : '/resume.pdf';

    const triggerDownload = () => {
      const link = document.createElement('a');
      link.href = dbResumePath;
      link.download = dbResumePath.split('/').pop() || 'Ajay_Kumar_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    fetch(`${API_BASE}/api/resume/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: resumeName,
        email: resumeEmail,
        company: resumeCompany,
        designation: resumeDesignation
      })
    })
      .then(res => res.json())
      .then(() => {
        triggerDownload();
        setResumeName('');
        setResumeEmail('');
        setResumeCompany('');
        setResumeDesignation('');
        setShowResumeModal(false);

        fetchDbStats();
        alert(`✅ Resume file downloaded from Database (${dbResumePath.split('/').pop()})!`);
      })
      .catch(err => {
        console.error('API Tracking error, executing direct DB resume download:', err);
        triggerDownload();
        setShowResumeModal(false);
      });
  };

  // Helper to fetch syllabus modules dynamically
  const getSyllabusTopics = (subjectCode) => {
    const topics = {
      // Semester 5 CSE-AIML
      'KCS-501': [
        'Unit 1: Introduction to DBMS, ER Model, Entity Sets, Attributes & Keys.',
        'Unit 2: Relational Data Model, Relational Algebra, SQL DDL/DML & Joins.',
        'Unit 3: Normalization Theories: 1NF, 2NF, 3NF, BCNF, Dependency Preservation.',
        'Unit 4: Transaction Concepts, ACID Properties, Concurrency Control (2PL, Locks).',
        'Unit 5: Database Recovery Systems (Log-based, Shadow Paging) & NoSQL Introductions.'
      ],
      'KCS-503': [
        'Unit 1: Asymptotic Notations (Big-O, Omega, Theta), Recurrence Relations & Master Theorem.',
        'Unit 2: Divide & Conquer (Merge Sort, Quick Sort), Greedy Algorithms (Kruskal, Prim).',
        'Unit 3: Dynamic Programming (0/1 Knapsack, Longest Common Subsequence, LCS).',
        'Unit 4: Backtracking (N-Queens, Graph Coloring) & Branch and Bound Methods.',
        'Unit 5: Complexity Classes (P, NP, NP-Complete, NP-Hard) & Approximation Algorithms.'
      ],
      'KCA-501': [
        'Unit 1: Introduction to ML, Supervised vs Unsupervised, Bias-Variance Trade-off.',
        'Unit 2: Regression Algorithms (Linear & Logistic), Cost Functions & Gradient Descent.',
        'Unit 3: Classification Techniques: Decision Trees, Random Forests, K-NN & SVM.',
        'Unit 4: Neural Networks: Perceptrons, Multi-Layer Perceptrons, Backpropagation & Activation Functions.',
        'Unit 5: Clustering (K-Means, Hierarchical) & Dimensionality Reduction (PCA).'
      ],
      'KCS-055': [
        'Unit 1: Phases of Compiler, Lexical Analysis, Tokenization & Lexical Errors.',
        'Unit 2: Syntax Analysis: CFGs, Top-down Parsing (LL1), Bottom-up Parsing (LR, LALR).',
        'Unit 3: Syntax Directed Translation, Attributes (Synthesized & Inherited), Intermediate Code.',
        'Unit 4: Runtime Storage Administrations, Activation Records & Symbol Tables.',
        'Unit 5: Code Optimization (DAG, Loop Optimization) & Target Machine Code Generation.'
      ],
      'KNC-501': [
        'Unit 1: Historical Background of Indian Constitution, Preamble & Key Salient Features.',
        'Unit 2: Fundamental Rights, Directive Principles of State Policy & Fundamental Duties.',
        'Unit 3: Union Executive: President, Prime Minister, Union Cabinet & Parliamentary Houses.',
        'Unit 4: State Executive: Governor, Chief Minister & Local Panchayats Administrations.',
        'Unit 5: Emergency Clauses, Constitutional Amendments & Judicial Review Powers.'
      ],
      // Semester 3 CSE-AIML
      'KCS-301': [
        'Unit 1: Arrays Representation, Sparse Matrices, Singly/Doubly Linked Lists & Operations.',
        'Unit 2: Stacks & Queues Implementations, Recursion Applications, Polish Notations Conversion.',
        'Unit 3: Binary Trees, Traversals (Pre/In/Postorder), Binary Search Trees & AVL Trees.',
        'Unit 4: Graphs Definitions, Adjacency Lists/Matrices, Breadth-First & Depth-First Search.',
        'Unit 5: Bubble/Quick/Merge Sorts, Binary Search & Hashing Collisions Resolution.'
      ],
      'KCS-302': [
        'Unit 1: Functional Units of Computer, Register Transfer Language & Bus Systems.',
        'Unit 2: Instruction Formats, Addressing Modes, CPU Accumulator Registers & Hardwired Control.',
        'Unit 3: Computer Arithmetic: Booth Multiplier, Floating Point Representations & ALU Design.',
        'Unit 4: Memory Hierarchies: Main Memory, Cache Memory Mapping & Virtual Memory.',
        'Unit 5: Input-Output Organization, Peripheral Interfaces, DMA & Interrupt Handlers.'
      ],
      'KCS-303': [
        'Unit 1: Set Theory, Venn Diagrams, Binary Relations, Equivalence Relations & Functions.',
        'Unit 2: Algebraic Structures: Monoids, Semigroups, Groups, Subgroups & Cosets.',
        'Unit 3: Propositional Logic: Connectives, Tautology, Truth Tables & Quantifiers.',
        'Unit 4: Permutations, Combinations, Pigeonhole Principle & Generating Functions.',
        'Unit 5: Graphs, Euler/Hamilton Paths, Planar Graphs, Tree Traversals & Spanning Trees.'
      ]
    };
    return topics[subjectCode] || [
      'Unit 1: Core Subject Overview and Introduction to Fundamental Concepts.',
      'Unit 2: Intermediate Module covering structural designs and implementations.',
      'Unit 3: Advanced Concepts, optimizations, and technical problem analysis.',
      'Unit 4: Case Studies, practical applications, and laboratory validations.',
      'Unit 5: Modern trends, research scopes, and future project architectures.'
    ];
  };

  // Helper to dynamically download academic study materials
  const handleDownloadItem = (subjectName, type, subjectCode) => {
    const url = `${API_BASE}/api/study/download?subject=${encodeURIComponent(subjectName)}&code=${encodeURIComponent(subjectCode)}&type=${encodeURIComponent(type)}`;
    window.open(url, '_blank');
  };

  // Submit contact form to SQL API
  const handleSendContact = (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: contactName,
        email: contactEmail,
        subject: contactSubject || 'Direct Portfolio Connect',
        message: contactMessage
      })
    })
      .then(res => res.json())
      .then(() => {
        setFormStatus({ success: true, text: 'Message saved directly to SQL Server database!' });
        setContactName('');
        setContactEmail('');
        setContactSubject('');
        setContactMessage('');
        fetchDbMessages();
        fetchDbStats();
        setTimeout(() => setFormStatus(null), 4000);
      })
      .catch(() => {
        alert('Server API connection offline. Message could not be saved.');
      });
  };

  // Admin login check
  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) return;

    fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: adminUsername.trim(), password: adminPassword.trim() })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid Username or Password!');
        }
        return res.json();
      })
      .then(() => {
        setIsAdminLoggedIn(true);
        setLoginError('');
        setAdminUsername('');
        setAdminPassword('');
        navigateTo('admin-dashboard', '/Admin');
      })
      .catch(err => {
        // Fallback for offline API server mode or connection failure
        const u = adminUsername.trim().toLowerCase();
        const p = adminPassword.trim();
        if (
          (u === 'admin' && (p === 'admin123' || p === 'admin' || p === 'admin@123')) ||
          (u === 'ajay' && (p === 'Ajay@7318' || p === 'ajay7318' || p === 'admin123' || p === 'admin'))
        ) {
          setIsAdminLoggedIn(true);
          setLoginError('');
          setAdminUsername('');
          setAdminPassword('');
          navigateTo('admin-dashboard', '/Admin');
        } else {
          setLoginError(err.message || 'Verification failed');
        }
      });
  };

  // Profile update to SQL Server
  const handleUpdateProfile = () => {
    fetch(`${API_BASE}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName,
        title: editTitle,
        description: editDesc,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
        linkedIn: editLinkedIn,
        gitHub: editGitHub,
        photo: editPhoto,
        resumePath: editResumePath
      })
    })
      .then(res => res.json())
      .then(() => {
        alert('Profile saved live to SQL Server!');
        fetchPortfolioData();
      })
      .catch(err => alert('Save failed: ' + err));
  };

  // Skill CRUD
  const handleSaveSkill = (e) => {
    e.preventDefault();
    if (!newSkillName || !newSkillPercent) return;
    const pct = parseInt(newSkillPercent, 10);

    fetch(`${API_BASE}/api/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingSkillId, name: newSkillName, percentage: pct })
    })
      .then(res => res.json())
      .then(() => {
        fetchPortfolioData();
        setNewSkillName('');
        setNewSkillPercent('');
        setEditingSkillId(null);
      });
  };

  const handleDeleteSkill = (id) => {
    fetch(`${API_BASE}/api/skills/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchPortfolioData());
  };

  // Project CRUD
  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!newProjName || !newProjDesc) return;
    const tags = newProjTags ? newProjTags.split(',').map(t => t.trim()) : ['React'];

    fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingProjId,
        title: newProjName,
        description: newProjDesc,
        liveLink: newProjLive || '#',
        githubLink: newProjGit || '#',
        tags
      })
    })
      .then(res => res.json())
      .then(() => {
        fetchPortfolioData();
        setNewProjName('');
        setNewProjDesc('');
        setNewProjLive('');
        setNewProjGit('');
        setNewProjTags('');
        setEditingProjId(null);
      });
  };

  const handleDeleteProject = (id) => {
    fetch(`${API_BASE}/api/projects/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchPortfolioData());
  };

  // Experience CRUD
  const handleSaveExperience = (e) => {
    e.preventDefault();
    if (!newExpCompany || !newExpRole || !newExpDesc) return;

    fetch(`${API_BASE}/api/experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingExpId,
        company: newExpCompany,
        role: newExpRole,
        description: newExpDesc,
        duration: ''
      })
    })
      .then(res => res.json())
      .then(() => {
        fetchPortfolioData();
        setNewExpCompany('');
        setNewExpRole('');
        setNewExpDesc('');
        setEditingExpId(null);
      });
  };

  const handleDeleteExperience = (id) => {
    fetch(`${API_BASE}/api/experience/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchPortfolioData());
  };

  // Education CRUD
  const handleSaveEducation = (e) => {
    e.preventDefault();
    if (!newEduDegree || !newEduInstitute || !newEduDuration) return;

    fetch(`${API_BASE}/api/education`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingEduId,
        degree: newEduDegree,
        institute: newEduInstitute,
        duration: newEduDuration,
        score: newEduScore
      })
    })
      .then(res => res.json())
      .then(() => {
        fetchPortfolioData();
        setNewEduDegree('');
        setNewEduInstitute('');
        setNewEduDuration('');
        setNewEduScore('');
        setEditingEduId(null);
      });
  };

  const handleDeleteEducation = (id) => {
    fetch(`${API_BASE}/api/education/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchPortfolioData());
  };

  // Blogs CRUD
  const handleSaveBlog = (e) => {
    e.preventDefault();
    if (!newBlogTitle || !newBlogExcerpt) return;

    fetch(`${API_BASE}/api/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingBlogId,
        title: newBlogTitle,
        excerpt: newBlogExcerpt
      })
    })
      .then(res => res.json())
      .then(() => {
        fetchPortfolioData();
        setNewBlogTitle('');
        setNewBlogExcerpt('');
        setEditingBlogId(null);
      });
  };

  const handleDeleteBlog = (id) => {
    fetch(`${API_BASE}/api/blogs/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchPortfolioData());
  };

  const toggleMessageRead = (id) => {
    fetch(`${API_BASE}/api/messages/${id}/read`, { method: 'PUT' })
      .then(res => res.json())
      .then(() => {
        fetchDbMessages();
        fetchDbStats();
      });
  };

  const handleDeleteMessage = (id) => {
    fetch(`${API_BASE}/api/messages/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        fetchDbMessages();
        fetchDbStats();
      });
  };

  // Categories CRUD
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;
    fetch(`${API_BASE}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingCatId,
        name: newCatName,
        slug: newCatSlug,
        description: newCatDesc,
        icon: newCatIcon,
        displayOrder: parseInt(newCatOrder) || 0
      })
    })
      .then(res => res.json())
      .then(() => {
        fetchDbCategories();
        fetchPortfolioData();
        setNewCatName('');
        setNewCatSlug('');
        setNewCatDesc('');
        setNewCatIcon('bi-tag');
        setNewCatOrder(0);
        setEditingCatId(null);
      });
  };

  const handleDeleteCategory = (id) => {
    fetch(`${API_BASE}/api/categories/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        fetchDbCategories();
        fetchPortfolioData();
      });
  };

  // Comments Approval & Delete
  const handleToggleCommentApproval = (id, currentStatus) => {
    fetch(`${API_BASE}/api/comments/approve/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !currentStatus })
    })
      .then(res => res.json())
      .then(() => {
        fetchDbComments();
      });
  };

  const handleDeleteComment = (id) => {
    fetch(`${API_BASE}/api/comments/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        fetchDbComments();
      });
  };

  // Gallery CRUD
  const handleSaveGallery = (e) => {
    e.preventDefault();
    if (!newGalTitle) return;
    fetch(`${API_BASE}/api/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingGalId,
        title: newGalTitle,
        description: newGalDesc,
        mediaType: newGalType,
        mediaPath: newGalPath,
        videoEmbedCode: newGalEmbed,
        category: newGalCategory,
        tags: newGalTags,
        displayOrder: parseInt(newGalOrder) || 0,
        isFeatured: newGalFeatured
      })
    })
      .then(res => res.json())
      .then(() => {
        fetchDbGallery();
        fetchPortfolioData();
        setNewGalTitle('');
        setNewGalDesc('');
        setNewGalType('Video');
        setNewGalPath('');
        setNewGalEmbed('');
        setNewGalCategory('');
        setNewGalTags('');
        setNewGalOrder(0);
        setNewGalFeatured(false);
        setEditingGalId(null);
      });
  };

  const handleDeleteGallery = (id) => {
    fetch(`${API_BASE}/api/gallery/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        fetchDbGallery();
        fetchPortfolioData();
      });
  };

  // Scroll reveal IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.15 });

    const sections = document.querySelectorAll('.reveal-section');
    sections.forEach(sec => observer.observe(sec));

    return () => {
      sections.forEach(sec => observer.unobserve(sec));
    };
  }, [data]);

  // OS Windows lifecycle handlers
  const focusWindow = (id) => {
    maxZIndex.current += 1;
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
        zIndex: maxZIndex.current
      }
    }));
    setActiveWindow(id);
  };

  const closeWindow = (id) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
  };

  const minimizeWindow = (id) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }));
  };

  const toggleMaximize = (id) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMaximized: !prev[id].isMaximized }
    }));
  };

  // Ambient welcome audio synthesizer
  const toggleMusic = () => {
    if (isPlayingMusic) {
      setIsPlayingMusic(false);
      setMusicStatusText('Greeting audio paused');
    } else {
      setIsPlayingMusic(true);
      setMusicStatusText('Greeting audio is active');
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance("Welcome! I am Ajay Kumar. I build premium software, databases, and responsive React applications. Connect with me using the form below.");
        window.speechSynthesis.speak(msg);
      }
    }
  };

  // HTML5 voice SpeechRecognition assistant
  const toggleVoiceCommands = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech Voice Recognition is not supported by your browser model.");
      return;
    }

    if (isListeningVoice) {
      setIsListeningVoice(false);
      setVoiceMessage('');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-US';
    rec.interimResults = false;

    rec.onstart = () => {
      setIsListeningVoice(true);
      setVoiceMessage('Listening for macOS desk commands...');
    };

    rec.onerror = () => {
      setIsListeningVoice(false);
      setVoiceMessage('');
    };

    rec.onend = () => {
      setIsListeningVoice(false);
    };

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript.toLowerCase();
      setVoiceMessage(`Recognized: "${text}"`);
      
      setTimeout(() => {
        if (text.includes('terminal')) {
          focusWindow('terminal');
        } else if (text.includes('editor') || text.includes('sandbox')) {
          focusWindow('playground');
        } else if (text.includes('scheduler') || text.includes('booking')) {
          focusWindow('scheduler');
        } else if (text.includes('admin') || text.includes('console')) {
          focusWindow('admin');
        } else if (text.includes('recruiter')) {
          focusWindow('recruiter');
        } else if (text.includes('chat')) {
          focusWindow('chat');
        } else if (text.includes('light')) {
          setTheme('light');
        } else if (text.includes('dark')) {
          setTheme('dark');
        } else if (text.includes('blue')) {
          setTheme('blue');
        } else if (text.includes('purple')) {
          setTheme('purple');
        } else if (text.includes('greet') || text.includes('welcome')) {
          toggleMusic();
        }
        setVoiceMessage('');
      }, 1000);
    };

    rec.start();
  };

  // Intelligent dynamic regex chatbot reply parser
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newLogs = [...chatLog, { sender: 'user', text: userText }];
    setChatLog(newLogs);
    setChatInput('');

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = "";

      if (lower.includes('skill')) {
        reply = "Ajay's current database active skills are: " + data.Skills.map(s => s.name).join(', ') + ".";
      } else if (lower.includes('project')) {
        reply = "He has built several projects: " + data.Projects.map(p => p.title || p.ProjectName).join(', ') + ". You can review them in the Projects section.";
      } else if (lower.includes('experience') || lower.includes('job')) {
        reply = "His work experience includes roles at: " + data.Experience.map(e => e.company).join(', ') + ".";
      } else if (lower.includes('education') || lower.includes('degree')) {
        reply = "He is pursuing: " + data.Education.map(edu => edu.degree).join(' and ') + ".";
      } else if (lower.includes('contact') || lower.includes('email') || lower.includes('phone')) {
        reply = `You can email him directly at ${data.Profile.Email || 'ajaykumar737905@gmail.com'} or call at +91 ${data.Profile.Phone || '7318342416'}.`;
      } else {
        reply = "I understand! I can help you retrieve his database values. Try asking about his 'skills', 'projects', or 'experience'!";
      }

      setChatLog(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 500);
  };

  // Terminal bash CLI command parser
  const handleTerminalSubmit = (e) => {
    if (e.key === 'Enter') {
      const val = terminalInput.trim();
      setTerminalInput('');
      if (!val) return;

      const newLogs = [...terminalLog, { text: `guest@ajay-portfolio:~$ ${val}`, type: 'input' }];
      const cmd = val.toLowerCase().split(' ')[0];
      let response = '';

      switch (cmd) {
        case 'help':
          response = 'Available Commands:\n- about: Show developer biography\n- skills: List technical stack proficiencies\n- projects: View project showcases\n- clear: Clear screen';
          break;
        case 'about':
          response = `${data.Profile.Name} is a ${data.Profile.Title}. ${data.Profile.Description}`;
          break;
        case 'skills':
          response = 'Active Skills:\n' + data.Skills.map(s => `- ${s.name} (${s.percentage || s.Percentage}%)`).join('\n');
          break;
        case 'projects':
          response = 'Dynamic Projects:\n' + data.Projects.map(p => `- ${p.title || p.ProjectName}`).join('\n');
          break;
        case 'clear':
          setTerminalLog([]);
          return;
        default:
          response = `bash: command not found: ${cmd}. Type "help" for a list of available actions.`;
      }

      setTerminalLog([...newLogs, { text: response, type: 'output' }]);
    }
  };

  // Scheduler meeting request submission
  const handleBookMeeting = (e) => {
    e.preventDefault();
    if (!bookName || !bookEmail || !bookDate) return;

    const emailTo = "ajaykumar737905@gmail.com";
    const emailSubject = encodeURIComponent(`📅 Meeting Request from ${bookName} (${bookCompany || 'Client'})`);
    const emailBody = encodeURIComponent(
      `Hello Ajay,\n\nA new video connection meeting has been scheduled via your Portfolio Console:\n\n` +
      `👤 Name: ${bookName}\n` +
      `📧 Email: ${bookEmail}\n` +
      `🏢 Company: ${bookCompany || 'N/A'}\n` +
      `📅 Date: ${bookDate}\n` +
      `⏰ Time Slot: ${bookTime}\n` +
      `📝 Notes: ${bookNotes || 'None'}\n\n` +
      `Best regards,\nPortfolio Meeting Scheduler System`
    );

    // Save to Database ContactMessages / Inbox
    fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: bookName,
        email: bookEmail,
        subject: `📅 Meeting Request: ${bookDate} (${bookTime})`,
        message: `Company: ${bookCompany || 'N/A'}\nDate: ${bookDate}\nTime Slot: ${bookTime}\nNotes: ${bookNotes || 'None'}`
      })
    }).catch(err => console.error("Error saving meeting to DB:", err));

    // Open mail client addressed to ajaykumar737905@gmail.com
    window.open(`mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`, '_blank');

    alert(`✅ Meeting scheduled for ${bookDate} at ${bookTime}!\n\nEmail notification generated for ajaykumar737905@gmail.com and saved to your Admin Inbox.`);
    setBookName('');
    setBookEmail('');
    setBookCompany('');
    setBookDate('');
    setBookNotes('');
  };

  // Helper to handle client-side routing
  const navigateTo = (page, path) => {
    window.history.pushState({}, '', path);
    setCurrentPage(page);
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin/login')) {
        setCurrentPage('admin-login');
      } else if (path.startsWith('/admin')) {
        setCurrentPage('admin-dashboard');
      } else if (path === '/aktuportal') {
        setCurrentPage('aktu-portal');
      } else if (path === '/aktuportal/upload') {
        setCurrentPage('aktu-upload');
      } else if (path === '/aktuportal/requestboard') {
        setCurrentPage('aktu-request');
      } else if (path === '/aktuportal/tools') {
        setCurrentPage('aktu-tools');
      } else if (path === '/aktuportal/placement') {
        setCurrentPage('aktu-placement');
      } else if (path === '/aktuauth/login') {
        setCurrentPage('aktu-signin');
      } else if (path === '/aktuauth/register') {
        setCurrentPage('aktu-register');
      } else if (path === '/gallery') {
        setCurrentPage('gallery-page');
      } else if (path === '/app.html' || path === '/stock-app' || path === '/portfolio-app') {
        setCurrentPage('stock-app');
      } else {
        setCurrentPage('portfolio');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (currentPage === 'stock-app') {
    return <StockPortfolioAppShowcase onBack={() => navigateTo('portfolio', '/')} />;
  }

  const renderStars = (percent) => {
    const stars = Math.max(1, Math.min(5, Math.round((percent || 80) / 20)));
    return (
      <span style={{ color: 'var(--purple)', textShadow: '0 0 5px var(--purple)' }}>
        {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
      </span>
    );
  };

  const getSkillPercent = (name, def) => {
    const found = data.Skills.find(s => s.name.toLowerCase() === name.toLowerCase());
    return found ? (found.percentage || found.Percentage) : def;
  };

  if (currentPage === 'admin-login') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', backgroundColor: '#0A0E17', position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef} id="hero-canvas" style={{ zIndex: 1, position: 'absolute', inset: 0, pointerEvents: 'none' }}></canvas>
        <div className="glass-card" style={{ width: '420px', padding: '40px', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid rgba(0, 212, 255, 0.25)', boxShadow: '0 0 30px rgba(0, 212, 255, 0.15)', borderRadius: '20px' }}>
          <div style={{ fontSize: '60px', color: 'var(--cyan)' }}>👤🛡️</div>
          <h2 style={{ color: '#FFF', fontWeight: 'bold', fontSize: '28px', fontFamily: "'Space Grotesk', sans-serif" }}>Admin Login</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Enter your credentials to access dashboard</p>
          <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
              <span style={{ marginRight: '12px', fontSize: '16px' }}>👤</span>
              <input
                type="text"
                placeholder="Username"
                value={adminUsername}
                onChange={e => setAdminUsername(e.target.value)}
                required
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#FFF', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
              <span style={{ marginRight: '12px', fontSize: '16px' }}>🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                required
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#FFF', fontSize: '14px' }}
              />
            </div>
            {loginError && <p style={{ color: 'var(--danger-color)', fontSize: '12px' }}>{loginError}</p>}
            <button type="submit" className="btn-primary-neon" style={{ marginTop: '10px', padding: '12px' }}>Login</button>
          </form>
          <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('portfolio', '/'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', marginTop: '10px', display: 'inline-block' }}>← Back to Home</a>
        </div>
      </div>
    );
  }

  if (currentPage === 'aktu-portal') {
    // activeSubjects state is dynamically loaded from the API backend
    const getUniversityUpdates = () => {
      switch (selectedUniversity) {
        case 'VTU':
          return [
            { title: 'VTU Exam Schedule 2026', desc: 'Semester theory examinations timetable has been officially released.' },
            { title: `Syllabus Guidelines (${selectedBranch})`, desc: 'Scheme of studies and syllabus structure updated.' }
          ];
        case 'SPPU':
          return [
            { title: 'SPPU In-Sem Timetable 2026', desc: 'Schedules for Pune University in-sem theory assessments are now active.' },
            { title: `Curriculum Annexure (${selectedBranch})`, desc: 'Core course credits and practical session guidelines revised.' }
          ];
        case 'RGPV':
          return [
            { title: 'RGPV Odd Sem Exams 2026', desc: 'Theory exam online registration portals are now open.' },
            { title: `Module Structure (${selectedBranch})`, desc: 'New unit topics added for professional core subjects.' }
          ];
        case 'BTEUP':
          return [
            { title: 'BTEUP Special Back Paper 2026', desc: 'Timetables for diploma special carryover papers published.' },
            { title: `Diploma Syllabus (${selectedBranch})`, desc: 'Revised guidelines for semester coursework.' }
          ];
        default: // AKTU
          return [
            { title: 'AKTU Date Sheet 2026', desc: 'Final exams timetable for odd semester theory exams is now live.' },
            { title: `Syllabus Updates (${selectedBranch})`, desc: 'Minor revisions in B.Tech Sem 5 neural networks syllabus.' }
          ];
      }
    };

    const getActiveRequests = () => {
      switch (selectedUniversity) {
        case 'BTEUP':
          return [
            { req: 'GPA calculator sheet', status: 'Pending ⏳', color: 'orange' },
            { req: 'BTEUP Diploma EEE Notes', status: 'Fulfilled ✅', color: '#10b981' }
          ];
        case 'VTU':
          return [
            { req: 'VTU 18CS53 Solved Papers 2023', status: 'Pending ⏳', color: 'orange' },
            { req: 'VTU CSE 5th Sem Notes', status: 'Fulfilled ✅', color: '#10b981' }
          ];
        case 'SPPU':
          return [
            { req: 'SPPU 310242 Question Script', status: 'Pending ⏳', color: 'orange' },
            { req: 'SPPU CSE Lab Manuals', status: 'Fulfilled ✅', color: '#10b981' }
          ];
        default: // AKTU
          return [
            { req: 'GPA calculator sheet', status: 'Pending ⏳', color: 'orange' },
            { req: 'AKTU KCS-501 Carryover Papers', status: 'Fulfilled ✅', color: '#10b981' }
          ];
      }
    };

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#FFF', paddingBottom: '100px', fontFamily: "'Outfit', sans-serif" }}>
        {/* Header */}
        <div className="glass-card" style={{ margin: '20px', padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(13,202,240,0.1) 0%, rgba(13,110,253,0.1) 100%)', border: '1px solid rgba(13,202,240,0.2)' }}>
          <span className="theme-pill" style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)' }}>🎓 Multi-University Resources Hub</span>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginTop: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>University Notes & Question Papers</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px', margin: '10px auto' }}>Access syllabus, notes, carryover question papers, lab manuals, and sessional test guides for all technical and non-technical semesters.</p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button onClick={() => navigateTo('aktu-upload', '/AktuPortal/Upload')} className="btn-primary-neon" style={{ width: isMobile ? '100%' : 'auto', padding: '8px 16px', fontSize: '13px' }}>📤 Upload Study Notes</button>
            <button onClick={() => navigateTo('aktu-request', '/AktuPortal/RequestBoard')} className="btn-primary-neon" style={{ width: isMobile ? '100%' : 'auto', padding: '8px 16px', fontSize: '13px', background: 'none', border: '1px solid var(--cyan)', color: 'var(--cyan)' }}>📣 Request Material</button>
            <button onClick={() => navigateTo('aktu-tools', '/AktuPortal/Tools')} className="btn-primary-neon" style={{ width: isMobile ? '100%' : 'auto', padding: '8px 16px', fontSize: '13px', background: 'none', border: '1px solid var(--purple)', color: 'var(--purple)' }}>🧮 Student Tools</button>
          </div>
        </div>

        {/* Filter Catalog */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '3fr 1fr', gap: '20px', margin: isMobile ? '0 10px' : '0 20px' }}>
          <div className="glass-card" style={{ padding: isMobile ? '16px' : '24px' }}>
            <h4 style={{ color: 'var(--cyan)', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>🔍 Search Catalog</h4>
            
            {/* Catalog Selectors Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '25px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>University</label>
                <select value={selectedUniversity} onChange={e => setSelectedUniversity(e.target.value)} className="form-control" style={{ marginBottom: 0, backgroundColor: '#0d1117', color: '#FFF' }}>
                  <option value="AKTU">Dr. A.P.J. Abdul Kalam Technical University (AKTU)</option>
                  <option value="BTEUP">Board of Technical Education U.P. (BTEUP)</option>
                  <option value="CCSU">Chaudhary Charan Singh University (CCSU)</option>
                  <option value="DBRAU">Dr. Bhimrao Ambedkar University (DBRAU)</option>
                  <option value="VTU">Visvesvaraya Technological University (VTU)</option>
                  <option value="SPPU">Savitribai Phule Pune University (SPPU)</option>
                  <option value="JNTU">Jawaharlal Nehru Technological University (JNTU)</option>
                  <option value="RGPV">Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)</option>
                  <option value="RTU">Rajasthan Technical University (RTU)</option>
                  <option value="MAKAUT">Maulana Abul Kalam Azad University of Technology (MAKAUT)</option>
                  <option value="GTU">Gujarat Technological University (GTU)</option>
                  <option value="PTU">I.K. Gujral Punjab Technical University (PTU)</option>
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Course</label>
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="form-control" style={{ marginBottom: 0, backgroundColor: '#0d1117', color: '#FFF' }}>
                  <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                  <option value="M.Tech">M.Tech (Master of Technology)</option>
                  <option value="Diploma">Polytechnic Diploma</option>
                  <option value="BCA">BCA (Computer Applications)</option>
                  <option value="MCA">MCA (Master of Computer Applications)</option>
                  <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                  <option value="BBA">BBA (Business Administration)</option>
                  <option value="MBA">MBA (Master of Business Admin)</option>
                  <option value="B.Pharm">B.Pharm (Bachelor of Pharmacy)</option>
                  <option value="D.Pharm">D.Pharm (Diploma in Pharmacy)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Branch</label>
                <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className="form-control" style={{ marginBottom: 0, backgroundColor: '#0d1117', color: '#FFF' }}>
                  <option value="CSE-AIML">CSE (AI & ML)</option>
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="EE">Electrical Engineering (EE)</option>
                  <option value="ME">Mechanical Engineering (ME)</option>
                  <option value="CE">Civil Engineering (CE)</option>
                  <option value="CH">Chemical Engineering (CH)</option>
                  <option value="BT">Biotechnology (BT)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Semester</label>
                <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="form-control" style={{ marginBottom: 0, backgroundColor: '#0d1117', color: '#FFF' }}>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="Semester 7">Semester 7</option>
                  <option value="Semester 8">Semester 8</option>
                </select>
              </div>
            </div>

            {/* Dynamic Subjects Grid based on Selected Branch and Semester */}
            <h5 style={{ color: 'var(--warning-color)', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>
              📚 Semester Curriculum Subjects ({selectedBranch} - {selectedSemester})
            </h5>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeSubjects.map((sub, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '24px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <span className="theme-pill" style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)', fontSize: '10px', padding: '2px 8px', marginRight: '8px' }}>{sub.code}</span>
                      <strong style={{ fontSize: '16px', color: '#FFF', fontFamily: "'Space Grotesk', sans-serif" }}>{sub.name}</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>AKTU Curriculum</span>
                  </div>
                  
                  {/* Solved Papers, Quantum Book & Notes Download Action Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
                    <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', marginBottom: '6px' }}>📋</div>
                      <span style={{ fontSize: '12px', display: 'block', color: '#FFF', fontWeight: 'bold' }}>Syllabus Details</span>
                      <button 
                        onClick={() => setActiveSyllabusAccordion(activeSyllabusAccordion === sub.code ? null : sub.code)} 
                        className="btn-primary-neon" 
                        style={{ fontSize: '10px', padding: '4px 10px', marginTop: '10px', width: 'auto', background: activeSyllabusAccordion === sub.code ? 'var(--warning-color)' : 'none', border: '1px solid var(--warning-color)', color: activeSyllabusAccordion === sub.code ? '#000' : 'var(--warning-color)' }}
                      >
                        {activeSyllabusAccordion === sub.code ? '▲ Close View' : '👁️ View Syllabus'}
                      </button>
                    </div>

                    <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', marginBottom: '6px' }}>📙</div>
                      <span style={{ fontSize: '12px', display: 'block', color: '#FFF', fontWeight: 'bold' }}>Quantum Book</span>
                      <button onClick={() => handleDownloadItem(sub.name, 'Quantum Book', sub.code)} className="btn-primary-neon" style={{ fontSize: '10px', padding: '4px 10px', marginTop: '10px', width: 'auto' }}>
                        📥 Download Quantum
                      </button>
                    </div>

                    <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', marginBottom: '6px' }}>📂</div>
                      <span style={{ fontSize: '12px', display: 'block', color: '#FFF', fontWeight: 'bold' }}>10 Years Papers</span>
                      <button onClick={() => handleDownloadItem(sub.name, '10 Years Papers', sub.code)} className="btn-primary-neon" style={{ fontSize: '10px', padding: '4px 10px', marginTop: '10px', width: 'auto', background: 'none', border: '1px solid var(--cyan)', color: 'var(--cyan)' }}>
                        📥 Download Papers
                      </button>
                    </div>

                    <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', marginBottom: '6px' }}>📝</div>
                      <span style={{ fontSize: '12px', display: 'block', color: '#FFF', fontWeight: 'bold' }}>Lecture Notes</span>
                      <button onClick={() => handleDownloadItem(sub.name, 'Lecture Notes', sub.code)} className="btn-primary-neon" style={{ fontSize: '10px', padding: '4px 10px', marginTop: '10px', width: 'auto', background: 'none', border: '1px solid var(--purple)', color: 'var(--purple)' }}>
                        📥 Download Notes
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Syllabus Accordion View */}
                  {activeSyllabusAccordion === sub.code && (
                    <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--warning-color)', fontWeight: 'bold' }}>📋 Syllabus Modules (Curriculum Units)</span>
                        <button 
                          onClick={() => handleDownloadItem(sub.name, 'Syllabus PDF', sub.code)} 
                          className="theme-pill" 
                          style={{ fontSize: '10px', padding: '2px 8px', border: '1px solid var(--cyan)', color: 'var(--cyan)', background: 'none' }}
                        >
                          📥 Download Syllabus PDF
                        </button>
                      </div>
                      <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {getSyllabusTopics(sub.code).map((topic, i) => (
                          <li key={i} style={{ textAlign: 'left' }}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h5 style={{ color: 'var(--danger-color)', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>🔔 University Updates</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                {getUniversityUpdates().map((up, idx) => (
                  <div key={idx}>
                    <strong style={{ color: '#FFF' }}>{up.title}</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>{up.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h5 style={{ color: 'var(--warning-color)', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>📣 Active Requests</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                {getActiveRequests().map((item, idx) => (
                  <p key={idx}>🙋‍♂️ <strong>{item.req}</strong> <span style={{ color: item.color, fontSize: '11px' }}>({item.status})</span></p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => navigateTo('portfolio', '/')} className="btn-primary-neon" style={{ width: 'auto', margin: '30px auto 0 auto', display: 'block' }}>← Back to Portfolio</button>
      </div>
    );
  }

  if (currentPage === 'aktu-upload') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', fontFamily: "'Outfit', sans-serif" }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '40px', borderRadius: '20px', border: '1px solid rgba(0, 212, 255, 0.25)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '40px' }}>📤</span>
            <h3 style={{ color: '#FFF', fontWeight: '800', marginTop: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>Upload Notes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Contribute study notes and earn academic points</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); alert('Notes successfully uploaded for review!'); navigateTo('aktu-portal', '/AktuPortal'); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="text" placeholder="Title of material" required className="form-control" />
            <select className="form-control">
              <option>Select University</option>
              <option>AKTU</option>
              <option>BTEUP</option>
              <option>CCSU</option>
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '10px' }}>
              <select className="form-control" style={{ marginBottom: 0, backgroundColor: '#0d1117', color: '#FFF' }} required>
                <option value="">Select Course</option>
                <option value="B.Tech">B.Tech</option>
                <option value="Diploma">Diploma</option>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
                <option value="MBA">MBA</option>
                <option value="MCA">MCA</option>
              </select>
              <select className="form-control" style={{ marginBottom: 0, backgroundColor: '#0d1117', color: '#FFF' }} required>
                <option value="">Select Branch</option>
                <option value="CSE-AIML">CSE (AI & ML)</option>
                <option value="CSE">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="ECE">Electronics</option>
                <option value="EE">Electrical</option>
                <option value="ME">Mechanical</option>
              </select>
              <select className="form-control" style={{ marginBottom: 0, backgroundColor: '#0d1117', color: '#FFF' }} required>
                <option value="">Select Semester</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
            </div>
            <textarea placeholder="Description of topics covered" rows="3" className="form-control"></textarea>
            <input type="file" required className="form-control" style={{ backgroundColor: 'transparent' }} />
            <button type="submit" className="btn-primary-neon">Upload Document</button>
          </form>
          <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('aktu-portal', '/AktuPortal'); }} style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', marginTop: '16px' }}>← Back to Portal</a>
        </div>
      </div>
    );
  }

  if (currentPage === 'aktu-request') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#FFF', padding: '40px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '30px', textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '40px' }}>📣</span>
            <h2 style={{ color: '#FFF', fontWeight: '800', marginTop: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>Request Material Board</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Ask for missing notes, carryover papers, or model solutions</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* Submit Request */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h4 style={{ color: 'var(--cyan)', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>Submit Request</h4>
              <form onSubmit={(e) => { e.preventDefault(); alert('Request submitted successfully!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder="Subject Name / Code" required className="form-control" />
                <input type="text" placeholder="Course & Semester" required className="form-control" />
                <textarea placeholder="Specific topic or year of paper needed..." rows="3" required className="form-control"></textarea>
                <button type="submit" className="btn-primary-neon">Post Request</button>
              </form>
            </div>

            {/* Active Request Log */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h4 style={{ color: 'var(--warning-color)', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>Active Requests Log</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { user: 'Sanjay S.', req: 'AKTU Carryover Paper 2024 (Discrete Math)', status: 'Pending ⏳', color: 'orange' },
                  { user: 'Ananya M.', req: 'Notes on Compiler Design Sem 5', status: 'Fulfilled ✅', color: '#10b981' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span>Requester: {item.user}</span>
                      <span style={{ color: item.color }}>{item.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#FFF', marginTop: '6px' }}>{item.req}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => navigateTo('aktu-portal', '/AktuPortal')} className="btn-primary-neon" style={{ width: 'auto', margin: '30px auto 0 auto', display: 'block' }}>← Back to Portal</button>
        </div>
      </div>
    );
  }

  if (currentPage === 'aktu-tools') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#FFF', padding: '40px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '30px', textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '40px' }}>🧮</span>
            <h2 style={{ color: '#FFF', fontWeight: '800', marginTop: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>Academic Calculators Suite</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Estimate your SGPA/CGPA and monitor exam metrics</p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ color: 'var(--cyan)', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>Semester SGPA Calculator</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { sub: 'Operating Systems', credits: 4, grade: 'S (Outstanding - 10)' },
                { sub: 'Web Technologies', credits: 3, grade: 'A (Excellent - 9)' },
                { sub: 'Engineering Mathematics', credits: 4, grade: 'B (Very Good - 8)' }
              ].map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                  <input type="text" defaultValue={row.sub} className="form-control" style={{ marginBottom: 0 }} />
                  <input type="number" defaultValue={row.credits} className="form-control" style={{ marginBottom: 0 }} />
                  <select className="form-control" style={{ marginBottom: 0 }}>
                    <option>S (10)</option>
                    <option selected>A (9)</option>
                    <option>B (8)</option>
                  </select>
                </div>
              ))}
              <button className="btn-primary-neon" onClick={() => alert('Calculated SGPA: 8.95')} style={{ marginTop: '10px' }}>Calculate SGPA</button>
            </div>
          </div>
          <button onClick={() => navigateTo('aktu-portal', '/AktuPortal')} className="btn-primary-neon" style={{ width: 'auto', margin: '30px auto 0 auto', display: 'block' }}>← Back to Portal</button>
        </div>
      </div>
    );
  }

  if (currentPage === 'aktu-placement') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#FFF', padding: '40px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '30px', textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '40px' }}>💼</span>
            <h2 style={{ color: '#FFF', fontWeight: '800', marginTop: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>Placement Prep Portal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Aptitude formulas, interview cheat sheets, and coding solutions</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { company: 'TCS', title: 'TCS NQT Coding Questions 2026', tag: 'Coding', desc: 'Array and String coding questions asked in recent national qualifier tests.' },
              { company: 'Infosys', title: 'HR Interview Tips & Questions', tag: 'HR Prep', desc: 'Frequently asked behavioral questions with guidelines.' },
              { company: 'Cognizant', title: 'Aptitude Formulas Cheat Sheet', tag: 'Quantitative', desc: 'Formula list for speed-math, probability, ratios, and averages.' }
            ].map((p, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', borderRadius: '16px' }}>
                <span className="theme-pill" style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)', fontSize: '9px', padding: '2px 8px', alignSelf: 'flex-start' }}>{p.company}</span>
                <h4 style={{ color: '#FFF', fontSize: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>{p.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{p.desc}</p>
                <button className="btn-primary-neon" onClick={() => alert(`Opening ${p.title} full solution sheet...`)} style={{ fontSize: '11px', padding: '6px' }}>View Prep Details</button>
              </div>
            ))}
          </div>
          <button onClick={() => navigateTo('aktu-portal', '/AktuPortal')} className="btn-primary-neon" style={{ width: 'auto', margin: '30px auto 0 auto', display: 'block' }}>← Back to Portal</button>
        </div>
      </div>
    );
  }

  if (currentPage === 'aktu-ai') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#FFF', padding: '40px', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '30px', textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '40px' }}>🤖</span>
            <h2 style={{ color: '#FFF', fontWeight: '800', marginTop: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>AI Study Assistant</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Instant academic tutoring, code solving, and explanation of complex theorems</p>
          </div>
          <div className="glass-card" style={{ padding: '24px', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '13px' }}>
              <p>🤖 <strong>Assistant:</strong> Hi! I can help you solve academic problems. Try asking me a question about operating systems, SQL indexing, or neural network algorithms.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Type your academic query..." className="form-control" style={{ marginBottom: 0 }} />
              <button className="btn-primary-neon" style={{ width: 'auto' }} onClick={() => alert('Tutoring response loaded successfully!')}>Send</button>
            </div>
          </div>
          <button onClick={() => navigateTo('aktu-portal', '/AktuPortal')} className="btn-primary-neon" style={{ width: 'auto', margin: '30px auto 0 auto', display: 'block' }}>← Back to Portal</button>
        </div>
      </div>
    );
  }

  if (currentPage === 'aktu-signin') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#FFF', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', fontFamily: "'Outfit', sans-serif" }}>
        <div className="glass-card" style={{ width: '400px', padding: '40px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(13,202,240,0.25)' }}>
          <span style={{ fontSize: '40px' }}>🔐</span>
          <h3 style={{ color: '#FFF', fontWeight: '800', marginTop: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>Welcome Back</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>Sign in to manage bookmarks and earn points</p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Signed in successfully!'); navigateTo('aktu-portal', '/AktuPortal'); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="email" placeholder="student@university.edu" required className="form-control" />
            <input type="password" placeholder="Enter password" required className="form-control" />
            <button type="submit" className="btn-primary-neon">Sign In to Account</button>
          </form>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '14px' }}>New student? <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('aktu-register', '/AktuAuth/Register'); }} style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Register Now</a></p>
        </div>
      </div>
    );
  }

  if (currentPage === 'aktu-register') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#FFF', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', fontFamily: "'Outfit', sans-serif" }}>
        <div className="glass-card" style={{ width: '400px', padding: '40px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.25)' }}>
          <span style={{ fontSize: '40px' }}>👤</span>
          <h3 style={{ color: '#FFF', fontWeight: '800', marginTop: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>Create Account</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>Register to join resources sharing network</p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Account registered successfully!'); navigateTo('aktu-portal', '/AktuPortal'); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="text" placeholder="Full Name" required className="form-control" />
            <input type="email" placeholder="student@university.edu" required className="form-control" />
            <input type="password" placeholder="Create password" required className="form-control" />
            <button type="submit" className="btn-primary-neon">Register Account</button>
          </form>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '14px' }}>Already a member? <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('aktu-signin', '/AktuAuth/Login'); }} style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Sign In</a></p>
        </div>
      </div>
    );
  }

  if (currentPage === 'gallery-page') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#070a13', color: '#FFF', padding: '40px 20px 100px 20px', fontFamily: "'Outfit', sans-serif" }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: '800', fontFamily: "'Space Grotesk', sans-serif" }}>My Gallery</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Collection of my work, technical projects, tutorials, and materials</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <button className="theme-pill" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>All</button>
            <button className="theme-pill">Images</button>
            <button className="theme-pill">Videos</button>
            <button className="theme-pill">Documents</button>
          </div>
        </div>

        {/* Grid matching the live site with watch/download actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { type: 'document', title: 'CSS3 Lesson Plan - Part 2', desc: 'Welcome to Part 2 of our CSS3 course, picking up from selector syntax. Today we master the box model: the absolute core of web layout.', file: 'css3-lesson-2.pdf' },
            { type: 'video', title: 'CSS3 Styling Course: Part 2 - Box Model and Sizing Constraints', desc: 'Complete 20-minute guided masterclass. Narrated dynamically with real-time spectrum waveform visualization.', video: 'https://www.youtube.com/watch?v=j88rfskMGss' },
            { type: 'document', title: 'CSS3 Lesson Plan - Part 4', desc: 'Welcome to Part 4 of our CSS3 course. Today we explore CSS Grid, a powerful two-dimensional grid system. Unlike Flexbox, Grid manages both columns and rows.', file: 'css3-lesson-4.pdf' },
            { type: 'video', title: 'CSS3 Styling Course: Part 4 - Two-Dimensional Grid Systems', desc: 'Complete 20-minute guided masterclass. Narrated dynamically with real-time spectrum waveform visualization.', video: 'https://www.youtube.com/watch?v=D5J2ai0anF4' }
          ].map((item, idx) => (
            <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '16px', padding: '20px' }}>
              <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', background: '#070a13', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {item.type === 'document' ? (
                  <span style={{ fontSize: '60px' }}>📕</span>
                ) : (
                  <>
                    <span style={{ fontSize: '60px' }}>🎥</span>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                      <span style={{ fontSize: '40px', color: '#FFF' }}>▶</span>
                    </div>
                  </>
                )}
              </div>
              <h4 style={{ color: 'var(--cyan)', fontSize: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>{item.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{item.desc}</p>
              {item.type === 'document' ? (
                <button onClick={() => alert(`Downloading file: ${item.file}`)} className="btn-primary-neon" style={{ fontSize: '11px', padding: '6px' }}>📥 Download Document</button>
              ) : (
                <button onClick={() => window.open(item.video, '_blank')} className="btn-primary-neon" style={{ fontSize: '11px', padding: '6px', background: 'none', border: '1px solid var(--cyan)', color: 'var(--cyan)' }}>▶ Watch Video</button>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => navigateTo('portfolio', '/')} className="btn-primary-neon" style={{ width: 'auto', margin: '40px auto 0 auto', display: 'block' }}>← Back to Portfolio</button>
      </div>
    );
  }

  if (currentPage === 'admin-dashboard') {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#0B0F17', color: '#FFF', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Left Sidebar */}
        <div style={{ width: sidebarCollapsed ? '70px' : '260px', backgroundColor: '#070a13', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width 0.2s' }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {!sidebarCollapsed && <span style={{ fontWeight: '800', color: 'var(--cyan)', fontSize: '18px', letterSpacing: '0.5px' }}>⚙️ AdminPanel</span>}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: '18px' }}>☰</button>
          </div>
          
          <div style={{ flex: 1, padding: '15px 10px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            <div>
              {!sidebarCollapsed && <h5 style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', paddingLeft: '10px', marginBottom: '8px', letterSpacing: '1px' }}>Main</h5>}
              <button onClick={() => setAdminTab('dashboard')} className="theme-pill" style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: adminTab === 'dashboard' ? 'rgba(0, 212, 255, 0.1)' : 'none', borderColor: adminTab === 'dashboard' ? 'var(--cyan)' : 'transparent', color: '#FFF', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <span style={{ fontSize: '16px' }}>📊</span> {!sidebarCollapsed && <span>Dashboard</span>}
              </button>
            </div>
            
            <div>
              {!sidebarCollapsed && <h5 style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', paddingLeft: '10px', marginBottom: '8px', letterSpacing: '1px' }}>Content</h5>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { key: 'profile', label: '👤 Profile' },
                  { key: 'skills', label: '⚡ Skills' },
                  { key: 'projects', label: '💼 Projects' },
                  { key: 'experience', label: '🏢 Experience' },
                  { key: 'education', label: '🎓 Education' }
                ].map(t => (
                  <button key={t.key} onClick={() => setAdminTab(t.key)} className="theme-pill" style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: adminTab === t.key ? 'rgba(0, 212, 255, 0.1)' : 'none', borderColor: adminTab === t.key ? 'var(--cyan)' : 'transparent', color: '#FFF', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                    <span style={{ fontSize: '16px' }}>{t.label.split(' ')[0]}</span> {!sidebarCollapsed && <span>{t.label.split(' ')[1]}</span>}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              {!sidebarCollapsed && <h5 style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', paddingLeft: '10px', marginBottom: '8px', letterSpacing: '1px' }}>Blog & Media</h5>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { key: 'blogs', label: '📝 Blog Posts' },
                  { key: 'categories', label: '📁 Categories' },
                  { key: 'comments', label: '💬 Comments' },
                  { key: 'gallery', label: '🖼️ Gallery' },
                  { key: 'messages', label: '✉️ Messages' }
                ].map(t => (
                  <button key={t.key} onClick={() => setAdminTab(t.key)} className="theme-pill" style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: adminTab === t.key ? 'rgba(0, 212, 255, 0.1)' : 'none', borderColor: adminTab === t.key ? 'var(--cyan)' : 'transparent', color: '#FFF', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                    <span style={{ fontSize: '16px' }}>{t.label.split(' ')[0]}</span> {!sidebarCollapsed && <span>{t.label.slice(2)}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div style={{ padding: '15px 10px', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => navigateTo('portfolio', '/')} className="theme-pill" style={{ width: '100%', borderColor: 'var(--danger-color)', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', padding: '10px', fontSize: '13px' }}>
              <span>⬅</span> {!sidebarCollapsed && <span>Exit Panel</span>}
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top Header navbar */}
          <div style={{ height: '70px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', backgroundColor: '#070a13' }}>
            <h4 style={{ fontWeight: '700', fontSize: '16px', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.5px' }}>{adminTab.toUpperCase()}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '16px', cursor: 'pointer' }}>🔔</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>A</div>
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                  <strong>Ajay</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>Administrator</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Workspaces Body */}
          <div style={{ flex: 1, padding: '30px', overflowY: 'auto', backgroundColor: '#090d16' }}>
            
            {/* OVERVIEW TAB */}
            {adminTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="glass-card" style={{ padding: '30px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px rgba(99,102,241,0.25)' }}>
                  <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', fontFamily: "'Space Grotesk', sans-serif" }}>Welcome back, Ajay! 👋</h2>
                  <p style={{ fontSize: '13px', opacity: 0.85 }}>Last login: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                  <div style={{ display: 'flex', gap: '50px', marginTop: '24px' }}>
                    <div>
                      <p style={{ fontSize: '11px', opacity: 0.75, textTransform: 'uppercase' }}>Today's Visitors</p>
                      <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '2px' }}>1</h3>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', opacity: 0.75, textTransform: 'uppercase' }}>Active Chats</p>
                      <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '2px' }}>0</h3>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', opacity: 0.75, textTransform: 'uppercase' }}>Page Views</p>
                      <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '2px' }}>{dbStats?.totalViews || 384}</h3>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  {[
                    { label: 'Total Skills', val: data.Skills.length, color: 'var(--cyan)' },
                    { label: 'Total Projects', val: data.Projects.length, color: 'var(--purple)' },
                    { label: 'Timeline Milestones', val: data.Experience.length, color: 'var(--cyan)' },
                    { label: 'Contact Messages', val: dbStats?.activeChats || 0, color: 'orange' }
                  ].map((c, i) => (
                    <div key={i} className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{c.label}</p>
                      <h3 style={{ color: c.color, fontSize: '28px', marginTop: '6px', fontWeight: '800' }}>{c.val}</h3>
                    </div>
                  ))}
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                  <h5 style={{ fontSize: '14px', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>📊 Visitor Traffic Activity (Last 7 Days)</h5>
                  <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--border)' }}>
                    {(dbStats?.chartData || [45, 60, 52, 75, 90, 82, 110]).map((val, idx) => (
                      <div key={idx} style={{ width: '35px', height: `${val}%`, backgroundColor: 'var(--cyan)', borderRadius: '6px 6px 0 0', position: 'relative', minHeight: '15px' }}>
                        <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#FFF', fontWeight: '600' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 20px 0 20px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                    {(dbStats?.chartLabels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((l, i) => <span key={i}>{l}</span>)}
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE EDITOR */}
            {adminTab === 'profile' && (
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '16px' }}>
                <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', color: 'var(--cyan)' }}>Edit Bio & Profiles Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="Name" value={editName} onChange={e => setEditName(e.target.value)} className="form-control" />
                  <input type="text" placeholder="Title" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="form-control" />
                </div>
                <textarea placeholder="Description" value={editDesc} onChange={e => setEditDesc(e.target.value)} rows="4" className="form-control"></textarea>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="Email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="form-control" />
                  <input type="text" placeholder="Phone" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="form-control" />
                </div>
                <input type="text" placeholder="Address" value={editAddress} onChange={e => setEditAddress(e.target.value)} className="form-control" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="LinkedIn Link" value={editLinkedIn} onChange={e => setEditLinkedIn(e.target.value)} className="form-control" />
                  <input type="text" placeholder="GitHub Link" value={editGitHub} onChange={e => setEditGitHub(e.target.value)} className="form-control" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="Photo URL" value={editPhoto} onChange={e => setEditPhoto(e.target.value)} className="form-control" />
                  <input type="text" placeholder="Resume Document URL" value={editResumePath} onChange={e => setEditResumePath(e.target.value)} className="form-control" />
                </div>
                <button onClick={handleUpdateProfile} className="btn-primary-neon" style={{ padding: '12px' }}>💾 Save Info Changes</button>
              </div>
            )}

            {/* SKILLS MANAGER */}
            {adminTab === 'skills' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <form onSubmit={handleSaveSkill} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '12px', alignItems: 'center', borderRadius: '12px' }}>
                  <input type="text" placeholder="Skill Name (e.g. HTML5)" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} required className="form-control" style={{ flex: 3, marginBottom: 0 }} />
                  <input type="number" placeholder="Percentage (0-100)" value={newSkillPercent} onChange={e => setNewSkillPercent(e.target.value)} min="0" max="100" required className="form-control" style={{ flex: 1, marginBottom: 0 }} />
                  <button type="submit" className="btn-primary-neon" style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                    {editingSkillId ? 'Update Skill' : '+ Add Skill'}
                  </button>
                  {editingSkillId && <button type="button" onClick={() => { setEditingSkillId(null); setNewSkillName(''); setNewSkillPercent(''); }} className="theme-pill" style={{ borderColor: 'var(--text-secondary)' }}>Cancel</button>}
                </form>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--cyan)', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Skill Name</th>
                        <th style={{ padding: '12px' }}>Percentage</th>
                        <th style={{ padding: '12px' }}>Progress</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.Skills.map((sk) => (
                        <tr key={sk.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{sk.name}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{sk.percentage || sk.Percentage}%</td>
                          <td style={{ padding: '12px', width: '30%' }}>
                            <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${sk.percentage || sk.Percentage}%`, height: '100%', backgroundColor: 'var(--cyan)' }}></div>
                            </div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => { setEditingSkillId(sk.id); setNewSkillName(sk.name); setNewSkillPercent(sk.percentage || sk.Percentage); }} style={{ backgroundColor: 'var(--warning-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>📝</button>
                              <button onClick={() => handleDeleteSkill(sk.id)} style={{ backgroundColor: 'var(--danger-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PROJECTS MANAGER */}
            {adminTab === 'projects' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <form onSubmit={handleSaveProject} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '12px' }}>
                  <input type="text" placeholder="Project Name" value={newProjName} onChange={e => setNewProjName(e.target.value)} required className="form-control" />
                  <textarea placeholder="Description" value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} required rows="2" className="form-control"></textarea>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" placeholder="Live Demo URL" value={newProjLive} onChange={e => setNewProjLive(e.target.value)} className="form-control" />
                    <input type="text" placeholder="GitHub Repository URL" value={newProjGit} onChange={e => setNewProjGit(e.target.value)} className="form-control" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary-neon" style={{ flex: 1 }}>{editingProjId ? 'Update Project' : '+ Add New Project'}</button>
                    {editingProjId && <button type="button" onClick={() => { setEditingProjId(null); setNewProjName(''); setNewProjDesc(''); setNewProjLive(''); setNewProjGit(''); }} className="theme-pill" style={{ borderColor: 'var(--text-secondary)' }}>Cancel</button>}
                  </div>
                </form>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--cyan)', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Project Title</th>
                        <th style={{ padding: '12px' }}>Description</th>
                        <th style={{ padding: '12px' }}>Demo Link</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.Projects.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{p.title || p.ProjectName}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description || p.Description}</td>
                          <td style={{ padding: '12px' }}><a href={p.liveLink || p.LiveLink} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)' }}>Demo ↗</a></td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => { setEditingProjId(p.id); setNewProjName(p.title); setNewProjDesc(p.description); setNewProjLive(p.liveLink); setNewProjGit(p.githubLink); }} style={{ backgroundColor: 'var(--warning-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>📝</button>
                              <button onClick={() => handleDeleteProject(p.id)} style={{ backgroundColor: 'var(--danger-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* EXPERIENCE MANAGER */}
            {adminTab === 'experience' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <form onSubmit={handleSaveExperience} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" placeholder="Company Name" value={newExpCompany} onChange={e => setNewExpCompany(e.target.value)} required className="form-control" />
                    <input type="text" placeholder="Job Role" value={newExpRole} onChange={e => setNewExpRole(e.target.value)} required className="form-control" />
                  </div>
                  <textarea placeholder="Job Responsibilities & Description" value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} required rows="3" className="form-control"></textarea>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary-neon" style={{ flex: 1 }}>{editingExpId ? 'Update Role' : '+ Add Experience'}</button>
                    {editingExpId && <button type="button" onClick={() => { setEditingExpId(null); setNewExpCompany(''); setNewExpRole(''); setNewExpDesc(''); }} className="theme-pill" style={{ borderColor: 'var(--text-secondary)' }}>Cancel</button>}
                  </div>
                </form>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--cyan)', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Company</th>
                        <th style={{ padding: '12px' }}>Role</th>
                        <th style={{ padding: '12px' }}>Duration</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.Experience.map((exp) => (
                        <tr key={exp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{exp.company}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{exp.role}</td>
                          <td style={{ padding: '12px', color: 'var(--purple)' }}>{exp.duration}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => { setEditingExpId(exp.id); setNewExpCompany(exp.company); setNewExpRole(exp.role); setNewExpDesc(exp.desc || exp.description); }} style={{ backgroundColor: 'var(--warning-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>📝</button>
                              <button onClick={() => handleDeleteExperience(exp.id)} style={{ backgroundColor: 'var(--danger-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* EDUCATION MANAGER */}
            {adminTab === 'education' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <form onSubmit={handleSaveEducation} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" placeholder="Degree Milestones" value={newEduDegree} onChange={e => setNewEduDegree(e.target.value)} required className="form-control" />
                    <input type="text" placeholder="Institute" value={newEduInstitute} onChange={e => setNewEduInstitute(e.target.value)} required className="form-control" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" placeholder="Duration (e.g. 2020-2024)" value={newEduDuration} onChange={e => setNewEduDuration(e.target.value)} required className="form-control" />
                    <input type="text" placeholder="Aggregate Score (e.g. 82%)" value={newEduScore} onChange={e => setNewEduScore(e.target.value)} className="form-control" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary-neon" style={{ flex: 1 }}>{editingEduId ? 'Update Credentials' : '+ Add Education'}</button>
                    {editingEduId && <button type="button" onClick={() => { setEditingEduId(null); setNewEduDegree(''); setNewEduInstitute(''); setNewEduDuration(''); setNewEduScore(''); }} className="theme-pill" style={{ borderColor: 'var(--text-secondary)' }}>Cancel</button>}
                  </div>
                </form>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--cyan)', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Degree</th>
                        <th style={{ padding: '12px' }}>Institute</th>
                        <th style={{ padding: '12px' }}>Duration</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.Education.map((edu) => (
                        <tr key={edu.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{edu.degree}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{edu.institute}</td>
                          <td style={{ padding: '12px', color: 'var(--purple)' }}>{edu.duration}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => { setEditingEduId(edu.id); setNewEduDegree(edu.degree); setNewEduInstitute(edu.institute); setNewEduDuration(edu.duration); setNewEduScore(edu.score); }} style={{ backgroundColor: 'var(--warning-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>📝</button>
                              <button onClick={() => handleDeleteEducation(edu.id)} style={{ backgroundColor: 'var(--danger-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ARTICLES MANAGER */}
            {adminTab === 'blogs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <form onSubmit={handleSaveBlog} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '12px' }}>
                  <input type="text" placeholder="Article Title" value={newBlogTitle} onChange={e => setNewBlogTitle(e.target.value)} required className="form-control" />
                  <textarea placeholder="Excerpt Summary" value={newBlogExcerpt} onChange={e => setNewBlogExcerpt(e.target.value)} required rows="3" className="form-control"></textarea>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary-neon" style={{ flex: 1 }}>{editingBlogId ? 'Update Post' : '+ Add Blog Post'}</button>
                    {editingBlogId && <button type="button" onClick={() => { setEditingBlogId(null); setNewBlogTitle(''); setNewBlogExcerpt(''); }} className="theme-pill" style={{ borderColor: 'var(--text-secondary)' }}>Cancel</button>}
                  </div>
                </form>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--cyan)', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Post Title</th>
                        <th style={{ padding: '12px' }}>Summary</th>
                        <th style={{ padding: '12px' }}>Publish Date</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.Blogs.map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{b.title}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.excerpt}</td>
                          <td style={{ padding: '12px', color: 'var(--purple)' }}>{b.date}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => { setEditingBlogId(b.id); setNewBlogTitle(b.title); setNewBlogExcerpt(b.excerpt); }} style={{ backgroundColor: 'var(--warning-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>📝</button>
                              <button onClick={() => handleDeleteBlog(b.id)} style={{ backgroundColor: 'var(--danger-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CATEGORIES MANAGER */}
            {adminTab === 'categories' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <form onSubmit={handleSaveCategory} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" placeholder="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} required className="form-control" />
                    <input type="text" placeholder="Slug (lowercase, no spaces)" value={newCatSlug} onChange={e => setNewCatSlug(e.target.value)} required className="form-control" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" placeholder="Icon class (e.g. bi-laptop)" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} className="form-control" />
                    <input type="number" placeholder="Display Order" value={newCatOrder} onChange={e => setNewCatOrder(e.target.value)} className="form-control" />
                  </div>
                  <textarea placeholder="Category Description" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} rows="2" className="form-control"></textarea>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary-neon" style={{ flex: 1 }}>{editingCatId ? 'Update Category' : '+ Add Category'}</button>
                    {editingCatId && <button type="button" onClick={() => { setEditingCatId(null); setNewCatName(''); setNewCatSlug(''); setNewCatDesc(''); setNewCatIcon('bi-tag'); setNewCatOrder(0); }} className="theme-pill" style={{ borderColor: 'var(--text-secondary)' }}>Cancel</button>}
                  </div>
                </form>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--cyan)', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Category Name</th>
                        <th style={{ padding: '12px' }}>Slug</th>
                        <th style={{ padding: '12px' }}>Icon</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoriesList.map((cat) => (
                        <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{cat.name}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{cat.slug}</td>
                          <td style={{ padding: '12px', color: 'var(--purple)' }}>{cat.icon}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => { setEditingCatId(cat.id); setNewCatName(cat.name); setNewCatSlug(cat.slug); setNewCatDesc(cat.description || ''); setNewCatIcon(cat.icon || 'bi-tag'); setNewCatOrder(cat.displayOrder || 0); }} style={{ backgroundColor: 'var(--warning-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>📝</button>
                              <button onClick={() => handleDeleteCategory(cat.id)} style={{ backgroundColor: 'var(--danger-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COMMENTS MANAGER */}
            {adminTab === 'comments' && (
              <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--cyan)', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Article/Post</th>
                      <th style={{ padding: '12px' }}>Author</th>
                      <th style={{ padding: '12px' }}>Comment Text</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commentsList.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{c.postTitle}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{c.name}<br /><span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c.email}</span></td>
                        <td style={{ padding: '12px', color: '#FFF', maxWidth: '250px' }}>{c.comment}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleToggleCommentApproval(c.id, c.approved)} className="theme-pill" style={{ borderColor: c.approved ? 'var(--cyan)' : 'orange', color: c.approved ? 'var(--cyan)' : 'orange', padding: '4px 8px', fontSize: '10px' }}>
                            {c.approved ? 'Approved 🟢' : 'Pending ⏳'}
                          </button>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleDeleteComment(c.id)} style={{ backgroundColor: 'var(--danger-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* GALLERY MANAGER */}
            {adminTab === 'gallery' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <form onSubmit={handleSaveGallery} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" placeholder="Item Title" value={newGalTitle} onChange={e => setNewGalTitle(e.target.value)} required className="form-control" />
                    <select value={newGalType} onChange={e => setNewGalType(e.target.value)} className="form-control">
                      <option>Video</option>
                      <option>Image</option>
                      <option>Audio</option>
                    </select>
                  </div>
                  <input type="text" placeholder="YouTube Video URL (if Video)" value={newGalEmbed} onChange={e => setNewGalEmbed(e.target.value)} className="form-control" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" placeholder="Image File Path (if Image)" value={newGalPath} onChange={e => setNewGalPath(e.target.value)} className="form-control" />
                    <input type="text" placeholder="Category Name" value={newGalCategory} onChange={e => setNewGalCategory(e.target.value)} className="form-control" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" placeholder="Tags (comma-separated)" value={newGalTags} onChange={e => setNewGalTags(e.target.value)} className="form-control" />
                    <input type="number" placeholder="Display Order" value={newGalOrder} onChange={e => setNewGalOrder(e.target.value)} className="form-control" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <input type="checkbox" checked={newGalFeatured} onChange={e => setNewGalFeatured(e.target.checked)} />
                      Featured Item
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary-neon" style={{ flex: 1 }}>{editingGalId ? 'Update Gallery Item' : '+ Add Gallery Item'}</button>
                    {editingGalId && <button type="button" onClick={() => { setEditingGalId(null); setNewGalTitle(''); setNewGalDesc(''); setNewGalType('Video'); setNewGalPath(''); setNewGalEmbed(''); setNewGalCategory(''); setNewGalTags(''); setNewGalOrder(0); setNewGalFeatured(false); }} className="theme-pill" style={{ borderColor: 'var(--text-secondary)' }}>Cancel</button>}
                  </div>
                </form>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--cyan)', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Title</th>
                        <th style={{ padding: '12px' }}>Type</th>
                        <th style={{ padding: '12px' }}>Category</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Featured</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {galleryList.map((g) => (
                        <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{g.title}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{g.mediaType}</td>
                          <td style={{ padding: '12px', color: 'var(--purple)' }}>{g.category}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{g.isFeatured ? '⭐ Yes' : 'No'}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={() => { setEditingGalId(g.id); setNewGalTitle(g.title); setNewGalDesc(g.description || ''); setNewGalType(g.mediaType || 'Video'); setNewGalPath(g.mediaPath || ''); setNewGalEmbed(g.videoEmbedCode || ''); setNewGalCategory(g.category || ''); setNewGalTags(g.tags || ''); setNewGalOrder(g.displayOrder || 0); setNewGalFeatured(g.isFeatured || false); }} style={{ backgroundColor: 'var(--warning-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>📝</button>
                              <button onClick={() => handleDeleteGallery(g.id)} style={{ backgroundColor: 'var(--danger-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MESSAGES INBOX */}
            {adminTab === 'messages' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dbMessages && dbMessages.length > 0 ? (
                  dbMessages.map(m => (
                    <div key={m.id} className="glass-card" style={{ padding: '20px', fontSize: '13px', border: m.isRead ? '1px solid var(--border)' : '1px solid var(--purple)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{m.name} (<span style={{ color: 'var(--cyan)' }}>{m.email}</span>)</strong>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => toggleMessageRead(m.id)} className="theme-pill" style={{ borderColor: 'var(--border)', padding: '4px 8px' }}>
                            {m.isRead ? '👁️ Read' : '✉️ Mark Read'}
                          </button>
                          <button onClick={() => handleDeleteMessage(m.id)} style={{ backgroundColor: 'var(--danger-color)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}>🗑️</button>
                        </div>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Received: {m.createdDate} | Subject: {m.subject}</p>
                      <p style={{ marginTop: '12px', color: '#FFF', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.message}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>Inbox is empty.</p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '100%', overflowX: 'hidden', minHeight: '100vh', backgroundColor: 'var(--bg-dark)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Scroll Progress Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, height: '4px', background: 'linear-gradient(90deg, #00d4ff, #7c3aed)', zIndex: 99999, width: `${scrollProgress}%`, transition: 'width 0.1s ease' }}></div>
      {/* Stars Canvas Backdrop */}
      <canvas ref={canvasRef} id="hero-canvas" style={{ zIndex: 1, position: 'absolute', inset: 0, pointerEvents: 'none' }}></canvas>

      {/*  Top Navigation Bar */}
      <div className="top-menu-bar">
        <div className="top-bar-left">
          <span style={{ color: 'var(--cyan)', fontFamily: 'monospace', fontWeight: '800', fontSize: '18px', letterSpacing: '1px' }}>&lt;/&gt; AJAY KUMAR</span>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Mobile Navigation">
            <span style={{ fontSize: '20px', lineHeight: '1' }}>{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
        <div className={`top-bar-right ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ gap: '15px', alignItems: 'center' }}>
          <a href="#home" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '13px' }}>Home</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '13px' }}>About</a>
          <a href="#skills" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '13px' }}>Skills</a>
          <a href="#projects" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '13px' }}>Projects</a>
          <a href="#experience" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '13px' }}>Experience</a>
          <a href="#education" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '13px' }}>Education</a>
          <a href="#blogs" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '13px' }}>Blog</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateTo('gallery-page', '/Gallery'); }} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '13px' }}>Gallery</a>
          
          {/* Study Portal Hover Dropdown Menu */}
          <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
              Study Portal <span style={{ fontSize: '9px' }}>▼</span>
            </span>
            <div className="dropdown-content">
              <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateTo('aktu-portal', '/AktuPortal'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>📚</span> Resources Home</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateTo('aktu-upload', '/AktuPortal/Upload'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>📤</span> Upload Notes</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateTo('aktu-request', '/AktuPortal/RequestBoard'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>📣</span> Request Board</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateTo('aktu-tools', '/AktuPortal/Tools'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>🧮</span> Student Tools</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateTo('aktu-placement', '/AktuPortal/Placement'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>💼</span> Placement Prep</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateTo('aktu-ai', '/AktuPortal/AiAssistant'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>🤖</span> AI Assistant</a>
              <hr style={{ margin: '4px 0', borderColor: 'rgba(255,255,255,0.08)' }} />
              <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateTo('aktu-signin', '/AktuAuth/Login'); }} style={{ color: 'var(--cyan)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🔐</span> Sign In</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateTo('aktu-register', '/AktuAuth/Register'); }} style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><span>👤</span> Register</a>
              <hr style={{ margin: '4px 0', borderColor: 'rgba(255,255,255,0.08)' }} />
              <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateTo('admin-login', '/Admin/Login'); }} style={{ color: 'var(--warning-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🔑</span> Admin Login</a>
            </div>
          </div>

          <a href="#contact" onClick={() => setMobileMenuOpen(false)} style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '13px' }}>Contact</a>
          <input
            type="text"
            placeholder="Search..."
            className="form-control nav-search-input"
            style={{ width: '100px', padding: '4px 10px', fontSize: '11px', margin: 0, height: '28px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '14px' }}
          />
          <span className="theme-pill" style={{ padding: '4px 8px', fontSize: '11px', borderColor: 'var(--border)' }}>EN</span>
          <button onClick={() => { setMobileMenuOpen(false); navigateTo('admin-login', '/Admin/Login'); }} className="theme-pill" style={{ borderColor: 'var(--purple)', color: 'var(--purple)', whiteSpace: 'nowrap' }}>🔑 Admin Panel</button>
        </div>
      </div>

      {/* ── LANDING CONTENT PORTFOLIO BODY ── */}
      <div className="portfolio-body-container">
        
        {/* Section 1: Hero */}
        <section id="home" style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: '20px' }}>
          <div className="status-badge zigzag-float" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>🔵 Available for Opportunities</div>
          <h1 style={{ fontSize: isMobile ? '38px' : '56px', fontWeight: '800', lineHeight: 1.15, fontFamily: "'Space Grotesk', sans-serif" }}>Hi, I'm <span className="gradient-name">{data.Profile.Name}</span></h1>
          <h2 style={{ fontSize: isMobile ? '20px' : '26px', color: 'var(--purple)', minHeight: '40px', height: 'auto', lineHeight: 1.3, fontFamily: "'Space Grotesk', sans-serif" }}>I build systems as a <span style={{ textShadow: '0 0 10px var(--purple)' }}>{typingText}</span></h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', fontSize: '15px', lineHeight: 1.6 }}>{data.Profile.Description}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', width: isMobile ? '100%' : 'auto' }}>
            <button onClick={() => focusWindow('recruiter')} className="btn-primary-neon zigzag-hover" style={{ textDecoration: 'none', flex: isMobile ? '1 1 100%' : 'none', width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', backgroundColor: 'var(--warning-color)', color: '#000', border: 'none' }}>
              <span>⚡</span> Recruiter Mode (60s Summary)
            </button>
            <button onClick={() => setShowResumeModal(true)} className="btn-primary-neon zigzag-hover" style={{ flex: isMobile ? '1 1 100%' : 'none', width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', backgroundColor: 'var(--cyan)', color: '#000', border: 'none' }}>
              <span>📥</span> Download CV / Resume
            </button>
            <a href="#contact" className="btn-primary-neon zigzag-hover" style={{ textDecoration: 'none', flex: isMobile ? '1 1 100%' : 'none', width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--cyan)', background: 'none', color: 'var(--cyan)' }}>✉️ Contact Me</a>
          </div>
          {/* Social Links */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '20px', fontSize: '24px', justifyContent: isMobile ? 'center' : 'flex-start', width: '100%' }}>
            <a href={data.Profile.GitHub || 'https://github.com/Ajaykumar812'} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='var(--cyan)'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>🐙</a>
            <a href={data.Profile.LinkedIn || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='var(--cyan)'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>💼</a>
            <a href={`https://api.whatsapp.com/send?phone=91${data.Profile.Phone}&text=Hello%20Ajay`} target="_blank" rel="noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>💬</a>
            <a href={`mailto:${data.Profile.Email}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='var(--cyan)'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>✉️</a>
          </div>
        </section>

        {/* Section 2: Developer stats card grid */}
        <section id="stats" className="reveal-section" style={{ padding: '60px 0' }}>
          <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px', textAlign: 'center', borderRadius: '16px' }}>
            <div>
              <h3 style={{ fontSize: isMobile ? '28px' : '36px', color: 'var(--cyan)', fontWeight: '800' }}>{data.Projects.length}+</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Projects Showcase</p>
            </div>
            <div>
              <h3 style={{ fontSize: isMobile ? '28px' : '36px', color: 'var(--purple)', fontWeight: '800' }}>2+ Years</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Experience Timeline</p>
            </div>
            <div>
              <h3 style={{ fontSize: isMobile ? '28px' : '36px', color: 'var(--cyan)', fontWeight: '800' }}>15+</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Skills Technologies</p>
            </div>
            <div>
              <h3 style={{ fontSize: isMobile ? '28px' : '36px', color: 'var(--purple)', fontWeight: '800' }}>{dbStats?.totalViews || 384}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Visits Count</p>
            </div>
          </div>
        </section>

        {/* Section 3: About biography */}
        <section id="about" className="reveal-section" style={{ padding: '80px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.5fr', gap: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '180px', height: '180px', borderRadius: '24px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>👨‍💻</div>
            </div>
            <div style={{ textAlign: isMobile ? 'center' : 'left', display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' }}>
              <h3 style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '2px' }}>Biography</h3>
              <h2 style={{ fontSize: isMobile ? '28px' : '36px', margin: '6px 0 20px 0', fontFamily: "'Space Grotesk', sans-serif" }}>About Me</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '14px', marginBottom: '20px' }}>
                I am a Software Developer and AI/ML enthusiast pursuing Computer Science and Artificial Intelligence. I develop backend API networks in C# and Python while designing relational schemas in SQL Server.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', fontSize: '13px', width: '100%', textAlign: isMobile ? 'center' : 'left' }}>
                <p>📚 <strong>University</strong>: AKTU, Lucknow</p>
                <p>🌍 <strong>Languages</strong>: English, Hindi</p>
                <p>📧 <strong>Email</strong>: {data.Profile.Email}</p>
                <p>📞 <strong>Phone</strong>: +91 {data.Profile.Phone}</p>
              </div>
              <button onClick={() => setShowResumeModal(true)} className="btn-primary-neon" style={{ marginTop: '20px', width: isMobile ? '100%' : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px' }}>
                <span>📥</span> Download Full CV / Resume
              </button>
            </div>
          </div>

          {/* Objective & Learning cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginTop: '30px' }}>
            <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--cyan)', borderRadius: '14px' }}>
              <h4 style={{ color: '#FFF', marginBottom: '8px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🎯</span> Objective</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>Deploy high-performance REST APIs & enterprise scale database architectures.</p>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--purple)', borderRadius: '14px' }}>
              <h4 style={{ color: '#FFF', marginBottom: '8px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📖</span> Current Learning</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>AWS Cloud Architect, Docker & Kubernetes Containers Orchestration.</p>
            </div>
          </div>
        </section>

        {/* Section 4: Skills ratings toolbox */}
        <section id="skills" className="reveal-section" style={{ padding: '80px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '2px' }}>Tech Toolbox</span>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', margin: '6px 0 10px 0', fontFamily: "'Space Grotesk', sans-serif" }}>Skills & Ratings</h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--cyan)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
            {/* Frontend */}
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <h5 style={{ color: 'var(--cyan)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>🖥️ Frontend</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>HTML5</span> {renderStars(getSkillPercent('HTML5', 100))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>CSS3</span> {renderStars(getSkillPercent('CSS3', 90))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bootstrap</span> {renderStars(getSkillPercent('Bootstrap', 100))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>JavaScript</span> {renderStars(getSkillPercent('JavaScript', 85))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>jQuery</span> {renderStars(getSkillPercent('jQuery', 80))}</li>
              </ul>
            </div>

            {/* Backend */}
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <h5 style={{ color: 'var(--purple)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>⚙️ Backend</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>ASP.NET Core</span> {renderStars(getSkillPercent('ASP.NET Core', 100))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>ASP.NET MVC</span> {renderStars(getSkillPercent('ASP.NET MVC', 100))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>C# Language</span> {renderStars(getSkillPercent('C#', 90))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>FastAPI</span> {renderStars(getSkillPercent('FastAPI', 80))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>REST APIs</span> {renderStars(getSkillPercent('REST APIs', 95))}</li>
              </ul>
            </div>

            {/* Database & Cloud */}
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <h5 style={{ color: '#10b981', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>💾 Database</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>SQL Server</span> {renderStars(getSkillPercent('SQL Server', 100))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>MySQL</span> {renderStars(getSkillPercent('MySQL', 80))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>IIS Deploy</span> {renderStars(getSkillPercent('IIS Deploy', 80))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>AWS Cloud</span> {renderStars(getSkillPercent('AWS Cloud', 40))}</li>
              </ul>
            </div>

            {/* Tools */}
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <h5 style={{ color: 'var(--warning-color)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>🛠️ Tools</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Git & GitHub</span> {renderStars(getSkillPercent('Git & GitHub', 100))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Visual Studio</span> {renderStars(getSkillPercent('Visual Studio', 100))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>VS Code</span> {renderStars(getSkillPercent('VS Code', 90))}</li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Postman API</span> {renderStars(getSkillPercent('Postman API', 95))}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4b: Professional Services */}
        <section id="services" className="reveal-section" style={{ padding: '80px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '2px' }}>What I Offer</span>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', margin: '6px 0 10px 0', fontFamily: "'Space Grotesk', sans-serif" }}>Professional Services</h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--cyan)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { icon: '🌐', title: 'Web Development', desc: 'Responsive ASP.NET MVC and Core portal system designs built for enterprise scalability.', color: 'var(--cyan)' },
              { icon: '🔗', title: 'API Development', desc: 'FastAPI & Web API endpoints protected with JWT authorization tokens and clean Swagger documentation.', color: 'var(--warning-color)' },
              { icon: '💾', title: 'Database Design', desc: 'Advanced relational schema mappings, index optimization, and connection pool management.', color: '#10b981' },
              { icon: '🐛', title: 'Bug Fixing', desc: 'Resolving complex runtime exceptions, memory leaks, and model mapping synchronization issues.', color: '#ef4444' },
              { icon: '⚡', title: 'SQL Optimization', desc: 'Improving database transaction execution times, indexing tables, and refining nested query procedures.', color: '#3b82f6' },
              { icon: '🔄', title: 'Full Stack Integration', desc: 'Coordinating asynchronous backend loops with interactive frontend dashboard reporting systems.', color: 'var(--warning-color)' }
            ].map((svc, i) => (
              <div key={i} className="glass-card" style={{ padding: '24px', textAlign: 'center', borderRadius: '16px' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>{svc.icon}</div>
                <h4 style={{ color: '#FFF', fontFamily: "'Space Grotesk', sans-serif", fontSize: '17px', marginBottom: '8px' }}>{svc.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{svc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4c: Live API Endpoint Tester */}
        <section id="api-tester" className="reveal-section" style={{ padding: '80px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '2px' }}>Interactive API Playground</span>
            <h2 style={{ fontSize: '36px', margin: '6px 0 10px 0', fontFamily: "'Space Grotesk', sans-serif" }}>Live API Endpoint Tester</h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--cyan)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>
          <div className="glass-card" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', borderRadius: '16px' }}>
            <div>
              <h5 style={{ color: 'var(--warning-color)', marginBottom: '12px' }}>Select Endpoint</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { method: 'GET', path: '/api/hospital/doctors' },
                  { method: 'POST', path: '/api/auth/token' },
                  { method: 'GET', path: '/api/village/stats' }
                ].map((ep, i) => (
                  <button key={i} onClick={() => { setApiMethod(ep.method); setApiUrl(ep.path); }} style={{ background: apiUrl === ep.path ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: '#FFF', cursor: 'pointer', textAlign: 'left', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', backgroundColor: ep.method === 'GET' ? '#10b981' : '#f59e0b', color: '#000' }}>{ep.method}</span>
                    {ep.path}
                  </button>
                ))}
              </div>
              <button onClick={() => {
                const responses = {
                  '/api/hospital/doctors': JSON.stringify({status:200,data:[{id:1,name:'Dr. Sharma',specialty:'Cardiology'},{id:2,name:'Dr. Gupta',specialty:'Neurology'}]}, null, 2),
                  '/api/auth/token': JSON.stringify({status:200,token:'eyJhbGciOiJIUzI1...',expires_in:3600,type:'Bearer'}, null, 2),
                  '/api/village/stats': JSON.stringify({status:200,total_villages:145,population:234500,districts:12}, null, 2)
                };
                setApiResponse(`HTTP/1.1 200 OK\nContent-Type: application/json\n\n${responses[apiUrl] || '{}'}`)
              }} className="btn-primary-neon" style={{ marginTop: '16px' }}>▶ Send Request</button>
            </div>
            <div>
              <h5 style={{ color: 'var(--warning-color)', marginBottom: '12px' }}>Execution Console</h5>
              <div style={{ backgroundColor: '#000', padding: '16px', borderRadius: '10px', fontFamily: 'monospace', fontSize: '12px', color: '#10b981', minHeight: '200px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Method: <span style={{ color: '#FFF' }}>{apiMethod || '--'}</span></div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>URL: <span style={{ color: '#FFF' }}>{apiUrl || '--'}</span></div>
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, color: '#10b981' }}>{apiResponse || 'Select an endpoint and click Send Request to test simulated JSON responses.'}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4d: Before vs After Showcase */}
        <section id="before-after" className="reveal-section" style={{ padding: '80px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '2px' }}>Evolution of Architecture</span>
            <h2 style={{ fontSize: '36px', margin: '6px 0 10px 0', fontFamily: "'Space Grotesk', sans-serif" }}>Before vs After Showcase</h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--cyan)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' }}>
            <div>
              <h5 style={{ color: '#FFF', fontFamily: "'Space Grotesk', sans-serif" }}>UI Evolution & Modernization</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.7 }}>This slider represents our portfolio refactoring journey: moving from a flat, basic Bootstrap layout to the premium glassmorphism Apple/Microsoft inspired layout.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span className="theme-pill" style={{ borderColor: '#ef4444', color: '#ef4444', padding: '4px 12px', fontSize: '11px' }}>Before: Plain CSS</span>
                <span className="theme-pill" style={{ borderColor: '#10b981', color: '#10b981', padding: '4px 12px', fontSize: '11px' }}>After: Acrylic Blur & Canvas</span>
              </div>
            </div>
            <div style={{ position: 'relative', height: '250px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1e3a8a 0%, #581c87 100%)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '24px', color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>AFTER (Premium Acrylic Fluid UI)</div>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '24px', color: '#ef4444', fontWeight: 'bold', fontSize: '16px', borderRight: '2px solid #FFF', zIndex: 2 }}>BEFORE (Static Table UI)</div>
            </div>
          </div>
        </section>

        {/* Section 5: Experience Timeline */}
        <section id="experience" className="reveal-section" style={{ padding: '80px 0' }}>
          <h2 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '50px', fontFamily: "'Space Grotesk', sans-serif" }}>Experience Milestones</h2>
          <div className="timeline">
            {data.Experience.map((exp, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot"></div>
                <p style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 'bold' }}>📅 {exp.duration}</p>
                <div className="timeline-content" style={{ marginTop: '8px' }}>
                  <h4>{exp.role}</h4>
                  <h5 style={{ color: 'var(--purple)', margin: '4px 0 10px 0' }}>{exp.company}</h5>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Projects showcase */}
        <section id="projects" className="reveal-section" style={{ padding: '80px 0' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '36px', textAlign: 'center', marginBottom: '40px', fontFamily: "'Space Grotesk', sans-serif" }}>Projects Showcases</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
            {data.Projects.map((proj, idx) => (
              <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ color: 'var(--cyan)', fontFamily: "'Space Grotesk', sans-serif" }}>{proj.title || proj.ProjectName}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>{proj.description || proj.Description}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <a href={proj.liveLink || proj.LiveLink} target="_blank" rel="noreferrer" className="btn-primary-neon" style={{ flex: 1, padding: '8px', fontSize: '12px', textAlign: 'center', textDecoration: 'none' }}>Live Demo</a>
                  <a href={proj.githubLink || proj.GitHubLink} target="_blank" rel="noreferrer" className="btn-primary-neon" style={{ flex: 1, padding: '8px', fontSize: '12px', textAlign: 'center', textDecoration: 'none', background: 'none', border: '1px solid var(--cyan)', color: 'var(--cyan)' }}>Code</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Education */}
        <section id="education" className="reveal-section" style={{ padding: '80px 0' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '36px', textAlign: 'center', marginBottom: '40px', fontFamily: "'Space Grotesk', sans-serif" }}>Education Credentials</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
            {data.Education.map((edu, idx) => (
              <div key={idx} className="glass-card" style={{ borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ color: 'var(--cyan)', fontSize: '18px', fontFamily: "'Space Grotesk', sans-serif" }}>{edu.degree}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{edu.institute} | {edu.duration}</p>
                <p style={{ fontSize: '12px', color: 'var(--purple)', fontWeight: 'bold', marginTop: '4px' }}>{edu.score}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7b: Learning Journey */}
        <section id="learning-journey" className="reveal-section" style={{ padding: '80px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '2px' }}>Knowledge Timeline</span>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', margin: '6px 0 10px 0', fontFamily: "'Space Grotesk', sans-serif" }}>Learning Journey</h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--cyan)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { year: '2023', title: 'HTML & CSS', desc: 'Front-end layout structures, grid styles, responsive views.', color: 'var(--cyan)' },
              { year: '2024', title: 'ASP.NET MVC', desc: 'Model-View-Controller framework, Razor syntax, ADO.NET.', color: '#10b981' },
              { year: '2025', title: 'ASP.NET Core', desc: 'Modern REST APIs, dependency injection, entity framework core.', color: 'var(--warning-color)' },
              { year: '2026', title: 'FastAPI & AI/ML', desc: 'Machine learning pipelines, FastAPI routers, data processing.', color: '#ef4444' }
            ].map((j, i) => (
              <div key={i} className="glass-card" style={{ padding: '20px', textAlign: 'center', borderRadius: '16px' }}>
                <h6 style={{ color: j.color, fontSize: '14px', marginBottom: '6px' }}>{j.year}</h6>
                <h5 style={{ color: '#FFF', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '8px' }}>{j.title}</h5>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{j.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7c: GitHub Contribution Calendar */}
        <section id="github" className="reveal-section" style={{ padding: '80px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '2px' }}>Real-time Activity</span>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', margin: '6px 0 10px 0', fontFamily: "'Space Grotesk', sans-serif" }}>GitHub Contribution Calendar</h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--cyan)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', overflowX: 'auto' }}>
            <h5 style={{ color: 'var(--warning-color)', marginBottom: '16px' }}>🐙 Activity Tracker (Ajaykumar812)</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '4px', marginBottom: '12px', minWidth: '300px' }}>
              {Array.from({length: 168}, (_, i) => {
                const levels = ['#21262d', '#0e4429', '#006d32', '#26a641', '#39d353'];
                const level = [0,0,0,1,0,2,0,0,1,3,0,0,4,1,0,0,2,0,1,0,3,0,0,1,0,2,4,0,1,0,0,3,0,1,2,0,0,1,0,4,0,2,0,0,1,3,0,0,1,0,2,0,1,0,4,0,0,3,1,0,2,0,0,1,0,4,2,0,1,3,0,0,1,0,2,0,4,0,1,0,3,0,0,2,1,0,0,4,0,1,2,0,3,0,0,1,0,2,4,0,1,3,0,0,2,0,1,0,4,0,0,3,1,0,2,0,0,1,4,0,2,0,3,0,1,0,0,2,0,4,1,0,3,0,0,2,1,0,4,0,0,1,3,0,2,0,1,0,0,4,2,0,1,3,0,0,2,0,1,4,0,0,3,1,0,2,0,1][i] || 0;
                return <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: levels[level] }}></div>;
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
              <span>Less</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {['#21262d', '#0e4429', '#006d32', '#26a641', '#39d353'].map((c, i) => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: c }}></div>)}
              </div>
              <span>More</span>
            </div>
          </div>
        </section>

        {/* Section 7d: Achievements & Certificates */}
        <section id="achievements" className="reveal-section" style={{ padding: '80px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '2px' }}>Awards & Certifications</span>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', margin: '6px 0 10px 0', fontFamily: "'Space Grotesk', sans-serif" }}>Achievements Wall</h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--cyan)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏆</div>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FFF' }}>Best Student Award</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Honored for academic excellence and technical projects contribution within CSE (AI/ML).</p>
            </div>
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎖️</div>
              <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FFF' }}>Outstanding Performance Award</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Awarded for successfully integrating REST databases and APIs under active development cycles.</p>
            </div>
          </div>
          <h4 style={{ textAlign: 'center', color: 'var(--warning-color)', marginBottom: '20px', fontFamily: "'Space Grotesk', sans-serif" }}>Verified Certifications</h4>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { title: 'Python AI & Machine Learning Foundations', issuer: 'DeepLearning.AI' },
              { title: 'ASP.NET Core MVC & Web API Development', issuer: 'Microsoft / Coursera' },
              { title: 'Advanced SQL Server Database Administration', issuer: 'Udemy' }
            ].map((cert, i) => (
              <div key={i} className="glass-card" style={{ padding: '20px', textAlign: 'center', borderRadius: '16px' }}>
                <div style={{ fontSize: '32px', color: 'var(--cyan)', marginBottom: '10px' }}>📜</div>
                <h5 style={{ color: '#FFF', fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', marginBottom: '6px' }}>{cert.title}</h5>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Issued by {cert.issuer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7e: Testimonials */}
        <section id="testimonials" className="reveal-section" style={{ padding: '80px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '2px' }}>Reviews & Feedbacks</span>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', margin: '6px 0 10px 0', fontFamily: "'Space Grotesk', sans-serif" }}>Testimonials</h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--cyan)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>
          <div className="glass-card" style={{ padding: isMobile ? '24px' : '40px', textAlign: 'center', borderRadius: '16px', maxWidth: '700px', margin: '0 auto' }}>
            <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
              {testimonialIndex === 0 ? '"Ajay is an excellent API developer. He delivered clean and fast endpoints with JWT security configurations."' : '"Outstanding dedication to stored procedures optimization and backend reliability. A solid full stack candidate."'}
            </p>
            <h5 style={{ color: 'var(--warning-color)', fontFamily: "'Space Grotesk', sans-serif" }}>
              {testimonialIndex === 0 ? 'Tech Lead, Summer Internships' : 'Academic Mentor, B.Tech CSE'}
            </h5>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setTestimonialIndex(0)} style={{ width: '10px', height: '10px', borderRadius: '50%', border: 'none', backgroundColor: testimonialIndex === 0 ? 'var(--cyan)' : 'var(--border)', cursor: 'pointer' }}></button>
              <button onClick={() => setTestimonialIndex(1)} style={{ width: '10px', height: '10px', borderRadius: '50%', border: 'none', backgroundColor: testimonialIndex === 1 ? 'var(--cyan)' : 'var(--border)', cursor: 'pointer' }}></button>
            </div>
          </div>
        </section>

        {/* Section 7f: Study & Resources Portal */}
        <section id="study" className="reveal-section" style={{ padding: '80px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--cyan)', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '2px' }}>AKTU Study Portal</span>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', margin: '6px 0 10px 0', fontFamily: "'Space Grotesk', sans-serif" }}>Resources & Study Centre</h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--cyan)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📚</div>
              <h4 style={{ color: '#FFF', fontSize: '17px', marginBottom: '8px' }}>Resources Home</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Access verified AKTU B.Tech lecture notes, previous year question papers, and lab manuals organized by semesters.</p>
              <button className="btn-primary-neon" style={{ marginTop: '14px', padding: '8px', fontSize: '12px' }} onClick={() => alert('Opening AKTU Resources Library...')}>View Notes Library</button>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📤</div>
              <h4 style={{ color: '#FFF', fontSize: '17px', marginBottom: '8px' }}>Upload Notes</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Share your hand-written notes or digital study materials to help fellow peers across AKTU colleges.</p>
              <button className="btn-primary-neon" style={{ marginTop: '14px', padding: '8px', fontSize: '12px', background: 'none', border: '1px solid var(--cyan)', color: 'var(--cyan)' }} onClick={() => alert('Please sign in to upload resources.')}>Upload Document</button>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📣</div>
              <h4 style={{ color: '#FFF', fontSize: '17px', marginBottom: '8px' }}>Request Board</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Can't find a paper or syllabus topic? Submit a request here and peers or administrators will upload it.</p>
              <button className="btn-primary-neon" style={{ marginTop: '14px', padding: '8px', fontSize: '12px' }} onClick={() => alert('Opening Request Board...')}>Submit Request</button>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧮</div>
              <h4 style={{ color: '#FFF', fontSize: '17px', marginBottom: '8px' }}>Student Tools</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Try the SGPA to CGPA calculators, syllabus trackers, and assignment planners tailored for AKTU curriculum.</p>
              <button className="btn-primary-neon" style={{ marginTop: '14px', padding: '8px', fontSize: '12px' }} onClick={() => alert('Launching Calculators Suite...')}>Launch Tools</button>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>💼</div>
              <h4 style={{ color: '#FFF', fontSize: '17px', marginBottom: '8px' }}>Placement Prep</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Mock coding tests, interview cheat sheets, DSA cheat sheets, and placement guidelines for CSE (AI/ML).</p>
              <button className="btn-primary-neon" style={{ marginTop: '14px', padding: '8px', fontSize: '12px', background: 'none', border: '1px solid var(--cyan)', color: 'var(--cyan)' }} onClick={() => alert('Opening Placement Preparation Hub...')}>Start Prep</button>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🤖</div>
              <h4 style={{ color: '#FFF', fontSize: '17px', marginBottom: '8px' }}>AI Study Assistant</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Stuck on a problem or formula? Ask the AI Assistant widget inside the macOS dock launcher.</p>
              <button className="btn-primary-neon" style={{ marginTop: '14px', padding: '8px', fontSize: '12px' }} onClick={() => focusWindow('chat')}>Ask AI Assistant</button>
            </div>
          </div>
        </section>

        {/* Section 8: Blogs */}
        <section id="blogs" className="reveal-section" style={{ padding: '80px 0' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '36px', textAlign: 'center', marginBottom: '40px', fontFamily: "'Space Grotesk', sans-serif" }}>Articles & Blog Posts</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
            {data.Blogs.map((b, idx) => (
              <div key={idx} className="glass-card" style={{ borderRadius: '16px', padding: '20px' }}>
                <p style={{ fontSize: '11px', color: 'var(--cyan)' }}>📅 {b.date} | {b.readTime}</p>
                <h4 style={{ margin: '8px 0', color: '#FFF', fontFamily: "'Space Grotesk', sans-serif" }}>{b.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{b.excerpt}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 8.5: Gallery */}
        <section id="gallery" className="reveal-section" style={{ padding: '80px 0' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '36px', textAlign: 'center', marginBottom: '40px', fontFamily: "'Space Grotesk', sans-serif" }}>Media Gallery</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
            {galleryList.map((item, idx) => (
              <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderRadius: '16px', padding: '20px' }}>
                {item.videoEmbedCode ? (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
                    <iframe
                      src={item.videoEmbedCode.replace('watch?v=', 'embed/').split('&')[0]}
                      title={item.title}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div style={{ height: '180px', overflow: 'hidden', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '40px' }}>🖼️</span>
                  </div>
                )}
                <h4 style={{ color: 'var(--cyan)', marginTop: '8px', fontFamily: "'Space Grotesk', sans-serif" }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{item.description}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="theme-pill" style={{ fontSize: '10px', padding: '2px 8px' }}>{item.category}</span>
                  {item.tags && item.tags.split(',').map((t, i) => (
                    <span key={i} className="theme-pill" style={{ fontSize: '10px', padding: '2px 8px', borderColor: 'var(--purple)', color: 'var(--purple)' }}>{t.trim()}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 9: Contact */}
        <section id="contact" className="reveal-section" style={{ padding: '80px 0' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '36px', textAlign: 'center', marginBottom: '30px', fontFamily: "'Space Grotesk', sans-serif" }}>Get In Touch</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1fr', gap: '20px' }}>
            <form onSubmit={handleSendContact} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderRadius: '16px', padding: isMobile ? '20px' : '28px' }}>
              {formStatus && (
                <div style={{ padding: '10px', border: '1px solid var(--cyan)', borderRadius: '8px', color: 'var(--cyan)', fontSize: '13px' }}>{formStatus.text}</div>
              )}
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '14px' }}>
                <input type="text" placeholder="Your Name *" value={contactName} onChange={e => setContactName(e.target.value)} required className="form-control" style={{ marginBottom: 0 }} />
                <input type="email" placeholder="Your Email *" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required className="form-control" style={{ marginBottom: 0 }} />
              </div>
              <input type="text" placeholder="Subject" value={contactSubject} onChange={e => setContactSubject(e.target.value)} className="form-control" style={{ marginBottom: 0 }} />
              <textarea placeholder="Message Body *" value={contactMessage} onChange={e => setContactMessage(e.target.value)} required rows="4" className="form-control" style={{ marginBottom: 0, resize: 'none' }}></textarea>
              <button type="submit" className="btn-primary-neon" style={{ padding: '12px' }}>✉️ Send Message</button>
            </form>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '16px', padding: isMobile ? '20px' : '28px', textAlign: isMobile ? 'center' : 'left', wordBreak: 'break-word' }}>
              <h4 style={{ color: 'var(--cyan)', fontFamily: "'Space Grotesk', sans-serif" }}>Direct Connect:</h4>
              <p style={{ fontSize: '13px' }}>📧 <strong>Email</strong>:<br /><span style={{ color: 'var(--text-secondary)' }}>{data.Profile.Email}</span></p>
              <p style={{ fontSize: '13px' }}>📞 <strong>Phone / WhatsApp</strong>:<br /><span style={{ color: 'var(--text-secondary)' }}>+91 {data.Profile.Phone}</span></p>
              <p style={{ fontSize: '13px' }}>📍 <strong>Address</strong>:<br /><span style={{ color: 'var(--text-secondary)' }}>{data.Profile.Address}</span></p>
              
              <a
                href={`https://api.whatsapp.com/send?phone=91${data.Profile.Phone || '7318104815'}&text=${encodeURIComponent("Hello Ajay, I saw your Portfolio website and wanted to connect!")}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary-neon"
                style={{
                  backgroundColor: '#25D366',
                  color: '#FFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '10px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  padding: '12px'
                }}
              >
                <span style={{ fontSize: '18px' }}>💬</span> Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* ── FULL FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: isMobile ? '40px 20px 30px' : '60px 40px 30px', color: 'var(--text-secondary)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1.5fr 1.5fr', gap: '24px' }}>
          <div>
            <h5 style={{ color: '#FFF', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>⌨️ AJAY KUMAR</h5>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{data.Profile.Description?.substring(0, 150)}...</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <a href={data.Profile.GitHub || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '18px', textDecoration: 'none' }}>🐙</a>
              <a href={data.Profile.LinkedIn || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '18px', textDecoration: 'none' }}>💼</a>
              <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '18px', textDecoration: 'none' }}>🐦</a>
              <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '18px', textDecoration: 'none' }}>📸</a>
            </div>
          </div>
          <div>
            <h5 style={{ color: '#FFF', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>Quick Links</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <a href="#home" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</a>
              <a href="#about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About</a>
              <a href="#skills" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Skills</a>
              <a href="#projects" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Projects</a>
              <a href="#blogs" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Blog</a>
            </div>
          </div>
          <div>
            <h5 style={{ color: '#FFF', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>Contact Info</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <p>📍 {data.Profile.Address}</p>
              <p>📞 +91 {data.Profile.Phone}</p>
              <p>✉️ {data.Profile.Email}</p>
            </div>
          </div>
          <div>
            <h5 style={{ color: '#FFF', marginBottom: '16px', fontFamily: "'Space Grotesk', sans-serif" }}>Newsletter</h5>
            <p style={{ fontSize: '13px', marginBottom: '12px' }}>Subscribe for latest updates</p>
            <div style={{ display: 'flex', gap: '0' }}>
              <input type="email" placeholder="Your Email" style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '8px 12px', color: '#FFF', fontSize: '12px', outline: 'none' }} />
              <button className="btn-primary-neon" style={{ borderRadius: '0 8px 8px 0', padding: '8px 16px', width: 'auto' }}>📩</button>
            </div>
          </div>
        </div>
        <hr style={{ borderColor: 'var(--border)', margin: '30px 0 16px' }} />
        <p style={{ textAlign: 'center', fontSize: '12px' }}>© {new Date().getFullYear()} AJAY KUMAR. All rights reserved.</p>
      </footer>

      {/* Floating WhatsApp Quick Chat Button */}
      <a
        href={`https://api.whatsapp.com/send?phone=91${data.Profile.Phone || '7318104815'}&text=${encodeURIComponent("Hello Ajay, I came across your portfolio website and would like to connect!")}`}
        target="_blank"
        rel="noreferrer"
        title="Chat on WhatsApp"
        style={{
          position: 'fixed',
          bottom: scrollProgress > 20 ? '145px' : '90px',
          right: '20px',
          zIndex: 9999,
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 18px rgba(37, 211, 102, 0.5), 0 0 12px rgba(37, 211, 102, 0.4)',
          textDecoration: 'none',
          transition: 'all 0.3s ease'
        }}
      >
        💬
      </a>

      {/* Back to Top Button */}
      {scrollProgress > 20 && (
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} style={{ position: 'fixed', bottom: '90px', right: '20px', zIndex: 9999, width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--cyan)', border: 'none', color: '#000', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,212,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⬆</button>
      )}

      {/* ── MAC OS WINDOW 1: DEVELOPER TERMINAL ── */}
      <OSPanel
        id="terminal"
        title="🖥️ guest@ajay-portfolio:~$ (Terminal CLI)"
        isOpen={windows.terminal.isOpen}
        isMinimized={windows.terminal.isMinimized}
        isMaximized={windows.terminal.isMaximized}
        activeWindow={activeWindow}
        zIndex={windows.terminal.zIndex}
        onHeaderClick={focusWindow}
        onClose={closeWindow}
        onMinimize={minimizeWindow}
        onMaximize={toggleMaximize}
        defaultPosition={{ x: 80, y: 100 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0A0E17', color: '#38bdf8', padding: '16px', fontFamily: 'monospace', fontSize: '13px' }}>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
            {terminalLog.map((log, i) => (
              <div key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: '8px', color: log.type === 'input' ? 'var(--cyan)' : '#e6edf3' }}>
                {log.text}
              </div>
            ))}
            <div ref={terminalEndRef}></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
            <span style={{ color: 'var(--purple)', marginRight: '6px', fontWeight: 'bold' }}>guest@ajay-portfolio:~$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={e => setTerminalInput(e.target.value)}
              onKeyDown={handleTerminalSubmit}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#FFF', fontFamily: 'monospace', fontSize: '13px' }}
            />
          </div>
        </div>
      </OSPanel>

      {/* ── MAC OS WINDOW 2: HTML LIVE CODE EDITOR ── */}
      <OSPanel
        id="playground"
        title="💻 HTML/CSS Live Sandbox Playground"
        isOpen={windows.playground.isOpen}
        isMinimized={windows.playground.isMinimized}
        isMaximized={windows.playground.isMaximized}
        activeWindow={activeWindow}
        zIndex={windows.playground.zIndex}
        onHeaderClick={focusWindow}
        onClose={closeWindow}
        onMinimize={minimizeWindow}
        onMaximize={toggleMaximize}
        defaultPosition={{ x: 120, y: 110 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h5 style={{ color: 'var(--cyan)' }}>HTML/CSS Editor:</h5>
            <textarea
              value={htmlCode}
              onChange={e => setHtmlCode(e.target.value)}
              style={{ flex: 1, backgroundColor: '#070a13', color: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '12px', outline: 'none', resize: 'none' }}
            ></textarea>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h5 style={{ color: 'var(--purple)' }}>Result Rendering:</h5>
            <div style={{ flex: 1, backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <iframe
                ref={iframeRef}
                srcDoc={htmlCode}
                title="Playground Preview"
                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#FFF' }}
              ></iframe>
            </div>
          </div>
        </div>
      </OSPanel>

      {/* ── MAC OS WINDOW 3: MEETING SCHEDULER ── */}
      <OSPanel
        id="scheduler"
        title="📅 Meeting Booking Console"
        isOpen={windows.scheduler.isOpen}
        isMinimized={windows.scheduler.isMinimized}
        isMaximized={windows.scheduler.isMaximized}
        activeWindow={activeWindow}
        zIndex={windows.scheduler.zIndex}
        onHeaderClick={focusWindow}
        onClose={closeWindow}
        onMinimize={minimizeWindow}
        onMaximize={toggleMaximize}
        defaultPosition={{ x: 160, y: 130 }}
      >
        <form onSubmit={handleBookMeeting} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4>Book a Video Connection Meeting</h4>
          <input type="text" placeholder="Recruiter / Client Name *" value={bookName} onChange={e => setBookName(e.target.value)} required className="form-control" />
          <input type="email" placeholder="Business Email *" value={bookEmail} onChange={e => setBookEmail(e.target.value)} required className="form-control" />
          <input type="text" placeholder="Company Name" value={bookCompany} onChange={e => setBookCompany(e.target.value)} className="form-control" />
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="date" required value={bookDate} onChange={e => setBookDate(e.target.value)} className="form-control" style={{ flex: 1 }} />
            <select value={bookTime} onChange={e => setBookTime(e.target.value)} className="form-control" style={{ flex: 1, backgroundColor: 'var(--bg-surface)' }}>
              <option>10:00 AM - 10:30 AM</option>
              <option>02:00 PM - 02:30 PM</option>
              <option>04:00 PM - 04:30 PM</option>
            </select>
          </div>
          <textarea placeholder="Optional notes..." value={bookNotes} onChange={e => setBookNotes(e.target.value)} rows="2" className="form-control"></textarea>
          <button type="submit" className="btn-primary-neon">Request Slot</button>
        </form>
      </OSPanel>

      {/* ── MAC OS WINDOW 4: RECRUITER 60S SUMMARY ── */}
      <OSPanel
        id="recruiter"
        title="💼 Recruiter Hub (60 Seconds Summary)"
        isOpen={windows.recruiter.isOpen}
        isMinimized={windows.recruiter.isMinimized}
        isMaximized={windows.recruiter.isMaximized}
        activeWindow={activeWindow}
        zIndex={windows.recruiter.zIndex}
        onHeaderClick={focusWindow}
        onClose={closeWindow}
        onMinimize={minimizeWindow}
        onMaximize={toggleMaximize}
        defaultPosition={{ x: 200, y: 90 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ color: 'var(--cyan)' }}>Ajay Kumar — Executive Resume Overview</h4>
          <div style={{ borderLeft: '3px solid var(--purple)', paddingLeft: '16px', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            "I pursue Computer Science and AI/ML model integrations. I develop backend REST APIs in C# ASP.NET Core, Python FastAPI, and host database networks inside optimized SQL Server schemas."
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
            <p>📁 <strong>{data.Projects.length}+ Complete Projects</strong></p>
            <p>⚡ <strong>Primary Stack</strong>: C#, SQL Server, FastAPI</p>
            <p>📍 <strong>Location</strong>: Gurugram, India</p>
            <p>✉️ <strong>Direct Contact</strong>: ajaykumar737905@gmail.com</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => window.open(data.Profile.LinkedIn || '#', '_blank')} className="btn-primary-neon" style={{ flex: 1 }}>Connect on LinkedIn</button>
            <button onClick={() => setShowResumeModal(true)} className="btn-primary-neon" style={{ flex: 1, background: 'none', border: '1px solid var(--cyan)', color: 'var(--cyan)' }}>📥 Download Resume</button>
          </div>
        </div>
      </OSPanel>

      {/* ── MAC OS WINDOW 5: AI CHAT ASSISTANT ── */}
      <OSPanel
        id="chat"
        title="💬 AI Chatbot Assistant"
        isOpen={windows.chat.isOpen}
        isMinimized={windows.chat.isMinimized}
        isMaximized={windows.chat.isMaximized}
        activeWindow={activeWindow}
        zIndex={windows.chat.zIndex}
        onHeaderClick={focusWindow}
        onClose={closeWindow}
        onMinimize={minimizeWindow}
        onMaximize={toggleMaximize}
        defaultPosition={{ x: 280, y: 150 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '13px', overflowY: 'auto', border: '1px solid var(--border)', marginBottom: '10px' }}>
            {chatLog.map((chat, idx) => (
              <div key={idx} style={{ marginBottom: '10px', textAlign: chat.sender === 'user' ? 'right' : 'left' }}>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: chat.sender === 'user' ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.05)',
                  color: chat.sender === 'user' ? 'var(--cyan)' : '#FFF',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  fontSize: '12px',
                  border: '1px solid var(--border)'
                }}>
                  {chat.text}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Ask me something about Ajay..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="form-control"
              style={{ marginBottom: 0 }}
            />
            <button type="submit" className="btn-primary-neon" style={{ width: '80px' }}>Send</button>
          </form>
        </div>
      </OSPanel>

      {/* 🎙️ Voice command indicator message overlays */}
      {voiceMessage && (
        <div style={{ position: 'fixed', bottom: '80px', left: '20px', zIndex: 99999, padding: '8px 16px', background: 'rgba(0, 212, 255, 0.2)', border: '1px solid var(--cyan)', color: '#FFF', borderRadius: '8px', fontSize: '12px', backdropFilter: 'blur(10px)' }}>
          {voiceMessage}
        </div>
      )}

      {/* 🎵 Ambient sound synthesizer bottom left */}
      <div className="floating-media-controls">
        <button className="media-btn" onClick={toggleMusic} title="Toggle welcome speech greeting">
          {isPlayingMusic ? '🔊' : '🔇'}
        </button>
        <button className="media-btn" onClick={toggleVoiceCommands} title="Trigger voice assistant voice listener" style={{ background: isListeningVoice ? 'var(--cyan)' : 'rgba(15, 23, 42, 0.6)', color: isListeningVoice ? '#000' : '#FFF' }}>
          🎙️
        </button>
        <div style={{ alignSelf: 'center', fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          {musicStatusText}
        </div>
      </div>

      {/* 💻 macOS Bottom Dock App Launcher */}
      <div className="macos-dock-wrapper">
        <div className="macos-dock">
          {[
            { id: 'stockapp', icon: '📈', label: 'Stock Portfolio App' },
            { id: 'terminal', icon: '🖥️', label: 'Terminal CLI' },
            { id: 'playground', icon: '💻', label: 'HTML Editor' },
            { id: 'scheduler', icon: '📅', label: 'Scheduler' },
            { id: 'recruiter', icon: '💼', label: 'Recruiter Hub' },
            { id: 'admin', icon: '🔑', label: 'Admin Console' },
            { id: 'chat', icon: '💬', label: 'AI Assistant' }
          ].map(app => {
            const isOpen = app.id === 'stockapp' ? currentPage === 'stock-app' : windows[app.id]?.isOpen;
            return (
              <button
                key={app.id}
                onClick={() => {
                  if (app.id === 'stockapp') {
                    navigateTo('stock-app', '/app.html');
                  } else if (app.id === 'admin') {
                    navigateTo('admin-login', '/Admin/Login');
                  } else {
                    focusWindow(app.id);
                  }
                }}
                className={`dock-item ${isOpen ? 'active' : ''}`}
              >
                <span className="tooltip-text">{app.label}</span>
                <span>{app.icon}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RESUME DOWNLOAD MODAL OVERLAY ── */}
      {showResumeModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999 }}>
          <div className="glass-card admin-modal-container" style={{ width: '420px', padding: '36px', border: '1px solid rgba(0, 212, 255, 0.25)', boxShadow: '0 0 30px rgba(0, 212, 255, 0.15)', borderRadius: '20px', position: 'relative' }}>
            <button onClick={() => setShowResumeModal(false)} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', color: '#FFF', fontSize: '20px', cursor: 'pointer' }}>×</button>
            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '10px' }}>📄📥</div>
            <h3 style={{ color: '#FFF', fontWeight: '800', textAlign: 'center', fontSize: '24px', fontFamily: "'Space Grotesk', sans-serif" }}>Download Resume</h3>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '13px', marginBottom: '20px' }}>Please provide your details to access the CV.</p>
            <form onSubmit={handleResumeDownloadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Full Name *"
                value={resumeName}
                onChange={e => setResumeName(e.target.value)}
                required
                className="form-control"
                style={{ marginBottom: 0 }}
              />
              <input
                type="email"
                placeholder="Work Email *"
                value={resumeEmail}
                onChange={e => setResumeEmail(e.target.value)}
                required
                className="form-control"
                style={{ marginBottom: 0 }}
              />
              <input
                type="text"
                placeholder="Company Name"
                value={resumeCompany}
                onChange={e => setResumeCompany(e.target.value)}
                className="form-control"
                style={{ marginBottom: 0 }}
              />
              <input
                type="text"
                placeholder="Designation"
                value={resumeDesignation}
                onChange={e => setResumeDesignation(e.target.value)}
                className="form-control"
                style={{ marginBottom: 0 }}
              />
              <button type="submit" className="btn-primary-neon" style={{ marginTop: '10px' }}>Download PDF</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
