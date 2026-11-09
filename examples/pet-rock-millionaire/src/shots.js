// Original comic staging for Gary Dahl's Pet Rock story. Reactions are dramatized.
import * as THREE from 'three';
import { ctx, clamp, eio } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import { Toon } from './core/toon.js';

const V=(a)=>new THREE.Vector3(...a);
const blink=(t,o=0)=>(t+o)%3.2<0.12?1:0;
const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:.82});
function cube(parent,size,pos,color){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color));o.position.set(...pos);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function stone(){
 const geo=new THREE.SphereGeometry(.23,32,20),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);let f=1+.045*Math.sin(x*29+y*17+z*23);p.setXYZ(i,x*f*1.25,y*f*.72,z*f*.91);}
 geo.computeVertexNormals();const o=new THREE.Mesh(geo,mat('#9B978D'));o.castShadow=o.receiveShadow=true;return o;
}
function printedCard(lines,w,h){
 const c=document.createElement('canvas');c.width=768;c.height=Math.round(768*h/w);const g=c.getContext('2d');
 g.fillStyle='#FFF3D8';g.fillRect(0,0,c.width,c.height);g.strokeStyle='#35566B';g.lineWidth=10;g.strokeRect(15,15,c.width-30,c.height-30);
 g.fillStyle='#35566B';g.textAlign='center';g.textBaseline='middle';
 lines.forEach((line,i)=>{g.font='900 '+Math.min(112,c.height/(lines.length+1)*.65)+'px Inter';g.fillText(line,c.width/2,(i+1)*c.height/(lines.length+1),c.width*.87);});
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));
}
function carrier(){
 const g=new THREE.Group();cube(g,[.72,.06,.54],[0,.03,0],'#C38B4F');
 cube(g,[.72,.22,.035],[0,.14,.27],'#EAC38B');cube(g,[.72,.48,.035],[0,.27,-.27],'#D7A968');
 for(const x of [-.35,.35])cube(g,[.035,.32,.54],[x,.19,0],'#DBAE74');
 for(const x of [-.22,0,.22]){const h=new THREE.Mesh(new THREE.CircleGeometry(.038,20),new THREE.MeshBasicMaterial({color:'#44342A'}));h.position.set(x,.16,.29);g.add(h);}
 cube(g,[.4,.05,.05],[0,.68,-.26],'#B08048');for(const x of [-.2,.2])cube(g,[.05,.25,.05],[x,.56,-.26],'#B08048');
 for(let i=0;i<18;i++){const a=cube(g,[.23,.014,.018],[Math.sin(i*19)*.23,.09+(i%3)*.008,Math.cos(i*7)*.17],'#EDCC88');a.rotation.y=i*2.4;}
 const r=stone();r.position.y=.25;g.add(r);
 const label=printedCard(['PET ROCK'],.43,.11);label.position.set(0,.07,.295);g.add(label);
 return g;
}
function table(scene){const g=new THREE.Group();g.position.z=-2.1;scene.add(g);cube(g,[1.55,.09,.85],[0,1.05,0],'#C47A45');for(const x of [-.63,.63])for(const z of [-.3,.3])cube(g,[.1,1,.1],[x,.5,z],'#865137');return g;}
function handRock(g,x,y,a){g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#AAA59B';g.strokeStyle='#272137';g.lineWidth=5;g.beginPath();g.ellipse(0,0,35,24,-.2,0,7);g.fill();g.stroke();g.restore();}
function handBox(g,x,y,a){g.save();g.translate(x,y);g.rotate(a*.3);g.fillStyle='#D7A968';g.strokeStyle='#272137';g.lineWidth=5;g.strokeRect(-20,0,40,25);g.fillRect(-43,22,86,62);g.strokeRect(-43,22,86,62);g.fillStyle='#44342A';for(let i=-1;i<=1;i++){g.beginPath();g.arc(i*22,38,5,0,7);g.fill();}g.fillStyle='#FFF3D8';g.fillRect(-35,51,70,24);g.fillStyle='#44342A';g.font='900 12px sans-serif';g.textAlign='center';g.fillText('PET ROCK',0,68);g.restore();}
function tag(text,sub=''){
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='900 77px Inter';
 const w=Math.min(930,ctx.measureText(text).width+66);ctx.fillStyle='#FFF3D8';ctx.strokeStyle='#242034';ctx.lineWidth=7;ctx.beginPath();ctx.roundRect(540-w/2,210,w,112,22);ctx.fill();ctx.stroke();ctx.fillStyle='#242034';ctx.fillText(text,540,268,880);
 if(sub){ctx.font='800 35px Inter';ctx.lineWidth=10;ctx.strokeStyle='#242034';ctx.strokeText(sub,540,365);ctx.fillStyle='white';ctx.fillText(sub,540,365);}ctx.restore();
}
export function buildShots(E){
 const shots=[],cues=[],cam=camera(37),cut=i=>i?L(i)-.06:0;
 const shop=WD.interior(E,{wall:'#D88B5F',motif:'#F0B97A',floor:'#AB714D',ceiling:'#71A8A1',counterOn:false,picture:false,litter:false,signText:''});
 const garden=WD.meadow(E,{flowers:true,fenceOn:true});
 const sale=WD.interior(E,{wall:'#67ACA1',motif:'#A2D5B5',floor:'#B78353',ceiling:'#F0D9A0',counterOn:false,picture:false,litter:false,signText:''});
 function set(stage){
  const t=table(stage.scene),rock=stone();rock.position.set(0,1.27,-2.1);stage.scene.add(rock);
  const pack=carrier();pack.position.set(0,1.1,-2.1);stage.scene.add(pack);
  const gary=new Toon({body:'#EF784B',pattern:'plain',hat:'none',neck:'none',extra:['mustache']},{height:1.9});
  const shopper=new Toon({body:'#579DDD',pattern:'plain',hat:'none',neck:'none'},{height:1.82});
  gary.at(-1.05,0,-2.1);shopper.at(1.05,0,-2.1);stage.scene.add(gary.group,shopper.group);
  const manual=printedCard(['PET ROCK','TRAINING','SIT.','STAY.'],.8,1.05);manual.position.set(.56,1.65,-2.1);stage.scene.add(manual);
  return {...stage,t,rock,pack,gary,shopper,manual};
 }
 const A=set(shop),B=set(garden),C=set(sale);
 const piles=[];for(let i=0;i<18;i++){const p=carrier();p.position.set(-2.3+(i%6)*.91,.02+Math.floor(i/6)*.74,-4.1);C.scene.add(p);piles.push(p);}
 const banner=WD.signBoard('THE PERFECT PET',{w:3.5,h:.52,bg:'#F6D556',fg:'#253F49'});banner.position.set(0,3.35,-5.5);C.scene.add(banner);
 const angles={
  wide:{from:[.15,2.6,6.6],to:[-.1,2.45,6.1],target:[0,1.2,-2.1],fov:43},
  duo:{from:[-.15,2.1,5.2],to:[.1,2.05,4.8],target:[0,1.15,-2.1],fov:46},
  hero:{from:[.55,1.8,.3],to:[.18,1.72,-.1],target:[0,1.34,-2.1],fov:37},
  buyer:{from:[1.4,1.75,.7],to:[1.2,1.72,.28],target:[1.05,1.31,-2.1],fov:36},
  gary:{from:[-1.4,1.8,.9],to:[-1.2,1.75,.35],target:[-1.05,1.35,-2.1],fov:36},
  overhead:{from:[.5,3.8,.45],to:[-.25,3.45,.15],target:[0,1.3,-2.1],fov:40},
  manual:{from:[.65,2.4,2.0],to:[.5,2.3,1.7],target:[.3,1.6,-2.1],fov:40}
 };
 const plan=[
  {s:C,a:'duo',pack:true,g:'proud',b:'shock',tag:'A PET ROCK?!',note:'Dahl beams; the shopper stares at his boxed stone'},
  {s:A,a:'hero',g:'happy',b:'shock',note:'Push into the ordinary, completely motionless rock'},
  {s:B,a:'gary',g:'sly',b:'neutral',tag:'1975',note:'Dahl gets an idea in the sunshine'},
  {s:B,a:'duo',g:'happy',b:'worried',note:'Dahl explains to the skeptical shopper'},
  {s:B,a:'hero',g:'happy',b:'neutral',tag:'ZERO CHORES',note:'The stone remains inert through every promised benefit'},
  {s:B,a:'buyer',g:'neutral',b:'sly',held:true,note:'Shopper holds another ordinary rock, questioning the idea'},
  {s:A,a:'buyer',g:'happy',b:'angry',tag:'WHY PAY?',note:'Reaction punch-in: the shopper questions the price'},
  {s:A,a:'gary',g:'smug',b:'neutral',note:'Dahl gestures as if delivering the punchline'},
  {s:A,a:'hero',pack:true,g:'happy',b:'shock',note:'The cardboard carrier replaces the bare rock'},
  {s:A,a:'overhead',pack:true,g:'proud',b:'shock',note:'Orbit the open carrier: holes and wooden shavings'},
  {s:A,a:'manual',pack:true,manual:true,g:'happy',b:'shock',note:'Reveal the deliberately silly training booklet'},
  {s:A,a:'hero',g:'happy',b:'neutral',tag:'STAY.',note:'The rock does absolutely nothing: perfect obedience'},
  {s:C,a:'hero',pack:true,g:'proud',b:'worried',tag:'$3.95',note:'Price reveal above a boxed pet'},
  {s:C,a:'wide',pack:true,g:'shock',b:'shock',sales:true,tag:'1,000,000+',sub:'SOLD BY CHRISTMAS 1975',note:'Boxes fill the shop; a million sales land on the narration'},
  {s:C,a:'buyer',pack:true,g:'happy',b:'happy',two:true,note:'Our fictional shopper now holds a box in each hand'},
  {s:C,a:'wide',pack:true,g:'neutral',b:'sad',tag:'1976',note:'The shop quiets down as the short-lived craze fades'},
  {s:C,a:'gary',pack:true,g:'proud',b:'shock',tag:'MILLIONAIRE',note:'Dahl smiles at the absurd result'},
  {s:B,a:'hero',g:'neutral',b:'neutral',tag:'STILL A ROCK.',note:'Return to the original unchanging stone'},
  {s:B,a:'duo',g:'laugh',b:'happy',pack:true,two:true,note:'Shopper carries his boxes; Dahl laughs at the final reversal'}
 ];
 plan.forEach((p,i)=>{
  const st=cut(i);cues.push({t:st+.02,type:'whoosh',gain:.35});
  if([1,6,8,10,12,13,14,16,18].includes(i))cues.push({t:Math.max(st+.2,Wd(i===13?'million':i===12?'dollars':i===16?'millionaire':i===1?'rock':'',i)),type:i===13?'ding':'pop',gain:.55});
  shots.push({id:'S'+String(i+1).padStart(2,'0'),at:st,note:p.note,draw(lt,d,t,blit){
   const s=p.s,k=eio(clamp(lt/d)),a=angles[p.a];
   s.t.visible=i!==14;
   s.pack.visible=!!p.pack&&i!==14;s.rock.visible=!p.pack;s.manual.visible=!!p.manual;
   s.gary.group.visible=!['hero','overhead','manual'].includes(p.a);s.shopper.group.visible=s.gary.group.visible;
   s.gary.at(-1.05,0,-2.1);s.shopper.at(1.05,0,-2.1);
   s.gary.set({mood:p.g,blink:blink(t),talk:[2,3,7].includes(i)?Math.abs(Math.sin(t*12)):0,armR:p.a==='gary'?[70+Math.sin(t*2)*9,-45]:[28,12],armL:[18,10],lean:Math.sin(t*1.5)*1.2,bob:Math.sin(t*2)*2});
   s.shopper.set({mood:lt<.16?'neutral':p.b,blink:blink(t,1),sweat:p.b==='worried'?.45:0,armL:p.held||p.two?[35,-55]:p.b==='shock'?[100,-30]:[20,10],armR:p.two?[35,-55]:p.b==='shock'?[100,-30]:[18,10],holdL:p.held?handRock:p.two?handBox:undefined,holdR:p.two?handBox:undefined,v:p.two?'two':p.held?'rock':'empty',lean:p.b==='shock'?-4:0});
   if(s===C)piles.forEach((b,j)=>{b.visible=i===13||i===14||i===16;b.scale.setScalar(i===13?Math.max(.001,clamp((t-Wd('million',13)+.9-j*.045)/.25)):1);});
   cam.fov=a.fov;cam.updateProjectionMatrix();cam.position.copy(V(a.from).lerp(V(a.to),k));cam.lookAt(V(a.target));s.gary.face(cam);s.shopper.face(cam);
   E.render(s.scene,cam,{bloom:.15,aperture:.0007,maxblur:.006,focus:cam.position.distanceTo(V(a.target)),vignette:.12,grain:.006,t});blit();
   if(p.tag&&(!p.sales||t>=Wd('million',13)-.05))tag(p.tag,p.sub);
  }});
 });
 return {shots,cues};
}
