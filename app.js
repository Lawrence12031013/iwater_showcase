import {coreDetailsMarkup} from './core-content.js?v=7fccaa70b5d7';
import {assets} from './assets-config.js?v=b77b1e851047';
import {clamp,ease,scenes,photoSeats,photoMounts,photoSizes} from './timeline.js?v=3cf75be72725';
import {chapterState,rhythm,coreScrollFrame,coreReadingPosition} from './pacing.js?v=13300bc88811';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const makeAsset=(src,label,kind)=>{const el=document.createElement(src?'img':'div');el.className=`component-asset ${kind}`;if(src){el.src=src;el.alt=label;el.addEventListener('error',()=>{const note=document.createElement('span');note.className='asset-error';note.textContent=label+'圖片無法載入';el.replaceWith(note)})}else{el.classList.add('asset-placeholder');el.textContent=label+'待補圖'}return el};
function placeComponentImage(layer,placement,fit,baseW,baseH,positionLayer=true){
 if(!placement)return;
 const img=layer.querySelector('img');if(!img)return;
 const [iw,ih]=placement.canvas,[bx,by,bw]=placement.bounds,[tx,ty,tw]=placement.target;
 const scale=tw*fit/bw;
 if(positionLayer)Object.assign(layer.style,{inset:'0',width:'100%',height:'100%'});
 Object.assign(img.style,{position:'absolute',maxWidth:'none',maxHeight:'none',objectFit:'contain',width:`${iw*scale}px`,height:`${ih*scale}px`,left:`${baseW/2+tx*fit-bx*scale}px`,top:`${baseH/2+ty*fit-by*scale}px`});
}
function createChapter(root){
 const kind=root.dataset.chapter,stage=root.querySelector('.stage'),shell=stage.querySelector('.shell'),assembly=stage.querySelector('.assembly'),empty=stage.querySelector('.empty-body'),pin=root.querySelector('.motion-pin'),slider=root.querySelector('input[type="range"]'),play=root.querySelector('[data-play]');
 let current=0;
 shell.querySelector('img').src=assets.front;
 const copyRoot=root.querySelector('.motion-copy');
 copyRoot.innerHTML=scenes.map((s,i)=>`<div class="story-panel" data-scene="${i}"><div class="eyebrow">${s.kicker}</div><${kind==='opening'&&i===0?'h1':'h2'}>${s.title}</${kind==='opening'&&i===0?'h1':'h2'}>${kind==='core'&&i>=4&&i<=6?coreDetailsMarkup(i-4):`<p>${s.body}</p>`}</div>`).join('');
const groups=assets.components.map((asset,i)=>{
 const group=document.createElement('div');group.className='component-group';group.dataset.component=asset.id;
 const body=document.createElement('div');body.className='housing-layer';body.append(makeAsset(asset.housing,asset.housingLabel||'鋼瓶','housing-asset'));
 const lid=document.createElement('div');lid.className='lid-layer';lid.append(makeAsset(asset.cap,asset.capLabel||'瓶蓋','lid-asset'));
 const core=document.createElement('div');core.className='core-layer';core.append(makeAsset(asset.core,asset.name,'core-asset'));
 group.append(core,body,lid);stage.append(group);return {group,body,lid,core,asset};
});
stage.querySelectorAll('.cartridge,.third-filter').forEach(el=>el.remove());
if(assets.emptyBody){empty.replaceChildren(makeAsset(assets.emptyBody,'空機身','empty-asset'));empty.classList.add('has-asset')}
const cover=document.createElement('div');cover.className='part isolated-cover';cover.append(makeAsset(assets.cover,'獨立外殼','cover-asset'));stage.append(cover);
const panels=[...copyRoot.querySelectorAll('.story-panel')];
function render(progress,selected=0){const w=stage.clientWidth,h=stage.clientHeight;
 const photo=assembly.querySelector('img'),bw=photo.clientWidth,bh=photo.clientHeight;
 const fit=Math.min(bw/448,bh/547);
 const seats=photoSeats(bw,bh,w,h),s=chapterState(kind,progress,selected,seats,assets.components.map(a=>a.openable));
 empty.style.width=`${448*fit}px`;empty.style.height=`${547*fit}px`;
 placeComponentImage(empty,assets.emptyBodyPlacement,fit,448*fit,547*fit,false);
 empty.querySelectorAll('.mounts i').forEach((el,i)=>{el.style.left=`${photoMounts[i].x/448*100}%`;el.style.top=`${photoMounts[i].y/547*100}%`});
 if(slider)slider.value=Math.round(progress*100);
 const paint=(el,state)=>{el.style.opacity=state.opacity;el.style.transform=`translate(calc(-50% + ${state.x*w}px),calc(-50% + ${state.y*h}px)) scale(${state.scaleX??state.scale},${state.scaleY??state.scale}) rotateY(${state.rotate||0}deg)`;el.setAttribute('aria-hidden',state.opacity<.05?'true':'false')};
 // Full product appears only at the bookends; an independent lid moves away.
 const closed=kind==='core'?0:1-ease((s.raw-.08)/.025)+ease((s.raw-.97)/.02);
 paint(shell,{...s.shell,x:0,rotate:0,opacity:Math.min(1,closed)});
 paint(cover,{...s.shell,opacity:s.shell.opacity*(1-Math.min(1,closed))});paint(assembly,s.assembly);paint(empty,s.empty);
 groups.forEach(({group,body,lid,core,asset},i)=>{
  const f=s.filters[i],baseW=photoSizes[i].width*fit,baseH=photoSizes[i].height*fit;
  group.style.width=`${baseW}px`;group.style.height=`${baseH}px`;
  placeComponentImage(body,asset.housingPlacement,fit,baseW,baseH);
  placeComponentImage(lid,asset.capPlacement,fit,baseW,baseH);
  const focusScale=Math.min(h*(asset.openable ? .48 : .72)/baseH,w*.35/baseW),scale=f.scale+(focusScale-f.scale)*f.focus;
  paint(group,{...f,scale});
  const [openingX,openingY]=asset.openingOffset||[1.2,-.42];
  lid.style.transform=`translate(${f.cap*baseW*openingX}px,${f.cap*baseH*openingY}px)`;
  const coreImg=core.querySelector('img'),cw=baseW*.84,ch=baseH*.84;
  const naturalW=coreImg?.naturalWidth||cw,naturalH=coreImg?.naturalHeight||ch;
  const imageFit=Math.min(cw/naturalW,ch/naturalH),imageW=naturalW*imageFit,imageH=naturalH*imageFit;
  const heroScale=Math.min(h*.8/(imageH*scale),w*.56/(imageW*scale));
  const coreScale=1+(heroScale-1)*f.reveal;
  const extractedY=-f.core*baseH*.96,centeredY=-f.y*h/scale;
  const coreY=extractedY+(centeredY-extractedY)*f.reveal;
  core.style.transform=`translateY(${coreY}px) scale(${coreScale})`;core.style.opacity=f.core;core.setAttribute('aria-hidden',f.core<.01?'true':'false');
  body.style.opacity=1-f.housingFade;lid.style.opacity=1-f.housingFade;
  group.setAttribute('aria-label',asset.name+(f.core>.9?'：濾芯已抽出':f.cap>.8?'：瓶蓋已開啟':'：鋼瓶組件'));
 });
 panels.forEach((el,i)=>{const opacity=s.copies[i];el.style.opacity=opacity;el.style.transform=`translateY(${(1-opacity)*12}px)`;el.style.visibility=opacity<.001?'hidden':'visible';el.setAttribute('aria-hidden',i===s.index?'false':'true');el.inert=i!==s.index});
 root.querySelector('.view-label').textContent=scenes[s.index].label;
 root.querySelector('.motion-progress span').style.transform=`scaleX(${progress})`;
 if(slider)slider.setAttribute('aria-valuetext',`${Math.round(progress*100)}%：${scenes[s.index].label}`);
 current=progress;
}
function bounds(){return {top:root.getBoundingClientRect().top+scrollY-parseFloat(getComputedStyle(pin).top||0),distance:Math.max(0,root.offsetHeight-pin.offsetHeight)}}
 function position(progress){const b=bounds();window.scrollTo({top:b.top+progress*b.distance,behavior:'instant'});render(progress)}
 return {root,pin,kind,slider,play,render,bounds,position,get current(){return current}};
}

