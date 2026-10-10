/** Paciência Spider — motor sem dependências do navegador.
 * 104 cartas, 10 colunas, cinco distribuições de 10 cartas.
 * Permite mover sequências descendentes do mesmo naipe;
 * uma sequência completa K→A do mesmo naipe é removida.
 */
export const LEVELS = Object.freeze({
  facil:{name:'Fácil',suits:['♠'],hint:true,description:'1 naipe · sugestões de movimentos'},
  medio:{name:'Médio',suits:['♠'],hint:false,description:'1 naipe · clássico'},
  dificil:{name:'Difícil',suits:['♠','♥'],hint:false,description:'2 naipes · estratégia'},
  extremo:{name:'Extremo',suits:['♠','♥','♦','♣'],hint:false,description:'4 naipes · especialista'}
});

export function brazilDay(date=new Date()){
  const parts = new Intl.DateTimeFormat('en-US',{
    timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(date);
  const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function seededRandom(seed){
  let h=2166136261;
  for(const ch of String(seed))h=Math.imul(h^ch.charCodeAt(0),16777619);
  let a=h>>>0;
  return ()=>{
    a=(a+0x6D2B79F5)|0;
    let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
function shuffle(array,random){
  for(let i=array.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}
export function makeGame(level='medio',seed='livre'){
  const conf=LEVELS[level];
  if(!conf)throw Error('Dificuldade inválida.');
  const random=seededRandom(`nexus-spider-v1:${level}:${seed}`);
  const deck=[];
  // Um naipe: 8 conjuntos de 13; dois naipes: 4 de cada; quatro: 2 de cada.
  for(let copy=0;copy<8/conf.suits.length;copy++){
    for(const suit of conf.suits){
      for(let rank=1;rank<=13;rank++){
        deck.push({id:`${suit}-${rank}-${copy}`,suit,rank,faceUp:false});
      }
    }
  }
  shuffle(deck,random);
  const columns=Array.from({length:10},()=>[]);
  for(let c=0;c<10;c++){
    const n=c<4?6:5;
    for(let i=0;i<n;i++){
      const card=deck.pop();
      card.faceUp=(i===n-1);
      columns[c].push(card);
    }
  }
  return {level,seed:String(seed),columns,stock:deck,completed:[],moves:0};
}
export function cloneGame(state){return structuredClone(state);}
export function canSelect(state,col,index){
  const stack=state.columns[col];
  if(!stack||index<0||index>=stack.length)return false;
  for(let i=index;i<stack.length;i++){
    if(!stack[i].faceUp)return false;
    if(i>index){
      const prior=stack[i-1],card=stack[i];
      if(prior.suit!==card.suit||prior.rank!==card.rank+1)return false;
    }
  }
  return true;
}
export function canMove(state,from,index,to){
  if(from===to||!canSelect(state,from,index))return false;
  const dest=state.columns[to];
  if(!dest)return false;
  if(!dest.length)return true;
  return dest[dest.length-1].faceUp &&
    dest[dest.length-1].rank===state.columns[from][index].rank+1;
}
function expose(state,col){
  const stack=state.columns[col];
  if(stack.length)stack[stack.length-1].faceUp=true;
}
export function collectRuns(state){
  const removed=[];
  // Também coleta grupos consecutivos revelados após uma remoção.
  let changed=true;
  while(changed){
    changed=false;
    for(let col=0;col<10;col++){
      const stack=state.columns[col];
      if(stack.length<13)continue;
      const run=stack.slice(-13);
      const suit=run[0].suit;
      const valid=run.every((card,i)=>card.faceUp&&card.suit===suit&&card.rank===13-i);
      if(!valid)continue;
      removed.push({suit,cards:stack.splice(-13)});
      state.completed.push(suit);
      expose(state,col);
      changed=true;
    }
  }
  return removed;
}
export function move(state,from,index,to){
  if(!canMove(state,from,index,to))return false;
  const cards=state.columns[from].splice(index);
  state.columns[to].push(...cards);
  expose(state,from);
  state.moves++;
  collectRuns(state);
  return true;
}
export function canDeal(state){
  return state.stock.length>=10 && state.columns.every(x=>x.length>0);
}
export function deal(state){
  if(!canDeal(state))return false;
  for(let col=0;col<10;col++){
    const card=state.stock.pop();
    card.faceUp=true;
    state.columns[col].push(card);
  }
  state.moves++;
  collectRuns(state);
  return true;
}
export function validMoves(state){
  const moves=[];
  for(let from=0;from<10;from++){
    for(let at=0;at<state.columns[from].length;at++){
      if(!canSelect(state,from,at))continue;
      for(let to=0;to<10;to++){
        if(!canMove(state,from,at,to))continue;
        const src=state.columns[from][at];
        const tgt=state.columns[to].at(-1);
        moves.push({from,at,to,score:(tgt&&src.suit===tgt.suit?4:0)+(at===0?2:0)+(tgt?1:0)});
      }
    }
  }
  return moves.sort((a,b)=>b.score-a.score);
}
export function isWon(state){return state.completed.length===8;}
export function rankLabel(n){return ({1:'A',11:'J',12:'Q',13:'K'})[n]||String(n);}
export function rankingOrder(moves,timeMs){
  if(!Number.isInteger(moves)||moves<1||moves>10000||!Number.isInteger(timeMs)||timeMs<1||timeMs>86400000)throw Error('Resultado fora da faixa.');
  return moves*100000000+timeMs;
}
