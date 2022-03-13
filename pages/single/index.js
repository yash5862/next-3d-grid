import { Suspense } from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import Renderer3D from '../../components/3d/renderer';
import { Canvas } from "@react-three/fiber";

export default function SinglePage() {
    return (
        <Container>
        <Row>
            <Col md="12" >
              <Card>
                <Card.Body>
                  <Canvas style={{ height: "100%", width: "100%" }}>
                    <Suspense>
                      <Renderer3D
                        path={'cube.obj'}
                        scale={[1, 1, 1]}
                        position={[0, 0, 0]}
                        renderPriority={2}
                        keyboardTranslate={true}
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