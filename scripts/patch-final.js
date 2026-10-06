const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: node patch-final.js <extension dir>'); process.exit(1); }
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const write = (f, s) => fs.writeFileSync(path.join(dir, f), s);

// ---- 1. background.js ----
let bg = read('background.js');

// 1a. horizontal candidate window (2 call sites)
const vCount = bg.split('vertical:!0').length - 1;
if (vCount !== 2) { console.error('ABORT: vertical:!0 count ' + vCount + ' (expected 2)'); process.exit(1); }
bg = bg.split('vertical:!0').join('vertical:__zwyVertical');

// 1b. runtime config overlay helper, prepended as a classic-script top-level function
if (bg.startsWith('function __zwyApply')) { console.error('ABORT: already patched'); process.exit(1); }
const helper = [
  'var __zwyVertical=true;',
  'var __zwyPairMap={"《":"》","【":"】","（":"）","“":"”","‘":"’","「":"」","『":"』"};',
  'var __zwyLastPairClose=null;',
  'function __zwyHandleCommit(text,ctxId,pairEnabled){',
  '  if(!pairEnabled||!text||typeof text!=="string"){__zwyLastPairClose=null;return text;}',
  '  if(__zwyLastPairClose&&text===__zwyLastPairClose){',
  '    try{chrome.input.ime.sendKeyEvents({contextID:ctxId,keyData:[{type:"keydown",key:"ArrowRight",code:"ArrowRight",keyCode:39},{type:"keyup",key:"ArrowRight",code:"ArrowRight",keyCode:39}]});}catch(e){}',
  '    __zwyLastPairClose=null;',
  '    return null;',
  '  }',
  '  var lastChar=text.slice(-1);',
  '  if(lastChar in __zwyPairMap){',
  '    var closeChar=__zwyPairMap[lastChar];',
  '    __zwyLastPairClose=closeChar;',
  '    setTimeout(function(){',
  '      try{chrome.input.ime.sendKeyEvents({contextID:ctxId,keyData:[{type:"keydown",key:"ArrowLeft",code:"ArrowLeft",keyCode:37},{type:"keyup",key:"ArrowLeft",code:"ArrowLeft",keyCode:37}]});}catch(e){}',
  '    },10);',
  '    return text+closeChar;',
  '  }',
  '  __zwyLastPairClose=null;',
  '  return text;',
  '}',
  'function __zwyApply(e,t){try{',
  '__zwyVertical=(t.horizontal!==true);',
  'this.__zwyPairPunct=(t.pairPunct!==false);',
  'e.translator=e.translator||{};',
  'if(t.enableCorrection===true)e.translator.enable_correction=true;',
  'else if(t.enableCorrection===false)e.translator.enable_correction=false;',
  'else if(!("enable_correction" in e.translator))e.translator.enable_correction=true;',
  'var setReset=function(name,on){',
  '  if(!Array.isArray(e.switches))return;',
  '  var it=null;',
  '  for(var i=0;i<e.switches.length;i++){var s=e.switches[i];if(s&&s.name===name){it=s;break;}}',
  '  if(!it){it={name:name};e.switches.push(it);}',
  '  it.reset=on?1:0;',
  '};',
  'var sm=(e.translator.simplifier&&e.translator.simplifier.option_name)||"zh_trad";',
  'if(t.zhTrad==="trad"||t.zhTrad==="simp"){',
  '  var wantTrad=(t.zhTrad==="trad");var doneZh=false;',
  '  if(Array.isArray(e.switches)){',
  '    var zhsw=e.switches.find(function(x){return x&&x.name===sm;});',
  '    if(zhsw){zhsw.reset=wantTrad?1:0;doneZh=true;}',
  '    if(!doneZh){var grp=e.switches.find(function(x){return x&&Array.isArray(x.options)&&x.options.some(function(o){return String(o).indexOf("s2")===0;});});',
  '      if(grp){var idx=grp.options.map(String).indexOf(wantTrad?"s2t":"s2s");grp.reset=idx>=0?idx:(wantTrad?1:0);doneZh=true;}}',
  '  }',
  '}',
  'if(t.emoji==="on")setReset("emoji",true);',
  'else if(t.emoji==="off")setReset("emoji",false);',
  'if(t.fullShape==="full")setReset("full_shape",true);',
  'else if(t.fullShape==="half")setReset("full_shape",false);',
  'var addBindings=function(list){',
  '  e.key_binder=e.key_binder||{};',
  '  if(!Array.isArray(e.key_binder.bindings))e.key_binder.bindings=[];',
  '  for(var j=0;j<list.length;j++){var nb=list[j];var dup=e.key_binder.bindings.some(function(b){return b.when===nb.when&&b.accept===nb.accept&&String(b.send)===String(nb.send);});',
  '    if(!dup)e.key_binder.bindings.push(nb);}',
  '};',
  'if(t.semicolonSecond===true)addBindings([{when:"has_menu",accept:"semicolon",send:2},{when:"has_menu",accept:"apostrophe",send:3}]);',
  'if(t.bracketPaging===true)addBindings([{when:"paging",accept:"bracketleft",send:"Page_Up"},{when:"has_menu",accept:"bracketright",send:"Page_Down"}]);',
  'addBindings([{when:"has_menu",accept:"Left",send:"Up"},{when:"has_menu",accept:"Right",send:"Down"}]);',
  'if(e.speller&&typeof e.speller.alphabet==="string")e.speller.alphabet=e.speller.alphabet.split("").filter(function(c){return c<"0"||c>"9";}).filter(function(c){return c!=="/"&&c!=="\\\\";}).join("");',
  'if(e.punctuator&&e.punctuator.half_shape){',
  '  e.punctuator.half_shape["/"]="、";',
  '  e.punctuator.half_shape["\\\\"]="、";',
  '  e.punctuator.half_shape["$"]="￥";',
  '  e.punctuator.half_shape["~"]="～";',
  '}',
  'if(e.punctuator&&e.punctuator.full_shape){',
  '  e.punctuator.full_shape["/"]="、";',
  '  e.punctuator.full_shape["\\\\"]="、";',
  '  e.punctuator.full_shape["$"]="￥";',
  '  e.punctuator.full_shape["~"]="～";',
  '}',
  'if(t.pairPunct!==false&&e.punctuator){',
  '  if(e.punctuator.half_shape){e.punctuator.half_shape[\'"\']="“";e.punctuator.half_shape["\'"]="‘";}',
  '  if(e.punctuator.full_shape){e.punctuator.full_shape[\'"\']="“";e.punctuator.full_shape["\'"]="‘";}',
  '}',
  '}catch(ex){console.error("__zwyApply failed",ex)}}',
].join('\n');
bg = helper + '\n' + bg;

