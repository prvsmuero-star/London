(function(g){
const stages=['vocab','sentence','arrange','quiz','comprehension'];
const legacy={book:'Not All Londoners Wear Hats',title:'Just Like a Londoner',number:1,id:'legacy',keys:{}};
function keys(kind,n){return Array.from({length:n},(_,i)=>kind+':'+i)}
function expected(v,s,q,c){return {vocab:[...keys('word',v),...keys('meaning',v),...keys('reverse',v)],sentence:keys('sentence',s),arrange:keys('arrange',s),quiz:keys('quiz',q),comprehension:keys('comprehension',c)}}
legacy.keys=expected(50,30,50,20);
function validate(o){const fail=m=>{throw Error(m)};const str=(x,n=1000)=>typeof x==='string'&&x.trim()&&x.length<=n;const arr=(x,min,max)=>Array.isArray(x)&&x.length>=min&&x.length<=max;const pair=x=>Array.isArray(x)&&x.length===2&&x.every(v=>str(v,300));const unique=x=>new Set(x).size===x.length;
if(!o||!str(o.book,100)||!str(o.title,100)||!Number.isInteger(o.number)||o.number<1||o.number>999)fail('교재명, 챕터 제목, 번호를 확인하세요.');
if(!arr(o.vocabulary,5,50)||!o.vocabulary.every(pair)||!unique(o.vocabulary.map(v=>v[0].toLowerCase()))||!unique(o.vocabulary.map(v=>v[1])))fail('단어 5~50개, 서로 다른 영어와 한글 뜻이 필요합니다.');
if(!arr(o.sentences,2,100)||!o.sentences.every(x=>str(x)&&/[a-zA-Z]/.test(x))||!Array.isArray(o.translations)||o.translations.length!==o.sentences.length||!o.translations.every(x=>str(x)))fail('문장 2~100개와 같은 수의 해석이 필요합니다.');
const choices=(a,n)=>Array.isArray(a)&&a.length===n&&a.every(pair)&&unique(a.map(x=>x[0]));
if(!arr(o.quizzes,1,100)||!o.quizzes.every(q=>Array.isArray(q)&&q.length===6&&[q[0],q[1],q[3],q[4],q[5]].every(x=>str(x))&&q[0].includes('___')&&choices(q[2],5)&&q[2].some(x=>x[0]===q[1])&&q[2].every(x=>o.vocabulary.some(v=>v[0]===x[0]&&v[1]===x[1]))&&o.sentences.includes(q[4])))fail('빈칸 문제 1~100개: 빈칸 ___, 단어 목록에서 가져온 보기 5개, 원문 문장과 해석이 필요합니다.');
if(!arr(o.comprehension,1,100)||!o.comprehension.every(q=>Array.isArray(q)&&q.length===5&&[q[0],q[1],q[2],q[4]].every(x=>str(x))&&choices(q[3],4)&&q[3][0][0]===q[4]))fail('독해 문제 1~100개: 보기 4개, 첫 번째 보기는 정답과 동일해야 합니다.');
const data={book:o.book.trim(),title:o.title.trim(),number:o.number,vocabulary:o.vocabulary,sentences:o.sentences,translations:o.translations,quizzes:o.quizzes,comprehension:o.comprehension};const payload=JSON.stringify(data);if(new TextEncoder().encode(payload).length>350000)fail('학습 자료 용량이 너무 큽니다.');return {book:data.book,title:data.title,number:data.number,payload,keys:expected(data.vocabulary.length,data.sentences.length,data.quizzes.length,data.comprehension.length)};}
function maxima(c){return Object.fromEntries(stages.map(k=>[k,c.keys[k].length*(k==='vocab'?2:5)]))}
function scores(d,c){const earned=new Set(d?.earned||[]);return Object.fromEntries(stages.map(k=>[k,c.keys[k].filter(x=>earned.has(x)).length*(k==='vocab'?2:5)]))}
function total(d,c){return Object.values(scores(d,c)).reduce((a,b)=>a+b,0)}
function ref(D,db,uid,id){return id==='legacy'?D.doc(db,'learning',uid):D.doc(db,'chapterLearning',id,'students',uid)}
function label(c){return c.book+' · Chapter '+c.number+' · '+c.title}
async function catalog(D,db){const snap=await D.getDocsFromServer(D.collection(db,'contents'));return [legacy,...snap.docs.map(x=>({id:x.id,...x.data()})).sort((a,b)=>a.book.localeCompare(b.book)||a.number-b.number)]}
g.LondonContent={stages,legacy,validate,maxima,scores,total,ref,label,catalog};
})(globalThis);