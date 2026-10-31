import { solution } from './model.mjs';
const modes = {
  'body-environment': {title:'One body & its environment', intro:'Change the starting temperature, thermal capacity or resistance to explore exponential warming and cooling.', second:false, ambient:true},
  'body-body': {title:'Two bodies, one equilibrium', intro:'An insulated pair exchanges heat until both bodies reach the same temperature. Change their properties to move the equilibrium.', second:true, ambient:false},
  'body-body-environment': {title:'Two bodies & their environment', intro:'Explore three heat-transfer paths and two coupled temperature curves, evaluated from the exact analytical solution.', second:true, ambient:true}
};
const requested = new URLSearchParams(location.search).get('scenario');
const scenario = Object.hasOwn(modes, requested) ? requested : 'body-environment';
const mode = modes[scenario];
const defaults = {t1:90,t2:20,env:25,m1:1,m2:2,c1:4180,c2:900,r1:.2,r2:.35,r12:.15,duration:3600};
let params={...defaults}, probeFraction=.25, current;
const $=id=>document.getElementById(id);
const fmt = n => new Intl.NumberFormat('en', {maximumFractionDigits:2}).format(n);
const seconds = n => n !== 0 && n < .01 ? n.toExponential(2) : fmt(n);
$('title').textContent=mode.title; document.title=`${mode.title} · Heat exchange`;
$('intro').textContent=mode.intro;
function field(key,label,unit,min,max,step='any') {
  return `<label class="field" for="${key}"><span>${label}<small>${unit}</small></span><input id="${key}" name="${key}" type="number" min="${min}" max="${max}" step="${step}" value="${params[key]}" required aria-label="${label} (${unit})"></label>`;
}
function bodyControls(i) {
  return `<fieldset class="body-${i}"><legend>Body ${i}</legend><div class="fields">`+
    field(`t${i}`,`Initial temperature ${i}`,'°C',-273.15,2000)+
    field(`m${i}`,`Mass ${i}`,'kg',.01,1000)+
    field(`c${i}`,`Specific heat ${i}`,'J/(kg·K)',1,10000)+`</div></fieldset>`;
}
$('body-controls').innerHTML=bodyControls(1)+(mode.second?bodyControls(2):'')+
  (mode.ambient?`<fieldset class="environment"><legend>Environment</legend><div class="fields">${field('env','Fixed temperature','°C',-273.15,2000)}</div></fieldset>`:'');
$('connection-controls').innerHTML=(mode.second?field('r12','Between bodies · R₁₂','K/W',.0001,10000):'')+
  (mode.ambient?field('r1',mode.second?'Body 1 ↔ environment · R₁₋ₑₙᵥ':'Thermal resistance · R','K/W',.0001,10000):'')+
  (mode.ambient&&mode.second?field('r2','Body 2 ↔ environment · R₂₋ₑₙᵥ','K/W',.0001,10000):'')+
  field('duration','Plot duration','s',.01,10000000);
const colors=['#c66b3e','#237e78'];
$('legend').innerHTML=`<span><i class="swatch" style="background:${colors[0]}"></i>Body 1</span>`+
 (mode.second?`<span><i class="swatch" style="background:${colors[1]}"></i>Body 2</span>`:'')+
 `<span><i class="swatch" style="border-top:2px dashed #827298"></i>${mode.ambient?'Environment':'Equilibrium'}</span>`;
