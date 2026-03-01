import React from 'react';

interface LogoAMProps {
    size?: number;
    className?: string;
    showText?: boolean;
    variant?: 'gold' | 'white' | 'dark';
}

const LogoAM: React.FC<LogoAMProps> = ({ size = 100, className = "", variant = 'gold' }) => {
    const color = variant === 'gold' ? '#d4af37' : variant === 'white' ? '#ffffff' : '#000000';

    return (
        <div className={`flex flex-col items-center justify-center ${className}`} style={{ width: size, height: size * 1.2 }}>
            <svg
                viewBox="0 0 200 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-glow"
            >
                {/* Oval/Capsule Border */}
                <rect
                    x="20" y="20" width="160" height="200" rx="80"
                    stroke={color} strokeWidth="4"
                />

                {/* Bottom Circle */}
                <circle cx="100" cy="195" r="30" stroke={color} strokeWidth="4" />
                <circle cx="100" cy="195" r="22" stroke={color} strokeWidth="2" strokeDasharray="4 2" />

                {/* Top Glass and Bottle */}
                <g stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    {/* Bottle */}
                    <path d="M125 40 L125 55 L135 65 L135 120 L115 120 L115 65 L125 55" />
                    <rect x="119" y="80" width="12" height="25" rx="1" strokeWidth="2" />

                    {/* Glass */}
                    <path d="M75 100 L125 100" strokeWidth="2" /> {/* Table line */}
                    <path d="M100 80 Q100 120 85 120 L80 120 Q65 120 65 80 Z" />
                    <path d="M82.5 120 L82.5 135" />
                    <path d="M70 135 L95 135" />
                </g>

                {/* "AM" Text */}
                <text
                    x="100" y="145"
                    fill={color}
                    fontSize="75"
                    fontWeight="900"
                    textAnchor="middle"
                    fontFamily="serif"
                    style={{ letterSpacing: '-4px' }}
                >
                    AM
                </text>

                {/* "LICORES" Text */}
                <text
                    x="100" y="170"
                    fill={color}
                    fontSize="22"
                    fontWeight="900"
                    textAnchor="middle"
                    fontFamily="Outfit, sans-serif"
                    style={{ letterSpacing: '4px' }}
                >
                    LICORES
                </text>

                {/* "DESDE" - Curved path top left */}
                <defs>
                    <path id="curveLeft" d="M35 110 Q35 50 100 50" />
                    <path id="curveRight" d="M100 50 Q165 50 165 110" />
                </defs>
                <text fill={color} fontSize="12" fontWeight="bold" fontFamily="Outfit">
                    <textPath href="#curveLeft" startOffset="20%">DESDE</textPath>
                </text>
                <text fill={color} fontSize="12" fontWeight="bold" fontFamily="Outfit">
                    <textPath href="#curveRight" startOffset="45%">2025</textPath>
                </text>

                {/* Small deco lines */}
                <line x1="100" y1="130" x2="100" y2="135" stroke={color} strokeWidth="1" />
            </svg>
        </div>
    );
};

export default LogoAM;
