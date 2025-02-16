import { useCallback } from 'react';
import { Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const AnimatedBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options = {
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 30,
    particles: {
      color: {
        value: '#ffffff',
      },
      links: {
        color: '#ffffff',
        distance: 150,
        enable: true,
        opacity: 0.15,
        width: 0.8,
      },
      move: {
        enable: true,
        outModes: {
          default: 'out',
        },
        random: false,
        speed: 0.5,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 1000,
        },
        value: 60,
      },
      opacity: {
        value: 0.15,
        animation: {
          enable: true,
          speed: 0.5,
          minimumValue: 0.1,
        },
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 2 },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab',
          parallax: {
            enable: true,
            force: 20,
            smooth: 20,
          },
        },
      },
      modes: {
        grab: {
          distance: 200,
          links: {
            opacity: 0.3,
          },
        },
      },
    },
    detectRetina: true,
    smooth: true,
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={options}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedBackground; 