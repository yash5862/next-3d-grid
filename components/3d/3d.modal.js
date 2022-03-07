import React, { useEffect, useState, Suspense } from 'react';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as THREE from 'three';
import { getFileExtension } from '../../utils/utils';
import { Html, useProgress } from '@react-three/drei'

const Model = (props) => {
    let {
        path,
        scale,
        rotation,
        position = [0, 0, 0],
    } = props;

    const { progress } = useProgress()
    const pathIsFile = path instanceof File;
    const [object, setObject] = useState(null);

    useEffect(() => {
        setObject(null);
        let url = pathIsFile ? URL.createObjectURL(path) : path;
        let loaderNameSpace = getValidLoader();
        let loader = new loaderNameSpace();
        loader.setPath(url);
        loader.load('', (loadData, err) => {
            setObject(loadData);
            setTimeout(() => {
                setObjectLoaded(true);
            });
        });
    }, [path])

    const getRenderableObject = () => {
        if (extension == 'gltf' || extension == 'glb') {
            return object ? object.scene : null;
        } else {
            return object;
        }
    }

    const getValidLoader = () => {
        if (extension == 'gltf' || extension == 'glb') {
            return GLTFLoader;
        } else if (extension == 'obj') {
            return OBJLoader;
        } else if (extension == 'fbx') {
            return FBXLoader;
        }
    }

    const adjustWorldCenter = () => {
        if (getRenderableObject()) {
            getRenderableObject().traverse(function (child) {
                if (child.isMesh) {
                    child.geometry.center(); // center here
                }
            });
        }
    };

    const autoScaleAndFit = () => {
        let mroot = getRenderableObject();
        if (mroot) {
            let bbox = new THREE.Box3().setFromObject(mroot);
            let cent = bbox.getCenter(new THREE.Vector3());
            let size = bbox.getSize(new THREE.Vector3());

            //Rescale the object to normalized space
            let maxAxis = Math.max(size.x, size.y, size.z);
            mroot.scale.multiplyScalar(3.0 / maxAxis);
            bbox.setFromObject(mroot);
            bbox.getCenter(cent);
            bbox.getSize(size);
            //Reposition to 0,halfY,0
            mroot.position.copy(cent).multiplyScalar(-1);
            mroot.position.y -= (size.y * 0.5);
        }
    }

    // console.log(path instanceof File ? path.path : path, path instanceof File ? URL.createObjectURL(path) : path)
    const extension = getFileExtension(pathIsFile ? path.path : path);

    if (progress == '100') {
        adjustWorldCenter();
        autoScaleAndFit();
    }

    return getRenderableObject() ? <Suspense fallback={<Html center>{progress} % loaded</Html>}>
        <primitive object={getRenderableObject()} scale={scale} position={position} />
    </Suspense> : null;
};
export default Model;
