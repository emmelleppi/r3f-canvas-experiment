import { Box, ContactShadows, Environment, Loader, Stats, useAspect, useTexture } from "@react-three/drei";
import React, { createRef, forwardRef, Suspense, useCallback,useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import * as THREE from "three";
import "./styles.css";
import { LineMaterial } from "./lineMaterial"
import { a, useSpring } from "@react-spring/three";
import { animated, useSprings } from "@react-spring/web";
import styled from "styled-components/macro";
import create from 'zustand'

const object1 = new THREE.Object3D();
const group = new THREE.Object3D();
const animationRef = createRef()

const useStore = create(set => ({
  step: 0,
  increaseStep: () => set(state => ({ step: state.step + 1 })),
  resetStep: () => set({ step: 0 })
}))

const Content = forwardRef(function Content(props, { objectRef, groupRef }) {
  const { x, y, z, rotX, rotY, groupRotX, scale, ...allTheRest } = props;
  const { size } = useThree()
  const paperTexture = useTexture("/Craft_Rough.jpg")

  return (
    <a.group ref={groupRef} rotation-x={groupRotX} >
      <group {...allTheRest}>
        <a.mesh ref={objectRef} position-x={x} position-y={y} position-z={z} rotation-y={rotY} rotation-x={rotX} scale-x={scale} scale-y={scale} scale-z={scale}>
          <torusBufferGeometry args={[6, 1, 32, 32]} />
          <meshPhysicalMaterial
            color={new THREE.Color(0xff0000)}
            roughness={0.4}
            metalness={0.8}
            resolution={[size.width, size.height]}
          />
        </a.mesh>
      </group>
      <mesh position={[0, 0, 20]} rotation-z={Math.PI/2} >
        <cylinderBufferGeometry args={[50, 50, 300, 32, 32, true]}/>
        <meshPhysicalMaterial
          color={new THREE.Color(0x333333)}
          roughness={0.4}
          metalness={0.8}
          side={THREE.BackSide}
        />
      </mesh>
      <pointLight position={[10, 0, 10]} intensity={4} />
      <pointLight position={[-10, 0, -10]} intensity={4} />
      <Environment files="rooftop_night_1k.hdr" />
    </a.group>
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
  return <Content ref={{ objectRef, groupRef }} {...props} />;
}

function Master(props) {
  const objectRef = useRef()
  const groupRef = useRef()

  const step = useStore(s => s.step)
  const [{ x, y, z, rotX, rotY, groupRotX, scale }, animate] = useSpring({
    from: { x: -20, y: 0, z: 0, rotX: 0, rotY:  Math.PI/2, groupRotX: 0, scale: 1 },
    to: { x: 20, y: 0, z: 0, rotX: 0, rotY:  Math.PI/2, groupRotX: 0, scale: 1 },
    loop: { reverse: true },
    config: {
      mass: 20,
      tension: 163,
      friction: 100
    }
  },[])

  useEffect(() => animationRef.current.start(), [])
  useEffect(async () => {
    if (step === 0) {
      await animate({
        to: { x: -20, y: 0, z: 0, rotX: 0, rotY:  Math.PI/2, groupRotX: 0, scale: 1 },
      })
      await animate({
        from: { x: -20, y: 0, z: 0, rotX: 0, rotY:  Math.PI/2, groupRotX: 0, scale: 1 },
        to: { x: 20, y: 0, z: 0, rotX: 0, rotY:  Math.PI/2, groupRotX: 0, scale: 1 },
        loop: { reverse: true },
      })
    }
    if (step === 1) {
      await animate({
        to: { x: 0, y: 0, rotY: 0, groupRotX: Math.PI, z: -10 },
        delay: 100,
      })
      await animate({
        from: { x: 0, y: 0, rotY: 0, groupRotX: Math.PI, z: -10, rotX: 0, scale: 1 },
        to: async animate => {
          await animate({
            x: 0, y: 0, rotY: 0, groupRotX: Math.PI, z: 0, rotX: Math.PI/2, scale: 4
          })
          await animate({
            x: 0, y: 10, rotY: 0, groupRotX: Math.PI, z: 0, rotX: Math.PI/2, scale: 2
          })
          await animate({
            x: 0, y: -10, rotY: 0, groupRotX: Math.PI, z: 0, rotX: Math.PI/2, scale: 2
          })
          await animate({
            x: 0, y: 1, rotY: 0, groupRotX: Math.PI, z: 10, rotX: 0, scale: 2
          })
        },
      })
    }
  }, [step, animate])

  useFrame(() => {
    objectRef.current.rotation.z += 0.01
    object1.position.copy(objectRef.current.position);
    object1.rotation.copy(objectRef.current.rotation);
    object1.scale.copy(objectRef.current.scale);
    group.rotation.copy(groupRef.current.rotation);
  });

  return (
    <>
      <Content ref={{ objectRef, groupRef }} {...props} x={x} y={y} z={z} rotX={rotX} rotY={rotY} groupRotX={groupRotX} scale={scale}/>
    </>
  )
}

function DomContent() {
  const { step, increaseStep, resetStep } = useStore(s => s)
  const [text, setText] = useState("Marcy___gay".split(""))

  const [springs, animate] = useSprings(text.length, i => ({
    ref: animationRef,
    from: { open: 0 },
    to: { open: 1 },
    delay: 1000 + i * 100,
  }));

  useEffect(async () => {
    if (step === 0 || step === 2) {
      await animate(i => ({
        from: { open: 0 },
        to: { open: 1 },
        delay: 1000 + i * 100,
      }))
    }
    if (step === 1 || step === 3) {
      await animate({
        from: { open: 1 },
        to: { open: 0 },
        delay: 100,
      })
      if (step === 3) {
        resetStep()
      } else {
        increaseStep()
      }
    }
  }, [step, animate, resetStep, increaseStep])

  return <div onClick={increaseStep} css={`
    overflow: hidden;
  `}>
    {springs.map(({ open }, index) =>  <animated.span key={`0${index}`} style={{
        position: "relative",
        display: "inline-block",
        opacity: text[index] === "_" ? 0 : 1,
        transform: open.to(x => {
          if (step === 0 || step === 2) {
            return `translate3d(0,${(1 - x) * 16}rem,0) rotateZ(${(1 - x) * 180}deg)`
          }
          if (step === 1 || step === 3) {
            return `rotateX(${(1 - x) * 90}deg)`
          }
        }),
      }}>{text[index]}</animated.span>
    )}
  </div>
}

function Scene() {
  return (
    <div className="wrapper">
      <Canvas
        concurrent
        colorManagement
        className="canvas"
        camera={{ position: [0, 0, 20], far: 1000, near: 19.9, fov: 70 }}
      >
        <Suspense fallback={null}>
          <Master/>
        </Suspense>
      </Canvas>
      <div className="out">
        <div>
          <div
            css={`
              position: absolute;
              transform: translate3d(-50%, -50%, 0);
              padding: 1rem; 
              font-family: "Reenie Beanie";
              font-size: 10rem;
              font-weight: 600;
              color: #000;
            `}
          >
            <DomContent />
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
          <Slave/>
        </Suspense> 
      </Canvas>
      <Loader />
      <Stats />
    </div>
  );
}

export default function App() {
  return <Scene />;
}
