const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());
app.use(cors());

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/quizDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Mô hình câu hỏi
const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    answer: Number,
    topic: String,
    points: { type: Number, default: 1 } // Thêm điểm cho câu hỏi, mặc định là 1 điểm
});

const Question = mongoose.model('Question', questionSchema);

// Mô hình người dùng
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, enum: ['student', 'teacher'], default: 'student' }, // Đảm bảo mặc định là 'student'
    scoreHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuizHistory' }],
});

const User = mongoose.model('User', userSchema);

// Mô hình lịch sử làm bài
const quizHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    topicScores: { type: Map, of: Number },
    date: { type: Date, default: Date.now },
});

const QuizHistory = mongoose.model('QuizHistory', quizHistorySchema);
// API thêm câu hỏi mới
app.post('/api/questions', async (req, res) => {
    const { question, options, answer, topic, points } = req.body;

    // Kiểm tra dữ liệu nhập vào
    if (!question || !options || answer === undefined || !topic) {
        return res.status(400).json({ error: "Thông tin câu hỏi không đầy đủ" });
    }

    // Kiểm tra giá trị của answer phải nằm trong khoảng từ 1 đến 4
    if (answer < 1 || answer > 4) {
        return res.status(400).json({ error: "Đáp án phải nằm trong khoảng từ 1 đến 4." });
    }

    try {
        // Tạo câu hỏi mới
        const newQuestion = new Question({
            question,
            options,
            answer,  // Sử dụng giá trị answer đã được điều chỉnh từ frontend
            topic,
            points: points || 1, // Nếu không có điểm, mặc định là 1
        });

        // Lưu câu hỏi vào cơ sở dữ liệu
        await newQuestion.save();
        res.status(201).json({ message: "Câu hỏi đã được thêm thành công", question: newQuestion });
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi thêm câu hỏi" });
    }
});


// API lấy câu hỏi
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy câu hỏi" });
    }
});
// API sửa câu hỏi
app.put('/api/questions/:id', async (req, res) => {
    const { id } = req.params;
    const { question, options, answer, topic, points } = req.body;
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            { question, options, answer, topic, points },
            { new: true }
        );
        res.json(updatedQuestion);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi sửa câu hỏi" });
    }
});

// API xóa câu hỏi
app.delete('/api/questions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Question.findByIdAndDelete(id);
        res.status(200).json({ message: "Câu hỏi đã bị xóa" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi xóa câu hỏi" });
    }
});


// API tính điểm
app.post('/api/submit', async (req, res) => {
    const { userId, answers } = req.body;
    const questions = await Question.find();
    let score = 0;
    let topicScores = {};

    questions.forEach((question, index) => {
        if (question.answer === answers[index]) {
            score += question.points; // Cộng điểm của câu hỏi vào tổng điểm
            if (!topicScores[question.topic]) {
                topicScores[question.topic] = 0;
            }
            topicScores[question.topic] += question.points; // Cộng điểm theo chủ đề
        }
    });

    // Lưu kết quả làm bài vào cơ sở dữ liệu
    const history = await QuizHistory.create({ userId, score, topicScores });
    await User.findByIdAndUpdate(userId, { $push: { scoreHistory: history._id } });

    res.json({ score, topicScores });
});

// API phân tích và đưa ra đề xuất ôn tập chi tiết hơn
app.post('/api/analyze-ai', async (req, res) => {
    const { topicScores } = req.body;

    let suggestion = "Học lại đi ba";
    let reviewSuggestions = [];

    // Kiểm tra từng chủ đề và xác định mức độ ôn tập
    Object.entries(topicScores).forEach(([topic, score]) => {
        if (score <= 3) {
            reviewSuggestions.push(`${topic}: Cần ôn tập`);
        } else if (score < 1) {
            reviewSuggestions.push(`${topic}: Cần ôn tập nhiều hơn`);
        } else {
            reviewSuggestions.push(`${topic}: Đã làm tốt`);
        }
    });

    // Nếu có chủ đề cần ôn tập, đưa ra thông báo cụ thể
    if (reviewSuggestions.length > 0) {
        suggestion = "Bạn cần ôn tập thêm các chủ đề sau:";
    }

    res.json({ suggestion, reviewSuggestions });
});

// API lấy bảng xếp hạng
app.get('/api/scores', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).populate('scoreHistory');

        const scores = students.map(student => {
            const highestScoreHistory = student.scoreHistory.reduce((max, history) => {
                return history.score > max.score ? history : max;
            }, { score: 0 });

            return {
                username: student.username,
                score: highestScoreHistory.score,
                date: highestScoreHistory.date,
            };
        });

        // Sắp xếp theo điểm số giảm dần
        scores.sort((a, b) => b.score - a.score);

        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy bảng điểm của học sinh" });
    }
});

// API lấy bảng điểm tất cả học sinh và chủ đề
app.get('/api/scoress', async (req, res) => {
    try {
        // Lọc người dùng chỉ có vai trò là "student"
        const students = await User.find({ role: 'student' }).populate('scoreHistory');
        
        // Chuẩn bị dữ liệu trả về
        const scores = students.map(student => ({
            username: student.username,
            scoreHistory: student.scoreHistory.map(history => ({
                score: history.score,
                date: history.date,
                topicScores: history.topicScores,  // Lấy thêm dữ liệu về các chủ đề
            })),
        }));
        
        res.json(scores); // Trả về danh sách điểm của "student" cùng với chủ đề
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy bảng điểm của học sinh" });
    }
});


// Đăng ký người dùng
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Tên đăng nhập đã tồn tại" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashedPassword, role }); 

        res.json({ userId: user._id, role: user.role }); 
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi đăng ký người dùng" });
    }
});

// Đăng nhập người dùng
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "Sai thông tin đăng nhập" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Sai thông tin đăng nhập" });
        }

        res.json({ userId: user._id, role: user.role }); // Trả về role cùng với userId
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi đăng nhập" });
    }
});

// Lịch sử làm bài
app.get('/api/history/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const history = await QuizHistory.find({ userId });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy lịch sử làm bài" });
    }
});

// API lấy bảng điểm cao nhất của tất cả học sinh cho giáo viên
app.get('/api/scores', async (req, res) => {
    try {
        // Lọc người dùng chỉ có vai trò là "student"
        const students = await User.find({ role: 'student' }).populate('scoreHistory');
        
        // Chuẩn bị dữ liệu trả về
        const scores = students.map(student => {
            // Tìm điểm cao nhất trong scoreHistory
            const highestScoreHistory = student.scoreHistory.reduce((max, history) => {
                return history.score > max.score ? history : max;
            }, { score: 0 });

            return {
                username: student.username,
                score: highestScoreHistory.score,
                date: highestScoreHistory.date,
            };
        });

        res.json(scores); // Trả về danh sách điểm cao nhất của các "student"
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi lấy bảng điểm của học sinh" });
    }
});

// Khởi động server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
