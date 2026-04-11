import React, { useState } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { showAlert } from '../../utils/swalCustom';
import './LoginAdmin.css';

const LoginAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/auth/login', { 
                email: email.trim(), 
                password 
            });

            const result = response.data.data;
            if (response.data.success && result && result.token) {
                // Guarda la sesión en base a la respuesta del nuevo backend
                localStorage.setItem('admin_session', JSON.stringify({
                    token: result.token,
                    ...result.user
                }));
                navigate('/admin');
            }
        } catch (error) {
            console.error("Error de login:", error);
            if (error.response && error.response.status === 401) {
                showAlert('Atención', 'Credenciales incorrectas', 'warning');
            } else {
                showAlert('Error', 'Error de conexión con el servidor', 'error');
            }
        }
    };

    return (
        <div className="login-admin-page">
            <div className="login-admin-card">
                <div className="login-admin-header">
                    <div className="login-icon-wrapper">
                        <Lock color="white" size={30} />
                    </div>
                    <h1 className="login-admin-title">Panel Administrativo</h1>
                    <p className="login-admin-subtitle">"Sabor a tradición, gestión con precisión"</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="login-input-group">
                        <label className="login-label">Correo electrónico</label>
                        <div className="login-input-wrapper">
                            <User className="login-input-icon" size={18} />
                            <input 
                                required
                                type="email" 
                                className="login-input"
                                placeholder="ejemplo@correo.com"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="login-input-group">
                        <label className="login-label">Contraseña</label>
                        <div className="login-input-wrapper">
                            <Lock className="login-input-icon" size={18} />
                            <input 
                                required
                                type={showPass ? "text" : "password"} 
                                className="login-input has-right-icon"
                                placeholder="••••••••"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="login-toggle-pass"
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="login-submit-btn"
                    >
                        <Lock size={18} color="white" />
                        ENTRAR AL SISTEMA
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginAdmin;
