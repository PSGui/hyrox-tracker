const STORAGE_KEY = 'hyroxTrackerV1';

const foodDB = {
  'Maçã': {kcal:52,p:0.3,c:13.8,f:0.2},
  'Massa cozida': {kcal:150,p:5.2,c:30.0,f:1.1},
  'Arroz cozido': {kcal:130,p:2.7,c:28.2,f:0.3},
  'Peito de frango cozinhado': {kcal:165,p:31.0,c:0,f:3.6},
  'Atum ao natural escorrido': {kcal:116,p:26.0,c:0,f:1.0},
  'Feijão cozido': {kcal:127,p:8.7,c:22.8,f:0.5},
  'Ovo inteiro cozinhado/mexido': {kcal:138,p:11.9,c:1.1,f:9.5},
  'Azeite': {kcal:884,p:0,c:0,f:100},
  'Skyr natural': {kcal:63,p:11.0,c:4.0,f:0.2},
  'Queijo flamengo': {kcal:356,p:25.0,c:1.5,f:27.0},
  'Pão de mistura': {kcal:255,p:8.5,c:49.0,f:2.5},
  'Batata cozida': {kcal:87,p:1.9,c:20.1,f:0.1},
  'Aveia': {kcal:389,p:16.9,c:66.3,f:6.9}
};

const weeklyPlan = {
  0: {name:'Domingo', title:'Descanso', details:['Descanso total ou caminhada muito leve.', 'Priorizar sono e recuperação.']},
  1: {name:'Segunda', title:'Upper — força/hipertrofia', details:['Supino 4×5–8','Remada 4×6–10','Incline DB press 3×8–12','Pull-up/Lat pulldown 3×8–12','Elevação lateral 3×12–20','Bíceps 2–3×10–15','Tríceps 2–3×10–15']},
  2: {name:'Terça', title:'Corrida Zone 2', details:['45–60 min','RPE 3–4/10','Conseguir conversar em frases normais','Objetivo: base aeróbia, não velocidade']},
  3: {name:'Quarta', title:'Full Body + força HYROX', details:['Deadlift/RDL 3×5–8','Agachamento ou variante 3×6–10','Press 3×6–10','Remada/Pull-up 3×8–12','Lunges 2–3 séries','Core 3 séries']},
  4: {name:'Quinta', title:'Corrida de qualidade', details:['Alternar threshold e intervalos','Exemplo: 10 min aquecimento + 5×1 km + 2 min recuperação + 10 min retorno à calma','RPE dos blocos: 7–8/10']},
  5: {name:'Sexta', title:'HYROX + Upper', details:['800 m corrida','500 m SkiErg','800 m corrida','500 m remo','800 m corrida','Farmer carry','800 m corrida','Lunges','Upper acessório moderado']},
  6: {name:'Sábado', title:'Recuperação ativa', details:['20–40 min Z1 ou caminhada/bicicleta leve','Mobilidade','Sem treino pesado']}
};

function defaultState(){
  return {
    goals:{calories:2700,protein:165,carbs:340,fat:75},
    customFoods:{},
    foods:[
      {id:crypto.randomUUID(),date:'2026-09-14',meal:'Pequeno-almoço',name:'Maçã',grams:170,kcal:88.4,p:0.5,c:23.5,f:0.3},
      {id:crypto.randomUUID(),date:'2026-09-14',meal:'Almoço',name:'Massa cozida',grams:250,kcal:375,p:13,c:75,f:2.8},
      {id:crypto.randomUUID(),date:'2026-09-14',meal:'Almoço',name:'Atum ao natural escorrido',grams:62,kcal:71.9,p:16.1,c:0,f:0.6},
      {id:crypto.randomUUID(),date:'2026-09-14',meal:'Almoço',name:'Ovo inteiro cozinhado/mexido',grams:210,kcal:289.8,p:25,c:2.3,f:20},
      {id:crypto.randomUUID(),date:'2026-09-14',meal:'Almoço',name:'Azeite',grams:10,kcal:88.4,p:0,c:0,f:10}
    ],
    body:[{id:crypto.randomUUID(),date:'2026-09-14',weight:78.7,waist:null,chest:null,arm:null,thigh:null}],
    sets:[], cardio:[], workoutDone:{},
    createdAt:new Date().toISOString()
  }
}

