// components/cosmic/CosmicVideoBackground.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface CosmicVideoBackgroundProps {
  videoSrc: string;
  fallbackImage?: string;
  overlay?: boolean;
  opacity?: number;
  blur?: boolean;
}

export default function CosmicVideoBackground({
  videoSrc,
  fallbackImage, // Remove default fallback
  overlay = true,
  opacity = 0.6,
  blur = false
}: CosmicVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoad = () => {
      console.log('🎬 Video loaded and ready!');
      setIsLoaded(true);
      video.play().catch((error) => {
        console.log('Autoplay failed (normal in some browsers):', error);
        // Fallback: try to play on user interaction
        document.addEventListener('touchstart', () => {
          video.play().catch(() => {});
        }, { once: true });
      });
    };

    const handleError = () => {
      console.error('❌ Video loading failed');
      setHasError(true);
    };

    video.addEventListener('loadeddata', handleLoad);
    video.addEventListener('canplay', handleLoad); // Additional trigger
    video.addEventListener('error', handleError);

    // Force check if already loaded
    if (video.readyState >= 3) {
      handleLoad();
    }

    return () => {
      video.removeEventListener('loadeddata', handleLoad);
      video.removeEventListener('canplay', handleLoad);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="cosmic-video-container">
      {/* Video Background */}
      {!hasError && (
        <video
          ref={videoRef}
          className={`cosmic-video-bg ${blur ? 'blur-sm' : ''} transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ opacity: isLoaded ? opacity : 0 }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          webkit-playsinline="true"
          onLoadedData={() => console.log('🎥 Video data loaded')}
          onCanPlay={() => console.log('▶️ Video can play')}
          onPlay={() => console.log('🚀 Video started playing')}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Fallback Image */}
      {fallbackImage && (hasError || !isLoaded) && (
        <div
          className="cosmic-fallback-bg"
          style={{
            backgroundImage: `url(${fallbackImage})`,
            opacity: hasError ? opacity : 0.3
          }}
        />
      )}

      {/* Cosmic Overlay */}
      {overlay && (
        <div className="cosmic-video-overlay">
          {/* Gradient Overlay */}
          <div className="cosmic-gradient-overlay" />
          
          {/* Twinkling Stars - Fixed hydration */}
          <div className="cosmic-stars">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="cosmic-star"
                style={{
                  left: `${(i * 7.3) % 100}%`, // Fixed positions to prevent hydration issues
                  top: `${(i * 11.7) % 100}%`,
                  animationDelay: `${(i * 0.3) % 3}s`,
                  animationDuration: `${2.5 + (i % 3) * 0.5}s`
                }}
              />
            ))}
          </div>

          {/* Floating Nebula Clouds - Fixed positions */}
          <div className="cosmic-nebula">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="nebula-cloud"
                style={{
                  left: `${20 + i * 30}%`, // Fixed positions
                  top: `${15 + i * 25}%`,
                  animationDelay: `${i * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// CSS Styles to add to globals.css
const styles = `
/* Cosmic Video Background Styles */
.cosmic-video-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -10;
  overflow: hidden;
}

.cosmic-video-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
  transition: opacity 1s ease-in-out;
}

.cosmic-fallback-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: opacity 1s ease-in-out;
}

.cosmic-video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.cosmic-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 15, 0.7) 0%,
    rgba(233, 69, 96, 0.1) 25%,
    rgba(243, 156, 18, 0.1) 50%,
    rgba(10, 10, 15, 0.8) 100%
  );
}

.cosmic-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.cosmic-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 3s infinite;
  box-shadow: 0 0 6px #fff, 0 0 12px #fff;
}

.cosmic-star:nth-child(3n) {
  background: #e94560;
  box-shadow: 0 0 6px #e94560, 0 0 12px #e94560;
}

.cosmic-star:nth-child(5n) {
  background: #f39c12;
  box-shadow: 0 0 6px #f39c12, 0 0 12px #f39c12;
}

.cosmic-nebula {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.nebula-cloud {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(233, 69, 96, 0.1) 0%,
    rgba(243, 156, 18, 0.05) 50%,
    transparent 70%
  );
  animation: float 8s ease-in-out infinite;
  filter: blur(2px);
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
  25% { transform: translateY(-20px) translateX(10px) scale(1.1); }
  50% { transform: translateY(-10px) translateX(-15px) scale(0.9); }
  75% { transform: translateY(-30px) translateX(5px) scale(1.05); }
}

/* Mobile Optimization */
@media (max-width: 768px) {
  .cosmic-video-bg {
    /* Use fallback image on mobile to save bandwidth */
    display: none;
  }
  
  .cosmic-fallback-bg {
    display: block !important;
    opacity: 0.6 !important;
  }
  
  .nebula-cloud {
    width: 200px;
    height: 200px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .cosmic-star,
  .nebula-cloud {
    animation: none;
  }
}
`;

export { styles as CosmicVideoStyles };