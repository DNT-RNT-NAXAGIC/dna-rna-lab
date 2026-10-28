"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
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
  const intact=useRef<THREE.Group>(null);
  const fork=useRef<THREE.Group>(null);
  const daughterA=useRef<THREE.Group>(null);
  const daughterB=useRef<THREE.Group>(null);
  const oldA=useRef<THREE.Group>(null);
  const oldB=useRef<THREE.Group>(null);
  const newA=useRef<THREE.Group>(null);
  const newB=useRef<THREE.Group>(null);
  const bases:Base[]=["A","G","C","T","T","A","C","G","A","T","G","C","A","G","T","C","A"];
  const nodes=useMemo(()=>bases.map((a,i)=>{
    const t=i/16, angle=t*Math.PI*5.4, y=(t-.5)*4.4;
    const p=new THREE.Vector3(Math.cos(angle)*.72,y,Math.sin(angle)*.72);
    const q=new THREE.Vector3(-Math.cos(angle)*.72,y,-Math.sin(angle)*.72);
    const b:Base=a==="A"?"T":a==="T"?"A":a==="G"?"C":"G";
    return {i,p,q,a,b};
  }),[]);
  useFrame((_,delta)=>{
    const smooth=3.8;
    const isFork=step===1;
    if(intact.current){
      intact.current.scale.setScalar(THREE.MathUtils.damp(intact.current.scale.x,step===0?1:.001,smooth,delta));
    }
    if(fork.current){
      fork.current.scale.setScalar(THREE.MathUtils.damp(fork.current.scale.x,isFork?1:.001,smooth,delta));
      fork.current.rotation.y=THREE.MathUtils.damp(fork.current.rotation.y,isFork?0:fork.current.rotation.y,smooth,delta);
    }
    if(oldA.current){
      oldA.current.position.x=THREE.MathUtils.damp(oldA.current.position.x,isFork?-1.0:-.58,smooth,delta);
      oldA.current.rotation.z=THREE.MathUtils.damp(oldA.current.rotation.z,isFork?.10:0,smooth,delta);
    }
    if(oldB.current){
      oldB.current.position.x=THREE.MathUtils.damp(oldB.current.position.x,isFork?1.0:.58,smooth,delta);
      oldB.current.rotation.z=THREE.MathUtils.damp(oldB.current.rotation.z,isFork?-.10:0,smooth,delta);
    }
    const pairScale=isFork?1:.001;
    if(newA.current) newA.current.scale.setScalar(THREE.MathUtils.damp(newA.current.scale.x,pairScale,smooth,delta));
    if(newB.current) newB.current.scale.setScalar(THREE.MathUtils.damp(newB.current.scale.x,pairScale,smooth,delta));
    const daughterScale=step===2?1:.001;
    if(daughterA.current) daughterA.current.scale.setScalar(THREE.MathUtils.damp(daughterA.current.scale.x,daughterScale,smooth,delta));
    if(daughterB.current) daughterB.current.scale.setScalar(THREE.MathUtils.damp(daughterB.current.scale.x,daughterScale,smooth,delta));
  });
  return <group>
    <group ref={intact}><DNAHelix/></group>
    <group ref={fork} scale={.001}>
      <group ref={oldA} position={[-1,0,0]}>
        <Backbone points={nodes.map(n=>n.p)} color="#d9e5f3"/>
        {nodes.map(n=><group key={"template-a-"+n.i}>
          <Atom position={[n.p.x,n.p.y,n.p.z]} color={atomColors.phosphorus} radius={.095}/>
          <Atom position={[n.p.x*.66,n.p.y,n.p.z*.66]} color={baseColors[n.a]} radius={.13}/>
          <Html position={[n.p.x*.66,n.p.y+.16,n.p.z*.66]} center distanceFactor={9} style={{pointerEvents:"none"}}><span style={{fontSize:"10px",fontWeight:800,color:baseColors[n.a]}}>{n.a}</span></Html>
        </group>)}
      </group>
      <group ref={oldB} position={[1,0,0]}>
        <Backbone points={nodes.map(n=>n.q)} color="#c8d9ee"/>
        {nodes.map(n=><group key={"template-b-"+n.i}>
          <Atom position={[n.q.x,n.q.y,n.q.z]} color={atomColors.phosphorus} radius={.095}/>
          <Atom position={[n.q.x*.66,n.q.y,n.q.z*.66]} color={baseColors[n.b]} radius={.13}/>
          <Html position={[n.q.x*.66,n.q.y+.16,n.q.z*.66]} center distanceFactor={9} style={{pointerEvents:"none"}}><span style={{fontSize:"10px",fontWeight:800,color:baseColors[n.b]}}>{n.b}</span></Html>
        </group>)}
      </group>
      <group ref={newA} scale={.001}>
        <Backbone points={nodes.map(n=>new THREE.Vector3(n.p.x*.43,n.p.y,n.p.z*.43))} color="#e5a04a"/>
        {nodes.map(n=><group key={"new-a-"+n.i}>
          <Atom position={[n.p.x*.43,n.p.y,n.p.z*.43]} color={baseColors[n.b]} radius={.105}/>
          <Bond from={new THREE.Vector3(n.p.x*.66,n.p.y,n.p.z*.66)} to={new THREE.Vector3(n.p.x*.43,n.p.y,n.p.z*.43)} color="#e5a04a" radius={.035}/>
          <Html position={[n.p.x*.43,n.p.y+.15,n.p.z*.43]} center distanceFactor={9} style={{pointerEvents:"none"}}><span style={{fontSize:"10px",fontWeight:900,color:baseColors[n.b]}}>{n.b}</span></Html>
        </group>)}
      </group>
      <group ref={newB} scale={.001}>
        <Backbone points={nodes.map(n=>new THREE.Vector3(n.q.x*.43,n.q.y,n.q.z*.43))} color="#e5a04a"/>
        {nodes.map(n=><group key={"new-b-"+n.i}>
          <Atom position={[n.q.x*.43,n.q.y,n.q.z*.43]} color={baseColors[n.a]} radius={.105}/>
          <Bond from={new THREE.Vector3(n.q.x*.66,n.q.y,n.q.z*.66)} to={new THREE.Vector3(n.q.x*.43,n.q.y,n.q.z*.43)} color="#e5a04a" radius={.035}/>
          <Html position={[n.q.x*.43,n.q.y+.15,n.q.z*.43]} center distanceFactor={9} style={{pointerEvents:"none"}}><span style={{fontSize:"10px",fontWeight:900,color:baseColors[n.a]}}>{n.a}</span></Html>
        </group>)}
      </group>
    </group>
    <group ref={daughterA} position={[-1.05,0,0]} scale={.001}><DNAHelix/></group>
    <group ref={daughterB} position={[1.05,0,0]} scale={.001}><DNAHelix/></group>
    <Html position={[0,-3.05,0]} center><span className="scene-caption">{["Մեկ ԴՆԹ երկպարույր՝ սկզբնական կառուցվածք","Հին շղթաները բաժանվում են, նոր լրացուցիչ հիմքերը միանում են դրանց","Երկու նույնական ԴՆԹ մոլեկուլ"][step]}</span></Html>
  </group>;
}