// 1c. call the helper right after the schema yaml is parsed (statement position, unique anchor)
const anchor = 'h=ga(l);if(this.schemaAlphabet=';
if (bg.split(anchor).length - 1 !== 1) { console.error('ABORT: anchor not unique'); process.exit(1); }
bg = bg.replace(anchor, 'h=ga(l);__zwyApply(h,n);this.__zwyTab=(n.tabFuzhuma===true);this.__zwySchema=(n.schema);this.__zwyPinyinWindow=(n.pinyinInWindow!==false);if(this.schemaAlphabet=');
write('background.js', bg);

// 1d. Tab keycode: Tab was missing from the special-keys table, so it never
// reached the engine and key_binder could not bind it ("Unhandled key Tab").
const tabAnchor = 'Qc={ArrowUp:65362,';
if (bg.split(tabAnchor).length - 1 !== 1) { console.error('ABORT: special keys table anchor not found/unique'); process.exit(1); }
bg = bg.replace(tabAnchor, 'Qc={Tab:65289,ArrowUp:65362,');


// 1f. Reorder and adapt CandidateWindow for robust horizontal rendering
const cwOld = 'if(w.menu.candidates.length>0){if(p.push(this.setCandidateWindowProperties(n,{visible:!0,cursorVisible:!0,auxiliaryTextVisible:!0,pageSize:w.menu.pageSize,auxiliaryText:chrome.i18n.getMessage("candidate_page",(w.menu.pageNumber+1).toString())+(w.menu.isLastPage?chrome.i18n.getMessage("candidate_page_last"):""),windowPosition:"composition",vertical:__zwyVertical})),this.context!=null){const _=this.context.contextID;p.push(new Promise((x,b)=>{chrome.input.ime.setCandidates({contextID:_,candidates:w.menu.candidates.map((C,F)=>({candidate:C.text,id:F,label:w.selectLabels[F]||(F+1).toString()}))},this.imeCallDone("setCandidates",x,b))})),p.push(new Promise((x,b)=>{chrome.input.ime.setCursorPosition({contextID:_,candidateID:w.menu.highlightedCandidateIndex},this.imeCallDone("setCursorPosition",x,b))}))}}';
const cwNew = 'if(w.menu.candidates.length>0){if(this.context!=null){const _=this.context.contextID;p.push(new Promise((x,b)=>{chrome.input.ime.setCandidates({contextID:_,candidates:w.menu.candidates.map((C,F)=>({candidate:__zwyVertical?C.text:\"\",id:F,label:w.selectLabels[F]||(F+1).toString(),annotation:__zwyVertical?(C.comment||\"\"):((F===0&&this.__zwyPinyinWindow&&this.__zwyPreedit?this.__zwyPreedit+\" | \":\"\")+(F+1)+\". \"+C.text)}))},this.imeCallDone(\"setCandidates\",x,b))})),p.push(new Promise((x,b)=>{chrome.input.ime.setCursorPosition({contextID:_,candidateID:w.menu.highlightedCandidateIndex},this.imeCallDone(\"setCursorPosition\",x,b))}))}p.push(this.setCandidateWindowProperties(n,{visible:!0,cursorVisible:!0,auxiliaryTextVisible:__zwyVertical?(this.__zwyPinyinWindow?!!this.__zwyPreedit:!0):!1,pageSize:__zwyVertical?w.menu.pageSize:Math.max(1,Math.min(w.menu.pageSize,w.menu.candidates.length)),auxiliaryText:__zwyVertical?(this.__zwyPinyinWindow?(this.__zwyPreedit||void 0):(chrome.i18n.getMessage(\"candidate_page\",(w.menu.pageNumber+1).toString())+(w.menu.isLastPage?chrome.i18n.getMessage(\"candidate_page_last\"):\"\"))):void 0,windowPosition:this.__zwyPinyinWindow?\"cursor\":__zwyVertical?\"composition\":\"cursor\",vertical:__zwyVertical}))}';

