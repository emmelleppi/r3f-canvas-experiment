import { animated } from "@react-spring/web";
import styled from "styled-components/macro";

export const Char = styled(animated.span)`
  position: relative;
  display: inline-block;
`;
export const CharWrapper = styled.div`
  overflow: hidden;
`;
export const InputWrapper = styled(animated.div)`
  display: flex;
  justify-content: center;
`;
export const Input = styled.input`
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
`;
export const Button = styled.button`
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
`;
export const BlendingLayer = styled.div`
  width: 100vw;
  height: 100vh;
  background: white;
  pointer-events: none;
  mix-blend-mode: exclusion;
`;
export const LabelsWrapper = styled.div`
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
  cursor: ${(props) => (props.isActive ? "pointer" : "auto")};
`;
