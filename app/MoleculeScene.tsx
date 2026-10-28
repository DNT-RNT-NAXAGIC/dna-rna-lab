"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Base = "A" | "T" | "G" | "C" | "U";
const baseColors: Record<Base, string> = { A: "#df4d50", T: "#397ac5", G: "#27966a", C: "#d6ad24", U: "#8a5ac8" };
const atomColors = { carbon: "#738196", nitrogen: "#397ac5", oxygen: "#df4d50", phosphorus: "#e5a04a", hydrogen: "#f6f8fb" };

function Atom({ position, color, radius = 0.11 }: { position: [number, number, number]; color: string; radius?: number }) {
  return <mesh position={position}><sphereGeometry args={[radius, 20, 20]} /><meshStandardMaterial color={color} roughness={0.28} metalness={0.04} /></mesh>;
}
function Bond({ from, to, color = "#9eacbd", radius = 0.025 }: { from: THREE.Vector3; to: THREE.Vector3; color?: string; radius?: number }) {
  const direction = to.clone().sub(from);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return <mesh position={from.clone().add(to).multiplyScalar(.5)} quaternion={quaternion}><cylinderGeometry args={[radius, radius, direction.length(), 8]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>;
}
function Backbone({ points, color }: { points: THREE.Vector3[]; color: string }) {
  const geometry = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 90, .055, 8, false), [points]);
  return <mesh geometry={geometry}><meshStandardMaterial color={color} roughness={.36} metalness={.04} /></mesh>;
}
function BaseRing({ base, position, scale = 1 }: { base: Base; position: [number, number, number]; scale?: number }) {
  const purine = base === "A" || base === "G";
  const points = purine
    ? [[-.2,.12,0],[0,.24,0],[.2,.12,0],[.2,-.12,0],[0,-.24,0],[-.2,-.12,0],[-.39,.02,0],[-.58,.13,0],[-.76,.02,0],[-.76,-.16,0],[-.57,-.25,0],[-.39,-.16,0]]
    : [[-.24,.16,0],[0,.28,0],[.24,.16,0],[.24,-.16,0],[0,-.28,0],[-.24,-.16,0]];
  const pts = points.map(p => new THREE.Vector3(p[0]*scale,p[1]*scale,p[2]*scale));
  const colors = pts.map((_,i) => i%4===0 ? atomColors.nitrogen : i%5===0 ? atomColors.oxygen : atomColors.carbon);
  return <group position={position}>
    {pts.map((p,i)=><Atom key={"a"+i} position={[p.x,p.y,p.z]} color={colors[i]} radius={.07*scale}/>)}
    {pts.map((p,i)=><Bond key={"b"+i} from={p} to={pts[(i+1)%pts.length]} color="#8f9db0" radius={.025*scale}/>)}
    <Html position={[0,-.48*scale,.05]} center distanceFactor={7} style={{pointerEvents:"none"}}><span className="atom-label" style={{color:baseColors[base],fontWeight:800}}>{base}</span></Html>
  </group>;
}
function DNAHelix() {
  const root = useRef<THREE.Group>(null);
  const nodes = useMemo(() => Array.from({length:17},(_,i) => {
    const t=i/16, angle=t*Math.PI*5.4, y=(t-.5)*4.4;
    const left=new THREE.Vector3(Math.cos(angle)*.88,y,Math.sin(angle)*.88);
    const right=new THREE.Vector3(-Math.cos(angle)*.88,y,-Math.sin(angle)*.88);
    const letters: Base[]=["A","G","C","T","T","A","C","G","A","T","G","C","A","G","T","C","A"];
    const a=letters[i], b:Base=a==="A"?"T":a==="T"?"A":a==="G"?"C":"G";
    return {i,left,right,a,b};
  }),[]);
  const leftPoints=useMemo(()=>nodes.map(n=>n.left),[nodes]);
  const rightPoints=useMemo(()=>nodes.map(n=>n.right),[nodes]);
  useFrame((_,delta)=>{if(root.current)root.current.rotation.y+=delta*.12;});
  return <group ref={root}>
    <Backbone points={leftPoints} color="#d9e5f3"/><Backbone points={rightPoints} color="#c8d9ee"/>
    {nodes.map(n=><group key={n.i}>
      <Atom position={[n.left.x,n.left.y,n.left.z]} color={atomColors.phosphorus} radius={.105}/>
      <Atom position={[n.right.x,n.right.y,n.right.z]} color={atomColors.phosphorus} radius={.105}/>
      <Bond from={n.left} to={n.right} color="#b6c4d4" radius={.022}/>
      <Atom position={[(n.left.x*.56+n.right.x*.44),(n.left.y+n.right.y)/2,(n.left.z*.56+n.right.z*.44)]} color={baseColors[n.a]} radius={.12}/>
      <Atom position={[(n.left.x*.44+n.right.x*.56),(n.left.y+n.right.y)/2,(n.left.z*.44+n.right.z*.56)]} color={baseColors[n.b]} radius={.12}/>
    </group>)}
    <Html position={[0,-2.52,0]} center><span className="scene-caption">ԴՆԹ-ի երկպարույր · ուսումնական 3D սխեմա</span></Html>
  </group>;
}
function RNAStrand() {
  const points=useMemo(()=>Array.from({length:15},(_,i)=>new THREE.Vector3((i-7)*.28,Math.sin(i*.68)*.4,Math.cos(i*.48)*.12)),[]);
  const letters:Base[]=["A","U","G","C","A","U","C","G","U","A","C","G","U","A","G"];
  return <group>
    <Backbone points={points} color="#e7a77d"/>
    {points.map((p,i)=><group key={i}>
      <Atom position={[p.x,p.y,p.z]} color={atomColors.phosphorus} radius={.09}/>
      <Bond from={p} to={new THREE.Vector3(p.x,p.y+.27,p.z)} color="#dca27b" radius={.025}/>
      <Atom position={[p.x,p.y+.31,p.z]} color={baseColors[letters[i]]} radius={.13}/>
      <Html position={[p.x,p.y+.51,p.z]} center distanceFactor={8} style={{pointerEvents:"none"}}><span className="atom-label" style={{color:baseColors[letters[i]]}}>{letters[i]}</span></Html>
    </group>)}
    <Html position={[0,-.9,0]} center><span className="scene-caption">ՌՆԹ-ի մեկ շղթայի սխեմատիկ մոդել</span></Html>
  </group>;
}
function BasePair({ selectedBase }: { selectedBase: Base }) {
  const partner: Base = selectedBase==="A"?"T":selectedBase==="T"?"A":selectedBase==="G"?"C":selectedBase==="C"?"G":"A";
  const rnaPair = selectedBase==="U";
  return <group>
    <BaseRing base={selectedBase} position={[-.82,0,0]} scale={1.15}/>
    <BaseRing base={partner} position={[.82,0,0]} scale={1.15}/>
    {[0,1,2].slice(0,selectedBase==="A"||selectedBase==="T"||rnaPair?2:3).map(i=><Bond key={i} from={new THREE.Vector3(-.22,.1-i*.1,.02)} to={new THREE.Vector3(.22,.1-i*.1,.02)} color="#8f9db0" radius={.028}/>)}
    <Html position={[0,-1.05,0]} center><span className="scene-caption">{rnaPair?"ՌՆԹ հիմքի ուսումնական օրինակ":"Հիմքերի զույգ · սխեմատիկ մոդել"}</span></Html>
  </group>;
}
function SelectedBase({ selectedBase }: { selectedBase: Base }) {
  return <group>
    <BaseRing base={selectedBase} position={[0,0,0]} scale={1.8}/>
    <Atom position={[0,.85,.02]} color={atomColors.phosphorus} radius={.2}/>
    <Bond from={new THREE.Vector3(0,.52,.02)} to={new THREE.Vector3(0,.67,.02)} color={atomColors.phosphorus} radius={.04}/>
    <Atom position={[0,-.85,.02]} color={atomColors.oxygen} radius={.2}/>
    <Bond from={new THREE.Vector3(0,-.52,.02)} to={new THREE.Vector3(0,-.67,.02)} color={atomColors.oxygen} radius={.04}/>
    <Html position={[0,-1.45,0]} center><span className="scene-caption">Հիմքի օղակային սխեմա · ոչ ատոմային ճշգրիտ կառուցվածք</span></Html>
  </group>;
}
function SceneContent({ mode, selectedBase, replicationStep }: { mode:string; selectedBase:Base; replicationStep:number }) {
  if(mode==="replication") return <ReplicationVisual step={replicationStep}/>;
  if(mode==="rna") return <RNAWithMotion selectedBase={selectedBase}/>;
  if(mode==="pair") return <BasePair selectedBase={selectedBase}/>;
  if(mode==="base") return <SelectedBase selectedBase={selectedBase}/>;
  return <DNAHelix/>;
}
function RNAWithMotion({selectedBase}:{selectedBase:Base}) {
  const group=useRef<THREE.Group>(null);
  useFrame((_,delta)=>{if(group.current)group.current.rotation.y+=delta*.045;});
  return <group ref={group}><RNASeed selectedBase={selectedBase}/></group>;
}
function RNASeed({selectedBase}:{selectedBase:Base}) {
  return <group><RNAVisual/><Html position={[0,1.25,0]} center><span className="scene-caption">Ընտրված հիմք՝ {selectedBase}</span></Html></group>;
}
function RNAVisual() { return <RNAContent/>; }
function RNAContent() { return <RNAStrand/>; }