function loadState(){
  try { const raw=localStorage.getItem(STORAGE_KEY); return raw?JSON.parse(raw):defaultState(); }
  catch(e){ return defaultState(); }
}
let state=loadState();
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); renderAll(); }
function todayISO(){ return new Date().toLocaleDateString('en-CA'); }
function fmtDate(d){ return new Date(d+'T12:00:00').toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric'}); }
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1600); }
function sumFoods(date){ return state.foods.filter(x=>x.date===date).reduce((a,x)=>({kcal:a.kcal+x.kcal,p:a.p+x.p,c:a.c+x.c,f:a.f+x.f}),{kcal:0,p:0,c:0,f:0}); }
function latestWeightOnOrBefore(date){ return state.body.filter(x=>x.weight && x.date<=date).sort((a,b)=>b.date.localeCompare(a.date))[0]?.weight ?? null; }
function avg7(date){ const sorted=state.body.filter(x=>x.weight && x.date<=date).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,7); if(!sorted.length) return null; return sorted.reduce((s,x)=>s+x.weight,0)/sorted.length; }
function dayPlan(date){ return weeklyPlan[new Date(date+'T12:00:00').getDay()]; }
function pct(v,g){ return clamp(Math.round((v/g)*100),0,100); }

function initDates(){ const d=todayISO(); ['dashboardDate','foodDate','bodyDate','trainingDate','cardioDate'].forEach(id=>{ const el=document.getElementById(id); if(!el.value) el.value=d; }); }

function populateFoods(){
  const sel=document.getElementById('foodSelect'); const current=sel.value;
  sel.innerHTML='';
  const all={...foodDB,...state.customFoods};
  Object.keys(all).sort((a,b)=>a.localeCompare(b,'pt')).forEach(name=>{ const o=document.createElement('option'); o.value=name; o.textContent=name; sel.appendChild(o); });
  if(current && all[current]) sel.value=current;
}

