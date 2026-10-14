import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Login.css';

const Login = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('Please enter your email');
      return;
    }
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast.error('Please enter a valid email');
      return;
    }
    setShowLogin(false);
    navigate('/home');
  };

  return (
    <div className="login-overlay" onClick={() => setShowLogin(false)}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={() => setShowLogin(false)}>&times;</button>
        <h2 className="login-title">Welcome</h2>
        <p className="login-subtitle">Enter your email to create your account or sign in.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Continue
          </button>
        </form>

        <div className="separator">
          <span>OR</span>
        </div>

        <button className="google-btn">
          <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" className="google-icon" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
