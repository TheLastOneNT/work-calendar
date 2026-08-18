(function(){
'use strict';
var START_UTC=Date.UTC(2026,7,17);
var END_UTC=Date.UTC(2027,0,23);
var DAY=86400000;
var TOTAL=Math.round((END_UTC-START_UTC)/DAY); // 159
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function todayIndex(){
  var d=new Date();
  var localAsUTC=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate());
  return clamp(Math.round((localAsUTC-START_UTC)/DAY),0,TOTAL);
}
function applyRoadFix(){
  var completed=todayIndex();
  var progress=completed/TOTAL*100;
  var svg=document.querySelector('.roadsvg');
  var red=document.getElementById('redfill');
  var marker=document.getElementById('todayArrow');
  var road=document.getElementById('road');
  var scroller=document.getElementById('scroller');
  var pct=document.getElementById('pct');
  if(!svg||!red)return;

  // Keep one calendar day visually equal to one 10px chevron on iPhone.
  // 159 days × 10px = 1590px; horizontal scrolling is intentional.
  if(road){
    road.style.width='1590px';
    road.style.minWidth='1590px';
  }

  var vb=1590;
  try{if(svg.viewBox&&svg.viewBox.baseVal&&svg.viewBox.baseVal.width)vb=svg.viewBox.baseVal.width}catch(e){}
  var dayWidth=vb/TOTAL;
  var completedWidth=completed*dayWidth;

  red.setAttribute('x','0');
  red.setAttribute('y','0');
  red.setAttribute('width',completedWidth.toFixed(3));
  red.setAttribute('height','46');
  red.setAttribute('fill','url(#past)');
  red.style.display='block';
  red.style.opacity='1';
  red.style.visibility='visible';
  red.style.filter=completed>0?'drop-shadow(0 0 3px rgba(255,59,48,.38))':'none';

  if(marker){
    if(completed<TOTAL){
      marker.style.opacity='1';
      marker.setAttribute('transform','translate('+(completed*dayWidth).toFixed(3)+' 0)');
    }else{
      marker.style.opacity='0';
    }
  }

  if(pct)pct.textContent=progress.toFixed(1);

  if(scroller&&road){
    requestAnimationFrame(function(){
      var x=road.scrollWidth*(progress/100);
      var target=x-scroller.clientWidth*.42;
      var max=Math.max(0,road.scrollWidth-scroller.clientWidth);
      scroller.scrollLeft=clamp(target,0,max);
    });
  }

  // Useful for checking the live page in Safari dev tools / future debugging.
  document.documentElement.dataset.completedDays=String(completed);
}
requestAnimationFrame(applyRoadFix);
setTimeout(applyRoadFix,60);
setTimeout(applyRoadFix,300);
document.addEventListener('visibilitychange',function(){if(!document.hidden)applyRoadFix()});
window.addEventListener('pageshow',applyRoadFix);
})();