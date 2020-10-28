import React, { useState, useEffect, useMemo } from "react";
import "./styles.css";
import { useSpring } from "@react-spring/three";
import { useSprings, config } from "@react-spring/web";
import "styled-components/macro";
import {
  Button,
  Char,
  CharWrapper,
  Input,
  InputWrapper,
} from "./DomComponents";
import { animationRef, useStore } from "./store";

function getCharTransform(x, step) {
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
}

const ANIMATIONS = (text) => ({
  0: (i) => ({
    from: { open: 0 },
    to: { open: 1 },
    delay: 1000 + i * 100,
  }),
  1: (i) => ({
    from: { open: 1 },
    to: { open: 0 },
    delay: (text.length - i) * 100,
  }),
  4: (i) => ({
    from: { open: 1 },
    to: { open: 0 },
    delay: 100 + (text.length - i) * 100,
  }),
  5: (i) => ({
    from: { open: 1 },
    to: { open: 0 },
    delay: 2000 + i * 100,
  }),
});

export default function DomContent(props) {
  const { steps } = props;
  const { step, increaseStep, resetStep } = useStore((s) => s);
  const [text] = useState(props.text.split(""));
  const animations = useMemo(() => ANIMATIONS(text),[text])

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
          await animate(animations[0]);
          break;
        case 1:
          await animate(animations[1]);
          increaseStep();
          break;
        case 2:
          await animate(animations[0]);
          break;
        case 3:
          await animateInput({ inputOpenHeight: 1 });
          await animateInput({ inputOpenWidth: 1 });
          break;
        case 4:
          await animateInput({ inputOpenWidth: 0 });
          await animateInput({ inputOpenHeight: 0 });
          await animate(animations[4]);
          increaseStep();
          break;
        case 5:
          await animate(animations[0]);
          await animate(animations[5]);
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
    <CharWrapper>
      {springs.map(({ open }, index) => (
        <Char
          key={`0${index}`}
          onClick={[-1, 0].includes(step) ? increaseStep : null}
          style={{
            opacity: text[index] === "_" ? 0 : 1,
            transform: open.to(x =>getCharTransform(x, step)),
          }}
        >
          {text[index]}
        </Char>
      ))}
      {[3, 4].includes(step) && (
        <InputWrapper
          style={{
            height: inputOpenHeight.to((x) => `${x * 8}rem`),
            opacity: inputOpenWidth,
          }}
        >
          <Input />
          <Button onClick={[3].includes(step) ? increaseStep : null}>◎</Button>
        </InputWrapper>
      )}
    </CharWrapper>
  );
}
