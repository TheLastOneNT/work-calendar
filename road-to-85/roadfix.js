(function(){
'use strict';
var START_UTC=Date.UTC(2026,7,17);
var END_UTC=Date.UTC(2027,0,23);
var DAY=86400000;
var TOTAL=Math.round((END_UTC-START_UTC)/DAY); // 159
var CELL=12;
var W=TOTAL*CELL;
var H=46;
var YELLOW='#ffd21a';
var RED='#ff3b30';
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function completedDays(){
  var d=new Date();
  var localAsUTC=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate());
  return clamp(Math.floor((localAsUTC-START_UTC)/DAY),0,TOTAL);
}
function makeChevron(i,fill,isToday){
  var x=i*CELL;
  var gap=2;
  var w=CELL-gap;
  var x1=x;
  var x2=x+w*.58;
  var x3=x+w;
  var x4=x+w*.28;
  var d='M '+x1+' 3 H '+x2+' L '+x3+' 23 L '+x2+' 43 H '+x1+' L '+x4+' 23 Z';
  return '<path d="'+d+'" fill="'+fill+'" opacity="'+(fill===RED?'1':'.9')+'"'+(isToday?' filter="drop-shadow(0 0 5px rgba(255,210,26,.9))"':'')+'/>';
}
function render(){
  var completed=completedDays();
  var progress=completed/TOTAL*100;
  var svg=document.querySelector('.roadsvg');
  var road=document.getElementById('road');
  var scroller=document.getElementById('scroller');
  var pct=document.getElementById('pct');
  if(!svg)return;

  if(road){
    road.style.width=W+'px';
    road.style.minWidth=W+'px';
  }
  svg.setAttribute('viewBox','0 0 '+W+' '+H);
  svg.setAttribute('preserveAspectRatio','none');

  var html='';
  for(var i=0;i<TOTAL;i++){
    var fill=i<completed?RED:YELLOW;
    var today=(i===completed && completed<TOTAL);
    html+=makeChevron(i,fill,today);
  }
  svg.innerHTML=html;

  if(pct)pct.textContent=progress.toFixed(1);

  if(scroller&&road){
    requestAnimationFrame(function(){
      var x=completed*CELL;
      var target=x-scroller.clientWidth*.42;
      var max=Math.max(0,road.scrollWidth-scroller.clientWidth);
      scroller.scrollLeft=clamp(target,0,max);
    });
  }

  document.documentElement.dataset.completedDays=String(completed);
  document.documentElement.dataset.roadRenderer='explicit-chevrons-v2';
}
requestAnimationFrame(render);
setTimeout(render,80);
setTimeout(render,350);
document.addEventListener('visibilitychange',function(){if(!document.hidden)render()});
window.addEventListener('pageshow',render);
})();