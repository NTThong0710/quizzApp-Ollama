import React, { useEffect, useState } from 'react';
import './Score.css';

const HighScores = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/scores');
                const data = await response.json();
                setScores(data);
                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu:', error);
                setLoading(false);
            }
        };

        fetchScores();
    }, []);

    if (loading) {
        return <div className="scores-loading">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="scores-container">
            <div className="scores-wrapper">
                <table className="scores-table">
                    <thead className="scores-header">
                        <tr className="scores-header-row">
                            <th className="scores-header-cell">Tên Người Dùng</th>
                            <th className="scores-header-cell">Điểm Cao Nhất</th>
                            <th className="scores-header-cell">Ngày Đạt</th>
                        </tr>
                    </thead>
                    <tbody className="scores-body">
                        {scores.map((player, index) => (
                            <tr key={index} className="scores-row">
                                <td className="scores-cell scores-name">{player.username}</td>
                                <td className="scores-cell scores-points">{player.score}</td>
                                <td className="scores-cell scores-date">
                                    {new Date(player.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HighScores;