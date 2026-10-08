// Product page 7, sections 1–2; read 2026-10-07. These details belong to
// the core chapter only, leaving the opening and reassembly copy unchanged.
export const coreContent=[
 {
  metrics:[['0.2–0.4 μm','約略孔徑'],['天然矽藻土','燒製陶瓷']],
  body:'以天然矽藻土／矽藻化石燒製，透過細密孔隙攔截泥沙、鐵鏽與水中微粒。',
  note:'可依使用狀況清潔表面；刷洗後仍需按建議週期更換。',
  link:'product.html#care',linkLabel:'濾心更換與保養'
 },
 {
  metrics:[['0.5 μm','約略孔徑'],['4,500 L','額定過濾量']],
  body:'高壓壓縮活性碳處理餘氯、異味及特定污染物，保留原水天然礦物質；礦物質含量依原水而異。',
  note:'整機測試另列重金屬、囊胞及部分新興污染物的減量項目，效能依型號、配置與測試條件確認。',
  link:'product.html#evidence',linkLabel:'過濾項目與測試資料'
 },
 {
  metrics:[['磁石排列','建立磁場環境'],['流道設計','安排水流路徑']],
  body:'兩道濾淨之後，水流再通過金字塔水磁化裝置。磁石排列、流道設計與動態水流，一起完成這道物理處理。',
  note:'這是濾淨後的獨立處理模組，與陶瓷、活性碳的污染物過濾功能不同。',
  link:'product.html#magnetic',linkLabel:'認識金字塔水磁化'
 }
];
export const coreDetailsMarkup=index=>{
 const detail=coreContent[index];
 return `<dl class="core-facts">${detail.metrics.map(([value,label])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><p class="core-description">${detail.body}</p><p class="core-note">${detail.note}</p><a class="text-link core-detail-link" href="${detail.link}">${detail.linkLabel} ↗</a><a class="core-faq-trigger" href="faq.html#faq-q${[32,33,34][index]}" data-faq-open="${['ceramic','carbon','magnetic'][index]}" aria-haspopup="dialog">使用與保養問題 <span aria-hidden="true">＋</span></a>`;
};
