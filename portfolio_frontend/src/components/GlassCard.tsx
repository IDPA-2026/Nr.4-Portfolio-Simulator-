import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    className?: string;
}

export default function GlassCard({ children, className = "" }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card ${className}`}
        >
            {children}
        </motion.div>
    );
}