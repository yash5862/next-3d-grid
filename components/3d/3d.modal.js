import React, { useEffect, useState, Suspense } from 'react';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as THREE from 'three';
import { getFileExtension, getRandomColor } from '../../utils/utils';
import { Html, useProgress } from '@react-three/drei'
import useEventListener from '@use-it/event-listener'
import { useFrame } from '@react-three/fiber';

const Model = (props) => {
    let {
        path,
        scale,
        position = [0, 0, 0],
        keyboardTranslate,
        animations = [],
        externalAnimation
    } = props;

    const { progress } = useProgress()
    const pathIsFile = path instanceof File;
    const [object, setObject] = useState(null);
    const [ animationsData, setAnimationsData ] = useState([]);

    let animationPlaying = false

    useEffect(() => {
        load3DObject();
        loadAnimations();
    }, [path])

    useEffect(() => {
        animationPlaying = false;
        toggleAnimationPlay();
    }, [externalAnimation])

    const load3DObject = () => {
        setObject(null);
        let url = pathIsFile ? URL.createObjectURL(path) : path;
        let loaderNameSpace = getValidLoader();
        let loader = new loaderNameSpace();
        loader.setPath(url);
        loader.load('', (loadData, err) => {
            setObject(loadData);
        });
    }

    const loadAnimations = async () => {
        let animationsDataPromise = [];
        animations.map(async (animation) => {
            let url = animation instanceof File ? URL.createObjectURL(animation) : animation;
            let extensionName = getFileExtension(url);
            let loaderNameSpace = getValidLoader(extensionName);
            let loader = new loaderNameSpace();
            loader.setPath(url);
            animationsDataPromise.push(load3dAsync(loader));
        });

        animationsDataPromise = await Promise.all(animationsDataPromise);
        setAnimationsData(animationsDataPromise);
    }

    const load3dAsync = async (loader) => {
        return new Promise((resolve, reject) => {
            loader.load('', (loadData, err) => {
                if (err) {
                    reject(err);
                }
                resolve(loadData);
            });
        })
    }
    
    useEventListener('keydown', ({key}) => {
        if (keyboardTranslate) {
            switch(key) {
                case 'ArrowLeft': {
                    leftPress();
                    break;
                }
    
                case 'ArrowRight': {
                    rightPress();
                    break;
                }

                case ' ': {
                    spacePress();
                    break;
                }
            }
        }
    });

    const leftPress = () => {
        getRenderableObject().position.x -= 0.1;
    }

    const rightPress = () => {
        getRenderableObject().position.x += 0.1;
    }

    const spacePress = () => {
        // if (getRenderableObject()) {
        //     getRenderableObject().traverse((o) => {
        //         if (o.isMesh && o.material != null) {
        //             o.material.color = new THREE.Color(getRandomColor());
        //         }
        //     });
        // }
        toggleAnimationPlay();
    }

    let mixer
    const toggleAnimationPlay = () => {
        if (!animationPlaying) {
            let animationSource = externalAnimation ? animationsData : [getRenderableObject()];
            if (animationSource) {
                mixer = new THREE.AnimationMixer(getRenderableObject());
                setTimeout(() => {
                    animationSource.forEach(fbxData => {
                        if (fbxData) {
                            fbxData.animations.forEach(clip => {
                                const action = mixer.clipAction(clip)
                                action.play();
                            })
                        }
                    });
                })
            }
            animationPlaying = true;
        } else {
            mixer = null;
            animationPlaying = false;
        }
    }

    const getRenderableObject = () => {
        if (extension == 'gltf' || extension == 'glb') {
            return object ? object.scene : null;
        } else {
            return object;
        }
    }

    useFrame((state, delta) => {
        mixer?.update(delta)
    })

    const getValidLoader = (name = extension) => {
        if (name == 'gltf' || name == 'glb') {
            return GLTFLoader;
        } else if (name == 'obj') {
            return OBJLoader;
        } else if (name == 'fbx') {
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

    autoScaleAndFit();
    if (progress == '100') {
        // adjustWorldCenter();
        autoScaleAndFit();
    }

    return getRenderableObject() ? <Suspense fallback={<Html center>{progress} % loaded</Html>}>
        <primitive object={getRenderableObject()} scale={scale} position={position} />
    </Suspense> : null;
};
export default Model;
