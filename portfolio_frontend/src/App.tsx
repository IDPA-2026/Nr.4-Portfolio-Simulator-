import { useState, useEffect } from 'react';
import PortfolioDashboard from './components/PortfolioDashboard';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import './App.css';

export default function App() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    return (
        <div className="app-container">
            <button
                onClick={() => setIsDark(!isDark)}
                className="theme-toggle"
            >
                {isDark ? <Sun className="sun" size={20} /> : <Moon className="moon" size={20} />}
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <PortfolioDashboard />
            </motion.div>
        </div>
    );
}