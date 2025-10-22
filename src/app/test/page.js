// app/test/page.js
import ModelViewer from '../components/ModelViewer';

export default function TestPage() {
  return (
    <main style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>3D Model Test Page</h1>
      <p>
        Use this page to inspect your 3D models. <br />
        Open the developer console (F12) to see the model's structure.
      </p>
      
      {/* 
        We are telling the viewer to load the pawn.glb model.
        You can change this URL to test any other model in your /public folder.
      */}
      <ModelViewer modelUrl="/pawn.glb" />
    </main>
  );
}