const equations = {
 'body-environment': `<p>The exponential solution derived above, with thermal capacity C₁ = m₁c₁ and time constant τ = RC₁.</p><div class="equation">T₁(t) = Tₑₙᵥ + (T₁(0) − Tₑₙᵥ) exp(−t/τ)</div>`,
 'body-body': `<p>The isolated-pair solution derived above. Thermal capacities C₁ = m₁c₁ and C₂ = m₂c₂ determine the equilibrium.</p><div class="equation">Tₑq = (C₁T₁(0) + C₂T₂(0)) / (C₁ + C₂)\nγ = (1/C₁ + 1/C₂) / R₁₂\nTᵢ(t) = Tₑq + (Tᵢ(0) − Tₑq) exp(−γt)</div>`,
 'body-body-environment': `<p>The article develops an iterative update for this case. Here the same two linear differential equations are solved exactly using two exponential decay modes.</p><div class="equation">Cᵢ = mᵢcᵢ; g = 1/R₁₂; gᵢ = 1/Rᵢ₋ₑₙᵥ\na = (g + g₁)/C₁; b = g/C₁\nc = g/C₂; d = (g + g₂)/C₂\nA = [−a, b; c, −d]\nu(t) = exp(At) u(0)\nu = [T₁ − Tₑₙᵥ, T₂ − Tₑₙᵥ]ᵀ\nr± = (a + d ± √((a − d)² + 4bc))/2</div><p>The matrix exponential is evaluated from exp(−r₋t) and exp(−r₊t). Both temperatures approach the fixed environment temperature.</p>`
};
$('model').innerHTML=equations[scenario];
const L=58,TOP=22,BOTTOM=263;
let plotWidth=720,R=697;
let xMap,yMap;
const svgLine=(x1,y1,x2,y2,stroke,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" ${extra}/>`;
function draw() {
  plotWidth=Math.min(720,Math.max(460, $('chart').clientWidth));
  R=plotWidth-23;
  $('chart').setAttribute('viewBox',`0 0 ${plotWidth} 310`);
  current=solution(scenario,params);
  const initial=[params.t1,current.equilibrium,...(mode.second?[params.t2]:[])];
  const low=Math.min(...initial), high=Math.max(...initial), pad=Math.max(2,(high-low)*.1);
  const ymin=low-pad,ymax=high+pad;
  xMap=t=>L+(R-L)*t/params.duration;yMap=t=>BOTTOM-(BOTTOM-TOP)*(t-ymin)/(ymax-ymin);
  let grid='';
  for(let i=0;i<=4;i++) {
    const temp=ymin+(ymax-ymin)*i/4,y=yMap(temp),t=params.duration*i/4,x=xMap(t);
    grid+=svgLine(L,y,R,y,'#e0e6dc')+`<text x="${L-9}" y="${y+4}" text-anchor="end">${fmt(temp)}</text>`;
    grid+=`<text x="${x}" y="${BOTTOM+23}" text-anchor="${i===4?'end':i===0?'start':'middle'}">${seconds(t)}</text>`;
  }
  grid+=`<text x="${L}" y="13">Temperature (°C)</text><text x="${R}" y="306" text-anchor="end">Time (s)</text>`;
  $('grid').innerHTML=grid;
  // Extra logarithmic samples resolve rapid transients even on long time windows.
  const times=new Set([0,params.duration]);
  for(let i=1;i<361;i++)times.add(params.duration*i/360);
  for(let i=0;i<181;i++)times.add(params.duration*Math.pow(10,-14+14*i/180));
  const samples=[...times].sort((a,b)=>a-b).map(t=>[t,current.at(t)]);
  let curves=svgLine(L,yMap(current.equilibrium),R,yMap(current.equilibrium),'#827298','stroke-width="1.5" stroke-dasharray="6 5"');
  for(let i=0;i<(mode.second?2:1);i++) {
    const d=samples.map(([t,v],j)=>`${j?'L':'M'}${xMap(t).toFixed(3)},${yMap(v[i]).toFixed(3)}`).join(' ');
    curves+=`<path d="${d}" fill="none" stroke="${colors[i]}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  $('curves').innerHTML=curves;
  $('chart-desc').textContent=`${mode.title}. Initial temperatures: ${fmt(params.t1)} degrees Celsius${mode.second?` and ${fmt(params.t2)} degrees Celsius`:''}. Equilibrium: ${fmt(current.equilibrium)} degrees Celsius. Duration: ${seconds(params.duration)} seconds. Use the time slider for exact values.`;
  updateProbe();
}
function updateProbe() {
  const t=probeFraction*params.duration,values=current.at(t),x=xMap(t);
  $('time-value').textContent=`${seconds(t)} s`;
  $('time').setAttribute('aria-valuetext',`${seconds(t)} seconds; ${values.map((v,i)=>`body ${i+1}: ${fmt(v)} degrees Celsius`).join('; ')}`);
  $('readings').innerHTML=values.map((v,i)=>`<span>Body ${i+1} <b style="color:${colors[i]}">${fmt(v)} °C</b></span>`).join('')+`<span>${mode.ambient?'Environment':'Equilibrium'} <b>${fmt(current.equilibrium)} °C</b></span>`;
  $('probe').innerHTML=svgLine(x,TOP,x,BOTTOM,'#a2b4aa','stroke-dasharray="3 4"')+values.map((v,i)=>`<circle cx="${x}" cy="${yMap(v)}" r="5" fill="${colors[i]}" stroke="#fbfaf6" stroke-width="2"/>`).join('');
}
$('parameters').addEventListener('submit',e=>e.preventDefault());
$('parameters').addEventListener('input',()=>{
  const inputs=[...$('parameters').querySelectorAll('input')];
  for(const input of inputs)input.setAttribute('aria-invalid',String(!input.validity.valid || !Number.isFinite(input.valueAsNumber)));
  const invalid=inputs.find(i=>i.getAttribute('aria-invalid')==='true');
  $('status').classList.toggle('error',!!invalid);
  if(invalid) {
    $('status').textContent=`Enter ${invalid.previousElementSibling.firstChild.textContent} between ${invalid.min} and ${invalid.max}. The plot keeps the last valid settings.`;
    return;
  }
  for(const input of inputs)params[input.name]=input.valueAsNumber;
  $('status').textContent='Curves updated from the analytical solution.';
  draw();
});
$('time').addEventListener('input',e=>{probeFraction=Number(e.target.value)/1000;updateProbe();});
$('chart').addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  const bounds=$('chart').getBoundingClientRect();
  probeFraction=Math.max(0,Math.min(1,((e.clientX-bounds.left)*plotWidth/bounds.width-L)/(R-L)));
  $('time').value=Math.round(probeFraction*1000);updateProbe();
});
$('reset').addEventListener('click',()=>{
  params={...defaults};probeFraction=.25;$('time').value=250;
  $('parameters').querySelectorAll('input').forEach(i=>{i.value=params[i.name];i.removeAttribute('aria-invalid');});
  $('status').classList.remove('error');$('status').textContent='Default parameters restored.';draw();
});
draw();
window.addEventListener('resize',draw);
let resizeQueued=false;
function reportSize(){
  if(resizeQueued)return;resizeQueued=true;
  requestAnimationFrame(()=>{resizeQueued=false;window.parent.postMessage({type:'heat-scenario-resize',height:Math.ceil(document.querySelector('main').getBoundingClientRect().height)},location.origin);});
}
new ResizeObserver(reportSize).observe(document.querySelector('main'));reportSize();
