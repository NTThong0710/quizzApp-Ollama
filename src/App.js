import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Question from './components/Question';
import TeacherDashboard from './components/TeacherDashBoard';
import Auth from './components/Auth';
import Chatbot from './components/Chatbot'; 
import ReadyToStart from './components/ReadyToStart'; // Import ReadyToStart component
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';
import Scores from'./components/Score';

function App() {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [score, setScore] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const [reviewSuggestions, setReviewSuggestions] = useState([]);
    const [showReview, setShowReview] = useState(false);
    const [questionFeedback, setQuestionFeedback] = useState([]);
    const [scoreHistory, setScoreHistory] = useState([]);
    const [timeLeft, setTimeLeft] = useState(15);
    const [loading, setLoading] = useState(true);
    const [showChatbot, setShowChatbot] = useState(false); // Trạng thái hiển thị Chatbot
    const [showScores, setShowScores] = useState(false); // Trạng thái hiển thị bảng điểm
    const [isReady, setIsReady] = useState(false); // Trạng thái xác nhận sẵn sàng làm bài

    // Lấy câu hỏi và điểm số từ server
    useEffect(() => {
        async function fetchQuestionsAndScores() {
            try {
                const questionsResponse = await axios.get('http://localhost:5000/api/questions');
                setQuestions(questionsResponse.data);
            } catch (error) {
                console.error('Lỗi khi lấy câu hỏi:', error);
            } finally {
                setLoading(false);
            }

            if (userId) {
                try {
                    const scoresResponse = await axios.get(`http://localhost:5000/api/scores/${userId}`);
                    setScoreHistory(scoresResponse.data);
                } catch (error) {
                    console.error('Lỗi khi lấy lịch sử điểm số:', error);
                }
            }
        }
        fetchQuestionsAndScores();
    }, [userId]);

    // Quản lý bộ đếm thời gian
    useEffect(() => {
        if (isReady && timeLeft > 0 && !isSubmitted) {
            const timerInterval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
    
            return () => clearInterval(timerInterval); 
        } else if (timeLeft === 0 && !isSubmitted) {
            handleAnswer(currentQuestionIndex); // Tự động trả lời khi hết thời gian
        }
    }, [timeLeft, isSubmitted, currentQuestionIndex, isReady]);
    

    // Xử lý trả lời câu hỏi
    const handleAnswer = (index, answerIndex = -1) => {
        const newAnswers = [...answers];
        newAnswers[index] = answerIndex;
        setAnswers(newAnswers);

        if (index < questions.length - 1) {
            setCurrentQuestionIndex(index + 1);
            setTimeLeft(15);
        } else {
            handleSubmit();
        }
    };

    // Xử lý nộp bài
    const handleSubmit = useCallback(async () => {
        if (!userId) {
            alert('Bạn cần đăng nhập để nộp bài');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/submit', { userId, answers });
            setScore(response.data.score);
            setQuestionFeedback(response.data.feedback);
            const analyzeResponse = await axios.post('http://localhost:5000/api/analyze-ai', { topicScores: response.data.topicScores });
            setSuggestion(analyzeResponse.data.suggestion);
            setReviewSuggestions(analyzeResponse.data.reviewSuggestions || []);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Lỗi khi nộp bài:', error);
        }
    }, [userId, answers]);

    // Tính toán tiến độ thời gian
    const timeProgress = (timeLeft / 15) * 100;

    // Hiển thị/ẩn Chatbot
    const toggleChatbot = () => setShowChatbot(!showChatbot);

    // Hiển thị/ẩn bảng điểm
    const toggleScores = () => setShowScores(!showScores);

    // Xử lý đăng xuất
    const handleLogout = () => {
        console.log('Đăng xuất thành công!');
        
        // Reset tất cả các trạng thái người dùng
        setUserId(null);
        setUserRole(null);
        setIsSubmitted(false);
        setScore(null);
        setAnswers([]);
        setQuestionFeedback([]);
        setReviewSuggestions([]);
        setShowChatbot(false);
        setShowScores(false);

        window.location.href = ''; 
    };

    return (
        <div className="container mt-4">
            {!userId ? (
                <Auth setUserId={setUserId} setUserRole={setUserRole} />
            ) : (
                <>
                    {userRole === 'teacher' ? (
                        <TeacherDashboard />
                    ) : (
                        <>
                            {!isReady ? (
                                <ReadyToStart setIsReady={setIsReady} />
                            ) : (
                                <>
                                    <div className="logout-button-container">
                                        <button className="logout-button" onClick={handleLogout}>
                                            <i className="fa fa-sign-out" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                    <h1 className="text-center mb-4">TRẮC NGHIỆM TIN HỌC 10</h1>
                                    {loading ? (
                                        <div>Đang tải...</div>
                                    ) : (
                                        <div>
                                            {questions.length > 0 && !isSubmitted && (
                                                <Question
                                                    question={questions[currentQuestionIndex]}
                                                    index={currentQuestionIndex}
                                                    handleAnswer={(answerIndex) => handleAnswer(currentQuestionIndex, answerIndex)}
                                                />
                                            )}
                                            {!isSubmitted && (
                                                <div className="text-center mt-4">
                                                    <div className="progress" style={{ height: '30px' }}>
                                                        <div
                                                            className="progress-bar"
                                                            role="progressbar"
                                                            style={{ width: `${timeProgress}%` }}
                                                            aria-valuenow={timeProgress}
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                            {isSubmitted && (
                                                <div className="alert alert-success text-center mt-4">
                                                    Bạn đã nộp bài thành công!
                                                </div>
                                            )}
                                            {score !== null && (
                                                <h2 className="alert alert-warning text-center mt-4">Điểm của bạn: {score}</h2>
                                            )}
                                            {suggestion && (
                                                <div className="alert alert-info text-center mt-4">
                                                    {suggestion}
                                                </div>
                                            )}
                                            {reviewSuggestions.length > 0 && (
                                                <div className="alert alert-warning text-center mt-4">
                                                    <h5>Chủ đề:</h5>
                                                    <ul>
                                                        {reviewSuggestions.map((item, index) => (
                                                            <li key={index}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {isSubmitted && showReview && questionFeedback.length > 0 && (
                                                <div className="mt-4">
                                                    {questionFeedback.map((feedback, index) => (
                                                        <div key={index} className="alert alert-info">
                                                            <strong>Câu {index + 1}:</strong> {feedback.correct ? "Đúng!" : "Sai!"}
                                                        </div>
                                                    ))}
                                                </div> 
                                            )}
                                            {isSubmitted && (
                                                <>
                                                    <div className="container-btn" style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
                                                        <button
                                                            className="btn btn-primary btn-block btn-flat rounded"
                                                            onClick={toggleChatbot}
                                                        >
                                                            {showChatbot ? 'Đóng Chatbot' : 'Mở Chatbot'}
                                                        </button>
                                                        <button
                                                            className="btn btn-success btn-block btn-flat rounded"
                                                            onClick={toggleScores}
                                                        >
                                                            {showScores ? 'Ẩn Bảng Điểm' : 'Hiện Bảng Điểm'}
                                                        </button>
                                                    </div>
                                                    {showChatbot && <Chatbot />}
                                                    {showScores && <Scores />}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default App;
