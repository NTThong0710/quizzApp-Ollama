import React, { useState, useEffect } from 'react';
import './ReadyToStart.css';

const ReadyToStart = ({ setIsReady }) => {
  const [isReadyLocal, setIsReadyLocal] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Create particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        '--moveX': `${(Math.random() - 0.5) * 200}px`,
        '--moveY': `${(Math.random() - 0.5) * 200}px`,
        animationDelay: `${Math.random() * 20}s`
      }
    }));
    setParticles(newParticles);
  }, []);

  const handleReadyClick = () => {
    setIsReadyLocal(true);
    setIsReady(true);
  };

  return (
    <div className="ready-container">
      <div className="particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={particle.style}
          />
        ))}
      </div>
      <div className="ready-content">
        {!isReadyLocal ? (
          <>
            <h1 className="ready-title">CHÀO MỪNG!</h1>
            <p className="ready-description">
              Hãy sẵn sàng cho bài kiểm tra của bạn. 
              Hãy chắc chắn rằng bạn đã chuẩn bị đầy đủ và sẵn sàng bắt đầu.
            </p>
            <button
              onClick={handleReadyClick}
              className="ready-button"
            >
              Tôi đã sẵn sàng
            </button>
          </>
        ) : (
          <>
            <h1 className="ready-title">Chúc mừng!</h1>
            <p className="ready-description">
              Bạn đã sẵn sàng để bắt đầu. Chúc bạn đạt kết quả tốt nhất!
            </p>
            <button
              onClick={() => setIsReady(true)}
              className="ready-button"
            >
              Bắt đầu làm bài
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReadyToStart;