/* Deep Cut prompt bank: loads and parses the plain-text files in prompts/.
   Shared by index.html (the game) and bank.html (the bank checker).

   FILE FORMAT (see prompts/README.md for the friendly version)
     // comment                     ignored
     ## Movies                      sets the category for the prompts below it
     # Name a Pixar movie           starts a new prompt
     Toy Story                      answers, one per line, MOST common first
     Monsters, Inc. | monsters inc  "|" separates extra spellings that also count
     *Luca                          a leading * marks the Mother Lode (optional)
     # Name a Friends character {names}
                                    {names}: a first or last name on its own also counts
*/
const BANK_DIR = "prompts/";
const MIN_ANSWERS = 5;

function fnv(s){ let h = 2166136261; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h>>>0; }
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function norm(s){
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/&/g," and ").replace(/\+/g,"plus").replace(/#/g,"sharp").replace(/['’]/g,"")
    .replace(/[^a-z0-9]+/g," ").trim().replace(/^(the|a|an) /,"").replace(/ /g,"");
}
function lev(a,b,max){
  if(Math.abs(a.length-b.length)>max) return max+1;
  // optimal string alignment distance: swapped neighbours count as one typo
  let pp=null, prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const cur=[i]; let best=i;
    for(let j=1;j<=b.length;j++){
      cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
      if(pp && i>1 && j>1 && a[i-1]===b[j-2] && a[i-2]===b[j-1]) cur[j]=Math.min(cur[j],pp[j-2]+1);
      if(cur[j]<best) best=cur[j];
    }
    if(best>max) return max+1;
    pp=prev; prev=cur;
  }
  return prev[b.length];
}

/* Turn one file's text into prompts. Problems go into `issues` instead of stopping the load. */
function parseBankText(text, file){
  const prompts = [], issues = [];
  let cat = "General", cur = null;
  const lines = text.split(/\r?\n/);
  const close = () => { if(cur){ const p = finishPrompt(cur, issues); if(p) prompts.push(p); } cur = null; };
  lines.forEach((raw, idx) => {
    const line = raw.trim(), n = idx+1;
    if(!line || line.startsWith("//")) return;
    if(line.startsWith("##")){ close(); cat = line.replace(/^##\s*/,"") || "General"; return; }
    if(line.startsWith("#")){
      close();
      let q = line.replace(/^#\s*/,""); const flags = new Set();
      q = q.replace(/\{([^}]*)\}\s*$/, (_,f)=>{ f.split(/[\s,]+/).filter(Boolean).forEach(x=>flags.add(x.toLowerCase())); return ""; }).trim();
      cur = {q, cat, file, line:n, flags, raw:[]};
      return;
    }
    if(!cur){ issues.push({file, line:n, level:"error", msg:`Answer "${line}" has no prompt above it. Add a line starting with # first.`}); return; }
    cur.raw.push({text:line, line:n});
  });
  close();
  return {prompts, issues};
}

function finishPrompt(c, issues){
  const where = {file:c.file, line:c.line, q:c.q};
  if(!c.q){ issues.push({...where, level:"error", msg:"A # line has no prompt text."}); return null; }
  const seen = new Map(), answers = [];
  c.raw.forEach(r=>{
    const gem = r.text.startsWith("*");
    const names = r.text.replace(/^\*\s*/,"").split("|").map(s=>s.trim()).filter(Boolean);
    if(!names.length) return;
    const keys = new Set(names.map(norm).filter(Boolean));
    // free extra spellings: "Title (2019)" also matches "Title"; "Franchise: Subtitle" also matches "Subtitle"
    names.forEach(nm=>{
      const noParen = nm.replace(/\s*\([^)]*\)\s*/g," ").trim(); if(noParen && noParen!==nm) keys.add(norm(noParen));
      const m = nm.match(/^[^:]+:\s*(.+)$/); if(m && norm(m[1]).length>=6) keys.add(norm(m[1]));
    });
    const a = {name:names[0], keys:[...keys].filter(Boolean), gem, line:r.line};
    const dupe = a.keys.find(k=>seen.has(k));
    if(dupe && norm(a.name)===dupe){ issues.push({...where, level:"warn", msg:`"${a.name}" is listed twice (line ${seen.get(dupe).line} and line ${r.line}). The second one is ignored.`}); return; }
    a.keys.forEach(k=>{ if(!seen.has(k)) seen.set(k,a); });
    answers.push(a);
  });
  // {names}: each first or last name counts on its own when no other answer shares it
  if(c.flags.has("names")){
    const count = new Map();
    const parts = a => { const w = a.name.replace(/\s*\([^)]*\)/g,"").split(/\s+/).filter(Boolean); return w.length>1 ? [...new Set([w[0], w[w.length-1]])].map(norm).filter(x=>x.length>=3) : []; };
    answers.forEach(a=>parts(a).forEach(p=>count.set(p,(count.get(p)||0)+1)));
    answers.forEach(a=>parts(a).forEach(p=>{ if(count.get(p)===1 && !seen.has(p)){ a.keys.push(p); seen.set(p,a); } }));
  }
  if(answers.length < MIN_ANSWERS){ issues.push({...where, level:"error", msg:`Only ${answers.length} answer${answers.length===1?"":"s"}. A prompt needs at least ${MIN_ANSWERS}, so it's left out of the game.`}); return null; }
  const gems = answers.filter(a=>a.gem);
  if(gems.length>1){ issues.push({...where, level:"warn", msg:`${gems.length} answers are marked with *. Only the first ("${gems[0].name}") is the Mother Lode.`}); gems.slice(1).forEach(g=>g.gem=false); }
  let autoGem = false;
  if(!gems.length){ answers[Math.min(answers.length-1, Math.floor(answers.length*0.7))].gem = true; autoGem = true; }
  // popularity: earlier lines are more common; a little seeded wobble so shares don't look mechanical
  const rnd = mulberry32(fnv(c.q));
  answers.forEach((a,i)=>{ a.rank=i; a.w = (1/Math.pow(i+2,1.3))*(0.7+rnd()*0.6); });
  const tot = answers.reduce((s,a)=>s+a.w,0); answers.forEach(a=>a.share=a.w/tot);
  const sorted = [...answers].sort((a,b)=>b.w-a.w);
  return {q:c.q, cat:c.cat, file:c.file, line:c.line, id:fnv(c.q.toLowerCase()), answers:sorted, autoGem};
}

