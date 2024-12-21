import React, { useEffect, useState } from 'react';
import'./Score.css';
const HighScores = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data từ API
    useEffect(() => {
        const fetchScores = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/scores');
                const data = await response.json();
                setScores(data); // Lưu dữ liệu bảng điểm
                setLoading(false); // Tắt trạng thái loading
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu:', error);
                setLoading(false);
            }
        };

        fetchScores();
    }, []);

    if (loading) {
        return <p>Đang tải dữ liệu...</p>;
    }

    return (
        <div>
            <table border="1">
                <thead>
                    <tr>
                        <th>Tên Người Dùng</th>
                        <th>Điểm Cao Nhất</th>
                        <th>Ngày Đạt</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((student, index) => (
                        <tr key={index}>
                            <td>{student.username}</td>
                            <td>{student.score}</td>
                            <td>{new Date(student.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HighScores;
