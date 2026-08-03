<script lang="ts">
  import type { OracleEvent } from '$lib/types';
  import { base } from '$app/paths';
  let { data } = $props();
  let market = $state<'ALL'|'NASDAQ'|'KOSPI'>('ALL');
  let result = $state<'ALL'|'OPPOSITE'|'SAME'>('ALL');
  let visibleCount = $state(12);
  let events = $derived((data.events as OracleEvent[]).filter((e)=> (market==='ALL'||e.market===market)&&(result==='ALL'||e.outcome===result)).sort((a,b)=>new Date(b.publishedAt).getTime()-new Date(a.publishedAt).getTime()));
  let opposite = $derived(events.filter((e)=>e.outcome==='OPPOSITE').length);
  let oppositeRate = $derived(events.length?opposite/events.length:0);
  let visible = $derived(events.slice(0,visibleCount));
  let nasdaqEvents = $derived((data.events as OracleEvent[]).filter((e)=>e.market==='NASDAQ').sort((a,b)=>new Date(a.publishedAt).getTime()-new Date(b.publishedAt).getTime()));
  let indicatorPoints = $derived.by(()=>{let nasdaq=100;const points=[{label:'START',nasdaq:100,jingu:50}];nasdaqEvents.forEach((event,index)=>{nasdaq*=1+event.marketReturn;const recent=nasdaqEvents.slice(Math.max(0,index-9),index+1);let sum=0,weights=0;recent.forEach((item,i)=>{const weight=i+1;sum+=(item.prediction==='DOWN'?1:item.prediction==='UP'?-1:0)*item.confidence*weight;weights+=weight});points.push({label:event.publishedAt.slice(0,10),nasdaq,jingu:50+50*(sum/(weights||1))})});return points});
  let indicatorPath = $derived(chartPath(indicatorPoints.map((p)=>p.jingu),0,100));
  let nasdaqPath = $derived.by(()=>{const values=indicatorPoints.map((p)=>p.nasdaq),min=Math.min(...values)-1,max=Math.max(...values)+1;return chartPath(values,min,max)});
  let latestIndicator = $derived(indicatorPoints.at(-1)?.jingu??50);
  const pct=(v:number)=>`${v>=0?'+':''}${(v*100).toFixed(2)}%`;
  const date=(v:string)=>new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(v));
  function chartPath(values:number[],min:number,max:number){return values.map((value,index)=>`${index?'L':'M'} ${40+index*(720/Math.max(1,values.length-1))} ${240-(value-min)/(max-min||1)*190}`).join(' ')}
</script>

<svelte:head><title>SINTAK — 신탁 이후 시장은 어땠을까?</title><meta name="description" content="영상의 시장 전망과 다음 거래일의 실제 움직임을 비교합니다." /></svelte:head>

<header><a class="brand" href={base+'/'}><b>S</b><span>SINTAK<small>신탁을 거꾸로 읽다</small></span></a><nav><a href="#timeline">신탁 연대기</a><a href="#method">계산 방법</a></nav><span class:live={data.source==='live'} class="status">● {data.source==='live'?'실제 데이터':'예시 데이터'}</span></header>

