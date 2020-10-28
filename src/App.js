import { Environment, Loader, Stats } from "@react-three/drei";
import React, {
  createRef,
  forwardRef,
  Suspense,
  useState,
  useEffect,
  useRef,
} from "react";
import { Canvas, useFrame } from "react-three-fiber";
import * as THREE from "three";
import "./styles.css";
import { a, useSpring } from "@react-spring/three";
import { animated, useSprings, config } from "@react-spring/web";
import "styled-components/macro";
import lerp from "lerp";
import create from "zustand";

const object1 = new THREE.Object3D();
const group = new THREE.Object3D();
const animationRef = createRef();

const useStore = create((set) => ({
  step: -1,
  increaseStep: () =>
    set((state) => ({ step: state.step === -1 ? 1 : state.step + 1 })),
  resetStep: () => set({ step: 0 }),
}));

const Content = forwardRef(function Content(props, { objectRef, groupRef }) {
  const { x, y, z, rotX, rotY, rotZ, scale, ...allTheRest } = props;
  return (
    <>
      <group ref={groupRef} {...allTheRest}>
        <a.mesh
          ref={objectRef}
          position-x={x}
          position-y={y}
          position-z={z}
          rotation-y={rotY}
          rotation-x={rotX}
          rotation-z={rotZ}
          scale-x={scale}
          scale-y={scale}
          scale-z={scale}
        >
          <torusBufferGeometry args={[6, 1, 64, 64]} />
          <meshStandardMaterial color="white" metalness={0.7} roughness={0.3} />
        </a.mesh>
      </group>
      <pointLight position={[10, 0, 50]} intensity={4} />
      <pointLight position={[-10, 0, -50]} intensity={4} />
      <Environment files="studio_small_03_1k.hdr" />
    </>
  );
});

function Slave(props) {
  const objectRef = useRef();
  const groupRef = useRef();
  useFrame(() => {
    objectRef.current.position.copy(object1.position);
    objectRef.current.rotation.copy(object1.rotation);
    objectRef.current.scale.copy(object1.scale);
    groupRef.current.rotation.copy(group.rotation);
  });
  return (
    <>
      <fog attach="fog" args={["black", 0, 100]} />
      <Content ref={{ objectRef, groupRef }} {...props} />
    </>
  );
}

function Master(props) {
  const objectRef = useRef();
  const groupRef = useRef();
  const { step, increaseStep } = useStore((s) => s);
  const [{ x, y, z, rotX, rotY, rotZ, scale }, animate] = useSpring(
    {
      from: {
        x: -20,
        y: 0,
        z: 0,
        rotX: 0,
        rotY: Math.PI / 2,
        rotZ: 0,
        scale: 1,
      },
      to: {
        x: 20,
      },
      config: {
        friction: 50,
      },
      delay: 1000,
    },
    []
  );
  useEffect(() => animationRef.current.start(), []);
  useEffect(() => {
    async function animateSpring() {
      switch (step) {
        case 0:
          await animate({
            x: -20,
            y: 0,
            z: 0,
            rotX: 0,
            rotY: Math.PI / 2,
            rotZ: 0,
            scale: 1,
            config: {
              friction: 50,
            },
          });
          await animate({
            x: 20,
          });
          break;
        case 1:
          await animate({
            x: -20,
          });
          await animate({
            x: 0,
            rotY: -Math.PI * 2,
            z: 8,
            config: config.molasses,
          });
          await animate({
            scale: 30,
          });
          await animate({
            y: 0,
            z: -16,
            rotX: Math.PI * 2,
            rotY: -Math.PI * 2,
            rotZ: Math.PI * 2,
            scale: 2,
            config: config.molasses,
          });
          increaseStep();
          break;
        default:
          break;
      }
    }
    animateSpring();
  }, [step, animate, increaseStep]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    groupRef.current.rotation.z = lerp(
      groupRef.current.rotation.y,
      0.2 * Math.sin(time),
      0.01
    );
    groupRef.current.rotation.y = lerp(
      groupRef.current.rotation.y,
      0.2 * Math.sin(time),
      0.01
    );
    groupRef.current.rotation.x = lerp(
      groupRef.current.rotation.x,
      0.2 * Math.cos(time),
      0.01
    );
    object1.position.copy(objectRef.current.position);
    object1.rotation.copy(objectRef.current.rotation);
    object1.scale.copy(objectRef.current.scale);
    group.rotation.copy(groupRef.current.rotation);
  });

  return (
    <>
      <fog attach="fog" args={["black", 0, 100]} />
      <Content
        ref={{ objectRef, groupRef }}
        {...props}
        x={x}
        y={y}
        z={z}
        rotX={rotX}
        rotY={rotY}
        rotZ={rotZ}
        scale={scale}
      />
    </>
  );
}

