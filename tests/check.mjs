const mem={}; globalThis.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v}};
globalThis.location={origin:'https://x.github.io',pathname:'/repo/'};
const R=new URL('../js/', import.meta.url).href;
const St=await import(R+'store.js'); const G=await import(R+'generators.js');
const IA=await import(R+'data/ia.js'); const {evaluatePrompt}=await import(R+'prompt-lab.js');
let err=0; const fail=(m)=>{err++;console.log('FAIL',m)};
// generators: run each 300 times, check self-consistency
for(const k of G._allKeys){for(let i=0;i<300;i++){const q=G.generate(k); if(!q.q||!q.e||!q.c||!q.m) fail(k+' fields');
 if(q.ch){ if(q.a<0||q.a>=q.ch.length) fail(k+' idx '+JSON.stringify(q)); if(new Set(q.ch).size!==q.ch.length) fail(k+' dup choices '+q.ch);}
 else { if(!St.isCorrect(q,q.a[0])) fail(k+' self '+JSON.stringify(q)); if(/NaN|undefined|Infinity/.test(q.q+q.a+q.e)) fail(k+' nan '+q.q+q.a);} }}
// banks
const ids=new Set();
for(const lv of Object.keys(St.LEVELS)){const D=St.LEVELS[lv].data; const subs=new Set(D.SUBJECTS.map(s=>s.key));
 for(const q of [...D.QUESTIONS,...IA.IA_QUESTIONS[IA.TIER_BY_LEVEL[lv]]]){ if(ids.has(q.id)) fail('dup id '+q.id); ids.add(q.id);
  if(!subs.has(q.m)) fail('bad subject '+q.id); if(q.ch){ if(typeof q.a!=='number'||q.a>=q.ch.length) fail('idx '+q.id);} else if(!Array.isArray(q.a)) fail('ans '+q.id);
  if(!q.ch && !St.isCorrect(q,q.a[0])) fail('self '+q.id);}
 console.log(lv, D.QUESTIONS.length,'questions banque +', G.GENERATORS_BY_LEVEL[lv].length,'générateurs');}
for(const t of ['junior','ado','lycee']) for(const d of IA.DETECTIVE[t]) if(d.bad>=d.lines.length) fail('det');
// answer normalization
const qa={a:['étions']}; if(!St.isCorrect(qa,'Etions ')) fail('accent'); if(!St.isCorrect({a:['1,2']},'1.2')) fail('dec'); if(!St.isCorrect({a:['-3']},'−3')) fail('minus'); if(St.isCorrect({a:['42']},'4')) fail('num false');
if(!St.isCorrect({a:['fit','il fit']},'Il fit')) fail('il');
// simulate kid usage
const k=St.newKid('Test','3e','🦊'); St.S.kids.push(k);
for(let s=0;s<5;s++){const list=St.buildSession(k,{n:10}); if(list.length!==10) fail('session len '+list.length);
 let ok=0; list.forEach((q,i)=>{const good=Math.random()<0.6; const ans=q.ch?(good?q.a:(q.a+1)%q.ch.length):(good?q.a[0]:'zzz'); const c=St.isCorrect(q,ans); if(c!==good) fail('check '+q.id); if(c)ok++; St.recordAnswer(k,q,c,20000,i);});
 St.endSession(k,{mode:'train',n:10,ok,ms:200000,xp:0});}
for(const sub of St.subjects(k).map(s=>s.key)){const l=St.buildSession(k,{subject:sub,n:10}); if(!l.length) fail('sub '+sub); if(l.some(q=>q.m!==sub)) fail('sub mismatch '+sub);}
const rv=St.buildSession(k,{mode:'review',n:10}); console.log('review len',rv.length,'due',St.dueCount(k),'weak',St.weakChapters(k).length);
// prompt eval
for(const t of ['junior','ado','lycee']) IA.PROMPT_CHALLENGES[t].forEach((c,i)=>{const r=evaluatePrompt(c.example,t); if(r.stars<5) console.log('example not 5*',t,i,r.criteria.filter(x=>!x.ok).map(x=>x.id));});
console.log(err?`${err} ERREURS`:'TOUT OK'); process.exit(err?1:0);
