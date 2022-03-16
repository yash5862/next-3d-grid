import { useFrame, extend } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface CameraControlProps {
    camera: any,
    domElement: any
}

extend({ OrbitControls });

const CameraControls = (props: CameraControlProps) => {
  const controls = useRef<any>(null);
  useFrame(() => {
    if (controls && controls.current && controls.current != null) {
      controls.current.update();
    }
  });
  return (
    // @ts-ignore
    <orbitControls
      ref={controls}
      args={[props.camera, props.domElement]}
      enableZoom={false}
      enablePan={false}
    />
  );
};

export default CameraControls;
