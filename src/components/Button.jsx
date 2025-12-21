import React from 'react';

const Button = ({ children, onClick, type = "button", variant = "primary", disabled, style }) => {
    const baseStyle = {
        padding: '12px 24px',
        borderRadius: 'var(--radius)',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        transition: 'var(--transition)',
        opacity: disabled ? 0.7 : 1,
    };

    const styles = {
        primary: {
            ...baseStyle,
            backgroundColor: 'var(--primary)',
            color: '#fff',
        },
        secondary: {
            ...baseStyle,
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
        }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{ ...styles[variant], ...style }}
            onMouseOver={(e) => !disabled && (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseOut={(e) => !disabled && (e.currentTarget.style.filter = 'brightness(1)')}
        >
            {children}
        </button>
    );
};

export default Button;
