import { Suspense, useState } from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import Renderer3D from '../../components/3d/renderer';
import { Canvas } from "@react-three/fiber";
import Switch from "react-switch";

export default function SinglePage() {
    const [ checked, setChecked ] = useState(true);

    const handleChange = (e) => {
        setChecked(e);
    }

    return (
        <Container>
        <Row>
            <Col md="12" >
              <Card>
                <Card.Body>
                External Animations: <Switch onChange={handleChange} checked={checked} />
                  <Canvas style={{ height: "90vh", width: "100%" }} camera={{ fov: 50, position: [0, 2, 8]}}>
                    <Suspense>
                      <Renderer3D
                        path={'test.fbx'}
                        scale={[1, 1, 1]}
                        position={[0, 0, 0]}
                        renderPriority={2}
                        keyboardTranslate={true}
                        animations={['test_anim.fbx']}
                        externalAnimation={checked}
                      />
                    </Suspense>
                  </Canvas>
                </Card.Body>
              </Card>
            </Col>
        </Row>
        </Container>
    )
}