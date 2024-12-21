import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

function Auth({ setUserId, setUserRole }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async () => {
        setError(""); // Reset lỗi trước khi xử lý
        setSuccess(""); // Reset thông báo thành công

        // Kiểm tra thông tin nhập liệu
        if (!username.trim()) {
            setError("Tên đăng nhập không được để trống");
            return;
        }
        if (!password.trim()) {
            setError("Mật khẩu không được để trống");
            return;
        }

        setLoading(true);

        const url = isRegister ? '/api/register' : '/api/login';
        try {
            const response = await axios.post(`http://localhost:5000${url}`, { username, password });

            // Nếu là đăng ký, hiển thị thông báo thành công
            if (isRegister) {
                setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
            }

            setUserId(response.data.userId);
            setUserRole(response.data.role); // Giả sử API trả về role của người dùng
        } catch (err) {
            // Xử lý lỗi từ API
            if (err.response && err.response.data.error === 'Tên đăng nhập đã tồn tại') {
                setError('Tài khoản đã được sử dụng');
            } else {
                setError(err.response ? err.response.data.error : "Đã có lỗi xảy ra");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="alt mx-auto mt-5" style={{ maxWidth: '400px' }}>
            <div className="alt-body">
                <h3 className="alt-title text-center">{isRegister ? "Đăng ký" : "Đăng nhập"}</h3>

                {/* Hiển thị thông báo lỗi nếu có */}
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Hiển thị thông báo thành công nếu có */}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="mb-3">
                    <input
                        type="text"
                        className="aform-control"
                        placeholder="Tên đăng nhập"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="password"
                        className="aform-control"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button className="btn btn-primary1 w-100" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}
                </button>

                <button
                    className="btn btn-link1 w-100 mt-2"
                    onClick={() => setIsRegister(!isRegister)}
                    disabled={loading}
                >
                    {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}
                </button>
            </div>
        </div>
    );
}

export default Auth;
