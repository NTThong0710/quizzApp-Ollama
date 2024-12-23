import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Scoreboard from './Scoreboard';
import ChatbotTeacher from './ChatbotTeacher';
import '../components/TeacherDashBoard.css';
import 'font-awesome/css/font-awesome.min.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showChatbotTeacher, setShowChatbotTeacher] = useState(false);
  const [newQuestionData, setNewQuestionData] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: 2,
    topic: '',
    points: 1,
  });

  // Load questions from server
  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/questions');
      setQuestions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestions([]);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleInputChange = (field, value) => {
    setNewQuestionData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    setNewQuestionData(prev => {
      const updatedOptions = [...prev.options];
      updatedOptions[index] = value;
      return { ...prev, options: updatedOptions };
    });
  };

  const handleAddQuestion = async () => {
    try {
      // Validate required fields
      if (!newQuestionData.question || !newQuestionData.topic) {
        alert('Vui lòng điền đầy đủ câu hỏi và chủ đề');
        return;
      }
  
      // Ensure all options are filled
      if (newQuestionData.options.some(opt => opt.trim() === '')) {
        alert('Vui lòng điền đầy đủ các đáp án');
        return;
      }

      const dataToSend = {
        question: newQuestionData.question.trim(),
        options: newQuestionData.options.map(opt => opt.trim()),
        answer: Number(newQuestionData.answer) , 
        topic: newQuestionData.topic.trim(),
        points: Number(newQuestionData.points)
      };
  
      // Log data for debugging
      console.log('User selected answer:', newQuestionData.answer);
      console.log('Sending to server:', dataToSend);
  
      // Send request
      const response = await axios.post(
        'http://localhost:5000/api/questions',
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data) {
        // Update local state immediately
        setQuestions(prevQuestions => [...(prevQuestions || []), response.data]);
        
        // Reset form
        setNewQuestionData({
          question: '',
          options: ['', '', '', ''],
          answer: 1, 
          topic: '',
          points: 1,
        });
  
        // Close form and refresh data
        setShowAddQuestion(false);
        await fetchQuestions();
        
        alert('Thêm câu hỏi thành công!');
      }
    } catch (err) {
      console.error('Error adding question:', err);
      console.error('Error response:', err.response?.data);
      
      // Show detailed error message
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Có lỗi xảy ra khi thêm câu hỏi. Vui lòng thử lại.');
      }
    }
  };
  

  const handleEditQuestion = async (id, updatedQuestion) => {
    try {
      const adjustedQuestion = {
        ...updatedQuestion,
        answer: updatedQuestion.answer 
      };
      const response = await axios.put(`http://localhost:5000/api/questions/${id}`, adjustedQuestion);
      if (response.data) {
        // Cập nhật state ngay lập tức với câu hỏi đã được chỉnh sửa
        setQuestions(prevQuestions => {
          const currentQuestions = Array.isArray(prevQuestions) ? prevQuestions : [];
          return currentQuestions.map(q => q._id === id ? { ...q, ...updatedQuestion } : q);
        });
        
        // Tùy chọn: Fetch lại dữ liệu từ server để đảm bảo đồng bộ
        await fetchQuestions();
      }
    } catch (err) {
      console.error('Error editing question:', err);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/questions/${id}`);
      // Xóa câu hỏi khỏi state ngay lập tức
      setQuestions(prevQuestions => {
        const currentQuestions = Array.isArray(prevQuestions) ? prevQuestions : [];
        return currentQuestions.filter(q => q._id !== id);
      });
      
      // Tùy chọn: Fetch lại dữ liệu từ server để đảm bảo đồng bộ
      await fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  const handleLogout = () => {
    window.location.href = '';
  };

  const renderQuestionRows = () => {
    const questionArray = Array.isArray(questions) ? questions : [];
    const rows = [];
    
    for (let i = 0; i < questionArray.length; i++) {
      const q = questionArray[i];
      const options = Array.isArray(q.options) ? q.options : [];
      
      rows.push(
        <tr key={q._id || i}>
          <td>
            <input
              type="text"
              value={q.question || ''}
              onChange={(e) => handleEditQuestion(q._id, { ...q, question: e.target.value })}
              className="form-control"
            />
          </td>
          <td>
            <input
              type="text"
              value={q.topic || ''}
              onChange={(e) => handleEditQuestion(q._id, { ...q, topic: e.target.value })}
              className="form-control"
            />
          </td>
          <td>
            <input
              type="number"
              value={q.points || 1}
              onChange={(e) => handleEditQuestion(q._id, { ...q, points: Number(e.target.value) })}
              className="form-control"
              min="1"
            />
          </td>
          <td>
            <select
              value={q.answer || 1}
              onChange={(e) => handleEditQuestion(q._id, { ...q, answer: Number(e.target.value) })}
              className="form-control"
            >
              {options.map((option, index) => (
                <option key={index} value={index}>
                  {option || ''}
                </option>
              ))}
            </select>
          </td>
          <td>
            <button 
              onClick={() => handleDeleteQuestion(q._id)} 
              className="btn btn-danger btn-sm"
            >
              Xóa
            </button>
          </td>
        </tr>
      );
    }
    return rows;
  };

  return (
    <div className="container">
      <div>
        <div className="logout-button-container">
          <button className="logout-button" onClick={handleLogout}>
            <i className="fa fa-sign-out" aria-hidden="true"></i>
          </button>
        </div>
        <h2 className="central-heading">WEB TRẮC NGHIỆM TIN HỌC 10</h2>
      </div>

      <table className="question-table">
        <thead>
          <tr>
            <th>Câu hỏi</th>
            <th>Chủ đề</th>
            <th>Điểm</th>
            <th>Đáp án</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {renderQuestionRows()}
        </tbody>
      </table>

      <div className="button-group" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
        <button className="btn btn-success btn-lock btn-flat" onClick={() => setShowScoreboard(!showScoreboard)}>
          {showScoreboard ? 'Ẩn bảng điểm' : 'Hiện bảng điểm'}
        </button>
        <button className="btn btn-primary btn-lock btn-flat" onClick={() => setShowAddQuestion(!showAddQuestion)}>
          {showAddQuestion ? 'Ẩn thêm câu hỏi' : 'Thêm câu hỏi'}
        </button>
        <button className="btn btn-info btn-lock btn-flat" onClick={() => setShowChatbotTeacher(!showChatbotTeacher)}>
          {showChatbotTeacher ? 'Đóng Chatbot' : 'Mở Chatbot'}
        </button>
      </div>

      {showScoreboard && <Scoreboard />}
      {showChatbotTeacher && <ChatbotTeacher />}
      {showAddQuestion && (
        <form className="add-question-form">
          <div className="form-group">
            <label>Câu hỏi:</label>
            <input
              type="text"
              value={newQuestionData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              className="form-control"
              placeholder="Nhập câu hỏi"
            />
          </div>
          <div className="form-group">
            <label>Chọn đáp án:</label>
            {(newQuestionData.options || []).map((option, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Đáp án ${index + 1}`}
                value={option || ''}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="form-control option-input"
              />
            ))}
          </div>
          <div className="form-group">
            <label>Đáp án đúng (chỉ số từ 0 đến 3) :</label>
            <input
              type="number"
              value={newQuestionData.answer}
              onChange={(e) => handleInputChange('answer', Number(e.target.value))}
              className="form-control"
              min="0"
              max="3"
              
            />
          </div>
          <div className="form-group">
            <label>Chủ đề:</label>
            <input
              type="text"
              value={newQuestionData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              className="form-control"
              placeholder="Nhập chủ đề"
            />
          </div>
          <div className="form-group">
            <label>Điểm:</label>
            <input
              type="number"
              value={newQuestionData.points}
              onChange={(e) => handleInputChange('points', Number(e.target.value))}
              className="form-control"
              min="1"
            />
          </div>
          <button type="button" onClick={handleAddQuestion} className="btn btn-success">
            Thêm Câu Hỏi
          </button>
        </form>
      )}
    </div>
  );
}

export default App;