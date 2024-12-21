import React, { useEffect, useState } from 'react';
import './ScoreBoard.css';
const Scoreboard = () => {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        // Gọi API lấy dữ liệu
        const fetchScores = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/scoress');
                const data = await response.json();
                setScores(data);
            } catch (err) {
                console.error('Lỗi khi lấy bảng điểm:', err);
            }
        };
        fetchScores();
    }, []);

    return (
<div className="scoreboard">
    {scores.length === 0 ? (
        <div className="empty-state">Không có dữ liệu</div>
    ) : (
        <table>
            <thead>
                <tr>
                    <th>Tên người dùng</th>
                    <th>Lịch sử làm bài</th>
                </tr>
            </thead>
            <tbody>
                {scores.map((user, index) => (
                    <tr key={index}>
                        <td>
                            <div className="username">{user.username}</div>
                        </td>
                        <td>
                            {user.scoreHistory?.length > 0 ? (
                                user.scoreHistory.map((history, idx) => (
                                    <div className="history-card" key={idx}>
                                        <div className={`score ${
                                            history.score >= 8 ? 'score-high' : 
                                            history.score >= 5 ? 'score-medium' : 
                                            'score-low'
                                        }`}>
                                            Điểm: {history.score}
                                        </div>
                                        {history.topicScores && 
                                         Object.entries(history.topicScores).length > 0 ? (
                                            <div className="topic-list">
                                                {Object.entries(history.topicScores)
                                                    .map(([topic, score], tIdx) => (
                                                    <div className="topic-item" key={tIdx}>
                                                        <span className="topic-name">{topic}</span>
                                                        <span className="topic-score">
                                                            {score} điểm
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>Không có chủ đề nào</p>
                                        )}
                                        <div className="date">
                                            {new Date(history.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">Không có lịch sử làm bài</div>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )}
</div>
    );
};

export default Scoreboard;