export default function MoleculeScene({ mode="dna", selectedBase="A", replicationStep=0, compact=false, transitionKey=0 }: { mode?:string; selectedBase?:Base; replicationStep?:number; compact?:boolean; transitionKey?:number }) {
  const transition=useRef<THREE.Group>(null);
  useEffect(()=>{if(transition.current){transition.current.scale.setScalar(.86);transition.current.rotation.y=-.12;}},[transitionKey,mode]);
  useFrame((_,delta)=>{if(transition.current){transition.current.scale.setScalar(THREE.MathUtils.damp(transition.current.scale.x,1,4,delta));transition.current.rotation.y=THREE.MathUtils.damp(transition.current.rotation.y,0,4,delta);}});
  return <div className={compact?"scene scene-compact":"scene"}>
    <Canvas camera={{position:[0,0,7.3],fov:42}} dpr={[1,1.6]} gl={{antialias:true,alpha:true}}>
      <ambientLight intensity={1.15}/>
      <directionalLight position={[4,5,6]} intensity={2.1}/>
      <directionalLight position={[-4,-2,-5]} intensity={.85} color="#c6dcff"/>
      <pointLight position={[0,2,4]} intensity={.5} color="#fff0dc"/>
      <group ref={transition}><SceneContent mode={mode} selectedBase={selectedBase} replicationStep={replicationStep}/></group>
      <OrbitControls enablePan={false} minDistance={3.2} maxDistance={10.5} enableDamping dampingFactor={.07}/>
    </Canvas>
  </div>;
}
