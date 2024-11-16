import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/tcdb.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newAnswer, setNewAnswer] = useState(0);
  const [newTopic, setNewTopic] = useState('');
  const [newPoints, setNewPoints] = useState(1);

  // Load questions from server
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/questions');
        setQuestions(response.data);
      } catch (err) {
        console.error('Lỗi khi lấy câu hỏi', err);
      }
    };
    fetchQuestions();
  }, []);

  // Thêm câu hỏi mới
  const handleAddQuestion = async () => {
    try {
      await axios.post('http://localhost:5000/api/questions', {
        question: newQuestion,
        options: newOptions,
        answer: newAnswer,
        topic: newTopic,
        points: newPoints,
      });
      // Sau khi thêm thành công, làm mới danh sách câu hỏi
      setQuestions([...questions, { question: newQuestion, options: newOptions, answer: newAnswer, topic: newTopic, points: newPoints }]);
      setNewQuestion('');
      setNewOptions(['', '', '', '']);
      setNewAnswer(0);
      setNewTopic('');
      setNewPoints(1);
    } catch (err) {
      console.error('Lỗi khi thêm câu hỏi:', err);
    }
  };

  // Sửa câu hỏi
  const handleEditQuestion = async (id, updatedQuestion) => {
    try {
      await axios.put(`http://localhost:5000/api/questions/${id}`, updatedQuestion);
      setQuestions(questions.map(q => (q._id === id ? { ...q, ...updatedQuestion } : q)));
    } catch (err) {
      console.error('Lỗi khi sửa câu hỏi:', err);
    }
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/questions/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
    } catch (err) {
      console.error('Lỗi khi xóa câu hỏi:', err);
    }
  };

  return (
    <div>
      <h2 class="central-heading">WEB TRẮC NGHIỆM TIN HỌC 10</h2>
      <form>
        <div>
          <label>Câu hỏi:</label>
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
        </div>
        <div>
          <label>Chọn đáp án:</label>
          {newOptions.map((option, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder={`Đáp án ${index + 1}`}
                value={option}
                onChange={(e) => {
                  const newOptionsList = [...newOptions];
                  newOptionsList[index] = e.target.value;
                  setNewOptions(newOptionsList);
                }}
              />
            </div>
          ))}
        </div>
        <div>
          <label>Đáp án đúng (chỉ số từ 0 đến 3):</label>
          <input
            type="number"
            value={newAnswer}
            onChange={(e) => setNewAnswer(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Chủ đề:</label>
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
          />
        </div>
        <div>
          <label>Điểm:</label>
          <input
            type="number"
            value={newPoints}
            onChange={(e) => setNewPoints(Number(e.target.value))}
          />
        </div>
        <button
          type="button"
          onClick={handleAddQuestion}
        >
          Thêm Câu Hỏi
        </button>
      </form>

      <h3>Danh Sách Câu Hỏi</h3>
      <table>
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
          {questions.map((q) => (
            <tr key={q._id}>
              <td>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => {
                    const updatedQuestion = { ...q, question: e.target.value };
                    handleEditQuestion(q._id, updatedQuestion);
                  }}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.topic}
                  onChange={(e) => {
                    const updatedQuestion = { ...q, topic: e.target.value };
                    handleEditQuestion(q._id, updatedQuestion);
                  }}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={q.points}
                  onChange={(e) => {
                    const updatedQuestion = { ...q, points: e.target.value };
                    handleEditQuestion(q._id, updatedQuestion);
                  }}
                />
              </td>
              <td>
                <select
                  value={q.answer}
                  onChange={(e) => {
                    const updatedQuestion = { ...q, answer: e.target.value };
                    handleEditQuestion(q._id, updatedQuestion);
                  }}
                >
                  {q.options.map((option, index) => (
                    <option key={index} value={index}>
                      {option}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button onClick={() => handleDeleteQuestion(q._id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
