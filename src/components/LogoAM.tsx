import React from 'react';

interface LogoAMProps {
    size?: number;
    className?: string;
    showText?: boolean;
    variant?: 'gold' | 'white' | 'dark';
}

const LogoAM: React.FC<LogoAMProps> = ({ size = 100, className = "", variant = 'gold' }) => {
    // Map variant to gradient ID
    const gradientId = variant === 'gold' ? 'goldGradient' : variant === 'white' ? 'whiteGradient' : 'darkGradient';
    const mainFillValue = `url(#${gradientId})`;

    return (
        <div className={`flex flex-col items-center justify-center ${className} hover:scale-[1.02] transition-transform duration-300`} style={{ width: size, height: size * 1.2 }}>
            <svg
                viewBox="0 0 200 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-2xl"
                style={variant === 'gold' ? { filter: 'drop-shadow(0px 0px 8px rgba(212, 175, 55, 0.4))' } : {}}
            >
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FDF0A6" />
                        <stop offset="30%" stopColor="#D4AF37" />
                        <stop offset="70%" stopColor="#AA7F1E" />
                        <stop offset="100%" stopColor="#6D4C00" />
                    </linearGradient>
                    <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#A0A0A0" />
                    </linearGradient>
                    <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#555555" />
                        <stop offset="100%" stopColor="#000000" />
                    </linearGradient>
                    <path id="curveLeft" d="M35 110 Q35 50 100 50" />
                    <path id="curveRight" d="M100 50 Q165 50 165 110" />
                </defs>

                {/* Oval/Capsule Border */}
                <rect
                    x="20" y="20" width="160" height="200" rx="80"
                    stroke={mainFillValue} strokeWidth="3"
                />

                {/* Bottom Circle */}
                <circle cx="100" cy="195" r="30" stroke={mainFillValue} strokeWidth="3" />
                <circle cx="100" cy="195" r="22" stroke={mainFillValue} strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Top Glass and Bottle */}
                <g stroke={mainFillValue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                    fill={mainFillValue}
                    fontSize="75"
                    fontWeight="900"
                    textAnchor="middle"
                    fontFamily="serif"
                    style={{ letterSpacing: '-6px' }}
                >
                    AM
                </text>

                {/* "LICORES" Text */}
                <text
                    x="100" y="170"
                    fill={mainFillValue}
                    fontSize="22"
                    fontWeight="900"
                    textAnchor="middle"
                    fontFamily="Outfit, sans-serif"
                    style={{ letterSpacing: '5px' }}
                >
                    LICORES
                </text>

                {/* Small deco lines */}
                <text fill={mainFillValue} fontSize="12" fontWeight="900" fontFamily="Outfit, sans-serif" letterSpacing="2px">
                    <textPath href="#curveLeft" startOffset="20%">DESDE</textPath>
                </text>
                <text fill={mainFillValue} fontSize="12" fontWeight="900" fontFamily="Outfit, sans-serif" letterSpacing="2px">
                    <textPath href="#curveRight" startOffset="45%">2025</textPath>
                </text>

                {/* Small deco lines */}
                <line x1="100" y1="130" x2="100" y2="135" stroke={mainFillValue} strokeWidth="1" />
            </svg>
        </div>
    );
};

export default LogoAM;