const chapters=[...document.querySelectorAll('[data-chapter]')].map(createChapter);
const opening=chapters[0],core=chapters[1],closing=chapters[2];
let selected=0,animation=null,scrollFrame=null;
const coreButtons=[...core.root.querySelectorAll('[data-core]')];
function selectCore(index){
 selected=index;
 coreButtons.forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index))});
}
function renderCoreScroll(progress){
 const frame=coreScrollFrame(progress);
 selectCore(frame.index);
 core.render(reduced.matches?1:frame.progress,frame.index);
 const fade=reduced.matches?1:frame.fade;
 core.root.querySelector('.stage').style.opacity=fade;
 core.root.querySelector('.motion-copy').style.opacity=fade;
 core.slider.value=Math.round(progress*100);
 core.slider.setAttribute('aria-valuetext',`${Math.round(progress*100)}%：${assets.components[selected].name}`);
 core.root.querySelector('.motion-progress span').style.transform=`scaleX(${progress})`;
}
function stop(){
 if(animation)cancelAnimationFrame(animation.frame);
 animation=null;
 chapters.forEach(c=>{if(c.play){c.play.textContent='播放本段';c.play.setAttribute('aria-pressed','false')}});
}
function run(chapter,duration,update){
 stop();const task={kind:chapter.kind,frame:null};animation=task;
 chapter.play.textContent='停止播放';chapter.play.setAttribute('aria-pressed','true');
 const start=performance.now();
 function tick(now){
  if(animation!==task)return;
  const t=clamp((now-start)/duration);update(t);
  if(t<1)task.frame=requestAnimationFrame(tick);else stop();
 }
 task.frame=requestAnimationFrame(tick);
}
function scrollProgress(c){const b=c.bounds();return clamp((scrollY-b.top)/Math.max(1,b.distance))}
function positionCore(progress){
 stop();
 if(!reduced.matches){const b=core.bounds();window.scrollTo({top:b.top+progress*b.distance,behavior:'instant'})}
 renderCoreScroll(progress);
}
function jumpCore(index){positionCore(coreReadingPosition(index))}
function syncScroll(){
 if(reduced.matches)return;
 [opening,closing].forEach(c=>{if(animation?.kind!==c.kind)c.render(scrollProgress(c))});
 renderCoreScroll(scrollProgress(core));
}
chapters.forEach(c=>{
 c.slider?.addEventListener('input',()=>{
  const progress=Number(c.slider.value)/100;
  if(c.kind==='core'){positionCore(progress);return}
  stop();if(reduced.matches)c.render(progress);else c.position(progress);
 });
 c.play?.addEventListener('click',()=>{
  if(animation?.kind===c.kind){stop();return}
  stop();const from=c.current>.98?0:c.current;
  if(reduced.matches){c.render(c.current>.98?0:1);return}
  run(c,(1-from)*rhythm[c.kind]*1000,t=>c.position(from+(1-from)*t));
 });
});
coreButtons.forEach((button,i)=>button.addEventListener('click',()=>jumpCore(i)));
core.root.querySelector('.core-tabs').addEventListener('keydown',event=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?2:(selected+(event.key==='ArrowRight'?1:2))%3;
 coreButtons[index].focus();jumpCore(index);
});
addEventListener('scroll',()=>{
 if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{syncScroll();scrollFrame=null});
},{passive:true});
document.addEventListener('click',event=>{if(event.target.closest('a[href^="#"]'))stop()});
addEventListener('wheel',stop,{passive:true});
addEventListener('touchstart',stop,{passive:true});
addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)&&!event.target.matches('button,input'))stop()});
addEventListener('resize',()=>{if(reduced.matches){opening.render(opening.current);core.render(1,selected);closing.render(closing.current)}else syncScroll()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
reduced.addEventListener('change',()=>{stop();opening.render(0);renderCoreScroll(coreReadingPosition(selected));closing.render(1);syncScroll()});
opening.render(reduced.matches?0:scrollProgress(opening));
renderCoreScroll(reduced.matches?coreReadingPosition(0):scrollProgress(core));
closing.render(reduced.matches?1:scrollProgress(closing));

if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.section-heading,.detail-card,.closing h2').forEach(e=>{e.classList.add('reveal');observer.observe(e)})}
