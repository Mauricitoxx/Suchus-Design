import React, { useState } from "react";
import { Card, Input, Button, Alert, Row, Col, Modal } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, LoginOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/auth";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (field, value) => {
        // Validar teléfono: solo números
        if (field === 'telefono') {
            const telefonoValido = value.replace(/[^0-9]/g, '');
            setFormData({
                ...formData,
                [field]: telefonoValido
            });
        } else {
            setFormData({
                ...formData,
                [field]: value
            });
        }
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validaciones
        if (!formData.nombre || !formData.apellido || !formData.email || !formData.password) {
            setError("Por favor completá todos los campos obligatorios");
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Ingresá un correo electrónico válido");
            return;
        }

        // Validar teléfono si está presente
        if (formData.telefono) {
            const soloNumeros = formData.telefono.replace(/[^0-9]/g, '');
            if (soloNumeros.length < 8 || soloNumeros.length > 15) {
                setError("El teléfono debe tener entre 8 y 15 dígitos");
                return;
            }
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);

        try {
            const response = await authService.register({
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                password: formData.password,
                telefono: formData.telefono
            });

            console.log('Registro exitoso:', response);
            
            // Registro exitoso - mostrar mensaje y redirigir
            setLoading(false);
            setSuccess(true);
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            console.error("Error al registrar:", err);
            setLoading(false);
            
            // Traducir mensajes de error comunes
            let errorMessage = "Error al crear la cuenta. Intenta nuevamente.";
            
            if (err.email) {
                const emailError = err.email[0];
                if (emailError.includes("already exists") || emailError.includes("ya existe")) {
                    errorMessage = "Este correo electrónico ya está registrado";
                } else if (emailError.includes("valid email") || emailError.includes("válido")) {
                    errorMessage = "Ingresa un correo electrónico válido";
                } else {
                    errorMessage = emailError;
                }
            } else if (err.contraseña || err.password) {
                const passError = (err.contraseña || err.password)[0];
                if (passError.includes("too short") || passError.includes("corta")) {
                    errorMessage = "La contraseña debe tener al menos 6 caracteres";
                } else {
                    errorMessage = passError;
                }
            } else if (err.detail) {
                errorMessage = err.detail;
            } else if (err.non_field_errors) {
                errorMessage = err.non_field_errors[0];
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            
            setError(errorMessage);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#f9f9f9', 
            display: 'flex', 
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{ 
                backgroundColor: 'white', 
                padding: '20px 40px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '40px'
            }}>
                <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
                        Suchus Copy & Design
                    </Link>
                </h1>
            </div>

            {/* Main Content */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '20px'
            }}>
                <Card 
                    style={{ 
                        width: '100%', 
                        maxWidth: '550px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    bodyStyle={{ padding: '40px' }}
                >
                    <h2 style={{ 
                        textAlign: 'center', 
                        fontSize: '28px', 
                        marginBottom: '10px',
                        color: '#333'
                    }}>
                        Crear Cuenta
                    </h2>
                    <p style={{ 
                        textAlign: 'center', 
                        color: '#666', 
                        marginBottom: '30px' 
                    }}>
                        Completá tus datos para registrarte
                    </p>

                    <form onSubmit={handleSubmit}>
                        {success && (
                            <Alert 
                                message="¡Cuenta creada exitosamente!" 
                                description="Serás redirigido al inicio de sesión en unos segundos..."
                                type="success" 
                                showIcon 
                                icon={<CheckCircleOutlined />}
                                style={{ marginBottom: '20px' }}
                            />
                        )}

                        {error && (
                            <Alert 
                                message={error} 
                                type="error" 
                                showIcon 
                                style={{ marginBottom: '20px' }}
                                closable
                                onClose={() => setError('')}
                            />
                        )}

                        <Row gutter={16}>
                            <Col span={12}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '8px', 
                                        color: '#333',
                                        fontWeight: '500'
                                    }}>
                                        Nombre *
                                    </label>
                                    <Input
                                        placeholder="Juan"
                                        prefix={<UserOutlined style={{ color: '#999' }} />}
                                        size="large"
                                        value={formData.nombre}
                                        onChange={(e) => handleChange('nombre', e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '8px', 
                                        color: '#333',
                                        fontWeight: '500'
                                    }}>
                                        Apellido *
                                    </label>
                                    <Input
                                        placeholder="Pérez"
                                        prefix={<UserOutlined style={{ color: '#999' }} />}
                                        size="large"
                                        value={formData.apellido}
                                        onChange={(e) => handleChange('apellido', e.target.value)}
                                    />
                                </div>
                            </Col>
                        </Row>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                color: '#333',
                                fontWeight: '500'
                            }}>
                                Correo electrónico *
                            </label>
                            <Input
                                placeholder="tu@email.com"
                                prefix={<MailOutlined style={{ color: '#999' }} />}
                                size="large"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                color: '#333',
                                fontWeight: '500'
                            }}>
                                Teléfono
                            </label>
                            <Input
                                type="tel"
                                placeholder="221-123-4567"
                                prefix={<PhoneOutlined style={{ color: '#999' }} />}
                                size="large"
                                value={formData.telefono}
                                onChange={(e) => handleChange('telefono', e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                color: '#333',
                                fontWeight: '500'
                            }}>
                                Contraseña *
                            </label>
                            <Input.Password
                                placeholder="Mínimo 6 caracteres"
                                prefix={<LockOutlined style={{ color: '#999' }} />}
                                size="large"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                color: '#333',
                                fontWeight: '500'
                            }}>
                                Confirmar contraseña *
                            </label>
                            <Input.Password
                                placeholder="Repetir contraseña"
                                prefix={<LockOutlined style={{ color: '#999' }} />}
                                size="large"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            />
                        </div>

                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            block
                            style={{ 
                                backgroundColor: '#1890ff',
                                borderColor: '#1890ff',
                                height: '45px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginBottom: '16px'
                            }}
                        >
                            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </Button>

                        <div style={{ 
                            textAlign: 'center', 
                            margin: '20px 0',
                            position: 'relative'
                        }}>
                            <div style={{ 
                                position: 'absolute', 
                                top: '50%', 
                                left: 0, 
                                right: 0, 
                                height: '1px', 
                                backgroundColor: '#e0e0e0' 
                            }}></div>
                            <span style={{ 
                                position: 'relative', 
                                backgroundColor: 'white', 
                                padding: '0 15px',
                                color: '#999',
                                fontSize: '14px'
                            }}>
                                o
                            </span>
                        </div>

                        <Button
                            type="default"
                            size="large"
                            block
                            icon={<LoginOutlined />}
                            onClick={() => navigate('/login')}
                            style={{ 
                                height: '45px',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            Ya tengo cuenta
                        </Button>
                    </form>
                </Card>
            </div>

            {/* Footer */}
            <footer style={{ 
                backgroundColor: '#333', 
                color: 'white', 
                textAlign: 'center', 
                padding: '20px',
                marginTop: '40px'
            }}>
                <p style={{ margin: 0 }}>
                    © 2025 Suchus Copy & Design. Todos los derechos reservados.
                </p>
            </footer>
        </div>
    );
}

export default Register;