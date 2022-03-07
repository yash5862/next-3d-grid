import {usePlane} from "@react-three/cannon";

function Plane(props) {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, -2.3, 0],
        color: "",
        ...props
    }));
    return (
        <mesh ref={ref}>
            <planeBufferGeometry args={[0, 0]} />
        </mesh>
    );
}

export { Plane }