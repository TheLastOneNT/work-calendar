(function(){
'use strict';

var START=new Date(2026,10,1,12);
var END=new Date(2027,0,1,12);
var WAIST_START=new Date(2026,10,1,12);
var START_W=103.6;
var TARGET_W=97.5;
var WAIST_START_CM=null;
var WAIST_CM_PER_KG=0;
var TARGET_WAIST=null;
var DAY=86400000;
var WSTORE='road85.health.weights.v1';
var CSTORE='road85.health.waist.v1';
function $(id){return document.getElementById(id)}
function localDay(d){d=d||new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate(),12)}
function days(a,b){return Math.round((b-a)/DAY)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function parse(s){var a=String(s||'').split('-').map(Number);return new Date(a[0],a[1]-1,a[2],12)}
function validDateString(s){return /^\d{4}-\d{2}-\d{2}$/.test(String(s||''))}
function plural(n){var a=Math.abs(n)%100,b=a%10;return a>10&&a<20?'дней':b===1?'день':b>=2&&b<=4?'дня':'дней'}
function read(store){try{return JSON.parse(localStorage.getItem(store)||'[]')}catch(e){return []}}
function write(store,a){localStorage.setItem(store,JSON.stringify(a))}
function putHealth(store,date,value){if(!validDateString(date)||!Number.isFinite(value))return;var a=read(store).filter(function(x){return x.date!==date});a.push({date:date,value:Math.round(value*100)/100,source:'apple-health'});a.sort(function(x,y){return x.date.localeCompare(y.date)});write(store,a)}
function parseNumber(raw){if(raw==null||raw==='')return null;var t=decodeURIComponent(String(raw)).toLowerCase().replace(',','.');var m=t.match(/-?\d+(?:\.\d+)?/);return m?{text:t,value:Number(m[0])}:null}
function toast(t){var el=$('toast');if(!el)return;el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){el.classList.remove('show')},1200)}
function acceptHealthUrl(){var u=new URL(location.href),changed=false,notes=[];var w=parseNumber(u.searchParams.get('weight'));if(w){var wv=w.value;if(w.text.indexOf('lb')>-1||(!w.text.includes('kg')&&wv>160))wv/=2.2046226218;var wd=u.searchParams.get('weightDate');if(!validDateString(wd))wd=iso(localDay());if(wv>=40&&wv<=250){putHealth(WSTORE,wd,wv);notes.push('вес синхронизирован')}u.searchParams.delete('weight');u.searchParams.delete('weightDate');changed=true}var c=parseNumber(u.searchParams.get('waist'));if(c){var cv=c.value;if(c.text.indexOf(' m')>-1||(!c.text.includes('cm')&&!c.text.includes('см')&&cv<3))cv*=100;var cd=u.searchParams.get('waistDate');if(!validDateString(cd))cd=iso(localDay());if(cv>=40&&cv<=200){putHealth(CSTORE,cd,cv);notes.push('талия синхронизирована')}u.searchParams.delete('waist');u.searchParams.delete('waistDate');changed=true}if(changed){var qs=u.searchParams.toString();history.replaceState(null,'',u.pathname+(qs?'?'+qs:'')+u.hash);if(notes.length)setTimeout(function(){toast(notes.join(' · '))},220)}}
function ensureWeightBaseline(){var a=read(WSTORE);if(!a.some(function(x){return x.date==='2026-11-01'}))putHealth(WSTORE,'2026-11-01',START_W)}
acceptHealthUrl();ensureWeightBaseline();
[].slice.call(document.querySelectorAll('.entry')).forEach(function(el){el.remove()});var waistPlanLabel=document.querySelector('#waistPage .plan');if(waistPlanLabel)waistPlanLabel.textContent='— план';
var TOTAL=days(START,END),pageIndex=0,pages=[$('roadPage'),$('weightPage'),$('waistPage')],dots=[].slice.call(document.querySelectorAll('.dot'));
function showPage(i){pageIndex=(i+pages.length)%pages.length;pages.forEach(function(p,j){p.hidden=j!==pageIndex});dots.forEach(function(d,j){d.classList.toggle('on',j===pageIndex)});if(pageIndex===1)setTimeout(drawWeight,0);if(pageIndex===2)setTimeout(drawWaist,0)}
$('nav').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();showPage(pageIndex+1)});
function planWeight(d){return START_W+(TARGET_W-START_W)*clamp(days(START,d)/TOTAL,0,1)}
function planWaist(d){var total=days(WAIST_START,END);return WAIST_START_CM+(TARGET_WAIST-WAIST_START_CM)*clamp(days(WAIST_START,d)/total,0,1)}
function renderRoad(){var t=localDay(),elapsed=clamp(days(START,t),0,TOTAL),p=clamp(elapsed/TOTAL*100,0,100),passed=t<START?0:elapsed;$('redfill').setAttribute('width',passed*10);var marker=$('todayArrow');if(t>=START&&t<END){marker.style.opacity='1';marker.setAttribute('transform','translate('+(elapsed*10)+' 0)')}else marker.style.opacity='0';var next=null;[].slice.call(document.querySelectorAll('.cp')).forEach(function(cp,i){var d=parse(cp.dataset.date);cp.classList.remove('past','next');if(d<t)cp.classList.add('past');if(!next&&i>0&&d>=t)next=cp});if(next){next.classList.add('next');var left=Math.max(0,days(t,parse(next.dataset.date)));next.querySelector('.count').textContent=left?left+' '+plural(left):'сегодня'}$('pct').textContent=p.toFixed(1);requestAnimationFrame(function(){var s=$('scroller'),r=$('road');s.scrollLeft=p?clamp(r.scrollWidth*p/100-s.clientWidth*.42,0,r.scrollWidth-s.clientWidth):0})}
var tip=$('tip');[].slice.call(document.querySelectorAll('.cp')).forEach(function(cp){cp.addEventListener('click',function(e){e.stopPropagation();var t=localDay(),d=parse(cp.dataset.date),w=Number(cp.dataset.weight),from=Math.max(0,days(START,d)),left=Math.max(0,days(t,d));tip.innerHTML='<b>'+w+' кг</b> · −'+(START_W-w).toFixed(1)+' кг · '+from+' '+plural(from)+' от старта · осталось '+(w-TARGET_W).toFixed(1)+' кг'+(d>=t?' · '+left+' '+plural(left):'');tip.style.left=cp.style.left;tip.classList.add('show')})});document.addEventListener('click',function(){tip.classList.remove('show')});
function weightPoints(){return read(WSTORE).map(function(x){return{date:x.date,value:Number(x.value)}}).filter(function(x){return Number.isFinite(x.value)&&parse(x.date)>=START&&parse(x.date)<=END}).sort(function(a,b){return a.date.localeCompare(b.date)})}
function waistPoints(){return read(CSTORE).map(function(x){return{date:x.date,value:Number(x.value)}}).filter(function(x){return Number.isFinite(x.value)&&parse(x.date)>=WAIST_START&&parse(x.date)<=END}).sort(function(a,b){return a.date.localeCompare(b.date)})}
function prep(canvas){var r=canvas.getBoundingClientRect();if(r.width<20||r.height<20)return null;var dpr=Math.max(1,window.devicePixelRatio||1);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);var ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);return{ctx:ctx,w:r.width,h:r.height}}
function drawAxes(ctx,w,h,Y,ticks){var p={l:8,r:8,t:10,b:24};ticks.forEach(function(v){ctx.strokeStyle='rgba(255,255,255,.055)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.l,Y(v));ctx.lineTo(w-p.r,Y(v));ctx.stroke();ctx.fillStyle='rgba(255,255,255,.25)';ctx.font='10px -apple-system';ctx.fillText(String(v),p.l+1,Y(v)-5)})}
function drawWeight(){
var z=prep($('weightChart'));if(!z)return;
var ctx=z.ctx,w=z.w,h=z.h,p={l:8,r:8,t:10,b:24},pw=w-p.l-p.r,ph=h-p.t-p.b;
var pts=weightPoints(),vals=pts.map(function(q){return q.value});
var ymin=Math.min(95,Math.floor(Math.min.apply(null,vals.concat([TARGET_W]))-1));
var ymax=Math.max(106,Math.ceil(Math.max.apply(null,vals.concat([START_W]))+1));
function X(d){return p.l+clamp(days(START,d)/TOTAL,0,1)*pw}
function Y(v){return p.t+(ymax-v)/(ymax-ymin)*ph}
ctx.clearRect(0,0,w,h);drawAxes(ctx,w,h,Y,[96,98,100,102,104].filter(function(v){return v>ymin&&v<ymax}));
ctx.strokeStyle='#ffd21a';ctx.lineWidth=2.2;ctx.setLineDash([7,6]);ctx.beginPath();
for(var i=0;i<=TOTAL;i++){var d=new Date(START.getTime()+i*DAY);i?ctx.lineTo(X(d),Y(planWeight(d))):ctx.moveTo(X(d),Y(planWeight(d)))}ctx.stroke();ctx.setLineDash([]);
if(pts.length){
ctx.strokeStyle='#f4f0e7';ctx.lineWidth=2.4;ctx.beginPath();
pts.forEach(function(q,i){i?ctx.lineTo(X(parse(q.date)),Y(q.value)):ctx.moveTo(X(parse(q.date)),Y(q.value))});ctx.stroke();
pts.forEach(function(q,i){ctx.fillStyle=i===pts.length-1?'#ff3b30':'#f4f0e7';ctx.beginPath();ctx.arc(X(parse(q.date)),Y(q.value),i===pts.length-1?3.6:2.4,0,Math.PI*2);ctx.fill()});
var last=pts[pts.length-1],delta=last.value-planWeight(parse(last.date));
$('latestWeight').textContent=last.value.toFixed(1)+' кг';
$('latestWeightMeta').textContent=pts.length===1?'старт · 1 ноября':(delta>=0?'+':'')+delta.toFixed(1)+' кг от плана';
}else{$('latestWeight').textContent='—';$('latestWeightMeta').textContent='ожидает замер'}
ctx.fillStyle='rgba(255,210,26,.55)';ctx.font='10px -apple-system';
ctx.fillText('1 ноя',p.l,h-6);ctx.fillText('1 янв',w-p.r-30,h-6);
}
function nextSundayOnOrAfter(d){var x=new Date(d.getTime()),add=(7-x.getDay())%7;x.setDate(x.getDate()+add);return localDay(x)}
function drawWaist(){
var z=prep($('waistChart'));if(!z)return;
var ctx=z.ctx,w=z.w,h=z.h,p={l:8,r:8,t:10,b:24},pw=w-p.l-p.r,ph=h-p.t-p.b;
var pts=waistPoints(),vv=pts.map(function(q){return q.value});
var ymin=pts.length?Math.floor(Math.min.apply(null,vv)/5)*5-5:75;
var ymax=pts.length?Math.ceil(Math.max.apply(null,vv)/5)*5+5:125;
if(ymax-ymin<10)ymax=ymin+10;
function X(d){return p.l+clamp(days(START,d)/TOTAL,0,1)*pw}
function Y(v){return p.t+(ymax-v)/(ymax-ymin)*ph}
ctx.clearRect(0,0,w,h);
var steps=5,ticks=[];for(var k=0;k<=steps;k++)ticks.push(Math.round(ymin+(ymax-ymin)*k/steps));
drawAxes(ctx,w,h,Y,ticks);
if(pts.length){
ctx.strokeStyle='#f4f0e7';ctx.lineWidth=2.4;ctx.beginPath();
pts.forEach(function(q,i){i?ctx.lineTo(X(parse(q.date)),Y(q.value)):ctx.moveTo(X(parse(q.date)),Y(q.value))});ctx.stroke();
pts.forEach(function(q,i){ctx.fillStyle=i===pts.length-1?'#ff3b30':'#f4f0e7';ctx.beginPath();ctx.arc(X(parse(q.date)),Y(q.value),i===pts.length-1?3.6:2.5,0,Math.PI*2);ctx.fill()});
var last=pts[pts.length-1];$('latestWaist').textContent=last.value.toFixed(1)+' см';
$('latestWaistMeta').textContent='замер · '+last.date;
}else{$('latestWaist').textContent='—';$('latestWaistMeta').textContent='ожидает новый замер'}
ctx.fillStyle='rgba(255,210,26,.55)';ctx.font='10px -apple-system';
ctx.fillText('1 ноя',p.l,h-6);ctx.fillText('1 янв',w-p.r-30,h-6);
}
window.addEventListener('resize',function(){if(pageIndex===1)drawWeight();if(pageIndex===2)drawWaist()});
renderRoad();showPage(0);
})();