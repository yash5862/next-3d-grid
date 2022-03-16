import { useThree } from '@react-three/fiber'
import CameraControls from "./orbitControls";
import { AdaptiveDpr } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import { Plane } from './plane';
import Model, { Rendered3DProps } from './3d.modal';
import React from "react";

const Renderer3D = (props: Rendered3DProps & any) => {

    const {
        camera,
        gl: { domElement },
    } = useThree();

    return <>
        <CameraControls camera={camera} domElement={domElement} />
        <AdaptiveDpr pixelated={true} />
        <directionalLight position={[10, 10, 5]} color={0xF8F0E3} intensity={0.9} />
        <directionalLight position={[-10, 10, 5]} color={0xF8F0E3} intensity={0.9} />
        <directionalLight position={[0, 0, 6]} color={0xF8F0E3} intensity={0.5} />
        <directionalLight position={[0, 0, -6]} color={0xF8F0E3} intensity={0.5} />
        {/*<ambientLight intensity={0.5} />*/}
        <Physics>

            <Model path={props.path}
                scale={props.scale}
                position={props.position}
                keyboardTranslate={props.keyboardTranslate}
                animations={props.animations}
                externalAnimation={props.externalAnimation}
            />

            <Plane />
        </Physics>
    </>;

}

export default Renderer3D;