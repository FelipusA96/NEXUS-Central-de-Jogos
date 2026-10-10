/** NEXUS Sudoku — motor puro, sem DOM ou dependências.
 * Puzzle raiz de 17 pistas, solução única. Permutações preservam a unicidade.
 */
export const LEVELS = Object.freeze({
  facil: {name:'Fácil', givens:45, note:'45 pistas · início acolhedor'},
  medio: {name:'Médio', givens:38, note:'38 pistas · exige atenção'},
  dificil: {name:'Difícil', givens:31, note:'31 pistas · dedução avançada'},
  extremo: {name:'Extremo', givens:25, note:'25 pistas · desafio intenso'},
});
export const ROOT_PUZZLE='000000010400000000020000000000050407008000300001090000300400200050100000000806000';
export const ROOT_SOLUTION='693784512487512936125963874932651487568247391741398625319475268856129743274836159';

function hash(str){
  let h=2166136261;
  for(let i=0;i<str.length;i++){
    h=Math.imul(h^str.charCodeAt(i),16777619);
  }
  return h>>>0;
}
export function seededRandom(seed){
  let a=hash(String(seed));
  return ()=>{
    a|=0;
    a=a+0x6D2B79F5|0;
    let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296;
  };
}
function shuffle(items,rand){
  const a=[...items];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(rand()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function axisPermutation(rand){
  const groups=shuffle([0,1,2],rand);
  const result=[];
  for(const g of groups){
    for(const x of shuffle([0,1,2],rand)) result.push(g*3+x);
  }
  return result;
}
export function makePuzzle(level='medio',seed='nexus'){
  if(!LEVELS[level]) throw new Error('Dificuldade desconhecida.');
  const rand=seededRandom(`${seed}:${level}:sudoku-v1`);
  const digits=shuffle([1,2,3,4,5,6,7,8,9],rand);
  const rows=axisPermutation(rand);
  const cols=axisPermutation(rand);
  const transpose=rand()<.5;
  const solved=new Array(81);
  const roots=new Array(81);
  for(let r=0;r<9;r++) for(let c=0;c<9;c++){
    const source=transpose?cols[c]*9+rows[r]:rows[r]*9+cols[c];
    const j=r*9+c;
    solved[j]=digits[Number(ROOT_SOLUTION[source])-1];
    roots[j]=ROOT_PUZZLE[source]!=='0';
  }
  const givens=LEVELS[level].givens;
  const extras=shuffle(
    Array.from({length:81},(_,i)=>i).filter(i=>!roots[i]),rand
  );
  for(let i=0;i<givens-17;i++) roots[extras[i]]=true;
  const puzzle=solved.map((value,i)=>roots[i]?value:0);
  return {puzzle,solution:solved,level,givens,seed:String(seed)};
}
export function peerIndices(index){
  const r=Math.floor(index/9),c=index%9;
  const peers=new Set();
  for(let i=0;i<9;i++){
    peers.add(r*9+i);peers.add(i*9+c);
  }
  const r0=Math.floor(r/3)*3,c0=Math.floor(c/3)*3;
  for(let y=r0;y<r0+3;y++)for(let x=c0;x<c0+3;x++) peers.add(y*9+x);
  peers.delete(index);
  return [...peers];
}
export function conflicts(values){
  const bad=new Set();
  for(let i=0;i<81;i++){
    if(!values[i])continue;
    for(const j of peerIndices(i)){
      if(values[j]===values[i]){bad.add(i);bad.add(j);}
    }
  }
  return bad;
}
export function isSolved(values,solution){
  return values.length===81 && values.every((x,i)=>x===solution[i]);
}
export function candidates(values,index){
  if(values[index])return [];
  const used=new Set(peerIndices(index).map(i=>values[i]));
  return Array.from({length:9},(_,i)=>i+1).filter(n=>!used.has(n));
}
