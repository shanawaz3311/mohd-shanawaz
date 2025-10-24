
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="text-right text-lg font-mono text-brand-accent">
            {time.toLocaleTimeString()}
        </div>
    );
};

export default Clock;