async function fetchText(path){
  const r = await fetch(path, {cache:"no-cache"});
  if(!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.text();
}

/* Load every file listed in prompts/_files.txt. Resolves to {prompts, issues, files}. */
async function loadBank(){
  const list = (await fetchText(BANK_DIR+"_files.txt")).split(/\r?\n/).map(s=>s.trim()).filter(s=>s && !s.startsWith("//"));
  const texts = await Promise.all(list.map(f=>fetchText(BANK_DIR+f).then(t=>({f,t}), e=>({f,err:e}))));
  const prompts = [], issues = [], byQ = new Map();
  texts.forEach(({f,t,err})=>{
    if(err){ issues.push({file:f, line:0, level:"error", msg:`Couldn't load this file (${err.message}). Check the name in _files.txt.`}); return; }
    const r = parseBankText(t, f);
    issues.push(...r.issues);
    r.prompts.forEach(p=>{
      const k = norm(p.q);
      if(byQ.has(k)){ const o = byQ.get(k); issues.push({file:f, line:p.line, q:p.q, level:"warn", msg:`Same prompt as ${o.file} line ${o.line}. This copy is left out.`}); return; }
      byQ.set(k,p); prompts.push(p);
    });
  });
  return {prompts, issues, files:list};
}

function matchAnswer(p, input){
  const k = norm(input); if(!k) return null;
  const variants = [k]; if(k.length>3 && k.endsWith("s")) variants.push(k.slice(0,-1));
  for(const a of p.answers) for(const key of a.keys) if(variants.includes(key) || variants.includes(key.replace(/s$/,""))) return a;
  let best=null, bd=9;
  for(const a of p.answers) for(const key of a.keys){
    if(key.length<5) continue;
    const max = key.length>=9 ? 2 : 1;
    const d = lev(k,key,max);
    if(d<=max && d<bd){bd=d;best=a;}
  }
  return best;
}
