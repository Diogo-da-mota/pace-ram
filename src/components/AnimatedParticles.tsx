import React from 'react';

interface AnimatedParticlesProps {
  count?: number;
  className?: string;
}

const AnimatedParticles: React.FC<AnimatedParticlesProps> = ({ 
  count = 6, 
  className = "" 
}) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1, // 1-5px
    left: Math.random() * 100, // 0-100%
    top: Math.random() * 100, // 0-100%
    delay: Math.random() * 3, // 0-3s delay
    duration: Math.random() * 2 + 3, // 3-5s duration
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-white/20 rounded-full animate-float"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedParticles;