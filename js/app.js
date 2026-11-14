(function(){
var app=document.getElementById('app'),CFG,BANK={},S={},tick=null;
function $(s){return document.querySelector(s)}
function esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function get(u){if(window.JLPT_DATA&&JLPT_DATA[u])return Promise.resolve(JLPT_DATA[u]);return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()})}
function load(files){return Promise.all(files.map(function(f){return BANK[f]?BANK[f]:get('data/'+f).then(function(d){return BANK[f]=d})})).then(function(r){return [].concat.apply([],r)})}
function show(h){app.innerHTML=h;window.scrollTo(0,0)}
function btn(t,a,c){return '<button class="b '+(c||'')+'" data-a="'+a+'">'+t+'</button>'}
function hist(){try{return JSON.parse(localStorage.getItem('jlpt_h')||'[]')}catch(e){return []}}
function fmt(q){var t=esc(q.question);if(q.underlined){var u=esc(q.underlined);t=t.replace(u,'<u>'+u+'</u>')}return t}
function build(sec,all,only){var out=[];sec.m.forEach(function(m){if(only&&m[0]!==only)return;
 shuffle(all.filter(function(q){return q.mondai===m[0]})).slice(0,m[1]).forEach(function(q){out.push({q:q,m:m,o:shuffle([0,1,2,3])})})});return out}
function start(lv,plan,only,full){S={lv:lv,plan:plan,only:only,full:!!full,i:0,done:[]};run()}
function run(){var p=S.plan[S.i];if(p.items)return quiz(p.items,p.sec);
 load(p.sec.files).then(function(all){var it=build(p.sec,all,S.only);if(!it.length){alert('Belum ada soal untuk bagian ini.');return A.home()}quiz(it,p.sec)})
 .catch(function(){show('<p class="err">Gagal memuat soal. Buka lewat GitHub Pages atau server, bukan file langsung.</p>'+btn('Kembali','home'))})}
function quiz(items,sec){S.items=items;S.sec=sec;var pm=0,h='<div class="bar"><b>'+esc(sec.name)+'</b><span id="t"></span><button class="x" data-a="exit">✕</button></div>';
 items.forEach(function(it,i){var q=it.q;
  if(it.m[0]!==pm){pm=it.m[0];var T=CFG.types[it.m[2]];h+='<h3>問題'+pm+'　'+T[0]+'</h3><p class="ins">'+T[1]+'</p>'}
  h+='<div class="q"><div class="n">'+(i+1)+'</div>'+(q.passage?'<p class="ps">'+esc(q.passage)+'</p>':'')+'<p class="qt">'+fmt(q)+'</p>';
  it.o.forEach(function(oi,k){h+='<label class="op"><input type="radio" name="q'+i+'" value="'+oi+'"><span>'+(k+1)+'. '+esc(q.options[oi])+'</span></label>'});
  h+='</div>'});
 show(h+btn('Selesai','submit','pri'));clearInterval(tick);
 var min=S.only?0:(sec.min||0);if(min){var end=Date.now()+min*6e4,el=$('#t');
  var tk=function(){var r=Math.max(0,Math.round((end-Date.now())/1000));el.textContent=Math.floor(r/60)+':'+('0'+r%60).slice(-2);if(r<=0)finish()};tk();tick=setInterval(tk,500)}}
function finish(){clearInterval(tick);if(!S.items)return;
 var ch=S.items.map(function(it,i){var c=document.querySelector('input[name=q'+i+']:checked');return c?+c.value:null});
 S.done.push({sec:S.sec,items:S.items,ch:ch});S.items=null;S.i++;if(S.i<S.plan.length)run();else result()}
