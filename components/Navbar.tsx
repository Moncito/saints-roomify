import { Box, Compass, Rss, Tag, Upload, LogOut, User, ChevronDown, LayoutGrid } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router';
import type { AuthContext } from '../app/root';

const Navbar = () => {
  const { isSignedIn, userName, signIn, signOut, openUpload } = useOutletContext<AuthContext>();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignIn = async () => {
    try { await signIn(); } catch (e) { console.error(`Puter sign in failed: ${e}`); }
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    try { await signOut(); } catch (e) { console.error(`Puter sign out failed: ${e}`); }
  };

  const getInitials = (name: string) =>
    name.split(/[\s_]/).map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const navLinks = [
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Feed',    href: '/feed',    icon: Rss     },
    { label: 'Tags',    href: '/tags',    icon: Tag     },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* ── Desktop top navbar ── */}
      <header className="navbar">
        <nav className="inner">

          <div className="left">
            <button className="brand" onClick={() => navigate('/')} aria-label="Go home">
              <Box className="logo" />
              <span className="name">Roomify</span>
            </button>

            <ul className="links">
              {navLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a href={href} className={isActive(href) ? 'active' : ''}>
                    <Icon size={13} strokeWidth={1.8} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="actions">
            {isSignedIn ? (
              <>
                {/* Upload — opens global modal, no href needed */}
                <button className="upload-btn" onClick={openUpload}>
                  <Upload size={13} strokeWidth={2} />
                  Upload
                </button>

                <div className="avatar-wrapper" ref={dropdownRef}>
                  <button
                    className="avatar-btn"
                    onClick={() => setDropdownOpen(prev => !prev)}
                    aria-label="Open profile menu"
                    aria-expanded={dropdownOpen}
                  >
                    <div className="avatar">
                      {userName ? getInitials(userName) : <User size={14} />}
                    </div>
                    <ChevronDown
                      size={12}
                      strokeWidth={2}
                      className={`chevron ${dropdownOpen ? 'open' : ''}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="dropdown">
                      <div className="dropdown-header">
                        <div className="avatar avatar--lg">
                          {userName ? getInitials(userName) : <User size={18} />}
                        </div>
                        <div className="dropdown-user">
                          <span className="dropdown-name">{userName ?? 'Anonymous'}</span>
                          <span className="dropdown-tag">Community Member</span>
                        </div>
                      </div>

                      <div className="dropdown-divider" />

                      <button className="dropdown-item"
                        onClick={() => { setDropdownOpen(false); navigate(`/profile/${userName}`); }}>
                        <User size={13} /> My Profile
                      </button>
                      <button className="dropdown-item"
                        onClick={() => { setDropdownOpen(false); navigate('/my-projects'); }}>
                        <LayoutGrid size={13} /> My Projects
                      </button>

                      <div className="dropdown-divider" />

                      <button className="dropdown-item dropdown-item--danger" onClick={handleSignOut}>
                        <LogOut size={13} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="signin-btn" onClick={handleSignIn}>
                  Sign In
                </button>
                {/* Even logged-out users can click Upload — openUpload handles sign-in first */}
                <button className="upload-btn" onClick={openUpload}>
                  <Upload size={13} strokeWidth={2} />
                  Upload
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="mobile-tabs">
        {navLinks.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            className={`mobile-tab ${isActive(href) ? 'active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </a>
        ))}

        {/* Upload — opens modal */}
        <button className="mobile-tab mobile-tab--upload" onClick={openUpload}>
          <div className="mobile-upload-pill">
            <Upload size={18} strokeWidth={2.2} />
          </div>
          <span>Upload</span>
        </button>

        {/* Profile or Sign In */}
        {isSignedIn ? (
          <button
            className="mobile-tab"
            onClick={() => navigate(`/profile/${userName}`)}
          >
            <div className="mobile-avatar">
              {userName ? getInitials(userName) : <User size={14} />}
            </div>
            <span>{userName ? userName.split(/[\s_]/)[0] : 'Me'}</span>
          </button>
        ) : (
          <button className="mobile-tab" onClick={handleSignIn}>
            <User size={20} strokeWidth={1.8} />
            <span>Sign In</span>
          </button>
        )}
      </nav>
    </>
  );
};

export default Navbar;