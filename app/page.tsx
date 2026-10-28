"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";

const MoleculeScene = dynamic(() => import("./MoleculeScene"), { ssr: false, loading: () => <div className="scene-loading">Մոլեկուլի մոդելը բեռնվում է…</div> });

type Base = "A" | "T" | "G" | "C" | "U";
type Slide = { title: string; eyebrow: string; summary: string; bullets: string[]; visual: string; mode?: string };
const projectInfo = { author: "", grade: "9-րդ դասարան", school: "" };

const slides: Slide[] = [
  {eyebrow:"ԿԵՆՍԱԲԱՆՈՒԹՅՈՒՆ · ԴՊՐՈՑԱԿԱՆ ՆԱԽԱԳԻԾ",title:"ԴՆԹ և ՌՆԹ",summary:"Կյանքի գենետիկական տեղեկատվությունը՝ մոլեկուլների լեզվով։",bullets:["Ինտերակտիվ ներկայացում","Եռաչափ մոլեկուլային լաբորատորիա","9-րդ դասարան"],visual:"hero",mode:"dna"},
  {eyebrow:"01 / ՈՒՂԵՑՈՒՅՑ",title:"Նպատակներ և պլան",summary:"Ուսումնասիրենք՝ ինչպես են նուկլեինաթթուները պահպանում և փոխանցում տեղեկությունը։",bullets:["Ծանոթանալ նուկլեոտիդներին և ԴՆԹ-ի կառուցվածքին։","Տարբերել ԴՆԹ-ն և ՌՆԹ-ն։","Հասկանալ գենետիկական կոդի և սպիտակուցների կապը։","Ստուգել գիտելիքները խաղերի և թեստի միջոցով։"],visual:"plan",mode:"dna"},
  {eyebrow:"02 / ՀԻՄՈՒՆՔՆԵՐ",title:"Ի՞նչ են նուկլեինաթթուները",summary:"ԴՆԹ-ն և ՌՆԹ-ն մոլեկուլներ են, որոնք կարևոր դեր ունեն ժառանգական տեղեկատվության պահպանման և օգտագործման մեջ։",bullets:["ԴՆԹ-ն պահպանում է բջջի գենետիկական հրահանգները։","ՌՆԹ-ի տարբեր տեսակներ մասնակցում են այդ հրահանգների իրականացմանը։","ԴՆԹ-ն գտնվում է կորիզում և միտոքոնդրիումներում։"],visual:"facts",mode:"dna"},
  {eyebrow:"03 / ՊԱՏՄՈՒԹՅՈՒՆ",title:"Բացահայտումների ճանապարհը",summary:"ԴՆԹ-ի մասին գիտելիքը ձևավորվել է բազմաթիվ հետազոտողների աշխատանքի շնորհիվ։",bullets:["1869 — Ֆրիդրիխ Միշերը բջիջներից առանձնացրեց նոր նյութ, որն անվանեց «նուկլեին»։","20-րդ դար — Ֆեբուս Լևենը և Էրվին Չարգաֆը ուսումնասիրեցին նուկլեինաթթուների բաղադրությունը։","Ռոզալինդ Ֆրանկլինի ռենտգենյան տվյալները կարևոր էին կառուցվածքը հասկանալու համար։","1953 — Ջեյմս Ուոթսոնը և Ֆրենսիս Կրիկը հրապարակեցին երկպարույրի մոդելը։"],visual:"timeline",mode:"dna"},
  {eyebrow:"04 / ԿԱՌՈՒՑՎԱԾՔ",title:"Նուկլեոտիդի երեք մասերը",summary:"Նուկլեոտիդը ԴՆԹ-ի և ՌՆԹ-ի շղթաների կառուցման հիմնական միավորն է։",bullets:["Ֆոսֆատային խումբ","Շաքար՝ դեզօքսիռիբոզ կամ ռիբոզ","Ազոտային հիմք՝ A, T, G, C կամ U"],visual:"nucleotide",mode:"base"},
  {eyebrow:"05 / ԴՆԹ",title:"ԴՆԹ-ի երկպարույրը",summary:"ԴՆԹ-ն սովորաբար կազմված է երկու շղթայից, որոնք միասին ձևավորում են կրկնակի պարույր։",bullets:["Շղթաների հիմքերը դասավորված են ներսի կողմում։","Շաքարաֆոսֆատային կմախքը գտնվում է շղթաների արտաքին մասում։","Հիմքերի միջև կապերը օգնում են կայուն պահել կառուցվածքը։"],visual:"dna",mode:"dna"},
  {eyebrow:"06 / ՀԻՄՔԵՐ",title:"Ազոտային հիմքերը",summary:"Հիմքերի հերթականությունը կրում է գենետիկական տեղեկատվություն։ Փորձիր ուսումնասիրել հիմքերը 3D լաբորատորիայում։",bullets:["A — ադենին","T — թիմին","G — գուանին","C — ցիտոզին"],visual:"bases",mode:"pair"},
  {eyebrow:"07 / ՌՆԹ",title:"ՌՆԹ-ի կառուցվածքը",summary:"ՌՆԹ-ն սովորաբար մեկ շղթա ունեցող նուկլեինաթթու է։",bullets:["Պարունակում է ռիբոզ շաքարը։","Թիմինի փոխարեն օգտագործում է ուրացիլ՝ U։","Կարող է ծալվել և կազմել տարբեր ձևեր։"],visual:"rna",mode:"rna"},
  {eyebrow:"08 / ՌՆԹ-Ի ՏԵՍԱԿՆԵՐԸ",title:"ՌՆԹ-ի երեք կարևոր տեսակ",summary:"Տարբեր ՌՆԹ-ներ կատարում են տարբեր աշխատանքներ սպիտակուցի սինթեզի ընթացքում։",bullets:["իՌՆԹ — տեղեկատվությունը փոխանցում է ԴՆԹ-ից դեպի ռիբոսոմ։","տՌՆԹ — բերում է համապատասխան ամինաթթուները։","ռՌՆԹ — ռիբոսոմի կարևոր կառուցվածքային և գործառական մասն է։"],visual:"rna-types",mode:"rna"},
  {eyebrow:"09 / ՀԱՄԵՄԱՏՈՒԹՅՈՒՆ",title:"ԴՆԹ և ՌՆԹ",summary:"Երկու մոլեկուլներն էլ կառուցված են նուկլեոտիդներից, բայց տարբեր են շաքարով, հիմքերով և հիմնական դերերով։",bullets:["Շաքար՝ դեզօքսիռիբոզ / ռիբոզ","Հիմքեր՝ A, T, G, C / A, U, G, C","Շղթաներ՝ սովորաբար երկու / սովորաբար մեկ","Դեր՝ պահպանում / փոխանցում և իրականացում"],visual:"compare",mode:"dna"},
  {eyebrow:"10 / ՊԱՏՃԵՆՈՒՄ",title:"ԴՆԹ-ի կրկնապատկում",summary:"Բջջի բաժանումից առաջ ԴՆԹ-ն պատճենվում է, որպեսզի նոր բջիջները ստանան գենետիկական տեղեկատվություն։",bullets:["Երկպարույրի շղթաները բացվում են։","Յուրաքանչյուր հին շղթայի հիման վրա հավաքվում է նոր շղթա։","Արդյունքում առաջանում են երկու ԴՆԹ մոլեկուլներ։"],visual:"replication",mode:"dna"},
  {eyebrow:"11 / ՏԵՂԵԿԱՏՎՈՒԹՅՈՒՆ",title:"Տրանսկրիպցիա և տրանսլյացիա",summary:"Գենետիկական տեղեկատվությունն օգտագործվում է սպիտակուցներ կառուցելու համար։",bullets:["ԴՆԹ-ի հատվածի հիման վրա կազմվում է իՌՆԹ։","Ռիբոսոմը կարդում է իՌՆԹ-ի կոդոնները։","Ամինաթթուները միանում են՝ կազմելով սպիտակուց։"],visual:"central-dogma",mode:"rna"},
  {eyebrow:"12 / ԿԻՐԱՌՈՒԹՅՈՒՆ",title:"Մուտացիաներ և նոր հնարավորություններ",summary:"Գենետիկական նյութի փոփոխությունները կարող են ազդեցություն ունենալ հատկությունների վրա և կիրառվել գիտության ու բժշկության մեջ։",bullets:["ԴՆԹ-ի տարբերակներն օգնում են ուսումնասիրել ժառանգականությունը։","ՊՇՌ մեթոդը բազմապատկում է ընտրված ԴՆԹ հատվածները։","ՄՌՆԹ պատվաստանյութերը բջիջներին ժամանակավոր հրահանգ են տալիս սպիտակուց ստեղծելու համար։","«ՌՆԹ-ն առաջինը» վարկածը կյանքի ծագման մասին գիտական վարկած է, ոչ վերջնական ապացույց։"],visual:"applications",mode:"dna"},
  {eyebrow:"13 / ԳԻՏԵԼԻՔՆԵՐ",title:"Փոքրիկ գիտելիքի ստուգում",summary:"Պատասխանիր ութ հարցի և տես՝ ինչ ես սովորել։",bullets:["Յուրաքանչյուր ճիշտ պատասխան՝ 1 միավոր։","Պատասխանից հետո կտեսնես բացատրությունը։","Կարող ես անցնել թեստը կրկին։"],visual:"quiz",mode:"base"},
  {eyebrow:"14 / ԱՄՓՈՓՈՒՄ",title:"Գլխավոր միտքը",summary:"ԴՆԹ-ն և ՌՆԹ-ն միասին ապահովում են գենետիկական տեղեկատվության պահպանումն ու դրա օգտագործումը։",bullets:["Նուկլեոտիդները նուկլեինաթթուների կառուցման միավորներն են։","ԴՆԹ-ի հերթականությունը կրում է ժառանգական տեղեկությունը։","ՌՆԹ-ի տարբեր տեսակները մասնակցում են տեղեկատվության փոխանցմանն ու սպիտակուցի սինթեզին։"],visual:"sources",mode:"dna"}
];

