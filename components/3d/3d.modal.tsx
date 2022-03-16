import React, { useEffect, useState, Suspense } from 'react';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as THREE from 'three';
import { getFileExtension, getRandomColor } from '../../utils/utils';
import { Html, useProgress } from '@react-three/drei'
import useEventListener from '@use-it/event-listener'
import { useFrame } from '@react-three/fiber';
import { Group, Object3D } from 'three';

interface FixedLengthArray<L extends number, T> extends ArrayLike<T> {
    length: L
}  

export interface Rendered3DProps {
    path: string,
    position?: FixedLengthArray<3, number>,
    scale?: FixedLengthArray<3, number>,
    renderPriority?: number,
    keyboardTranslate?: boolean,
    animations?: Array<any>,
    externalAnimation?: boolean
}

const Model = (props: Rendered3DProps) => {
    let {
        path,
        scale,
        position = [0, 0, 0],
        keyboardTranslate,
        animations = [],
        externalAnimation
    } = props;

    const { progress } = useProgress()
    const [object, setObject] = useState<Object3D>();
    const [ animationsData, setAnimationsData ] = useState<Array<any>>([]);

    let animationPlaying: boolean = false;

    useEffect(() => {
        load3DObject();
        loadAnimations();
    }, [path])

    useEffect(() => {
        animationPlaying = false;
        toggleAnimationPlay();
    }, [externalAnimation])

    const load3DObject = (): void => {
        setObject(undefined);
        let loaderNameSpace = getValidLoader();
        if (loaderNameSpace) {
            let loader = new loaderNameSpace();
            loader.setPath(path);
            loader.load('', (loadData: any) => {
                if (loaderNameSpace == GLTFLoader) {
                    setObject(loadData.scene);
                } else {
                    setObject(loadData);
                }
            });
        }
    }

    const loadAnimations = (): void => {
        (async () => {
            let animationsDataPromise: any[] = [];
            animations.map((animation) => {
                let url = animation instanceof File ? URL.createObjectURL(animation) : animation;
                let extensionName = getFileExtension(url);
                let loaderNameSpace = getValidLoader(extensionName);
                
                if (loaderNameSpace) {  
                    let loader = new loaderNameSpace();
                    loader.setPath(url);
                    animationsDataPromise.push(load3dAsync(loader));
                }
            });
    
            animationsDataPromise = await Promise.all(animationsDataPromise);
            setAnimationsData(animationsDataPromise);
        })();
    }

    const load3dAsync = async (loader: any): Promise<Group> => {
        return new Promise((resolve, reject) => {
            loader.load('', (loadData: Group) => {
                resolve(loadData);
            });
        })
    }
    
    useEventListener('keydown', (e: any) => {
        if (keyboardTranslate) {
            switch(e.key) {
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

    const leftPress = (): void => {
        if (object) object.position.x -= 0.1;
    }

    const rightPress = (): void => {
        if (object) object.position.x += 0.1;
    }

    const spacePress = (): void => {
        toggleAnimationPlay();
    }

    let mixer: THREE.AnimationMixer;
    const toggleAnimationPlay = () => {
        if (object)
            if (!animationPlaying) {
                let animationSource: Array<Group> = externalAnimation ? animationsData : [object];
                if (animationSource) {
                    mixer = new THREE.AnimationMixer(object);
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
                mixer.uncacheRoot(object);
                animationPlaying = false;
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

    const autoScaleAndFit = () => {
        let mroot = object;
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

    const extension = getFileExtension(path);

    autoScaleAndFit();
    if (progress == 100) {
        autoScaleAndFit();
    }

    return object ? <Suspense fallback={<Html center>{progress} % loaded</Html>}>
        <primitive object={object} scale={scale} position={position} />
    </Suspense> : null;
};
export default Model;