function DomContent(props) {
  const { steps } = props;
  const { step, increaseStep, resetStep } = useStore((s) => s);
  const [text] = useState(props.text.split(""));

  const [springs, animate] = useSprings(text.length, (i) => ({
    ref: animationRef,
    from: { open: 0 },
    to: { open: 1 },
    config: config.gentle,
    delay: 1000 + i * 100,
  }));

  const [{ inputOpenHeight, inputOpenWidth }, animateInput] = useSpring(
    {
      inputOpenHeight: 0,
      inputOpenWidth: 0,
    },
    []
  );

  useEffect(() => {
    async function animateSpring() {
      if (!steps.includes(step)) return;
      switch (step) {
        case 0:
          await animate((i) => ({
            from: { open: 0 },
            to: { open: 1 },
            delay: 1000 + i * 100,
          }));
          break;
        case 1:
          await animate((i) => ({
            from: { open: 1 },
            to: { open: 0 },
            delay: (text.length - i) * 100,
          }));
          increaseStep();
          break;
        case 2:
          await animate((i) => ({
            from: { open: 0 },
            to: { open: 1 },
            delay: 1000 + i * 100,
          }));
          break;
        case 3:
          await animateInput({ inputOpenHeight: 1 });
          await animateInput({ inputOpenWidth: 1 });
          break;
        case 4:
          await animateInput({ inputOpenWidth: 0 });
          await animateInput({ inputOpenHeight: 0 });
          await animate((i) => ({
            from: { open: 1 },
            to: { open: 0 },
            delay: 100 + (text.length - i) * 100,
          }));
          increaseStep();
          break;
        case 5:
          await animate((i) => ({
            from: { open: 0 },
            to: { open: 1 },
            delay: 1000 + i * 100,
          }));
          await animate((i) => ({
            from: { open: 1 },
            to: { open: 0 },
            delay: 2000 + i * 100,
          }));
          resetStep();
          break;
        default:
          break;
      }
    }
    animateSpring();
  }, [
    step,
    text.length,
    steps,
    animate,
    resetStep,
    increaseStep,
    animateInput,
  ]);
  return (
    <div
      css={`
        overflow: hidden;
      `}
    >
      {springs.map(({ open }, index) => (
        <animated.span
          key={`0${index}`}
          onClick={[-1, 0].includes(step) ? increaseStep : null}
          style={{
            position: "relative",
            display: "inline-block",
            opacity: text[index] === "_" ? 0 : 1,
            transform: open.to((x) => {
              switch (step) {
                case 0:
                  return `translate3d(0,${(1 - x) * 16}rem,0)`;
                case 1:
                  return `rotateX(${(1 - x) * 90}deg)`;
                case 2:
                  return `translate3d(0,${(1 - x) * -16}rem,0)`;
                case 4:
                  return `rotateY(${(1 - x) * 90}deg)`;
                case 5:
                  return `rotateY(${(1 - x) * -90}deg)`;
                default:
                  return `translate3d(0,${(1 - x) * 16}rem,0)`;
              }
            }),
          }}
        >
          {text[index]}
        </animated.span>
      ))}
      {[3, 4].includes(step) && (
        <animated.div
          style={{
            display: "flex",
            justifyContent: "center",
            height: inputOpenHeight.to((x) => `${x * 8}rem`),
            opacity: inputOpenWidth,
          }}
        >
          <input
            css={`
              width: 64rem;
              height: 8rem;
              border-radius: 2rem 0rem 0rem 2rem;
              font-size: 5rem;
              font-weight: 600;
              -webkit-letter-spacing: -4px;
              -moz-letter-spacing: -4px;
              -ms-letter-spacing: -4px;
              letter-spacing: -4px;
              padding: 2rem;
              border: 0.3rem white solid;
              background: transparent;
              color: white;
              text-align: center;
              border-right: none;
              :focus {
                outline: none;
              }
            `}
          />
          <button
            onClick={[3].includes(step) ? increaseStep : null}
            css={`
              border: none;
              width: 15rem;
              border-radius: 0rem 2rem 2rem 0rem;
              font-size: 5rem;
              cursor: pointer;
              :hover {
                color: gray;
              }
              :focus {
                outline: none;
              }
            `}
          >
            ◎
          </button>
        </animated.div>
      )}
    </div>
  );
}

function Scene() {
  const step = useStore((s) => s.step);
  return (
    <div className="wrapper">
      <Canvas
        concurrent
        colorManagement
        className="canvas"
        camera={{ position: [0, 0, 20], far: 1000, near: 19.8, fov: 70 }}
      >
        <Suspense fallback={null}>
          <Master />
        </Suspense>
      </Canvas>
      <div className="out">
        <div>
          <div
            css={`
              position: absolute;
              width: 100vw;
              transform: translate3d(-50%, -50%, 0);
              padding: 1rem;
              font-size: 8rem;
              font-weight: 600;
              color: #000;
              white-space: pre;
              font-weight: 800;
              letter-spacing: -6px;
              cursor: ${[-1, 0].includes(step) ? "pointer" : "auto"};
            `}
          >
            {[-1, 0, 1].includes(step) && (
              <DomContent text="CLICK HERE" steps={[-1, 0, 1]} />
            )}
            {[2, 3, 4].includes(step) && (
              <DomContent text="INSERT_YOUR_EMAIL" steps={[2, 3, 4]} />
            )}
            {[5].includes(step) && <DomContent text="THANK_YOU" steps={[5]} />}
          </div>
        </div>
      </div>
      <Canvas
        concurrent
        colorManagement
        className="canvas"
        camera={{ position: [0, 0, 20], far: 20, near: 0.1, fov: 70 }}
      >
        <Suspense fallback={null}>
          <Slave />
        </Suspense>
      </Canvas>
      <Loader />
      <Stats />
      <div
        css={`
          width: 100vw;
          height: 100vh;
          background: white;
          pointer-events: none;
          mix-blend-mode: exclusion;
        `}
      />
    </div>
  );
}

export default function App() {
  return <Scene />;
}
