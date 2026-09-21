// Replace null with a transparent PNG/WebP path relative to index.html.
// Trim transparent margins so that the product fills its image canvas.
export const assets = {
  front: 'assets/iWater-01.png',
  cover: 'assets/獨立外殼待補圖.png',
  emptyBody: 'assets/空機身素材.png',
  // Register the visible chassis rather than its square canvas margins.
  // Fit the 910 px chassis height to 473 px in the original assembly photo.
  emptyBodyPlacement:{canvas:[1254,1254], bounds:[262,177,732,910], target:[-184,-240.5,732*473/910]},
  components: [
    {id:'ceramic', name:'陶瓷濾心', housing:'assets/陶瓷濾芯-鋼瓶待補圖.png', cap:'assets/陶瓷濾芯-瓶蓋待補圖.png', core:'assets/iWater-05.png', openable:true,
      // Cropped parts share a 223 px rim width. Use one scale for both;
      // target is [left, top, width] in the 448 × 547 assembly photo.
      // The lid overlaps the housing rim by 2 photo pixels when closed.
      housingPlacement:{canvas:[223,842], bounds:[0,0,223,842], target:[-39,-131,78]},
      capPlacement:{canvas:[223,188], bounds:[0,0,223,188], target:[-39,-129-188*78/223,78]}},
    {id:'carbon', name:'活性碳濾心', housing:'assets/活性碳濾心-下.png', cap:'assets/活性碳濾心-上.png', core:'assets/iWater-06.png', openable:true,
      housingLabel:'活性碳鋼瓶下半部', capLabel:'活性碳鋼瓶上半部', openingOffset:[.85,-.56],
      // Align the 375 px capsule body, excluding the bracket on its left.
      // Both halves use the same scale; their seam sits beneath the upper half.
      housingPlacement:{canvas:[552,397], bounds:[142,0,375,397], target:[-65,-128+306*130/375-2,130]},
      capPlacement:{canvas:[552,306], bounds:[142,0,375,306], target:[-65,-128,130]}},
    {id:'magnetic', name:'磁化模組', housing:'assets/磁化模組_鋼瓶待補.png', cap:'assets/磁化模組-瓶蓋待補.png', core:null, openable:false,
      // Both supplied parts share a 224 px rim; preserve their common scale.
      housingPlacement:{canvas:[224,844], bounds:[0,0,224,844], target:[-39,-131,78]},
      capPlacement:{canvas:[224,189], bounds:[0,0,224,189], target:[-39,-129-189*78/224,78]}}
  ]
};
