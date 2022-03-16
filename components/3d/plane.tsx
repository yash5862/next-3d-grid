import {usePlane} from "@react-three/cannon";

function Plane() {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, -2.3, 0],
        color: "#808080"
    }));
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeBufferGeometry attach="geometry" args={[10, 10]} />
            <meshBasicMaterial attach="material" color="#808080" />
        </mesh>
    );
}

export { Plane }