function result(){var tot=0,ok=0,bad=[],h='<h2>Hasil '+S.lv+'</h2>',rev='';
 S.done.forEach(function(d){var c=0;d.items.forEach(function(it,i){var q=it.q,r=d.ch[i]===q.answer;if(r)c++;else bad.push({q:q,m:it.m,o:shuffle([0,1,2,3])});
  rev+='<div class="rv '+(r?'ok':'ng')+'"><div class="n">問題'+it.m[0]+' No.'+(i+1)+' '+(r?'✓ Benar':'✗ Salah')+'</div>'+(q.passage?'<p class="ps">'+esc(q.passage)+'</p>':'')+'<p class="qt">'+fmt(q)+'</p>'
  +'<div>Jawabanmu: '+(d.ch[i]==null?'(kosong)':esc(q.options[d.ch[i]]))+'</div><div>Benar: <b>'+esc(q.options[q.answer])+'</b></div><small>'+esc(q.explanation)+'</small></div>'});
  h+='<p><b>'+esc(d.sec.name)+'</b>: '+c+' / '+d.items.length+' ('+Math.round(c/d.items.length*100)+'%)</p>';tot+=d.items.length;ok+=c});
 var pct=Math.round(ok/tot*100),L=CFG.levels[S.lv];h+='<div class="sc">'+pct+'%</div>';
 if(S.full){var est=Math.round(ok/tot*120);h+='<p>Perkiraan kelompok 1 (言語知識・読解): <b>'+est+' / 120</b>. Batas minimum '+L.min1+': <b>'+(est>=L.min1?'terpenuhi':'belum terpenuhi')+'</b>.</p><small>Perkiraan, bukan skor resmi. Total dan status lulus ('+L.pass+' dari 180) menunggu bagian 聴解.</small>'}
 S.bad=bad;try{var H=hist();H.unshift({d:new Date().toISOString().slice(0,10),lv:S.lv,p:pct,n:tot});localStorage.setItem('jlpt_h',JSON.stringify(H.slice(0,20)))}catch(e){}
 if(bad.length)h+=btn('Latih ulang soal yang salah ('+bad.length+')','retry','pri');
 show(h+btn('Beranda','home')+'<h3>Pembahasan</h3>'+rev+btn('Beranda','home'))}

var K={items:[],pool:[],i:0,shown:false,mode:'card',score:0,questions:[],answers:[],readingOpts:null,meaningOpts:null,selectedReading:null,selectedMeaning:null,currentId:null,level:'Semua'};
function kanjiHome(){var c={'Nyumon':0,'Shokyu 1':0,'Shokyu 2':0};K.items.forEach(function(x){c[x.level]=(c[x.level]||0)+1});
var h='<section class="k-hero"><div class="k-eyebrow">IRODORI · JFT-BASIC</div><h1>Kanji & Kosakata</h1><p>Latih ingatan membaca dan memahami kosakata Jepang secara bertahap.</p><div class="k-total"><strong>'+K.items.length+'</strong><span>kosakata tersedia</span></div></section><div class="k-section-title"><h3>Pilih materi</h3><span>Materi belajar</span></div><div class="k-levels">';
h+='<button class="k-level '+(K.level==='Semua'?'active':'')+'" data-a="klevel|Semua"><span>Semua tingkat</span><strong>'+K.items.length+'</strong></button>';
Object.keys(c).forEach(function(x){h+='<button class="k-level '+(K.level===x?'active':'')+'" data-a="klevel|'+x+'"><span>'+x+'</span><strong>'+c[x]+'</strong></button>'});
h+='</div><div class="k-section-title"><h3>Mulai belajar</h3><span>'+(K.level==='Semua'?'Semua materi':K.level)+'</span></div><div class="k-modes"><button class="k-mode" data-a="kstart|card"><span class="k-mode-icon">あ</span><strong>Flashcard</strong><small>Lihat kanji, tebak bacaan dan artinya.</small><span class="k-mode-link">Mulai belajar →</span></button><button class="k-mode" data-a="kstart|test"><span class="k-mode-icon">✓</span><strong>Tes pilihan ganda</strong><small>Uji hafalan dengan 10 soal acak.</small><span class="k-mode-link">Mulai tes →</span></button></div>'+btn('← Kembali ke beranda','home');show(h)}
function kLoad(){return get('data/jft-kanji.json').then(function(a){K.items=a;K.pool=a.slice();kanjiHome()})}
function kstart(mode){K.mode=mode;K.pool=shuffle(K.items.filter(function(x){return K.level==='Semua'||x.level===K.level}));K.i=0;K.shown=false;K.answers=[];if(mode==='test'){K.questions=K.pool.slice(0,Math.min(10,K.pool.length));ktest()}else kcard()}
function kcard(){var x=K.pool[K.i];if(!x){kanjiHome();return}var pct=Math.round(K.i/K.pool.length*100);var h='<div class="bar"><b>Flashcard</b><button class="x" data-a="khome">✕</button></div><div class="k-progress-head"><span>'+x.level+'</span><strong>'+(K.i+1)+' / '+K.pool.length+'</strong></div><div class="k-progress"><i style="width:'+pct+'%"></i></div><div class="kanji-card"><span class="k-card-label">Apa arti kosakata ini?</span><div class="kanji-word">'+esc(x.word)+'</div>';
if(K.shown){h+='<div class="kanji-answer"><span>'+esc((x.readings&&x.readings.length)?x.readings.join('・'):x.reading)+'</span><strong>'+esc(x.meaning)+'</strong>';if(typeof x.note==='string'&&x.note.trim())h+='<small class="kanji-note" style="display:block;width:100%;margin-top:12px;padding-top:10px;border-top:1px solid var(--ln);font-size:14px;line-height:1.5;color:var(--mut);font-weight:400;text-align:left">'+esc(x.note)+'</small>';h+='</div>';}h+='</div>';
if(!K.shown)h+=btn('Tampilkan bacaan & arti','kreveal','pri');else h+='<div class="k-card-actions">'+btn('Sudah hafal','knext','pri')+btn('Belum hafal','kagain')+'</div>';
h+=btn('Kembali ke materi','khome');show(h)}
function ktest(){
var x=K.questions[K.i];
if(!x){
var total=K.questions.length*2,n=K.answers.reduce(function(a,v){return a+(v.reading?1:0)+(v.meaning?1:0)},0);
var h='<h2>Hasil tes kanji</h2><div class="sc">'+n+' / '+total+'</div><p>'+Math.round(n/total*100)+'% benar</p><p>Nilai bacaan: '+K.answers.filter(function(v){return v.reading}).length+' / '+K.questions.length+'</p><p>Nilai arti: '+K.answers.filter(function(v){return v.meaning}).length+' / '+K.questions.length+'</p>';
show(h+btn('Tes lagi','kstart|test','pri')+btn('Kembali','khome'));return
}
if(!K.readingOpts||K.currentId!==x.id){
K.currentId=x.id;
var correctReadings=(x.readings&&x.readings.length)?x.readings:[x.reading];
var readingPool=[];K.items.forEach(function(y){var rs=(y.readings&&y.readings.length)?y.readings:[y.reading];rs.forEach(function(r){if(correctReadings.indexOf(r)===-1&&readingPool.indexOf(r)===-1)readingPool.push(r)})});
K.readingOpts=shuffle(correctReadings.concat(shuffle(readingPool).slice(0,Math.max(0,4-correctReadings.length))));
K.meaningOpts=shuffle([x].concat(shuffle(K.items.filter(function(y){return y.id!==x.id&&y.meaning!==x.meaning})).slice(0,3)));
K.selectedReading=null;K.selectedMeaning=null
}
var pct=Math.round(K.i/K.questions.length*100);
var h='<div class="bar"><b>Tes kanji</b><button class="x" data-a="khome">✕</button></div><div class="k-progress-head"><span>Pertanyaan '+(K.i+1)+' / '+K.questions.length+'</span><strong>'+pct+'%</strong></div><div class="k-progress"><i style="width:'+pct+'%"></i></div><div class="kanji-card k-test-card"><span class="k-card-label">Tentukan bacaan dan arti</span><div class="kanji-word">'+esc(x.word)+'</div></div>';
h+='<section class="k-question-group"><h3>1. Pilih salah satu bacaan hiragana yang benar</h3><div class="k-options">';
K.readingOpts.forEach(function(r,i){h+='<button class="k-option '+(K.selectedReading===r?'selected':'')+'" data-a="kpick|reading|'+r+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(r)+'</button>'});
h+='</div></section><section class="k-question-group"><h3>2. Pilih arti bahasa Indonesia</h3><div class="k-options">';
K.meaningOpts.forEach(function(o,i){h+='<button class="k-option '+(K.selectedMeaning===o.id?'selected':'')+'" data-a="kpick|meaning|'+o.id+'"><span>'+String.fromCharCode(65+i)+'</span>'+esc(o.meaning)+'</button>'});
h+='</div></section>';
h+=btn('Soal berikutnya','knexttest','pri');
show(h)
}
function kpick(type,id){if(type==='reading')K.selectedReading=id;else K.selectedMeaning=+id;ktest()}
function knexttest(){
if(K.selectedReading==null||K.selectedMeaning==null){alert('Pilih satu jawaban untuk bacaan dan satu jawaban untuk arti.');return}
var x=K.questions[K.i];
var validReadings=(x.readings&&x.readings.length)?x.readings:[x.reading];
K.answers.push({reading:validReadings.indexOf(K.selectedReading)!==-1,meaning:K.selectedMeaning===x.id});
K.i++;K.currentId=null;K.readingOpts=null;K.meaningOpts=null;K.selectedReading=null;K.selectedMeaning=null;ktest()
}

var A={
 home:function(){clearInterval(tick);var h='<h1>Latihan JLPT</h1><p class="sub">Soal buatan sendiri, bukan soal resmi.</p>'+btn('Kanji JFT Basic — Flashcard & Tes','kload','pri');
  Object.keys(CFG.levels).forEach(function(l){h+=btn(l,'menu|'+l,'pri')});h+='<p class="sub">聴解 (listening) menyusul setelah audio tersedia.</p>';
  var H=hist().slice(0,5);if(H.length){h+='<h3>Riwayat</h3>';H.forEach(function(x){h+='<div>'+x.d+' · '+x.lv+' · '+x.p+'% ('+x.n+' soal)</div>'})}show(h)},
 kload:function(){kLoad().catch(function(){show('<p class="err">Gagal memuat data kanji.</p>'+btn('Kembali','home'))})},
 khome:function(){kanjiHome()},
 klevel:function(level){K.level=level;kanjiHome()},
 kstart:function(mode){kstart(mode)},
 kreveal:function(){K.shown=true;kcard()},
 knext:function(){K.i++;K.shown=false;kcard()},
 kagain:function(){var x=K.pool.splice(K.i,1)[0];K.pool.push(x);K.shown=false;kcard()},
 kpick:function(type,id){kpick(type,id)},
 knexttest:function(){knexttest()},
 menu:function(lv){var L=CFG.levels[lv],h='<h2>'+lv+'</h2>'+btn('Simulasi penuh (timer per bagian)','full|'+lv,'pri');
  L.sections.forEach(function(s,i){h+='<h3>'+s.name+' · '+s.min+' menit</h3>'+btn('Latihan seluruh bagian','sec|'+lv+'|'+i);
   s.m.forEach(function(m){h+='<button class="b sm" data-a="mon|'+lv+'|'+i+'|'+m[0]+'">問題'+m[0]+' '+CFG.types[m[2]][0]+'</button>'})});
  show(h+btn('← Kembali','home'))},
 full:function(lv){start(lv,CFG.levels[lv].sections.map(function(s){return{sec:s}}),null,true)},
 sec:function(lv,i){start(lv,[{sec:CFG.levels[lv].sections[+i]}],null)},
 mon:function(lv,i,n){start(lv,[{sec:CFG.levels[lv].sections[+i]}],+n)},
 submit:function(){finish()},
 retry:function(){S.plan=[{sec:{name:'Latihan ulang',min:0},items:S.bad}];S.i=0;S.done=[];S.only=null;S.full=false;run()},
 exit:function(){if(confirm('Keluar? Jawaban bagian ini hilang.')){clearInterval(tick);A.home()}}};
app.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.getAttribute('data-a').split('|');A[a[0]].apply(null,a.slice(1))});
get('data/config.json').then(function(c){CFG=c;A.home()}).catch(function(){show('<p class="err">Gagal memuat config. Buka lewat GitHub Pages atau server.</p>')});
})();
