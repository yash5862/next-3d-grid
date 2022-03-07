import { useFrame, useThree, extend } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });

const CameraControls = ({ camera, gl, domElement }) => {
  const controls = useRef();
  useFrame((state) => controls.current.update());
  return (
    // @ts-ignore
    <orbitControls
      ref={controls}
      args={[camera, domElement]}
      enableZoom={false}
      enablePan={false}
    />
  );
};

export default CameraControls;
