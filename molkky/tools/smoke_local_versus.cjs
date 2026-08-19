const {chromium}=require('playwright');

(async()=>{
  const url=process.argv[2]||'http://127.0.0.1:4173/molkky/experiments/local_versus/index.html?v=61';
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  const problems=[];
  page.on('pageerror',error=>problems.push('pageerror: '+error.message));
  page.on('console',message=>{if(message.type()==='error')problems.push('console: '+message.text())});
  page.on('requestfailed',request=>problems.push('request: '+request.url()+' '+request.failure().errorText));
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.getElementById('game').dataset.versusSelftest==='pass',{timeout:10000});
  const initial=await page.evaluate(()=>({
    contentPack:MolkkyContent.activeId,
    contentVersion:document.getElementById('game').dataset.contentVersion,
    background:document.getElementById('game').dataset.backgroundAsset,
    backgroundReady:MolkkyContentRuntime.backgroundImage.naturalWidth>0,
    fileCount:MolkkyContent.files().length,
    selftest:document.getElementById('game').dataset.versusSelftest,
    coreLog:document.getElementById('log').textContent,
    p1:document.getElementById('playerInput0').value,
    p2:document.getElementById('playerInput1').value,
    p2Disabled:document.getElementById('playerInput1').disabled,
    styles:MolkkyThrowStyles.list().map(style=>style.id),
    selectedStyle:MolkkyThrowStyles.current().id,
    throwingMolkky:MolkkyThrowView.assetReady()
  }));
  if(initial.contentPack!=='prototype-v59'||initial.contentVersion!=='59'||!initial.backgroundReady||initial.fileCount<26||initial.selftest!=='pass'||!initial.p2Disabled||initial.styles.join(',')!=='soft,standard,smash'||initial.selectedStyle!=='standard'||!initial.throwingMolkky)throw Error('initial content/setup check failed '+JSON.stringify(initial));
  await page.click('#matchSetupForm button[type="submit"]');
  await page.waitForFunction(()=>LocalVersus.snapshot().started&&LocalVersus.snapshot().activePlayer===1);
  await page.click('#throwStyles [data-throw-style="soft"]');
  const target=await page.evaluate(()=>{const pin=pins.find(item=>item.n===4),point=proj(pin.x,pin.y),rect=c.getBoundingClientRect();return{x:rect.left+point.x*rect.width/W,y:rect.top+point.y*rect.height/H}});
  await page.mouse.move(target.x,target.y);
  await page.waitForFunction(()=>document.getElementById('game').dataset.targetZoom==='4');
  await page.mouse.click(target.x,target.y);
  await page.waitForTimeout(320);
  await page.mouse.click(target.x,target.y);
  await page.waitForTimeout(450);
  await page.mouse.click(target.x,target.y);
  await page.waitForFunction(()=>LocalVersus.snapshot().activePlayer===1&&LocalVersus.snapshot().throwCount>=3,{timeout:15000});
  const result=await page.evaluate(()=>({
    match:LocalVersus.snapshot(),
    bgm:ContentFileBgm.info(),
    selftest:document.getElementById('game').dataset.versusSelftest,
    checks:document.getElementById('game').dataset.versusChecks,
    recovery:document.getElementById('game').dataset.boardRecovery,
    contentPack:document.getElementById('game').dataset.contentPack,
    selectedStyle:MolkkyThrowStyles.current().id,
    throwingMolkky:document.getElementById('game').dataset.throwingMolkky,
    targetZoom:document.getElementById('game').dataset.targetZoom
  }));
  if(result.match.activePlayer!==1||result.match.throwCount<3||!result.match.boardReady||result.match.throwStyle!=='soft'||result.selectedStyle!=='soft'||result.throwingMolkky!=='ready'||result.targetZoom!=='none'||result.bgm.mode!=='content-file-buffer-loop'||result.bgm.pack!=='prototype-v59'||result.selftest!=='pass'||problems.length)throw Error('play check failed '+JSON.stringify({result,problems}));
  await page.screenshot({path:process.env.MOLKKY_SCREENSHOT||'molkky-v61-smoke.png',fullPage:true});
  console.log(JSON.stringify({initial,result,problems},null,2));
  await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1});
