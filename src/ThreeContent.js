import { Environment, useTexture } from "@react-three/drei";
import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { useFrame } from "react-three-fiber";
import * as THREE from "three";
import "./styles.css";
import { a, useSpring } from "@react-spring/three";
import { config } from "@react-spring/web";
import "styled-components/macro";
import lerp from "lerp";
import { animationRef, useStore } from "./store";

const object1 = new THREE.Object3D();
const group = new THREE.Object3D();

const Content = forwardRef(function Content(props, { objectRef, groupRef }) {
  const { x, y, z, rotX, rotY, scale, ...allTheRest } = props;
  const textures = useTexture(["/AO.jpg","/HEIGHT.png","/NORMAL.jpg","/ROUGH.jpg"])
  useEffect(() => {
    textures.forEach(texture => {
        texture.wrapT = texture.wrapS = THREE.RepeatWrapping
        texture.repeat.set(4,4)
    })
  },[textures])
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
          scale-x={scale}
          scale-y={scale}
          scale-z={scale}
        >
          <torusBufferGeometry args={[6, 0.5, 64, 64]} />
          <meshStandardMaterial
            metalness={0.5}
            roughness={0.6}
            aoMap={textures[0]}
            displacementMap={textures[1]}
            normalMap={textures[2]}
            roughnessMap={textures[3]}
          />
        </a.mesh>
      </group>
      <pointLight position={[10, 0, 50]} intensity={4} />
      <pointLight position={[-10, 0, -50]} intensity={4} />
      <Environment files="studio_small_03_1k.hdr" />
    </>
  );
});

export function Slave(props) {
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

export function Master(props) {
  const objectRef = useRef();
  const groupRef = useRef();
  const { step, increaseStep } = useStore((s) => s);
  const [{ x, y, z, rotX, rotY, scale }, animate] = useSpring(
    {
      from: {
        x: -20,
        y: 0,
        z: 0,
        rotX: 0,
        rotY: Math.PI / 2,
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
    objectRef.current.rotation.z += 0.01
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
        scale={scale}
      />
    </>
  );
}