const sources = [
  {name:"NCBI Bookshelf — Molecular Biology of the Cell",url:"https://www.ncbi.nlm.nih.gov/books/NBK26887/",note:"ԴՆԹ-ի կառուցվածքի և գործառույթի հիմունքներ։"},
  {name:"NCBI Bookshelf — Genes and DNA",url:"https://www.ncbi.nlm.nih.gov/books/NBK21050/",note:"Ժառանգականություն և գենետիկական նյութ։"},
  {name:"NHGRI — Human Genomic Variation",url:"https://www.genome.gov/about-genomics/fact-sheets/human-genomic-variation",note:"Մարդկանց գենետիկական տարբերություններ։"},
  {name:"NHGRI — Understanding mRNA Vaccines",url:"https://www.genome.gov/about-genomics/fact-sheets/Understanding-COVID-19-mRNA-Vaccines",note:"ՄՌՆԹ պատվաստանյութերի պարզաբանում։"},
  {name:"Nature Education — DNA structure",url:"https://www.nature.com/scitable/topicpage/discovery-of-dna-structure-and-function-watson-397/",note:"ԴՆԹ-ի կառուցվածքի պատմական և կենսաբանական համատեքստ։"},
  {name:"Encyclopaedia Britannica — Nucleic acid",url:"https://www.britannica.com/science/nucleic-acid",note:"Նուկլեինաթթուների ընդհանուր նկարագրություն։"},
  {name:"ARLIS — Կենսաբանության առարկայական չափորոշիչ",url:"https://www.arlis.am/en/acts/179998",note:"Հայաստանի կրթական չափորոշիչ։"}
];

