// Nine-scene storyboard. All states depend only on progress, so scrolling back
// reverses the same motion without timers or accumulated transforms.
export const clamp = v => Math.max(0, Math.min(1, v));
// Zero velocity and acceleration at each end makes parts settle softly.
export const ease = v => { const t = clamp(v); return clamp(t*t*t*(t*(t*6-15)+10)); };
export const motionTiming = {playback:135000, chapterTransition:2200};
export function track(p, keys) {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i=1;i<keys.length;i++) {
    const [end,b]=keys[i], [start,a]=keys[i-1];
    if (p<=end) return a+(b-a)*ease((p-start)/(end-start));
  }
  return keys.at(-1)[1];
}
export const scenes = [
  {at:0, label:'淨水器', kicker:'IWATER', title:'純粹，<br><span>從內而外。</span>', body:'往下捲動，探索每一層細節。'},
  {at:.08, label:'外殼打開', kicker:'OPEN THE COVER', title:'打開，<br><span>看見更多。</span>', body:'外殼緩緩移開，內在即將呈現。'},
  {at:.19, label:'內部結構', kicker:'INSIDE IWATER', title:'內在，<br><span>一覽無遺。</span>', body:'從機身內部，開始探索三組核心元件。'},
  {at:.26, label:'三組鋼瓶同步飛出', kicker:'THREE CORE COMPONENTS', title:'三組鋼瓶，<br><span>同步展開。</span>', body:'先看完整鋼瓶，再探索內部核心。'},
  {at:.38, label:'精密陶瓷濾心', kicker:'CERAMIC · 第一道隔離', title:'精密陶瓷，<br><span>先行隔離。</span>', body:'矽藻化石燒製，過濾孔徑 0.2–0.4 μm，並添加銀離子。以精密孔隙進行物理過濾。'},
  {at:.50, label:'高壓縮活性碳濾心', kicker:'ACTIVATED CARBON · 第二道吸附', title:'高壓縮，<br><span>活性碳濾心。</span>', body:'天然椰子殼燒製，產品頁標示 0.5 μm 超高密度規格，並添加專利負離子配方，以吸附作為此道功能。'},
  {at:.62, label:'專利磁化模組', kicker:'MAGNETIC MODULE · 磁化模組', title:'專利，<br><span>磁化模組。</span>', body:'產品頁介紹的磁化核心，搭配濾心於水流通過時運作。主機利用水壓驅動，不需插電。'},
  {at:.73, label:'依序回裝', kicker:'BACK IN PLACE', title:'各歸其位，<br><span>回到完整。</span>', body:'右邊先回位，再來是中間，最後是左邊。'},
  {at:.94, label:'外殼蓋回', kicker:'SIMPLICITY, INSIDE OUT.', title:'回歸純粹，<br><span>一如最初。</span>', body:'外殼合上，回到完整的 iWater。'}
];
// Centers measured in the supplied 448 × 547 internal-structure photo.
// Convert from image coordinates after object-fit: contain, not stage percentages.
export const photoMounts = [{x:104,y:242},{x:226,y:234},{x:354,y:242}];
export const photoSizes = [{width:82,height:290},{width:152,height:228},{width:78,height:292}];
// Match visible product bounds, excluding the white margins in source PNGs.
export function dockScale(index,photoScale,layerWidth,layerHeight) {
 const sources=[{w:354,h:600,bw:113,bh:554},{w:368,h:535,bw:298,bh:455},null];
 const source=sources[index],fit=source?Math.min(layerWidth/source.w,layerHeight/source.h):1;
 const width=source?source.bw*fit:layerWidth,height=source?source.bh*fit:layerHeight;
 return {scaleX:photoSizes[index].width*photoScale/width,scaleY:photoSizes[index].height*photoScale/height};
}
export function photoSeats(boxWidth,boxHeight,stageWidth,stageHeight) {
 const scale=Math.min(boxWidth/448,boxHeight/547);
 return photoMounts.map(({x,y})=>({x:(x-224)*scale/stageWidth,y:(y-273.5)*scale/stageHeight}));
}
// Reading plateaus: preserve opening / 27% alignment while allocating
// dedicated scroll distance to fully revealed components and their copy.
export const readingStops=[.44,.56,.68];
const readingHold=.18, readingStart=.36, readingEnd=.94;
const readingFactor=(readingEnd-readingStart)/(readingEnd-readingStart+readingHold*readingStops.length);
export function displayProgress(raw) {
 if(raw<=readingStart||raw>=readingEnd)return raw;
 const before=readingStops.filter(stop=>stop<raw).length;
 const atStop=readingStops.includes(raw)?readingHold/2:0;
 return readingStart+(raw-readingStart+before*readingHold+atStop)*readingFactor;
}
export function storyProgress(progress) {
 if(progress<=readingStart||progress>=readingEnd)return progress;
 let travel=(progress-readingStart)/readingFactor, previous=readingStart;
 for(const stop of readingStops){
  const moving=stop-previous;
  if(travel<moving)return previous+travel;
  travel-=moving;
  if(travel<=readingHold)return stop;
  travel-=readingHold;previous=stop;
 }
 return previous+travel;
}
export function timeline(p,seats=photoSeats(448,547,448,547),openable=[true,true,false]) {
 p=storyProgress(clamp(p));const k=keys=>track(p,keys);
 const shell={opacity:k([[0,1],[.105,1],[.18,0],[.93,0],[.985,1],[1,1]]),x:k([[0,0],[.08,0],[.18,-.65],[.92,-.65],[.985,0]]),y:0,scale:1,rotate:k([[0,0],[.08,0],[.18,-30],[.92,-30],[.985,0]])};
 const assembly={opacity:k([[0,0],[.08,0],[.15,1],[.275,1],[.36,0],[.92,0],[.95,1],[.985,0]]),x:0,y:0,scale:1};
 const empty={opacity:k([[0,0],[.71,0],[.75,1],[.925,1],[.955,0]]),x:0,y:0,scale:1};
 const make=i=>{
  const seat=seats[i],spread=[-.31,0,.31][i],focusStart=[.37,.49,.61][i],focusEnd=focusStart+.035;
  const returnStart=[.87,.81,.75][i],returnEnd=returnStart+.055;
  const focus=k([[0,0],[focusStart,0],[focusEnd,1],[focusStart+.095,1],[focusStart+.125,0]]);
  const cap=openable[i]?k([[0,0],[focusStart+.025,0],[focusStart+.045,1],[focusStart+.103,1],[focusStart+.115,0]]):0;
  const core=openable[i]?k([[0,0],[focusStart+.045,0],[focusStart+.062,1],[focusStart+.085,1],[focusStart+.101,0]]):0;
  const reveal=openable[i]?k([[0,0],[focusStart+.062,0],[focusStart+.068,1],[focusStart+.074,1],[focusStart+.082,0]]):0;
  const housingFade=openable[i]?k([[0,0],[focusStart+.055,0],[focusStart+.064,1],[focusStart+.078,1],[focusStart+.085,0]]):0;
  const intro=openable[i]?k([[0,0],[focusStart+.064,0],[focusStart+.07,1],[focusStart+.074,1],[focusStart+.085,0]]):1;
  const alphaKeys=i===0?[[0,0],[.25,0],[.265,1],[.475,1],[.50,0],[.85,0],[.87,1],[.925,1],[.95,0]]:i===1?[[0,0],[.25,0],[.265,1],[.37,1],[.405,0],[.485,0],[.51,1],[.595,1],[.62,0],[.79,0],[.81,1],[.925,1],[.95,0]]:[[0,0],[.25,0],[.265,1],[.37,1],[.405,0],[.605,0],[.63,1],[.925,1],[.95,0]];
  return {opacity:k(alphaKeys),x:k([[0,seat.x],[.275,seat.x],[.36,spread],[focusStart,spread],[focusEnd,0],[focusStart+.095,0],[focusStart+.125,spread],[returnStart,spread],[returnEnd,seat.x]]),y:k([[0,seat.y],[.275,seat.y],[.36,-.04],[focusStart,-.04],[focusEnd,.12],[focusStart+.095,.12],[focusStart+.125,-.04],[returnStart,-.04],[returnEnd,seat.y]]),scale:k([[0,1],[.275,1],[.36,1.12],[returnStart,1.12],[returnEnd,1]]),focus,cap,core,reveal,housingFade,intro};
 };
 const components=[make(0),make(1),make(2)];
 const copies=scenes.map((scene,i)=>{const incoming=i===0?1:ease((p-(scene.at-.015))/.03);const outgoing=i===scenes.length-1?1:1-ease((p-(scenes[i+1].at-.015))/.03);return incoming*outgoing*(i>=4&&i<=6?components[i-4].intro:1)});
 let index=0;scenes.forEach((s,i)=>{if(p>=s.at)index=i});
 return {shell,assembly,empty,filters:components,copies,index};
}
