import {assets} from './assets-config.js?v=b77b1e851047';
import {clamp,ease,timeline,scenes,photoSeats,photoMounts,photoSizes,displayProgress,motionTiming} from './timeline.js?v=acaf021a0d23';
const slider=document.querySelector('#explode'),stage=document.querySelector('#stage'),shell=document.querySelector('.shell'),assembly=document.querySelector('.assembly'),tall=document.querySelector('.tall'),short=document.querySelector('.short'),third=document.querySelector('.third-filter'),empty=document.querySelector('.empty-body'),play=document.querySelector('#play'),chapter=document.querySelector('.motion-chapter'),pin=document.querySelector('.motion-pin');
if(assets.front)shell.querySelector('img').src=assets.front;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=null,scrollFrame=null;
const copyRoot=document.querySelector('#story-copy');
copyRoot.innerHTML=scenes.map((s,i)=>`<div class="story-panel" data-scene="${i}"><div class="eyebrow">${s.kicker}</div><${i===0?'h1':'h2'}>${s.title}</${i===0?'h1':'h2'}><p>${s.body}</p><a class="text-link" href="#details">跳至設計細節 ↗</a></div>`).join('');
// Each assembly has independent housing, lid and inner-core asset slots.
const makeAsset=(src,label,kind)=>{const el=document.createElement(src?'img':'div');el.className=`component-asset ${kind}`;if(src){el.src=src;el.alt=label;el.addEventListener('error',()=>{const note=document.createElement('span');note.className='asset-error';note.textContent=label+'圖片無法載入';el.replaceWith(note)})}else{el.classList.add('asset-placeholder');el.textContent=label+'待補圖'}return el};
const groups=assets.components.map((asset,i)=>{
 const group=document.createElement('div');group.className='component-group';group.dataset.component=asset.id;
 const body=document.createElement('div');body.className='housing-layer';body.append(makeAsset(asset.housing,asset.housingLabel||'鋼瓶','housing-asset'));
 const lid=document.createElement('div');lid.className='lid-layer';lid.append(makeAsset(asset.cap,asset.capLabel||'瓶蓋','lid-asset'));
 const core=document.createElement('div');core.className='core-layer';core.append(makeAsset(asset.core,asset.name,'core-asset'));
 group.append(core,body,lid);stage.append(group);return {group,body,lid,core,asset};
});
[tall,short,third].forEach(el=>el.remove());
if(assets.emptyBody){empty.replaceChildren(makeAsset(assets.emptyBody,'空機身','empty-asset'));empty.classList.add('has-asset')}
const cover=document.createElement('div');cover.className='part isolated-cover';cover.append(makeAsset(assets.cover,'獨立外殼','cover-asset'));stage.append(cover);
document.querySelectorAll('[data-value]').forEach((button,i)=>{button.dataset.value=String(displayProgress([0,.14,.22,.35,.44,.56,.68,.75,1][i])*100)});
// Register the visible metal component, not the untrimmed image canvas.
function placeComponentImage(layer,placement,fit,baseW,baseH,positionLayer=true){
 if(!placement)return;
 const img=layer.querySelector('img');if(!img)return;
 const [iw,ih]=placement.canvas,[bx,by,bw]=placement.bounds,[tx,ty,tw]=placement.target;
 const scale=tw*fit/bw;
 if(positionLayer)Object.assign(layer.style,{inset:'0',width:'100%',height:'100%'});
 Object.assign(img.style,{position:'absolute',maxWidth:'none',maxHeight:'none',objectFit:'contain',width:`${iw*scale}px`,height:`${ih*scale}px`,left:`${baseW/2+tx*fit-bx*scale}px`,top:`${baseH/2+ty*fit-by*scale}px`});
}
const panels=[...copyRoot.querySelectorAll('.story-panel')];
function render(value){const p=clamp(Number(value)/100),w=stage.clientWidth,h=stage.clientHeight;
 const photo=assembly.querySelector('img'),bw=photo.clientWidth,bh=photo.clientHeight;
 const fit=Math.min(bw/448,bh/547);
 const seats=photoSeats(bw,bh,w,h),s=timeline(p,seats,assets.components.map(a=>a.openable));
 empty.style.width=`${448*fit}px`;empty.style.height=`${547*fit}px`;
 placeComponentImage(empty,assets.emptyBodyPlacement,fit,448*fit,547*fit,false);
 empty.querySelectorAll('.mounts i').forEach((el,i)=>{el.style.left=`${photoMounts[i].x/448*100}%`;el.style.top=`${photoMounts[i].y/547*100}%`});
 slider.value=Math.round(p*100);
 const paint=(el,state)=>{el.style.opacity=state.opacity;el.style.transform=`translate(calc(-50% + ${state.x*w}px),calc(-50% + ${state.y*h}px)) scale(${state.scaleX??state.scale},${state.scaleY??state.scale}) rotateY(${state.rotate||0}deg)`;el.setAttribute('aria-hidden',state.opacity<.05?'true':'false')};
 // Full product appears only at the bookends; an independent lid moves away.
 const closed=1-ease((p-.08)/.025)+ease((p-.97)/.02);
 paint(shell,{...s.shell,x:0,rotate:0,opacity:Math.min(1,closed)});
 paint(cover,{...s.shell,opacity:s.shell.opacity*(1-Math.min(1,closed))});paint(assembly,s.assembly);paint(empty,s.empty);
 groups.forEach(({group,body,lid,core,asset},i)=>{
  const f=s.filters[i],baseW=photoSizes[i].width*fit,baseH=photoSizes[i].height*fit;
  group.style.width=`${baseW}px`;group.style.height=`${baseH}px`;
  placeComponentImage(body,asset.housingPlacement,fit,baseW,baseH);
  placeComponentImage(lid,asset.capPlacement,fit,baseW,baseH);
  const focusScale=Math.min(h*.48/baseH,w*.35/baseW),scale=f.scale+(focusScale-f.scale)*f.focus;
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
 document.querySelector('#view-label').textContent=`${String(s.index+1).padStart(2,'0')} / 09 — ${scenes[s.index].label}`;
 document.querySelectorAll('[data-value]').forEach((b,i)=>{b.classList.toggle('active',i===s.index);b.setAttribute('aria-pressed',i===s.index)});
 document.querySelector('#progress-number').textContent=String(Math.round(p*100)).padStart(2,'0');document.querySelector('#progress-bar').style.transform=`scaleX(${p})`;slider.setAttribute('aria-valuetext',`${Math.round(p*100)}%：${scenes[s.index].label}`)}
function bounds(){const top=chapter.getBoundingClientRect().top+scrollY-parseFloat(getComputedStyle(pin).top||0);return {top:Number.isFinite(top)?top:0,distance:Math.max(1,chapter.offsetHeight-pin.offsetHeight)}}
function scrollValue(){const b=bounds();return clamp((scrollY-b.top)/b.distance)*100}
function stop(){cancelAnimationFrame(frame);frame=null;play.textContent='▶';play.setAttribute('aria-label','播放拆解動畫')}
function position(value){if(reduced.matches){render(value);return}const b=bounds();window.scrollTo({top:b.top+value/100*b.distance,behavior:'instant'});render(value)}
function animate(target,duration=motionTiming.chapterTransition,linear=false){stop();if(reduced.matches){render(target);return}const from=Number(slider.value),start=performance.now();play.textContent='Ⅱ';play.setAttribute('aria-label','暫停拆解動畫');function tick(now){const t=clamp((now-start)/duration);position(from+(target-from)*(linear?t:ease(t)));if(t<1)frame=requestAnimationFrame(tick);else stop()}frame=requestAnimationFrame(tick)}
slider.addEventListener('input',()=>{stop();position(Number(slider.value))});document.querySelectorAll('[data-value]').forEach(b=>b.addEventListener('click',()=>animate(Number(b.dataset.value))));play.addEventListener('click',()=>{if(frame){stop();return}const current=Number(slider.value),target=current>95?0:100;animate(target,Math.max(600,Math.abs(target-current)/100*motionTiming.playback),true)});addEventListener('scroll',()=>{if(!reduced.matches&&!scrollFrame)scrollFrame=requestAnimationFrame(()=>{render(scrollValue());scrollFrame=null})},{passive:true});addEventListener('wheel',stop,{passive:true});addEventListener('touchstart',stop,{passive:true});addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))stop()});addEventListener('resize',()=>render(reduced.matches?slider.value:scrollValue()));reduced.addEventListener('change',()=>{stop();render(reduced.matches?0:scrollValue())});render(reduced.matches?0:scrollValue());
const filters=[
 {image:assets.components[0].core,title:'精密陶瓷濾心',description:'第一道隔離。矽藻化石燒製，過濾孔徑 0.2–0.4 μm，並添加銀離子。'},
 {image:assets.components[1].core,title:'高壓縮活性碳濾心',description:'第二道吸附。天然椰子殼燒製，產品頁標示 0.5 μm 超高密度規格，並添加專利負離子配方。'},
 {image:assets.components[2].core,title:'專利磁化模組',description:'搭配濾心於水流通過時運作。主機利用水壓驅動，不需插電；產品頁列磁化器每 10 年更換。'}
];
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.filter),f=filters[i],img=document.querySelector('#filter-image');img.hidden=!f.image;document.querySelector('#filter-pending').hidden=!!f.image;if(f.image){img.src=f.image;img.alt=f.title+'展示示意，對應待確認'}document.querySelector('#filter-title').textContent=f.title;document.querySelector('#filter-description').textContent=f.description;document.querySelector('#filter-number').textContent=`0${i+1} / 03`;document.querySelectorAll('[data-filter]').forEach((e,n)=>{e.classList.toggle('selected',n===i);e.setAttribute('aria-pressed',n===i)})}));
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.section-heading,.detail-card,.closing h2').forEach(e=>{e.classList.add('reveal');observer.observe(e)})}
