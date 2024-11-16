import React, { useState } from 'react';
import '../App.css';

function Question({ question, index, handleAnswer }) {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionClick = (i) => {
        setSelectedOption(i); // Lưu đáp án đã chọn
        handleAnswer(i); // Gọi hàm handleAnswer từ App.js để lưu đáp án
    };

    return (
        <div className="card mb-4 shadow-sm rounded">
            <div className="card-body">
                <h5 className="card-title text-primary">{index + 1}. {question.question}</h5>
            </div>
            <div className="card-footer d-flex flex-column align-items-center">
                {question.options.map((option, i) => (
                    <button
                        key={i}
                        className={`btn option-button w-100 mb-3 ${selectedOption === i ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleOptionClick(i)}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Question;