const quiz = [
  {q:"Ո՞րն է ԴՆԹ-ի հիմնական դերը։",opts:["Էներգիա արտադրել","Պահպանել գենետիկական տեղեկատվությունը","Թթվածին տեղափոխել"],correct:1,why:"ԴՆԹ-ն պահպանում է ժառանգական հրահանգները։"},
  {q:"Ո՞ր շաքարն է բնորոշ ՌՆԹ-ին։",opts:["Ռիբոզ","Դեզօքսիռիբոզ","Գլյուկոզ"],correct:0,why:"ՌՆԹ-ն պարունակում է ռիբոզ։"},
  {q:"Ո՞ր հիմքն է հանդիպում ՌՆԹ-ում՝ թիմինի փոխարեն։",opts:["Ցիտոզին","Ուրացիլ","Գուանին"],correct:1,why:"ՌՆԹ-ում թիմինի փոխարեն կա ուրացիլ՝ U։"},
  {q:"Ի՞նչ է նուկլեոտիդը։",opts:["Բջջի օրգանոիդ","Նուկլեինաթթվի կառուցման միավոր","Սպիտակուցի տեսակ"],correct:1,why:"Նուկլեոտիդը կազմված է ֆոսֆատից, շաքարից և ազոտային հիմքից։"},
  {q:"Ո՞ր մոլեկուլն է սովորաբար երկշղթա։",opts:["ԴՆԹ","իՌՆԹ","տՌՆԹ"],correct:0,why:"ԴՆԹ-ն սովորաբար ունի երկու շղթա։"},
  {q:"Ի՞նչ է անում իՌՆԹ-ն։",opts:["Փոխադրում է թթվածին","Փոխանցում է գենետիկական հաղորդագրությունը","Կուտակում է ճարպ"],correct:1,why:"իՌՆԹ-ն հաղորդագրությունը հասցնում է ռիբոսոմին։"},
  {q:"Ի՞նչ է կոդոնը։",opts:["Երեք նուկլեոտիդից կազմված հաջորդականություն","Շաքարի տեսակ","Բջջի թաղանթ"],correct:0,why:"իՌՆԹ-ի կոդոնը երեք նուկլեոտիդի հաջորդականություն է։"},
  {q:"Ո՞ր մեթոդն է օգտագործվում ԴՆԹ-ի ընտրված հատվածը բազմապատկելու համար։",opts:["ՊՇՌ","Ֆոտոսինթեզ","Դիֆուզիա"],correct:0,why:"ՊՇՌ-ն լաբորատորիայում բազմապատկում է ԴՆԹ-ի որոշակի հատվածը։"}
];

