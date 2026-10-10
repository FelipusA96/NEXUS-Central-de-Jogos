/** NEXUS Memória — motor puro: embaralhamento reprodutível no desafio diário. */
export const LEVELS = Object.freeze({
  facil: Object.freeze({name:'Fácil',columns:3,rows:4,pairs:6}),
  medio: Object.freeze({name:'Médio',columns:4,rows:4,pairs:8}),
  dificil: Object.freeze({name:'Difícil',columns:4,rows:5,pairs:10}),
  extremo: Object.freeze({name:'Extremo',columns:4,rows:6,pairs:12}),
});
export const ICONS = Object.freeze([
  {symbol:'🚀',name:'Foguete'}, {symbol:'🪐',name:'Planeta'},
  {symbol:'🤖',name:'Robô'}, {symbol:'⚡',name:'Raio'},
  {symbol:'💎',name:'Cristal'}, {symbol:'🛸',name:'Disco voador'},
  {symbol:'🧬',name:'DNA'}, {symbol:'🌌',name:'Galáxia'},
  {symbol:'🎮',name:'Controle'}, {symbol:'🔮',name:'Orbe'},
  {symbol:'🧿',name:'Amuleto'}, {symbol:'🛰️',name:'Satélite'}
]);
export function seededRandom(seed){
  let h=2166136261;
  const value=String(seed);
  for(let i=0;i<value.length;i++)h=Math.imul(h^value.charCodeAt(i),16777619);
  let a=h>>>0;
  return ()=>{
    a=(a+0x6D2B79F5)|0;
    let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
function shuffle(items,rand){
  const arr=[...items];
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(rand()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}
export function makeDeck(level='medio',seed='treino'){
  const def=LEVELS[level];
  if(!def)throw new Error('Dificuldade inválida.');
  const rand=seededRandom(`nexus-memory-v1:${level}:${seed}`);
  const icons=shuffle(ICONS,rand).slice(0,def.pairs);
  const cards=shuffle(icons.flatMap((item,index)=>[
    {id:`${index}-0`,pair:index,symbol:item.symbol,name:item.name},
    {id:`${index}-1`,pair:index,symbol:item.symbol,name:item.name}
  ]),rand);
  return {cards,level,pairs:def.pairs,cols:def.columns,rows:def.rows,seed:String(seed)};
}
export function resolvePair(cards,i,j){
  return i!==j && cards[i]?.pair===cards[j]?.pair;
}
/** Dia civil de Brasília, independente do fuso local do visitante. */
export function brazilDay(date=new Date()){
  const formatter=new Intl.DateTimeFormat('en-US',{
    timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'
  });
  const parts=Object.fromEntries(formatter.formatToParts(date).map(p=>[p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
/** Tentativas têm prioridade absoluta; tempo desempata. */
export function rankingOrder(attempts,timeMs){
  if(!Number.isInteger(attempts)||attempts<1||attempts>10000||!Number.isInteger(timeMs)||timeMs<1||timeMs>86400000)throw Error('Resultado fora da faixa.');
  return attempts*100000000+timeMs;
}
