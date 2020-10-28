import { Loader } from "@react-three/drei";
import React, { Suspense } from "react";
import { Canvas } from "react-three-fiber";
import "./styles.css";
import "styled-components/macro";
import { BlendingLayer, LabelsWrapper } from "./DomComponents";
import { useStore } from "./store";
import DomContent from "./DomContent";
import { Master, Slave } from "./ThreeContent";

export default function App() {
  const step = useStore((s) => s.step);
  return (
    <div className="wrapper">
      <Canvas
        concurrent
        className="canvas"
        camera={{ position: [0, 0, 20], far: 1000, near: 19.8, fov: 70 }}
      >
        <Suspense fallback={null}>
          <Master />
        </Suspense>
      </Canvas>
      <div className="out">
        <div>
          <LabelsWrapper isActive={[-1, 0].includes(step)}>
            {[-1, 0, 1].includes(step) && (
              <DomContent text="CLICK HERE" steps={[-1, 0, 1]} />
            )}
            {[2, 3, 4].includes(step) && (
              <DomContent text="INSERT_YOUR_EMAIL" steps={[2, 3, 4]} />
            )}
            {[5].includes(step) && <DomContent text="THANK_YOU" steps={[5]} />}
          </LabelsWrapper>
        </div>
      </div>
      <Canvas
        concurrent
        className="canvas"
        camera={{ position: [0, 0, 20], far: 20, near: 0.1, fov: 70 }}
      >
        <Suspense fallback={null}>
          <Slave />
        </Suspense>
      </Canvas>
      <Loader />
      <BlendingLayer />
    </div>
  );
}
