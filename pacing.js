import {clamp,ease,timeline,displayProgress} from './timeline.js?v=3cf75be72725';

// Only opening and closing offer optional playback. Core motion follows scroll.
export const rhythm={opening:12,closing:10};
const interpolate=(p,keys)=>{
 for(let i=1;i<keys.length;i++)if(p<=keys[i][0]){
  const [a,x]=keys[i-1],[b,y]=keys[i];return x+(y-x)*clamp((p-a)/(b-a));
 }
 return keys.at(-1)[1];
};
export function chapterRaw(kind,progress,index=0){
 const p=clamp(progress);
 if(kind==='opening')return interpolate(p,[[0,0],[.12,.08],[.40,.19],[.57,.25],[.62,.275],[.88,.36],[1,.36]]);
 if(kind==='closing')return interpolate(p,[[0,.71],[.10,.75],[.30,.805],[.32,.81],[.52,.865],[.54,.87],[.74,.925],[.78,.93],[.95,.985],[1,1]]);
 return [.37,.49,.61][index]+interpolate(p,[[0,0],[.20,.025],[.375,.045],[.75,.062],[1,.070]]);
}
export function chapterState(kind,progress,index,seats,openable){
 const raw=chapterRaw(kind,progress,index),state=timeline(displayProgress(raw),seats,openable);
 state.raw=raw;
 if(kind==='core'){
  state.shell.opacity=state.assembly.opacity=state.empty.opacity=0;
  state.filters.forEach((filter,i)=>{filter.opacity=i===index?1:0});
  state.index=index+4;
  state.copies=state.copies.map((_,i)=>i===index+4?ease((progress-.75)/.25):0);
 }
 if(kind==='closing'){
  state.filters.forEach((filter,i)=>{
   const start=[.87,.81,.75][i],amount=ease((raw-start)/.055);
   filter.focus=filter.cap=filter.core=filter.reveal=filter.housingFade=0;
   filter.opacity=1-ease((raw-.925)/.025);
   filter.x=[-.31,0,.31][i]+(seats[i].x-[-.31,0,.31][i])*amount;
   filter.y=-.04+(seats[i].y+.04)*amount;
  });
  state.index=raw<.94?7:8;
  const closingCopy=ease((raw-.925)/.03);
  state.copies=state.copies.map((_,i)=>i===7?1-closingCopy:i===8?closingCopy:0);
 }
 return state;
}
// Each third: reveal 0–42%, full reading 42–87%, then fade out.
// The final module stays visible at the end; reverse scrolling reverses the pose.
export function coreScrollFrame(progress){
 const scaled=clamp(progress)*3,index=Math.min(2,Math.floor(scaled)),local=scaled-index;
 return {index,progress:clamp(local/.42),fade:(index===0?1:ease(local/.12))*(index===2?1:1-ease((local-.87)/.13))};
}
export const coreReadingPosition=index=>(Math.max(0,Math.min(2,index))+.65)/3;
