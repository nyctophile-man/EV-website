import { useEffect, useState } from "react";
import Backgound from "./Compt/Background/Backgound";
import Navbar from "./Compt/Navbar/Navbar";
import Hero from "./Compt/Hero/Hero";
import Login from "./Compt/Login/Login";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import Home from "./Compt/Home/Home";

const App = () => {
  const heroData = [
    { text1: "Dive into", text2: "what you love" },
    { text1: "Indulge", text2: "your passions" },
    { text1: "Give in to", text2: "your passions" },
  ];
  const [heroCount, setHeroCount] = useState(1);
  const [playStatus, setPlayStatus] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (showLogin) return;
    const intervalId = setInterval(() => {
      setHeroCount((count) => (count === 2 ? 0 : count + 1));
    }, 3000);
    return () => clearInterval(intervalId);
  }, [showLogin]);

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ style: { background: '#12121c', color: '#f0f0f5', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <Routes>
        <Route path="/" element={
          <>
            {showLogin && <Login setShowLogin={setShowLogin} />}
            <div
              style={{
                position: 'relative',
                minHeight: '100vh',
                overflow: 'hidden',
                filter: showLogin ? 'blur(8px)' : 'none',
                pointerEvents: showLogin ? 'none' : 'auto',
                transition: 'filter 0.3s ease',
              }}
            >
              <Backgound playStatus={playStatus} heroCount={heroCount} />
              <Navbar setShowLogin={setShowLogin} />
              <Hero
                setPlayStatus={setPlayStatus}
                heroData={heroData[heroCount]}
                heroCount={heroCount}
                setHeroCount={setHeroCount}
                playStatus={playStatus}
                setShowLogin={setShowLogin}
              />
            </div>
          </>
        } />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
};

export default App;