const baseInfo: Record<Base,{name:string;color:string,kind:string,detail:string}> = {
  A:{name:"Ադենին",color:"#df4d50",kind:"Պուրինային հիմք",detail:"Հանդիպում է ԴՆԹ-ում և ՌՆԹ-ում։"},
  T:{name:"Թիմին",color:"#397ac5",kind:"Պիրիմիդինային հիմք",detail:"Սովորական ԴՆԹ-ում օգտագործվող հիմքերից է։"},
  G:{name:"Գուանին",color:"#27966a",kind:"Պուրինային հիմք",detail:"Հանդիպում է ԴՆԹ-ում և ՌՆԹ-ում։"},
  C:{name:"Ցիտոզին",color:"#d6ad24",kind:"Պիրիմիդինային հիմք",detail:"Հանդիպում է ԴՆԹ-ում և ՌՆԹ-ում։"},
  U:{name:"Ուրացիլ",color:"#8a5ac8",kind:"Պիրիմիդինային հիմք",detail:"ՌՆԹ-ում փոխարինում է թիմինին։"}
};

export default function Home() {
  const [slideIndex,setSlideIndex] = useState(0);
  const [lab,setLab] = useState(false);
  const [base,setBase] = useState<Base>("A");
  const [modelMode,setModelMode] = useState("dna");
  const [openedRna,setOpenedRna] = useState<string | null>(null);
  const [quizIndex,setQuizIndex] = useState(0);
  const [answers,setAnswers] = useState<Record<number,number>>({});
  const [replicationStep,setReplicationStep] = useState(0);
  const [replicationPlaying,setReplicationPlaying] = useState(false);
  const [transcriptionStep,setTranscriptionStep] = useState(0);
  const [dnaInput,setDnaInput] = useState("ATGCGT");
  const [pairSlots,setPairSlots] = useState<Record<number,Base>>({});
  const [pairFeedback,setPairFeedback] = useState("");
  const [toc,setToc] = useState(false);
  const [darkMode,setDarkMode] = useState(false);
  const [touchStart,setTouchStart] = useState<number|null>(null);

  const slide = slides[slideIndex];
  const score = useMemo(()=>Object.entries(answers).filter(([i,a])=>quiz[Number(i)].correct===a).length,[answers]);
  useEffect(()=>{ if(!replicationPlaying || slide.visual!=="replication") return; const timer=window.setTimeout(()=>{ setReplicationStep(s=>{ if(s>=2){setReplicationPlaying(false);return 2;} return s+1; }); },2200); return ()=>window.clearTimeout(timer); },[replicationPlaying,replicationStep,slide.visual]);

  const mrna = dnaInput.toUpperCase().replace(/[^ATGC]/g,"").replace(/T/g,"U");
  const codons = mrna.match(/.{1,3}/g)?.join(" · ") || "—";

  const go = useCallback((next:number) => {
    const safe = Math.max(0,Math.min(slides.length-1,next));
    setSlideIndex(safe);
    setLab(false);
    setToc(false);
    setPairFeedback("");
    window.location.hash = "slide-"+(safe+1);
  },[]);
  useEffect(()=>{
    const hash = window.location.hash.match(/slide-(\d+)/);
    if(hash) setSlideIndex(Math.max(0,Math.min(slides.length-1,Number(hash[1])-1)));
    const onKey=(e:KeyboardEvent)=>{
      const target=e.target as HTMLElement;
      if(["INPUT","TEXTAREA","SELECT"].includes(target.tagName)) return;
      if(e.key==="ArrowRight"||e.key==="PageDown"||e.key===" "){e.preventDefault();go(slideIndex+1);}
      if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();go(slideIndex-1);}
      if(e.key==="Home"){e.preventDefault();go(0);}
      if(e.key==="End"){e.preventDefault();go(slides.length-1);}
      if(e.key.toLowerCase()==="m") setToc(v=>!v);
      if(e.key.toLowerCase()==="f"){if(!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.();}
      if(e.key==="Escape"){setToc(false);setLab(false);}
    };
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[go,slideIndex]);
  const answer=(value:number)=>setAnswers(old=>({...old,[quizIndex]:value}));
  const resetQuiz=()=>{setAnswers({});setQuizIndex(0);};

  return <main className={"app-shell"+(darkMode?" theme-dark":"")} data-theme={darkMode?"dark":"light"} onTouchStart={e=>setTouchStart(e.touches[0].clientX)} onTouchEnd={e=>{if(touchStart===null)return;const dx=e.changedTouches[0].clientX-touchStart;if(Math.abs(dx)>90&&!lab&&!toc)go(slideIndex+(dx<0?1:-1));setTouchStart(null);}}>
    <header className="topbar">
      <a className="brand" href="#" onClick={e=>{e.preventDefault();go(0);}}><span className="brand-mark">DNA</span><span>ԿԵՆՍԱԲԱՆՈՒԹՅՈՒՆ <small>ԻՆՏԵՐԱԿՏԻՎ ՆԱԽԱԳԻԾ</small></span></a>
      <div className="top-actions"><span className="class-tag">{projectInfo.grade}</span><button className="ghost-button theme-toggle" onClick={()=>setDarkMode(v=>!v)} aria-label={darkMode?"Միացնել լուսավոր թեման":"Միացնել մուգ թեման"}>{darkMode?"☀ Լուսավոր":"☾ Մուգ"}</button><button className="ghost-button" onClick={()=>setToc(v=>!v)} aria-label="Բացել բովանդակությունը">Բովանդակություն <kbd>M</kbd></button><button className="lab-button" onClick={()=>setLab(true)}>3D լաբորատորիա <span>↗</span></button></div>
    </header>

    <div className="progress-track"><span style={{width:((slideIndex+1)/slides.length*100)+"%"}}/></div>

    {toc && <div className="toc-backdrop" onClick={()=>setToc(false)}><aside className="toc-panel" onClick={e=>e.stopPropagation()}><div className="panel-head"><div><span className="eyebrow">ՆԱՎԻԳԱՑԻԱ</span><h2>Բովանդակություն</h2></div><button className="icon-button" onClick={()=>setToc(false)} aria-label="Փակել">×</button></div>{slides.map((s,i)=><button key={s.title} className={"toc-row "+(i===slideIndex?"active":"")} onClick={()=>go(i)}><span>{String(i+1).padStart(2,"0")}</span><b>{s.title}</b><span>↗</span></button>)}<p className="muted tiny">Ստեղնաշար՝ ← → · Space · Home / End · F՝ լիաէկրան</p></aside></div>}

    <section className={"slide slide-"+slide.visual} key={slideIndex}>
      <div className="slide-copy">
        <div className="eyebrow"><span className="eyebrow-dot"/>{slide.eyebrow}</div>
        <h1>{slide.title}</h1>
        <p className="lead">{slide.summary}</p>
        {slide.visual==="hero" ? <div className="hero-meta"><span>{projectInfo.author||"Դպրոցական նախագիծ"}</span><i/ ><span>{projectInfo.school||"Կենսաբանություն"}</span></div> : null}
        {slide.visual==="timeline" ? <div className="timeline">{[{year:"1869",name:"Միշեր"},{year:"1900-ականներ",name:"Լևեն և Չարգաֆ"},{year:"1952",name:"Ֆրանկլինի տվյալներ"},{year:"1953",name:"Երկպարույրի մոդել"}].map((t,i)=><div className="timeline-item" key={t.year}><span className="timeline-dot">{i+1}</span><div><b>{t.year}</b><small>{t.name}</small></div></div>)}</div> : null}
        {slide.visual==="compare" ? <div className="comparison"><div className="compare-head"><span>ԲՆՈՒԹԱԳԻՐ</span><b>ԴՆԹ</b><b>ՌՆԹ</b></div>{[{a:"Շաքար",b:"Դեզօքսիռիբոզ",c:"Ռիբոզ"},{a:"Հիմքեր",b:"A · T · G · C",c:"A · U · G · C"},{a:"Շղթաներ",b:"Սովորաբար՝ 2",c:"Սովորաբար՝ 1"},{a:"Հիմնական դեր",b:"Տեղեկության պահպանում",c:"Փոխանցում և իրականացում"}].map(r=><div className="compare-row" key={r.a}><span>{r.a}</span><b>{r.b}</b><b>{r.c}</b></div>)}</div> : null}
        {slide.visual==="rna-types" ? <div className="rna-cards">{[{id:"mRNA",label:"իՌՆԹ",name:"Տեղեկատվական",text:"Գենետիկական հաղորդագրությունը տեղափոխում է դեպի ռիբոսոմ։"},{id:"tRNA",label:"տՌՆԹ",name:"Փոխադրող",text:"Օգնում է համապատասխան ամինաթթուն հասցնել ռիբոսոմին։"},{id:"rRNA",label:"ռՌՆԹ",name:"Ռիբոսոմային",text:"Ռիբոսոմի կարևոր բաղադրիչն է։"}].map(x=><button key={x.id} className={"rna-card "+(openedRna===x.id?"expanded":"")} onClick={()=>setOpenedRna(openedRna===x.id?null:x.id)}><span className="rna-glyph">{x.id==="mRNA"?"〰":x.id==="tRNA"?"♧":"◉"}</span><b>{x.label}</b><small>{x.name}</small>{openedRna===x.id&&<p>{x.text}</p>}</button>)}</div> : null}
        {slide.visual==="bases" ? <div className="base-selector">{(["A","T","G","C","U"] as Base[]).map(b=><button key={b} onClick={()=>{setBase(b);setModelMode(b==="U"?"rna":"pair");}} className={base===b?"selected":""} style={{"--base-color":baseInfo[b].color} as React.CSSProperties}><b>{b}</b><span>{baseInfo[b].name}</span></button>)}</div> : null}
        {slide.visual==="nucleotide" ? <div className="component-legend"><span><i className="legend-dot phosphate"/>Ֆոսֆատ</span><span><i className="legend-dot sugar"/>Շաքար</span><span><i className="legend-dot base"/>Ազոտային հիմք</span></div> : null}
        {slide.visual==="replication" ? <div className="stepper"><div className={"step-visual step-"+replicationStep}><span className="replication-step-number">ՔԱՅԼ {replicationStep+1} / 3</span><strong>{["1. Բացվում է երկպարույրը","2. Հին շղթաներին միանում են նոր նուկլեոտիդներ","3. Ստացվում են երկու ԴՆԹ մոլեկուլ"][replicationStep]}</strong><div className="replication-progress">{["Երկպարույր","Նոր շղթաների հավաքում","Երկու նույնական ԴՆԹ"].map((label,i)=><span key={label} className={i<=replicationStep?"done":""}>{label}</span>)}</div></div><div className="step-actions"><button className="primary-button" onClick={()=>{setReplicationPlaying(false);setReplicationStep(s=>Math.min(2,s+1));}} disabled={replicationStep===2}>Հաջորդ քայլը →</button><button className="text-button" onClick={()=>{if(replicationPlaying)setReplicationPlaying(false);else{if(replicationStep===2)setReplicationStep(0);setReplicationPlaying(true);}}}>{replicationPlaying?"Դադարեցնել Ⅱ":replicationStep===2?"Կրկնել ↻":"Ավտոմատ ցուցադրել ▶"}</button><button className="text-button" onClick={()=>{setReplicationPlaying(false);setReplicationStep(s=>Math.max(0,s-1));}} disabled={replicationStep===0}>Նախորդ քայլը</button><button className="text-button" onClick={()=>{setReplicationPlaying(false);setReplicationStep(0);}}>Զրոյացնել ↺</button></div></div> : null}
        {slide.visual==="central-dogma" ? <div className="transcription-box"><div className={"flow-node "+(transcriptionStep>=0?"active":"")}>ԴՆԹ</div><span className="flow-arrow">→</span><div className={"flow-node "+(transcriptionStep>=1?"active":"")}>իՌՆԹ</div><span className="flow-arrow">→</span><div className={"flow-node "+(transcriptionStep>=3?"active":"")}>Սպիտակուց</div><p>{["Պատրաստ ենք սկսել։","Տրանսկրիպցիա․ ստեղծվում է իՌՆԹ։","իՌՆԹ-ն հասնում է ռիբոսոմին։","Տրանսլյացիա․ կազմվում է ամինաթթուների շղթա։"][transcriptionStep]}</p><div className="step-actions"><button className="primary-button" onClick={()=>setTranscriptionStep(s=>s>=3?0:s+1)}>{transcriptionStep>=3?"Կրկնել":"Հաջորդ քայլը"} →</button><button className="text-button" onClick={()=>setTranscriptionStep(0)}>Սկսել նորից</button></div><div className="sequence-tool"><label htmlFor="dna-sequence">Մուտքագրիր ԴՆԹ-ի կոդավորող շղթան (A/T/G/C)</label><input id="dna-sequence" value={dnaInput} onChange={e=>setDnaInput(e.target.value.toUpperCase().replace(/[^ATGC]/g,"").slice(0,30))}/><div className="sequence-output"><span>իՌՆԹ</span><b>{mrna||"—"}</b><small>Կոդավորող շղթայի T-ն փոխարինվում է U-ով․ կոդոններ՝ {codons}</small></div></div></div> : null}
        {slide.visual==="quiz" ? <div className="quiz-panel"><div className="quiz-top"><span>ՀԱՐՑ {Math.min(quizIndex+1,quiz.length)} / {quiz.length}</span><b>{score} / {quiz.length}</b></div>{quizIndex<quiz.length ? <><h3>{quiz[quizIndex].q}</h3><div className="quiz-options">{quiz[quizIndex].opts.map((opt,i)=><button key={opt} className={"quiz-option "+(answers[quizIndex]===i?"chosen":"")+(answers[quizIndex]===i&&i===quiz[quizIndex].correct?" right":"")+(answers[quizIndex]===i&&i!==quiz[quizIndex].correct?" wrong":"")} onClick={()=>answer(i)}><span>{String.fromCharCode(65+i)}</span>{opt}</button>)}</div>{answers[quizIndex]!==undefined&&<p className="quiz-explain">{answers[quizIndex]===quiz[quizIndex].correct?"Ճիշտ է։":"Փորձիր հիշել։"} {quiz[quizIndex].why}</p>}<div className="step-actions"><button className="primary-button" disabled={answers[quizIndex]===undefined} onClick={()=>setQuizIndex(i=>Math.min(quiz.length,i+1))}>{quizIndex===quiz.length-1?"Արդյունքը":"Հաջորդ հարցը"} →</button><button className="text-button" onClick={resetQuiz}>Սկսել նորից</button></div></>:<div className="quiz-result"><strong>{score} / {quiz.length}</strong><p>{score>=7?"Գերազանց արդյունք։":score>=5?"Լավ աշխատանք։":"Կրկնիր նյութը և փորձիր նորից։"}</p><button className="primary-button" onClick={resetQuiz}>Կրկին անցնել</button></div>}</div> : null}
        {slide.visual==="sources" ? <><div className="source-list">{sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer"><span>↗</span><div><b>{s.name}</b><small>{s.note}</small></div></a>)}</div><div className="term-review"><b>Ուսուցչի հետ ճշտել տերմինները</b><span>իՌՆԹ / տեղեկատվական ՌՆԹ · տՌՆԹ / փոխադրող ՌՆԹ · ռՌՆԹ / ռիբոսոմային ՌՆԹ։</span></div></> : null}
        {!["hero","timeline","compare","rna-types","bases","nucleotide","replication","central-dogma","quiz","sources"].includes(slide.visual) ? <ul className="bullet-list">{slide.bullets.map((b,i)=><li key={b}><span>{String(i+1).padStart(2,"0")}</span>{b}</li>)}</ul> : null}
        {slide.visual==="hero" ? <button className="primary-button hero-start" onClick={()=>go(1)}>Սկսել ուսումնասիրությունը <span>→</span></button> : null}
        {slide.visual==="applications" ? <div className="fact-note"><b>Գիտական նշում</b><span>Մարդկանց ԴՆԹ-ի նմանության 99.9% թիվը տարածված պարզեցում է. լայն գենոմային տարբերակները հաշվի առնելիս գնահատականը կարող է մոտ լինել 99.6%-ի։</span></div> : null}
      </div>
      <div className="slide-visual">
        <div className="visual-topline"><span>{slide.visual==="hero"?"MOLECULAR BIOLOGY":slide.visual==="timeline"?"DISCOVERY TIMELINE":slide.visual==="bases"?"BASE EXPLORER":"MOLECULAR VIEW"}</span><span>{String(slideIndex+1).padStart(2,"0")} / 15</span></div>
        <div className={"visual-stage stage-"+slide.visual}>
          <MoleculeScene mode={slide.visual==="bases"?modelMode:slide.visual==="replication"?"replication":slide.mode||"dna"} selectedBase={base} replicationStep={replicationStep} compact={slide.visual!=="hero"}/>
          {slide.visual==="nucleotide"&&<div className="nucleotide-labels"><span>Ֆոսֆատ</span><span>Շաքար</span><span>Հիմք</span></div>}
          {slide.visual==="plan"&&<div className="floating-caption">01 <span>Գենետիկական տեղեկատվություն</span></div>}
          {slide.visual==="hero"&&<div className="hero-stamp"><span>3D</span><b>Մոլեկուլների<br/>աշխարհը</b></div>}
          {slide.visual==="central-dogma"&&<div className="stage-formula"><span>DNA</span><i>→</i><span>mRNA</span><i>→</i><span>PROTEIN</span></div>}
          {slide.visual==="rna"&&<div className="rna-badge">U <span>փոխարինում է</span> T</div>}
        </div>
        <div className="visual-footer"><span className="live-dot"/> <span>ԻՆՏԵՐԱԿՏԻՎ ՄՈԼԵԿՈՒԼԱՅԻՆ ՄՈԴԵԼ</span><span>Քաշիր՝ պտտելու համար</span></div>
      </div>
    </section>

    <footer className="bottombar">
      <div className="slide-index"><b>{String(slideIndex+1).padStart(2,"0")}</b><span>/ 15</span><div className="mini-progress"><i style={{width:((slideIndex+1)/15*100)+"%"}}/></div></div>
      <div className="bottom-center"><span>ԴՆԹ ԵՎ ՌՆԹ</span><i/> <span>ԻՆՏԵՐԱԿՏԻՎ ՈՒՍՈՒՄՆԱՍԻՐՈՒԹՅՈՒՆ</span></div>
      <div className="nav-buttons"><button onClick={()=>go(slideIndex-1)} disabled={slideIndex===0} aria-label="Նախորդ սլայդ">←</button><button onClick={()=>go(slideIndex+1)} disabled={slideIndex===14} aria-label="Հաջորդ սլայդ">→</button></div>
    </footer>

    {lab&&<div className="lab-overlay"><div className="lab-header"><div><span className="eyebrow">INTERACTIVE MOLECULAR STUDIO</span><h2>3D մոլեկուլային լաբորատորիա</h2><p>Ընտրիր հիմքը, պտտիր մոդելը և ուսումնասիրիր կառուցվածքը։</p></div><button className="icon-button close-lab" onClick={()=>setLab(false)} aria-label="Փակել լաբորատորիան">×</button></div><div className="lab-workspace"><div className="lab-controls"><span className="eyebrow">ՄՈԴԵԼԻ ՏԵՍԱԿԸ</span>{[{id:"dna",label:"ԴՆԹ երկպարույր"},{id:"rna",label:"ՌՆԹ շղթա"},{id:"pair",label:"Հիմքերի զույգ"},{id:"base",label:"Մեկ հիմք"}].map(m=><button key={m.id} className={modelMode===m.id?"lab-mode active":"lab-mode"} onClick={()=>setModelMode(m.id)}><span>{m.id==="dna"?"⌘":m.id==="rna"?"〰":m.id==="pair"?"⇄":"◉"}</span>{m.label}<i>→</i></button>)}<span className="eyebrow base-title">ԱԶՈՏԱՅԻՆ ՀԻՄՔԵՐ</span><div className="lab-bases">{(["A","T","G","C","U"] as Base[]).map(b=><button key={b} className={base===b?"active":""} onClick={()=>{setBase(b);if(b==="U")setModelMode("rna");else if(modelMode==="rna")setModelMode("pair");}} style={{"--base-color":baseInfo[b].color} as React.CSSProperties}>{b}</button>)}</div><div className="base-detail"><span style={{background:baseInfo[base].color}}/ ><div><b>{base} · {baseInfo[base].name}</b><small>{baseInfo[base].kind}</small><p>{baseInfo[base].detail}</p></div></div><p className="muted tiny">Մոդելները ուսումնական սխեմատիկ պատկերներ են և չեն ներկայացնում ատոմների ճշգրիտ չափերն ու քիմիական երկրաչափությունը։</p></div><div className="lab-canvas"><MoleculeScene mode={modelMode} selectedBase={base}/><div className="canvas-tip">Քաշիր՝ պտտելու համար · Մկնիկի անիվ՝ մեծացնելու համար</div></div></div><div className="lab-bottom"><span><i className="live-dot"/> 3D տեսարանն ակտիվ է</span><button className="text-button" onClick={()=>{setModelMode("dna");setBase("A");}}>Վերականգնել տեսարանը ↺</button></div></div>}

    <div className="keyboard-hint"><kbd>←</kbd><kbd>→</kbd><span>նավարկում</span><kbd>F</kbd><span>լիաէկրան</span></div>
  </main>;
}