function renderDashboard(){
  const date=document.getElementById('dashboardDate').value || todayISO();
  const total=sumFoods(date), g=state.goals, plan=dayPlan(date), w=latestWeightOnOrBefore(date), a=avg7(date);
  document.getElementById('todayLabel').textContent=fmtDate(date);
  document.getElementById('dashCalories').textContent=`${Math.round(total.kcal)} / ${g.calories}`;
  document.getElementById('dashProtein').textContent=`${Math.round(total.p)} / ${g.protein} g`;
  document.getElementById('calorieProgress').style.width=pct(total.kcal,g.calories)+'%';
  document.getElementById('proteinProgress').style.width=pct(total.p,g.protein)+'%';
  document.getElementById('dashWeight').textContent=w?`${w.toFixed(1)} kg`:'—';
  document.getElementById('dashWeightAvg').textContent=`Média 7 dias: ${a?a.toFixed(1)+' kg':'—'}`;
  document.getElementById('dashWorkout').textContent=plan.title;
  document.getElementById('dashWorkoutStatus').textContent=state.workoutDone[date]?'Concluído':'Por concluir';
  document.getElementById('macroP').textContent=`${Math.round(total.p)} g`;
  document.getElementById('macroC').textContent=`${Math.round(total.c)} g`;
  document.getElementById('macroF').textContent=`${Math.round(total.f)} g`;
  document.getElementById('macroStatus').textContent=`${pct(total.kcal,g.calories)}% kcal`;
  document.getElementById('planDayName').textContent=plan.name;
  document.getElementById('todayPlan').innerHTML=`<div class="plan-block"><h4>${plan.title}</h4><ul>${plan.details.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
  renderWeightMiniChart('weightChart', state.body.filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date)).slice(-14));
}

function previewFood(){
  const name=document.getElementById('foodSelect').value, grams=Number(document.getElementById('foodGrams').value||0), item={...foodDB,...state.customFoods}[name];
  if(!item){document.getElementById('foodPreview').textContent='';return;}
  const k=grams/100;
  document.getElementById('foodPreview').textContent=`≈ ${Math.round(item.kcal*k)} kcal · P ${(item.p*k).toFixed(1)} g · HC ${(item.c*k).toFixed(1)} g · G ${(item.f*k).toFixed(1)} g`;
}
function renderFood(){
  const date=document.getElementById('foodDate').value || todayISO(), rows=state.foods.filter(x=>x.date===date), total=sumFoods(date);
  document.getElementById('foodDayTotal').textContent=`${Math.round(total.kcal)} kcal · ${Math.round(total.p)} g proteína`;
  const box=document.getElementById('foodLog');
  if(!rows.length){ box.innerHTML='<div class="empty">Sem alimentos registados.</div>'; return; }
  const mealOrder=['Pequeno-almoço','Almoço','Lanche','Jantar','Ceia'];
  box.innerHTML=mealOrder.map(meal=>{
    const mr=rows.filter(x=>x.meal===meal); if(!mr.length) return '';
    return `<div class="plan-block"><h4>${meal}</h4>${mr.map(x=>`<div class="list-row"><div class="list-main"><strong>${x.name} — ${Math.round(x.grams)} g</strong><small>${Math.round(x.kcal)} kcal · P ${x.p.toFixed(1)} · HC ${x.c.toFixed(1)} · G ${x.f.toFixed(1)}</small></div><div class="list-actions"><button class="icon-btn" onclick="deleteFood('${x.id}')">Apagar</button></div></div>`).join('')}</div>`;
  }).join('');
}
window.deleteFood=(id)=>{ state.foods=state.foods.filter(x=>x.id!==id); saveState(); toast('Alimento removido'); };

function renderBody(){
  const rows=[...state.body].sort((a,b)=>b.date.localeCompare(a.date));
  const box=document.getElementById('bodyHistory');
  box.innerHTML=rows.length?rows.map(x=>`<div class="list-row"><div class="list-main"><strong>${fmtDate(x.date)} — ${x.weight?x.weight.toFixed(1)+' kg':'sem peso'}</strong><small>${[['Cintura',x.waist],['Peito',x.chest],['Braço',x.arm],['Coxa',x.thigh]].filter(v=>v[1]).map(v=>v[0]+' '+v[1]+' cm').join(' · ') || 'Sem medidas'}</small></div><button class="icon-btn" onclick="deleteBody('${x.id}')">Apagar</button></div>`).join(''):'<div class="empty">Sem registos.</div>';
  const asc=[...state.body].filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date));
  renderWeightMiniChart('bodyChart',asc.slice(-30));
  const last=asc.at(-1)?.weight, prev=asc.at(-2)?.weight;
  document.getElementById('weightTrend').textContent=(last&&prev)?`${(last-prev)>=0?'+':''}${(last-prev).toFixed(1)} kg`:'—';
}
window.deleteBody=(id)=>{ state.body=state.body.filter(x=>x.id!==id); saveState(); };

function renderWeightMiniChart(id,rows){
  const el=document.getElementById(id); if(!rows.length){el.innerHTML='<div class="empty">Ainda sem dados suficientes.</div>';return;}
  const W=500,H=180,pad=24, vals=rows.map(x=>x.weight), min=Math.min(...vals)-.4,max=Math.max(...vals)+.4, range=max-min||1;
  const pts=rows.map((x,i)=>{ const px=pad+(i*(W-2*pad)/Math.max(1,rows.length-1)); const py=H-pad-((x.weight-min)/range)*(H-2*pad); return [px,py,x]; });
  const path=pts.map((p,i)=>`${i?'L':'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" class="chart-grid"/><line x1="${pad}" y1="${pad}" x2="${pad}" y2="${H-pad}" class="chart-grid"/><path d="${path}" class="chart-line"/>${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" class="chart-dot"/>`).join('')}<text x="${pad}" y="14" class="chart-label">${max.toFixed(1)} kg</text><text x="${pad}" y="${H-5}" class="chart-label">${min.toFixed(1)} kg</text></svg>`;
}

function renderTraining(){
  const date=document.getElementById('trainingDate').value||todayISO(), plan=dayPlan(date);
  document.getElementById('trainingPlanTitle').textContent=`${plan.name} — ${plan.title}`;
  document.getElementById('trainingPlan').innerHTML=`<div class="plan-block"><ul>${plan.details.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
  const done=!!state.workoutDone[date]; const btn=document.getElementById('markWorkoutDoneBtn'); btn.textContent=done?'Treino concluído ✓':'Marcar treino concluído';
  const rows=state.sets.filter(x=>x.date===date); const box=document.getElementById('setLog');
  box.innerHTML=rows.length?rows.map((x,i)=>`<div class="list-row"><div class="list-main"><strong>${x.exercise}</strong><small>${x.load||0} kg × ${x.reps||0} · RPE ${x.rpe||'—'}</small></div><button class="icon-btn" onclick="deleteSet('${x.id}')">Apagar</button></div>`).join(''):'<div class="empty">Sem séries registadas.</div>';
}
window.deleteSet=(id)=>{ state.sets=state.sets.filter(x=>x.id!==id); saveState(); };

function paceString(min,km){ if(!min||!km) return '—'; const sec=Math.round((min*60)/km), m=Math.floor(sec/60), s=String(sec%60).padStart(2,'0'); return `${m}:${s}/km`; }
function renderCardio(){
  const rows=[...state.cardio].sort((a,b)=>b.date.localeCompare(a.date)); const box=document.getElementById('cardioHistory');
  box.innerHTML=rows.length?rows.map(x=>`<div class="list-row"><div class="list-main"><strong>${fmtDate(x.date)} — ${x.type}</strong><small>${x.duration||0} min · ${x.distance||0} km · ${paceString(x.duration,x.distance)} · FC ${x.hr||'—'} · RPE ${x.rpe||'—'}${x.notes?' · '+x.notes:''}</small></div><button class="icon-btn" onclick="deleteCardio('${x.id}')">Apagar</button></div>`).join(''):'<div class="empty">Sem treinos cardio registados.</div>';
}
window.deleteCardio=(id)=>{ state.cardio=state.cardio.filter(x=>x.id!==id); saveState(); };

function renderGoals(){
  document.getElementById('goalCalories').value=state.goals.calories;
  document.getElementById('goalProtein').value=state.goals.protein;
  document.getElementById('goalCarbs').value=state.goals.carbs;
  document.getElementById('goalFat').value=state.goals.fat;
}

function renderAll(){ populateFoods(); previewFood(); renderDashboard(); renderFood(); renderBody(); renderTraining(); renderCardio(); renderGoals(); }

// Navigation
[...document.querySelectorAll('.bottom-nav button')].forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===btn.dataset.target));
  window.scrollTo({top:0,behavior:'smooth'});
}));

['dashboardDate','foodDate','trainingDate'].forEach(id=>document.getElementById(id).addEventListener('change',renderAll));
document.getElementById('foodSelect').addEventListener('change',previewFood);
document.getElementById('foodGrams').addEventListener('input',previewFood);

document.getElementById('addFoodBtn').addEventListener('click',()=>{
  const date=document.getElementById('foodDate').value, name=document.getElementById('foodSelect').value, grams=Number(document.getElementById('foodGrams').value), meal=document.getElementById('mealSelect').value, item={...foodDB,...state.customFoods}[name];
  if(!date||!item||!grams){toast('Preenche alimento e quantidade');return;}
  const k=grams/100; state.foods.push({id:crypto.randomUUID(),date,meal,name,grams,kcal:item.kcal*k,p:item.p*k,c:item.c*k,f:item.f*k}); saveState(); toast('Alimento adicionado');
});

document.getElementById('saveCustomFoodBtn').addEventListener('click',()=>{
  const name=document.getElementById('customFoodName').value.trim(); if(!name){toast('Indica o nome');return;}
  state.customFoods[name]={kcal:Number(document.getElementById('customFoodKcal').value)||0,p:Number(document.getElementById('customFoodP').value)||0,c:Number(document.getElementById('customFoodC').value)||0,f:Number(document.getElementById('customFoodF').value)||0}; saveState(); document.getElementById('foodSelect').value=name; previewFood(); toast('Alimento guardado');
});

document.getElementById('saveBodyBtn').addEventListener('click',()=>{
  const rec={id:crypto.randomUUID(),date:document.getElementById('bodyDate').value,weight:Number(document.getElementById('weightInput').value)||null,waist:Number(document.getElementById('waistInput').value)||null,chest:Number(document.getElementById('chestInput').value)||null,arm:Number(document.getElementById('armInput').value)||null,thigh:Number(document.getElementById('thighInput').value)||null};
  if(!rec.date||(!rec.weight&&!rec.waist&&!rec.chest&&!rec.arm&&!rec.thigh)){toast('Preenche pelo menos um valor');return;}
  state.body=state.body.filter(x=>x.date!==rec.date); state.body.push(rec); saveState(); toast('Registo guardado');
});

document.getElementById('markWorkoutDoneBtn').addEventListener('click',()=>{ const d=document.getElementById('trainingDate').value; state.workoutDone[d]=!state.workoutDone[d]; saveState(); });
document.getElementById('addSetBtn').addEventListener('click',()=>{
  const exercise=document.getElementById('exerciseInput').value.trim();
  if(!exercise){toast('Indica o exercício');return;}
  state.sets.push({id:crypto.randomUUID(),date:document.getElementById('trainingDate').value,exercise,load:Number(document.getElementById('loadInput').value)||0,reps:Number(document.getElementById('repsInput').value)||0,rpe:Number(document.getElementById('rpeInput').value)||null}); saveState(); toast('Série adicionada');
});

document.getElementById('saveCardioBtn').addEventListener('click',()=>{
  const rec={id:crypto.randomUUID(),date:document.getElementById('cardioDate').value,type:document.getElementById('cardioType').value,duration:Number(document.getElementById('durationInput').value)||0,distance:Number(document.getElementById('distanceInput').value)||0,hr:Number(document.getElementById('hrInput').value)||null,rpe:Number(document.getElementById('cardioRpeInput').value)||null,notes:document.getElementById('cardioNotes').value.trim()};
  if(!rec.date||!rec.duration){toast('Indica a duração');return;} state.cardio.push(rec); saveState(); toast('Cardio guardado');
});

document.getElementById('saveGoalsBtn').addEventListener('click',()=>{ state.goals={calories:Number(document.getElementById('goalCalories').value)||2700,protein:Number(document.getElementById('goalProtein').value)||165,carbs:Number(document.getElementById('goalCarbs').value)||340,fat:Number(document.getElementById('goalFat').value)||75}; saveState(); toast('Metas atualizadas'); });

function download(name,text,type){ const blob=new Blob([text],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
document.getElementById('exportJsonBtn').addEventListener('click',()=>download(`hyrox-backup-${todayISO()}.json`,JSON.stringify(state,null,2),'application/json'));
document.getElementById('exportCsvBtn').addEventListener('click',()=>{
  const food=['tipo,data,refeicao,nome,gramas,kcal,proteina,hidratos,gordura',...state.foods.map(x=>`alimentacao,${x.date},"${x.meal}","${x.name}",${x.grams},${x.kcal.toFixed(1)},${x.p.toFixed(1)},${x.c.toFixed(1)},${x.f.toFixed(1)}`)];
  const body=['tipo,data,peso,cintura,peito,braco,coxa',...state.body.map(x=>`corpo,${x.date},${x.weight??''},${x.waist??''},${x.chest??''},${x.arm??''},${x.thigh??''}`)];
  download(`hyrox-dados-${todayISO()}.csv`,food.join('\n')+'\n\n'+body.join('\n'),'text/csv;charset=utf-8');
});
document.getElementById('importJsonInput').addEventListener('change',e=>{ const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{ try{ state=JSON.parse(r.result); saveState(); toast('Backup importado'); }catch{toast('Ficheiro inválido');} }; r.readAsText(f); });
document.getElementById('resetDataBtn').addEventListener('click',()=>{ if(confirm('Apagar todos os dados locais desta aplicação?')){ state=defaultState(); saveState(); toast('Dados reiniciados'); } });

// PWA install
let deferredPrompt=null; const installBtn=document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferredPrompt=e; installBtn.classList.remove('hidden'); });
installBtn.addEventListener('click',async()=>{ if(!deferredPrompt)return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; installBtn.classList.add('hidden'); });
if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }

initDates(); renderAll();
