import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // ACTIVADO - Protección de sesión
    const session = localStorage.getItem('admin_session');

    if (!session) {
        // Si no hay sesión guardada en localStorage, patear de regreso al login
        return <Navigate to="/admin/login" replace />;
    }

    // Si hay sesión (o si está desactivada la protección), dejamos que pase al contenido
    return children;
};

export default ProtectedRoute;
