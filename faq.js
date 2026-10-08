import {faqs,faqCategories,faqGroups,selectFaqs} from './faq-data.js?v=e572f9f4162f';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let instance=0;
export function answerMarkup(q,prefix='faq'){
 return `<details class="faq-item" id="${prefix}-q${q.id}"><summary><span class="faq-number">${String(q.id).padStart(2,'0')}</span><span>${escape(q.question)}</span><span class="faq-plus" aria-hidden="true">＋</span></summary><div class="faq-answer">${q.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}<div class="faq-answer-links">${q.links.map(a=>`<a href="${escape(a.url)}"${a.url.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':''}>${escape(a.label)} ↗</a>`).join('')}<a href="faq.html#faq-q${q.id}">單題連結 ↗</a></div></div></details>`;
}
const groupMarkup=(key,heading=true)=>{
 const group=faqGroups[key];if(!group)return '';
 const prefix=`faq-related-${++instance}`;
 return `${heading?`<h3 class="faq-related-title">${group.title}</h3>`:''}<div class="faq-items">${group.ids.map(id=>answerMarkup(faqs.find(q=>q.id===id),prefix)).join('')}</div><a class="faq-all-link" href="faq.html">查看全部 41 題常見問題 <span aria-hidden="true">↗</span></a>`;
};
document.querySelectorAll('[data-faq-group]').forEach(root=>{root.classList.add('faq-related');root.innerHTML=groupMarkup(root.dataset.faqGroup)});

// One shared dialog for the three motion panels. Lock background scrolling so
// reading an answer never advances the exploded-view animation underneath it.
let faqDialog,returnFocus,previousOverflow,returnPosition;
document.addEventListener('click',event=>{
 const trigger=event.target.closest('[data-faq-open]');if(!trigger)return;
 const group=faqGroups[trigger.dataset.faqOpen];if(!group)return;
 event.preventDefault();returnFocus=trigger;
 if(!faqDialog){
  faqDialog=document.createElement('dialog');faqDialog.className='faq-dialog';faqDialog.setAttribute('aria-labelledby','faq-dialog-title');
  faqDialog.innerHTML='<div class="faq-dialog-top"><div><div class="eyebrow">GOOD TO KNOW</div><h2 id="faq-dialog-title"></h2></div><button type="button" data-faq-close aria-label="關閉常見問題">關閉 ×</button></div><div class="faq-dialog-content"></div>';
  document.body.append(faqDialog);
  faqDialog.querySelector('[data-faq-close]').addEventListener('click',()=>faqDialog.close());
  faqDialog.addEventListener('close',()=>{document.documentElement.style.overflow=previousOverflow;returnFocus?.focus({preventScroll:true});window.scrollTo({...returnPosition,behavior:'instant'})});
 }
 faqDialog.querySelector('h2').textContent=group.title;
 faqDialog.querySelector('.faq-dialog-content').innerHTML=groupMarkup(trigger.dataset.faqOpen,false);
 returnPosition={top:scrollY,left:scrollX};
 previousOverflow=document.documentElement.style.overflow;
 document.documentElement.style.overflow='hidden';faqDialog.showModal();faqDialog.scrollTop=0;
});

const catalog=document.querySelector('#faq-catalog');
if(catalog){
 let category='all';
 const search=document.querySelector('#faq-search'),status=document.querySelector('#faq-results-status'),empty=document.querySelector('#faq-empty'),filters=document.querySelector('#faq-categories');
 filters.innerHTML=[{id:'all',label:'全部問題'},...faqCategories].map(c=>`<button type="button" data-category="${c.id}" aria-pressed="${c.id==='all'}">${c.label}</button>`).join('');
 catalog.innerHTML=faqCategories.map(c=>`<section class="faq-category-section" data-faq-category="${c.id}" aria-labelledby="faq-category-${c.id}"><h2 id="faq-category-${c.id}">${c.label}</h2>${faqs.filter(q=>q.category===c.id).map(q=>answerMarkup(q)).join('')}</section>`).join('');
 function filter(){
  const result=selectFaqs(search.value,category),ids=new Set(result.map(q=>q.id));
  catalog.querySelectorAll('.faq-item').forEach(el=>{el.hidden=!ids.has(Number(el.id.replace('faq-q','')))});
  catalog.querySelectorAll('.faq-category-section').forEach(el=>{el.hidden=![...el.querySelectorAll('.faq-item')].some(q=>!q.hidden)});
  filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
  status.textContent=`${search.value.trim()?'找到':'共'} ${result.length} 題${category==='all'?'':'・'+faqCategories.find(c=>c.id===category).label}`;
  empty.hidden=result.length>0;
 }
 search.addEventListener('input',filter);
 filters.addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;filter()}});
 document.querySelector('#faq-clear').addEventListener('click',()=>{search.value='';category='all';filter();search.focus()});
 function openHash(){
  const match=location.hash.match(/^#faq-q(\d+)$/);if(!match)return;
  const target=document.getElementById(`faq-q${Number(match[1])}`);if(!target)return;
  category='all';search.value='';filter();target.open=true;
  requestAnimationFrame(()=>{target.scrollIntoView({block:'start',behavior:'instant'});target.querySelector('summary').focus({preventScroll:true})});
 }
 addEventListener('hashchange',openHash);filter();openHash();
}