if (bg.includes(cwOld)) {
  bg = bg.replace(cwOld, cwNew);
  console.log('1f CandidateWindow ordering & horizontal properties patched successfully');
} else {
  console.error('cwOld block not matched in background.js');
  process.exit(1);
}

// 1e. Tab interception INSIDE the session mutex (at the real processKey call):
// Tab → Esc (clears any composition) → grave (96 = XK_grave), which starts
// wanxiang's NATIVE reverse-lookup mode (its pattern is start-anchored on `).
// The repaint afterwards shows the reverse preedit/candidates natively.
const procAnchor = 'x=await s.processKey(l,o)';
if (bg.split(procAnchor).length - 1 !== 1) { console.error('ABORT: processKey anchor not found/unique'); process.exit(1); }
bg = bg.replace(procAnchor, 'if(l===65289&&o===0&&this.__zwyTab&&this.__zwySchema==="wanxiang"){this.printErr("[zwy] Tab -> 辅码反查");const curCtx=await s.getContext();if(curCtx&&curCtx.composition&&curCtx.composition.preedit&&curCtx.composition.preedit.indexOf("`")>=0){return!0;}l=96}x=await s.processKey(l,o)');

// 1g. Direct commit on candidate click (space key press after select)
const oldClick = 'await s.actionCandidate(n,"select",t),!await this.commitIfAvailable(s,o,l,h)';
const newClick = 'await s.actionCandidate(n,"select",t),await s.processKey(32,0),!await this.commitIfAvailable(s,o,l,h)';
if (bg.includes(oldClick)) {
  bg = bg.replace(oldClick, newClick);
  console.log('1g candidate click direct commit patched');
} else {
  console.error('oldClick not matched');
  process.exit(1);
}


