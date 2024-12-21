import React, { useState } from 'react';
import './ReadyToStart.css';

const ReadyToStart = ({ setIsReady }) => {
  const [isReadyLocal, setIsReadyLocal] = useState(false);

  const handleReadyClick = () => {
    setIsReadyLocal(true);  // Thông báo cho component hiện tại biết người dùng đã sẵn sàng
    setIsReady(true);  // Gửi trạng thái "đã sẵn sàng" lên App.js để chuyển sang màn hình trắc nghiệm
  };

  return (
    <div className="ready-container">
      {!isReadyLocal ? (
        <>
          <h1 className="ready-title">CHÀO MỪNG!</h1>
          <p className="ready-description">Hãy chắc chắn rằng bạn đã sẵn sàng làm bài.</p>
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
          <p className="ready-description">Bạn đã sẵn sàng để làm bài. Chúc bạn thành công!</p>
          <button
            onClick={() => alert('Bắt đầu bài làm!')}
            className="ready-button"
          >
            Bắt đầu làm bài
          </button>
        </>
      )}
    </div>
  );
};

export default ReadyToStart;
