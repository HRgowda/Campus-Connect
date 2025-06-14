declare module 'react-typewriter-effect' {
  import { FC } from 'react';

  interface TypewriterProps {
    text: string;
    typeSpeed?: number;
    cursorColor?: string;
    startDelay?: number;
    className?: string;
  }

  const Typewriter: FC<TypewriterProps>;
  export default Typewriter;
}