function ReplicationVisual({step}:{step:number}) {
  const opening=useRef<THREE.Group>(null);
  const daughterLeft=useRef<THREE.Group>(null);
  const daughterRight=useRef<THREE.Group>(null);
  const strandLeft=useRef<THREE.Group>(null);
  const strandRight=useRef<THREE.Group>(null);
  const rungs=useRef<THREE.Group>(null);
  const newLeft=useRef<THREE.Group>(null);
  const newRight=useRef<THREE.Group>(null);
  const letters:Base[]=["A","G","C","T","T","A","C","G","A","T","G","C","A","G","T","C","A"];
  const nodes=useMemo(()=>letters.map((a,i)=>{
    const t=i/16, angle=t*Math.PI*5.4, y=(t-.5)*4.4;
    const complement:Base=a==="A"?"T":a==="T"?"A":a==="G"?"C":"G";
    return {i,y,z:Math.sin(angle)*.32,a,b:complement};
  }),[]);
  useFrame((_,delta)=>{
    const damp=1-Math.exp(-delta*3.5);
    const openingAmount=step===0?0:1;
    if(opening.current) opening.current.rotation.y+=delta*.12;
    if(strandLeft.current){
      strandLeft.current.position.x=THREE.MathUtils.damp(strandLeft.current.position.x,step===0?-.45:-1.12,3.5,delta);
      strandLeft.current.rotation.z=THREE.MathUtils.damp(strandLeft.current.rotation.z,step===0?0:.04,3.5,delta);
    }
    if(strandRight.current){
      strandRight.current.position.x=THREE.MathUtils.damp(strandRight.current.position.x,step===0?.45:1.12,3.5,delta);
      strandRight.current.rotation.z=THREE.MathUtils.damp(strandRight.current.rotation.z,step===0?0:-.04,3.5,delta);
    }
    if(rungs.current) rungs.current.scale.x=THREE.MathUtils.damp(rungs.current.scale.x,step===0?1:.001,5,delta);
    if(newLeft.current) newLeft.current.scale.setScalar(THREE.MathUtils.damp(newLeft.current.scale.x,step===0?.001:1,4,delta));
    if(newRight.current) newRight.current.scale.setScalar(THREE.MathUtils.damp(newRight.current.scale.x,step===0?.001:1,4,delta));
    const daughterTarget=step===2?1:.001;
    if(daughterLeft.current) daughterLeft.current.scale.setScalar(THREE.MathUtils.damp(daughterLeft.current.scale.x,daughterTarget,3,delta));
    if(daughterRight.current) daughterRight.current.scale.setScalar(THREE.MathUtils.damp(daughterRight.current.scale.x,daughterTarget,3,delta));
  });
  return <group>
    <group ref={opening}>
      <group ref={strandLeft} position={[-.45,0,0]}>
        {nodes.map(n=>{
          const p=new THREE.Vector3(Math.cos(n.i/16*Math.PI*5.4)*.22,n.y,n.z);
          const bp=new THREE.Vector3(p.x+.14,p.y,p.z);
          return <group key={"old-left-"+n.i}>
            <Atom position={[p.x,p.y,p.z]} color={atomColors.phosphorus} radius={.105}/>
            <Atom position={[bp.x,bp.y,bp.z]} color={baseColors[n.a]} radius={.13}/>
            {n.i>0&&<Bond from={new THREE.Vector3(Math.cos((n.i-1)/16*Math.PI*5.4)*.22,nodes[n.i-1].y,nodes[n.i-1].z)} to={p} color="#d9e5f3" radius={.045}/>}
            <Bond from={p} to={bp} color="#9eacbd" radius={.025}/>
          </group>;
        })}
      </group>
      <group ref={strandRight} position={[.45,0,0]}>
        {nodes.map(n=>{
          const p=new THREE.Vector3(-Math.cos(n.i/16*Math.PI*5.4)*.22,n.y,-n.z);
          const bp=new THREE.Vector3(p.x-.14,p.y,p.z);
          return <group key={"old-right-"+n.i}>
            <Atom position={[p.x,p.y,p.z]} color={atomColors.phosphorus} radius={.105}/>
            <Atom position={[bp.x,bp.y,bp.z]} color={baseColors[n.b]} radius={.13}/>
            {n.i>0&&<Bond from={new THREE.Vector3(-Math.cos((n.i-1)/16*Math.PI*5.4)*.22,nodes[n.i-1].y,-nodes[n.i-1].z)} to={p} color="#c8d9ee" radius={.045}/>}
            <Bond from={p} to={bp} color="#9eacbd" radius={.025}/>
          </group>;
        })}
      </group>
      <group ref={rungs}>
        {nodes.map(n=><group key={"rung-"+n.i}>
          <Bond from={new THREE.Vector3(-.28,n.y,n.z)} to={new THREE.Vector3(.28,n.y,-n.z)} color="#b6c4d4" radius={.025}/>
        </group>)}
      </group>
      <group ref={newLeft} position={[-.62,0,.03]}>
        {nodes.map(n=><group key={"new-left-"+n.i}>
          <Atom position={[.14,n.y,n.z]} color={baseColors[n.b]} radius={.115}/>
          <Atom position={[.31,n.y,n.z]} color={atomColors.phosphorus} radius={.085}/>
          <Bond from={new THREE.Vector3(.14,n.y,n.z)} to={new THREE.Vector3(.31,n.y,n.z)} color="#e5a04a" radius={.022}/>
          <Html position={[.14,n.y+.13,n.z]} center distanceFactor={10} style={{pointerEvents:"none"}}><span style={{fontSize:"9px",fontWeight:800,color:baseColors[n.b]}}>{n.b}</span></Html>
        </group>)}
      </group>
      <group ref={newRight} position={[.62,0,-.03]}>
        {nodes.map(n=><group key={"new-right-"+n.i}>
          <Atom position={[-.14,n.y,-n.z]} color={baseColors[n.a]} radius={.115}/>
          <Atom position={[-.31,n.y,-n.z]} color={atomColors.phosphorus} radius={.085}/>
          <Bond from={new THREE.Vector3(-.14,n.y,-n.z)} to={new THREE.Vector3(-.31,n.y,-n.z)} color="#e5a04a" radius={.022}/>
          <Html position={[-.14,n.y+.13,-n.z]} center distanceFactor={10} style={{pointerEvents:"none"}}><span style={{fontSize:"9px",fontWeight:800,color:baseColors[n.a]}}>{n.a}</span></Html>
        </group>)}
      </group>
    </group>
    <group ref={daughterLeft} position={[-1.12,0,0]} scale={.001}><DNAHelix/></group>
    <group ref={daughterRight} position={[1.12,0,0]} scale={.001}><DNAHelix/></group>
    <Html position={[0,-3.05,0]} center><span className="scene-caption">{["Մեկ ԴՆԹ երկպարույր՝ սկզբնական կառուցվածք","Հին շղթաները բաժանվում են, լրացուցիչ հիմքերը միանում են դրանց","Երկու նույնական ԴՆԹ մոլեկուլ"][step]}</span></Html>
  </group>;
}

export default function MoleculeScene({ mode="dna", selectedBase="A", replicationStep=0, compact=false }: { mode?:string; selectedBase?:Base; replicationStep?:number; compact?:boolean }) {
  return <div className={compact?"scene scene-compact":"scene"}>
    <Canvas camera={{position:[0,0,7.3],fov:42}} dpr={[1,1.6]} gl={{antialias:true,alpha:true}}>
      <ambientLight intensity={1.15}/>
      <directionalLight position={[4,5,6]} intensity={2.1}/>
      <directionalLight position={[-4,-2,-5]} intensity={.85} color="#c6dcff"/>
      <pointLight position={[0,2,4]} intensity={.5} color="#fff0dc"/>
      <SceneContent mode={mode} selectedBase={selectedBase} replicationStep={replicationStep}/>
      <OrbitControls enablePan={false} minDistance={3.2} maxDistance={10.5} enableDamping dampingFactor={.07}/>
    </Canvas>
  </div>;
}
