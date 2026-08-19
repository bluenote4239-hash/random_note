(function(){'use strict';
if(!window.MolkkyContent)throw Error('MolkkyContent missing');
MolkkyContent.register({
  id:'prototype-v59',version:59,label:'LOCAL MATCH PROTOTYPE v59',
  images:{
    stage:{id:'seaside90s',name:'SEASIDE 90s ARENA',background:{src:'stages/seaside90s/images/approved/kof90s_marina/background.webp',fit:'stretch',anchorX:.5,anchorY:.5}},
    character:{id:'gal01',name:'Mölkky Gal',voiceSet:'gal01',theme:'pink-blue-yellow',expressions:{full:'characters/gal01/full.webp',normal:'characters/gal01/normal.webp',joy:'characters/gal01/joy.webp',surprise:'characters/gal01/surprise.webp',thinking:'characters/gal01/thinking.webp',regret:'characters/gal01/regret.webp'}},
    skittles:Array.from({length:12},function(_,i){return'objects/skittles/official90s/images/pin_'+String(i+1).padStart(2,'0')+'.webp?v=31'}),
    molkkaari:'objects/field/official/images/molkkaari.webp?v=31'
  },
  audio:{
    bgm:{id:'ievan_v29',src:'audio/bgm/ievan_v29/ievan_v29.wav',volume:.46,loop:true},
    se:{id:'default',wood:['audio/se/default/wood_hit_01.wav','audio/se/default/wood_hit_02.wav','audio/se/default/wood_hit_03.wav'],whoosh:'audio/se/default/throw_whoosh.wav',land:'audio/se/default/land_01.wav'},
    voices:{id:'gal01',volume:.82,recentWindow:2,items:[
      {caption:'イェイ',src:'audio/voices/gal01/yeah_01.wav'},{caption:'イェァー！',src:'audio/voices/gal01/yeah_03.wav'},
      {caption:'ナイス♪',src:'audio/voices/gal01/nice_01.wav'},{caption:'ナイス',src:'audio/voices/gal01/nice_02.wav'},
      {caption:'やった♪',src:'audio/voices/gal01/yatta_01.wav'},{caption:'やりぃ♪',src:'audio/voices/gal01/yarii_01.wav'},
      {caption:'すごい！',src:'audio/voices/gal01/sugoi_01.wav'},{caption:'さっすがぁ！',src:'audio/voices/gal01/sassugaa_02.wav'}
    ]}
  },
  text:{
    page:{title:'MÖLKKY GAL ARCADE — LOCAL MATCH v60',badge:'LOCAL MATCH v60'},
    ui:{scoreLabel:'SCORE',targetLabel:'TARGET',targetValue:'50 JUST',miss:'MISS × {misses}',turn:'TURN {turn}',power:'POWER',accuracy:'ACCURACY',statusTip:'スキットルを選択 / 画面タップ：POWER → ACCURACY → THROW',ready:'READY',coachTag:'GAL実況・うるさめ',initialBubble:'ナイスー！'},
    setup:{kicker:'MATCH SETUP',title:'対戦設定',rule:'盤面共有・50点ジャスト・公式得点',cpuChoice:'CPU ふつう弱め',humanChoice:'人間2P',start:'対戦開始',change:'名前を変える',replay:'同じ2人でもう一戦',oneSide:'1P',twoSide:'2P',cpuSide:'CPU',versus:'VS'},
    match:{player1:'PLAYER 1',player2:'PLAYER 2',cpuName:'CPU ふつう弱め',cpuBattle:'CPU\nBATTLE',localVersus:'LOCAL\nVERSUS',throwCount:'THROW {count}',nextThrow:'NEXT THROW',sideThrow:'{side}P THROW',cpuThinking:'CPU THINKING',cpuThought:'CPU、いちおう考え中……',cpuTarget:'{target}番を狙うみたい！',opening:'{player}から！ぶっ倒してこー！',turnSafe:'{player}の番！狙ってこ！',turnDanger:'{player}の番！次は外せないよ！',winTitle:'{winner} WIN!',disqualified:'{loser}が3投連続ミスで失格　{winnerScore} - {loserScore}',perfect:'{winner}が50点ジャスト！　{p1} {p1Score} - {p2Score} {p2}'},
    game:{resetCoach:'ぶっ倒してこー！',power:'POWER',accuracy:'ACCURACY',throw:'THROW!',missFlash:'MISS!!',missFirst:'あー……惜しー！',missDanger:'それ外したらヤバくない？集中〜！',missCrisis:'3投目ミス危機',disqualifiedTitle:'DISQUALIFIED',disqualifiedText:'3投連続0本で失格',singleHit:'ナイスー！',multiHit:'お、巻き込んだ！いいじゃん！',longShot:'LONG SHOT!!',smash:'SMASH!!',chain:'CHAIN!!',points:'+{points} POINT',fallenLog:'FALLEN {pins} +{points}',over50:'OVER 50 → 25',over50Coach:'欲張ったー！25点戻し！',perfectCutin:'PERFECT 50!!',perfectCoach:'うっま！！！最高ー！！',perfectTitle:'PERFECT 50!',perfectText:'50点ジャスト！'},
    assist:{missMark:'スカッ…',impact:'IMPACT!!',hitStrong:'ドッカーン!!',hitMulti:'バキバキィ!!',hitLong:'ズギャァン!!',hitSingle:'ズバァン!!',finalTitle:'FINAL APPROACH',remaining:'あと {points}点！',finishTarget:'{points}番＝フィニッシュターゲット',aiming:'{targets}番を狙撃中',chooseNumber:'番号を選べ',finishCoach:'あと{points}点！{points}番で決めるのね！',aimCoach:'あと{points}点！{targets}番を狙うのね！',pairCoach:'{first}番……いや{second}番？どっち狙い！？',singleCoach:'{target}番を狙うのね！',routeCoach:'あと{points}点！フィニッシュルート探そ！'},
    effects:{menace:'ゴ ゴ ゴ ゴ ゴ…',lockOn:'LOCK ON!',target:'TARGET {target}',throwMain:'いっけぇぇ!!',throwSub:'FULL POWER THROW',missMain:'ズコォ…',missSub:'NO IMPACT',scoreHuge:'ドッッカァァン!!',scoreMulti:'バギャギャァ!!',scoreLong:'ズギャァァン!!',scoreSingle:'ドゴォン!!',megaImpact:'MEGA CHAIN IMPACT!!',woodImpact:'WOODEN IMPACT!!'}
  }
});
})();