// 1h. Pair punctuation commit & auto-pairing
const commitOld = ';if(l){const h=t.contextID;return await new Promise((p,w)=>{chrome.input.ime.commitText({contextID:h,text:l.text},this.imeCallDone("commitText",p,w))}),await this.invalidateCandidateCache(),!0}return!1}';
const commitNew = ';if(l){const h=t.contextID;const cStr=__zwyHandleCommit(l.text,h,this.__zwyPairPunct!==!1);if(!cStr)return await this.invalidateCandidateCache(),!0;return await new Promise((p,w)=>{chrome.input.ime.commitText({contextID:h,text:cStr},this.imeCallDone("commitText",p,w))}),await this.invalidateCandidateCache(),!0}return!1}';
if (bg.includes(commitOld)) {
  bg = bg.replace(commitOld, commitNew);
  console.log('1h pair punctuation commit patched');
} else {
  console.error('commitOld not matched in bg');
  process.exit(1);
}

// 1i. FeedKey backspace pair deletion
const feedOld = 'feedKey(n){const t=n.type=="keyup";if(t){if(this.pendingSwitchKeyUp===n.code)';
const feedNew = 'feedKey(n){const t=n.type=="keyup";if(!t&&n.code==="Backspace"&&__zwyLastPairClose&&this.context){try{chrome.input.ime.deleteSurroundingText({contextID:this.context.contextID,offset:0,length:1});}catch(e){}__zwyLastPairClose=null;}else if(!t&&n.code!=="ShiftLeft"&&n.code!=="ShiftRight"&&n.code!=="AltLeft"&&n.code!=="AltRight"&&n.code!=="ControlLeft"&&n.code!=="ControlRight"){__zwyLastPairClose=null;}if(t){if(this.pendingSwitchKeyUp===n.code)';
if (bg.includes(feedOld)) {
  bg = bg.replace(feedOld, feedNew);
  console.log('1i feedKey backspace pair deletion patched');
} else {
  console.error('feedOld not matched in bg');
  process.exit(1);
}

// 1j. Sogou-style pinyin-in-window: capture the preedit into __zwyPreedit and
// keep the inline composition empty when enabled (settings.pinyinInWindow).
const compAnchor = 'setComposition(n){return new Promise((t,s)=>{';
if (bg.split(compAnchor).length - 1 !== 1) { console.error('ABORT: setComposition anchor not found/unique'); process.exit(1); }
bg = bg.replace(compAnchor, 'setComposition(n){if(this.__zwyPinyinWindow&&n){this.__zwyPreedit=n.text||"";if(n.text)n={contextID:n.contextID,cursor:0,selectionStart:0,selectionEnd:0,text:""}}return new Promise((t,s)=>{');

write('background.js', bg);

// ---- verify ----
const after = read('background.js');
console.log('vertical dynamic   :', (after.match(/vertical:__zwyVertical/g) || []).length, '(want 2)');
console.log('Tab keycode added  :', after.includes('Qc={Tab:65289,'));
console.log('helper prepended   :', after.startsWith('var __zwyVertical=true;'));
console.log('call injected      :', after.includes('__zwyApply(h,n);'));
console.log('tab binding        :', after.includes('tabFuzhuma===true'));
console.log('pinyin window      :', after.includes('__zwyPinyinWindow') && after.includes('__zwyPreedit'));