<main>
  <section class="hero"><div><p class="mono tag">EXPERIMENT 001 · 2025 — NOW</p><h1>신탁 이후,<br/><em>시장은 어땠을까?</em></h1><p>영상에서 말한 전망과 다음 거래일의 실제 시장을 나란히 봅니다.<br/>맞았는지, 반대로 갔는지 누구나 쉽게 확인할 수 있습니다.</p></div><div class="stamp"><strong>逆</strong><span>NOT FINANCIAL ADVICE</span></div></section>

  <section class="filters"><div><small>시장 선택</small>{#each ['ALL','NASDAQ','KOSPI'] as item}<button class:active={market===item} onclick={()=>market=item as typeof market}>{item==='ALL'?'전체':item}</button>{/each}</div><div><small>결과만 보기</small>{#each [['ALL','전체'],['OPPOSITE','반대로 감'],['SAME','예측대로 감']] as item}<button class:active={result===item[0]} onclick={()=>result=item[0] as typeof result}>{item[1]}</button>{/each}</div></section>

  <section class="summary"><div><span class="number">한눈에 보기</span><h2>영상 다음 날 시장은<br/><em>{(oppositeRate*100).toFixed(0)}%</em> 반대로 움직였습니다.</h2><p>확인한 영상 {events.length}개 중 {opposite}개에서 전망과 실제 시장 방향이 달랐습니다.</p></div><div class="meter"><div><span>예측대로</span><b>{((1-oppositeRate)*100).toFixed(0)}%</b></div><div class="bar"><i style:width={`${(1-oppositeRate)*100}%`}></i><i class="opposite" style:width={`${oppositeRate*100}%`}></i></div><div><span>반대로</span><b>{(oppositeRate*100).toFixed(0)}%</b></div></div></section>

  <section class="indicator-section"><div class="title"><div><span class="number">INDEX</span><h2>전인구 역신탁 지수 × 나스닥</h2></div><div class="indicator-value"><small>오늘의 역신탁 지수</small><b>{latestIndicator.toFixed(0)}</b><span>{latestIndicator>=60?'역발상 강세':latestIndicator<=40?'역발상 약세':'중립'}</span></div></div><p class="indicator-help">최근 10개 나스닥 전망을 최근성·판정 신뢰도로 가중했습니다. 50은 중립, 100에 가까울수록 전망을 뒤집었을 때 강세 신호입니다.</p><div class="chart-legend"><span><i></i>전인구 역신탁 지수 (좌축 0–100)</span><span><i></i>나스닥 정규화 지수 (첫날=100)</span></div><div class="index-chart"><svg viewBox="0 0 800 280" role="img" aria-label="전인구 역신탁 지수와 나스닥 비교 차트">{#each [0,25,50,75,100] as tick}<line x1="40" y1={240-tick*1.9} x2="760" y2={240-tick*1.9}/><text x="5" y={244-tick*1.9}>{tick}</text>{/each}<path class="nasdaq-line" d={nasdaqPath}/><path class="jingu-line" d={indicatorPath}/>{#each indicatorPoints as point,index}<circle cx={40+index*(720/Math.max(1,indicatorPoints.length-1))} cy={240-point.jingu*1.9} r="4"><title>{point.label} · 역신탁 {point.jingu.toFixed(0)} · 나스닥 {point.nasdaq.toFixed(1)}</title></circle>{/each}</svg>{#if nasdaqEvents.length<2}<div class="chart-empty">나스닥 신탁 데이터가 더 쌓이면 추세선이 나타납니다.</div>{/if}</div></section>

  <section class="timeline-section" id="timeline"><div class="title"><div><span class="number">01</span><h2>신탁 연대기</h2></div><p>최신 영상부터 · 매일 자동 갱신{data.updatedAt?` · ${data.updatedAt.slice(0,10)}`:''}</p></div>
    <div class="grid">{#each visible as event}
      <article><a class="thumb" href={event.videoUrl} target="_blank"><img src={event.thumbnailUrl} alt={`${event.title} 썸네일`}/><span>▶ 영상 보기</span></a><div class="card-body"><div class="meta"><time>{date(event.publishedAt)}</time><span>{event.market}</span></div><h3>{event.title}</h3><p class="reason">“{event.rationale}”</p><div class="compare"><div><small>영상의 전망</small><b class:up={event.prediction==='UP'} class:down={event.prediction==='DOWN'}>{event.prediction==='UP'?'▲ 오를 것':'▼ 내릴 것'}</b></div><i>→</i><div><small>실제 시장</small><b class:up={event.actual==='UP'} class:down={event.actual==='DOWN'}>{event.actual==='UP'?'▲ 올랐음':'▼ 내렸음'} {pct(event.marketReturn)}</b></div></div><div class:opposite={event.outcome==='OPPOSITE'} class="verdict">{event.outcome==='OPPOSITE'?'↔ 신탁과 반대로 움직임':'✓ 신탁대로 움직임'}</div></div></article>
    {/each}</div>{#if events.length>visibleCount}<button class="more" onclick={()=>visibleCount+=12}>이전 신탁 12개 더 보기 ↓</button>{/if}
  </section>

  <section class="explain" id="method"><span class="number">계산 방법</span><h2>복잡한 공식 없이,<br/>두 방향만 비교합니다.</h2><div>{#each [['01','전망 판정','영상 게시 당시 제목·설명으로 상승·하락 전망을 판정합니다.'],['02','다음 장 연결','게시 후 처음 열리는 해당 시장 거래일을 찾습니다.'],['03','실제 방향 확인','그 거래일의 시가와 종가를 비교해 상승·하락을 확인합니다.'],['04','둘을 비교','두 방향이 다르면 ‘반대로’, 같으면 ‘예측대로’로 표시합니다.']] as step}<article><b>{step[0]}</b><h3>{step[1]}</h3><p>{step[2]}</p></article>{/each}</div></section>
</main>
<footer><span>SINTAK · BACKTEST LAB</span><p>오락 및 연구 목적의 비공식 프로젝트이며 투자 권유가 아닙니다.</p><span>SEOUL, KR</span></footer>
