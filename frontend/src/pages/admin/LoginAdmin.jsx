import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import './LoginAdmin.css';

const LoginAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Buscamos el usuario en nuestra tabla personalizada
        const { data, error } = await supabase
            .from('usuarios')
            .select('*') // Simplificado para evitar errores de Foreign Key locales()
            .eq('usuario', email)
            .eq('password', password)
            .single();

        if (error) {
            console.error("Error de Supabase:", error);
            // Si el error de postgrest no es "No rows found"
            if (error.code !== 'PGRST116') {
                alert("Error de base de datos: " + error.message);
                return;
            }
        }

        if (data) {
            localStorage.setItem('admin_session', JSON.stringify(data));
            navigate('/admin'); // Al tablero que ya hicimos
        } else {
            alert("Credenciales incorrectas");
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
                        <label className="login-label">Usuario</label>
                        <div className="login-input-wrapper">
                            <User className="login-input-icon" size={18} />
                            <input 
                                required
                                type="text" 
                                className="login-input"
                                placeholder="Nombre de usuario"
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