// 1k. Fuzzy-pinyin card: show for every schema (imported schemas like wanxiang
// lack the fuzzy_pinyin flag, which hid the card entirely).
const optChunk = fs.readdirSync(path.join(dir, 'chunks')).find((f) => /^options-.*\.js$/.test(f));
if (!optChunk) { console.error('ABORT: options chunk not found'); process.exit(1); }
let oc = read(path.join('chunks', optChunk));
const fuzzyNeedle = '?.fuzzy_pinyin&&';
const fuzzyCount = oc.split(fuzzyNeedle).length - 1;
if (fuzzyCount !== 1) { console.error('ABORT: fuzzy gate anchor count ' + fuzzyCount); process.exit(1); }
oc = oc.split(fuzzyNeedle).join('?.fuzzy_pinyin!==!1&&');
write(path.join('chunks', optChunk), oc);
console.log('fuzzy gate opened  :', path.join('chunks', optChunk));
console.log('panel embedded     :', read('options.html').includes('zwy-panel.js'));
console.log('panel js           :', fs.existsSync(path.join(dir, 'zwy-panel.js')));
console.log('no stray panel     :', !fs.existsSync(path.join(dir, 'zwy-panel.html')));
console.log('default schema     :', after.includes('const rr={schema:"aurora_pinyin"') ? 'aurora_pinyin (unchanged)' : 'CHANGED?!');

// ---- 2. embed the enhanced settings panel INTO the main options page ----
const jsPath = path.join(__dirname, 'zwy-panel.js');
let oh = read('options.html');
if (!oh.includes('zwy-panel.js')) {
  const fallbackCss = '<style>#zwy-block{font:14px/1.6 system-ui,\u0022Microsoft YaHei\u0022,system-ui,sans-serif;margin:16px 0}#zwy-card{padding:6px 20px}#zwy-block .zwy-row{display:flex;align-items:center;gap:16px;padding:12px 0;border-top:1px solid rgba(128,128,128,.16)}#zwy-block .zwy-row:first-of-type{border-top:none}#zwy-block .zwy-lb{flex:1}#zwy-block .zwy-lb p{margin:2px 0 0;color:gray;font-size:12px}#zwy-block select{font:inherit;padding:4px 10px;border-radius:8px}#zwy-block .zwy-btns{display:flex;gap:10px;align-items:center;padding:12px 0}#zwy-block button{font:inherit;padding:7px 16px;border-radius:10px;border:1px solid rgba(128,128,128,.5);cursor:pointer}#zwy-block #zwy-save{background:#e91e63;border-color:#e91e63;color:#fff;font-weight:600}#zwy-block #zwy-status{color:gray;font-size:12px}</style>\n  ';
  oh = oh.replace('</body>', fallbackCss + '<script src="zwy-panel.js"></script>\n  </body>');
  write('options.html', oh);
}
fs.writeFileSync(path.join(dir, 'zwy-panel.js'), fs.readFileSync(jsPath, 'utf8'));

// 2.5 version stamp
const manPath = path.join(dir, 'manifest.json');
const man = JSON.parse(fs.readFileSync(manPath, 'utf8'));
man.version = '1.0.3';
man.author = '78660';
fs.writeFileSync(manPath, JSON.stringify(man, null, 2));


// ---- 3. rename extension / input method so it sits alongside the store version ----
const locDir = path.join(dir, '_locales');
for (const loc of fs.readdirSync(locDir)) {
  const p = path.join(locDir, loc, 'messages.json');
  if (!fs.existsSync(p)) continue;
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  const suffix = loc.startsWith('zh') ? '（横排）' : ' (Horizontal)';
  let changed = false;
  for (const k of ['extension_name', 'input_method_name']) {
    if (j[k] && j[k].message && !j[k].message.includes('横排') && !j[k].message.includes('Horizontal')) {
      j[k].message += suffix;
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(p, JSON.stringify(j, null, 2));
}

