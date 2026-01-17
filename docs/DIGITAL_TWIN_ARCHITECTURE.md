# Digital Twin & IoT Architecture

## 1. 3D Model Integration

### Current State
Currently, the system uses a **procedural** representation (React Three Fiber primitives) to generate a "Cyber-Industrial" look. This ensures high performance and immediate availability without external assets.

### Production Implementation
In a real deployment, the procedural `MachineCore` component is replaced with a CAD-based model:

**Steps:**
1.  **Export**: Export the machine model from SolidWorks/AutoCAD to `.GLB` (GL Transmission Format).
2.  **Optimization**: Compress textures and mesh using `gltf-pipeline` or Draco compression.
3.  **Loading**:
    ```tsx
    // apps/frontend/src/components/MachineModel.tsx
    import { useGLTF } from '@react-three/drei';
    
    export function MachineModel() {
      const { scene, nodes } = useGLTF('/models/cnc_machine_production.glb');
      
      // Animate specific parts
      useFrame(() => {
        nodes.SpindleHead.rotation.y += 0.1;
      });
      
      return <primitive object={scene} />;
    }
    ```

## 2. Real-Time Data Flow (IoT)

To drive the Digital Twin with real data (RPM, Temperature, Vibration), the following architecture is required:

### Data Pipeline
1.  **Machine Level (PLC)**:
    *   The CNC machine (e.g., Siemens Sinumerik, Fanuc) exposes data headers via **OPC UA** or **MTConnect** protocol.
    *   *Data Point Example*: `ns=2;s=Machine1.Spindle.Speed`.

2.  **Edge Gateway**:
    *   A local industrial PC (IPC) polls the PLC every 100-500ms.
    *   Converts OPC UA packets to **JSON**.
    *   Publishes to an **MQTT Broker** (topic: `factory/machine/1/telemetry`).

3.  **Backend (Digital Ecosystem API)**:
    *   Subscribes to MQTT topic.
    *   Validates and analyzes data (Alerts/Anomalies).
    *   Broadcasts updates to frontend via **WebSockets** (`Socket.io` or `FastAPI Websockets`).

4.  **Frontend (Digital Twin Page)**:
    *   Establishes WebSocket connection.
    *   Updates React State on message receipt.
    
    ```tsx
    // Simplified Logic
    ws.onmessage = (event) => {
      const { rpm, vibration } = JSON.parse(event.data);
      setTelemetry({ rpm, vibration });
      // Update 3D Visual usage
      setGlitchActive(vibration > threshold);
    };
    ```

## Summary
The current implementation acts as a **Functional Prototype** demonstrating the *capability* to visualize this data. scaling to production requires:
1.  Specific GLB assets.
2.  OPC UA/MQTT Middleware integration.
