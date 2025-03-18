import React, { useState, useEffect } from 'react';

const DarkMode: React.FC = () => {
    const [isDark, setIsDark] = useState<boolean>(() => {
        return JSON.parse(localStorage.getItem('darkMode') || "false");
    });

    useEffect(() => {
        document.body.classList.toggle('dark-mode', isDark);
        localStorage.setItem('darkMode', JSON.stringify(isDark));
    }, [isDark]);

    const toggleDarkmode = () => {
        setIsDark(prevMode => !prevMode);
    };

    return (
        <div className="dark-mode-toggle">
            <label className="switch">
                <input type="checkbox" checked={isDark} onChange={toggleDarkmode} />
                <span className="slider"></span>
            </label>
            <span className='dark-mode-text'>Dark Mode</span>
        </div>
    );
};

export default DarkMode;
