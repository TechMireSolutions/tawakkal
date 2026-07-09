import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const InteractiveScene = ({ id }) => {
  const containerRef = useRef(null);
  const meshRef = useRef(null);

  useEffect(() => {
    // ... GSAP code
    gsap.to(meshRef.current?.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }, []);
  return (
    <section ref={containerRef} id={id} className="h-[70vh] w-full bg-ivory relative overflow-hidden">
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <h2 className="text-6xl md:text-9xl font-bold opacity-[0.03] text-charcoal select-none">
          CRAFTED <span className="gold-gradient italic">LUXURY</span>
        </h2>
      </div>

      <Canvas className="z-0">
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
            <mesh ref={meshRef} position={[0, 0, 0]}>
              <torusKnotGeometry args={[1, 0.3, 128, 32]} />
              <meshStandardMaterial color="#e6a13b" metalness={0.8} roughness={0.2} />
              <MeshDistortMaterial
                color="#e6a13b"
                speed={2}
                distort={0.4}
                radius={1}
              />
            </mesh>
          </Float>
        </Suspense>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="absolute bottom-10 left-10 z-20 max-w-xs hidden md:block">
        <p className="text-gold uppercase text-[10px] tracking-widest font-bold mb-2">Technological Precision</p>
        <p className="text-charcoal/60 text-xs leading-relaxed">
          Our garments are crafted using the finest materials and modern techniques, ensuring a perfect fit and timeless appeal.
        </p>
      </div>
    </section>
  );
};

export default InteractiveScene;
