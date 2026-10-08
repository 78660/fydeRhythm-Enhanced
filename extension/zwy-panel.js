(async function () {
  const V = 'v1.0.6';
  console.log('[zwy] ' + V + ' 增强设置脚本已加载');

  const DEFAULTS = {
    enableCorrection: true,
    pairPunct: true,
    zhTrad: 'follow',
    emoji: 'follow',
    fullShape: 'follow',
    semicolonSecond: false,
    bracketPaging: false,
    tabFuzhuma: false,
    horizontal: false,
    pinyinInWindow: true,
    keyGateEnabled: false,
    keyGateMod: 'MetaLeft',
    keyGateCodes: 'BracketLeft,BracketRight',
    repeatImmunity: false,
    phantomClean: false,
    capsToAscii: true,
  };
  const $ = (id) => document.getElementById(id);

  let zwyKeyList = [];
  let zwyRecording = false;
  let zwyKeyHandler = null;
  let zwyKeyListEl = null;
  let zwyGateCode = 'MetaLeft';
  let zwyGateRec = false;
  let zwyGateHandler = null;
  let zwyGateEl = null;
  let zwyReloadTimer = null;

  function renderList() {
    if (!zwyKeyListEl) return;
    zwyKeyListEl.innerHTML = '';
    for (const code of zwyKeyList) {
      const chip = document.createElement('span');
      chip.className = 'zwy-keychip';
      const txt = document.createElement('span');
      txt.textContent = code;
      const del = document.createElement('button');
      del.textContent = '\u00d7';
      del.title = '\u5220\u9664';
      del.addEventListener('click', () => {
        zwyKeyList = zwyKeyList.filter(c => c !== code);
        renderList();
        applyChanges();
      });
      chip.appendChild(txt);
      chip.appendChild(del);
      zwyKeyListEl.appendChild(chip);
    }
    const add = document.createElement('button');
    add.className = 'zwy-addkey';
    add.textContent = zwyRecording ? '\u6309\u4e0b\u8981\u9501\u5b9a\u7684\u6309\u952e\uff08Esc \u53d6\u6d88\uff09' : '\uff0b \u6dfb\u52a0\u6309\u952e';
    add.addEventListener('click', () => { zwyRecording ? stopRecord() : startRecord(); });
    zwyKeyListEl.appendChild(add);
  }
  function startRecord() {
    if (zwyRecording) return;
    zwyRecording = true;
    renderList();
    zwyKeyHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') { stopRecord(); return; }
      if (e.code && zwyKeyList.indexOf(e.code) === -1) {
        zwyKeyList.push(e.code);
        renderList();
        applyChanges();
      }
      stopRecord();
    };
    window.addEventListener('keydown', zwyKeyHandler, true);
  }
  function stopRecord() {
    zwyRecording = false;
    if (zwyKeyHandler) { window.removeEventListener('keydown', zwyKeyHandler, true); zwyKeyHandler = null; }
    renderList();
  }
  function buildKeyList() {
    const wrap = document.createElement('div');
    wrap.className = 'zwy-keylist';
    zwyKeyListEl = wrap;
    renderList();
    return wrap;
  }
  function renderGateKey() {
    if (!zwyGateEl) return;
    zwyGateEl.innerHTML = '';
    const chip = document.createElement('span');
    chip.className = 'zwy-keychip';
    const txt = document.createElement('span');
    txt.textContent = zwyGateCode;
    chip.appendChild(txt);
    zwyGateEl.appendChild(chip);
    const btn = document.createElement('button');
    btn.className = 'zwy-addkey';
    btn.textContent = zwyGateRec ? '\u6309\u4e0b\u8981\u4f5c\u4e3a\u95e8\u63a7\u952e\u7684\u6309\u952e\uff08Esc \u53d6\u6d88\uff09' : '\u66f4\u6539';
    btn.addEventListener('click', () => { zwyGateRec ? stopGateRecord() : startGateRecord(); });
    zwyGateEl.appendChild(btn);
  }
  function startGateRecord() {
    if (zwyGateRec) return;
    zwyGateRec = true;
    renderGateKey();
    zwyGateHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') { stopGateRecord(); return; }
      if (e.code) {
        zwyGateCode = e.code;
        stopGateRecord();
        applyChanges();
      }
    };
    window.addEventListener('keydown', zwyGateHandler, true);
  }
  function stopGateRecord() {
    zwyGateRec = false;
    if (zwyGateHandler) { window.removeEventListener('keydown', zwyGateHandler, true); zwyGateHandler = null; }
    renderGateKey();
  }
  function buildGateKey() {
    const wrap = document.createElement('div');
    wrap.className = 'zwy-keylist';
    zwyGateEl = wrap;
    renderGateKey();
    return wrap;
  }

  async function getSettings() {
    const store = await chrome.storage.sync.get({ settings: {} });
    return store.settings || {};
  }
  async function saveSettings(patch) {
    const settings = await getSettings();
    Object.assign(settings, patch);
    await new Promise((res) => chrome.storage.sync.set({ settings }, res));
  }
  function currentValues() {
    return {
      horizontal: $('zwy-horizontal').value === 'on',
      tabFuzhuma: $('zwy-tabFuzhuma').checked,
      enableCorrection: $('zwy-enableCorrection').checked,
      pairPunct: $('zwy-pairPunct').checked,
      zhTrad: $('zwy-zhTrad').value,
      emoji: $('zwy-emoji').value,
      fullShape: $('zwy-fullShape').value,
      semicolonSecond: $('zwy-semicolonSecond').checked,
      bracketPaging: $('zwy-bracketPaging').checked,
      pinyinInWindow: $('zwy-pinyinWindow').checked,
      keyGateEnabled: $('zwy-keyGateEnabled').checked,
      keyGateMod: zwyGateCode,
      keyGateCodes: zwyKeyList.join(','),
      repeatImmunity: $('zwy-repeatImmunity').checked,
      phantomClean: $('zwy-phantomClean').checked,
      capsToAscii: $('zwy-capsToAscii').checked,
    };
  }
  function reloadEngine() {
    return new Promise((res) => {
      let done = false;
      const finish = () => { if (!done) { done = true; res(); } };
      setTimeout(finish, 8000);
      try {
        chrome.runtime.sendMessage({ id: Date.now(), type: 'ReloadRime', data: undefined, timestamp: Date.now() }, () => {
          void chrome.runtime.lastError;
          finish();
        });
      } catch (e) { finish(); }
    });
  }
  // 改动即存 + 去抖重载（连续调整只触发一次引擎重载）
  function applyChanges() {
    const vals = currentValues();
    if (typeof window !== 'undefined' && typeof window.__zwyChangeSettings === 'function') {
      window.__zwyChangeSettings(vals);
    } else {
      void (async () => { try { await saveSettings(vals); } catch (e) { console.error('[zwy] save failed', e); } })();
    }
  }

  function hydrate(s) {
    $('zwy-horizontal').value = s.horizontal === true ? 'on' : 'off';
    $('zwy-tabFuzhuma').checked = s.tabFuzhuma === true;
    $('zwy-enableCorrection').checked = s.enableCorrection !== false;
    $('zwy-pairPunct').checked = s.pairPunct !== false;
    $('zwy-zhTrad').value = s.zhTrad || DEFAULTS.zhTrad;
    $('zwy-emoji').value = s.emoji || DEFAULTS.emoji;
    $('zwy-fullShape').value = s.fullShape || DEFAULTS.fullShape;
    $('zwy-semicolonSecond').checked = s.semicolonSecond === true;
    $('zwy-bracketPaging').checked = s.bracketPaging === true;
    $('zwy-pinyinWindow').checked = s.pinyinInWindow !== false;
    $('zwy-keyGateEnabled').checked = s.keyGateEnabled === true;
    zwyGateCode = { Meta: 'MetaLeft', Alt: 'AltLeft', Ctrl: 'ControlLeft', Shift: 'ShiftLeft' }[s.keyGateMod] || s.keyGateMod || 'MetaLeft';
    zwyKeyList = (s.keyGateCodes || 'BracketLeft,BracketRight').split(',').map(x => x.trim()).filter(Boolean);
    $('zwy-repeatImmunity').checked = s.repeatImmunity === true;
    $('zwy-phantomClean').checked = s.phantomClean === true;
    $('zwy-capsToAscii').checked = s.capsToAscii !== false;
    renderList();
    renderGateKey();
  }

  // Find the visual card that contains a heading with the given text.
  function findCardByText(root, text) {
    const leaves = [...root.querySelectorAll('*')].filter(
      (el) => el.children.length === 0 && (el.textContent || '').trim().startsWith(text),
    );
    if (leaves.length === 0) return { card: null, heading: null };
    leaves.sort((a, b) => a.textContent.length - b.textContent.length);
    const heading = leaves[0];
    let el = heading;
    for (let i = 0; i < 10 && el && el !== root.parentElement; i++) {
      const cs = getComputedStyle(el);
      const w = el.getBoundingClientRect().width;
      if ((parseFloat(cs.borderRadius) >= 6 || parseFloat(el.style && el.style.borderRadius) >= 6 || cs.boxShadow !== 'none') && w > 300) {
        return { card: el, heading };
      }
      el = el.parentElement;
    }
    return { card: null, heading };
  }

  // Find the native per-setting row card (the card behind the 托盘 switch row).
  function findRowCard(root) {
    const label = [...root.querySelectorAll('*')].find(
      (el) => el.children.length === 0 && /托盘菜单|显示此方案/.test((el.textContent || '').trim()),
    );
    if (!label) return null;
    let el = label;
    for (let i = 0; i < 8 && el; i++) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (parseFloat(cs.borderRadius) >= 6 && r.height >= 40 && r.height <= 140) return el;
      el = el.parentElement;
    }
    return null;
  }

  function collectNative(root) {
    const dict = findCardByText(root, '字典包');
    const log = findCardByText(root, 'RIME 服务日志');
    const anchorCard = log.card || dict.card;
    const styleCard = dict.card || log.card || anchorCard;
    const headingEl = dict.heading || log.heading;
    const descEl = styleCard
      ? [...styleCard.querySelectorAll('*')].find(
          (el) => el.children.length === 0 && (el.textContent || '').trim().startsWith('导入 .txt'),
        )
      : null;
    const rowCard = findRowCard(root);
    const labelEl = [...root.querySelectorAll('*')].find(
      (el) => el.children.length === 0 && /托盘菜单|显示此方案/.test((el.textContent || '').trim()),
    ) || null;
    // Sample the native switch "on" color from a checked native switch.
    let trackOn = '#e91e63';
    const swInput = [...root.querySelectorAll('input[type=checkbox]')].find((i) => i.checked);
    if (swInput) {
      let el = swInput;
      for (let i = 0; i < 4 && el; i++) {
        el = el.parentElement;
        if (!el) break;
        const bgc = getComputedStyle(el).backgroundColor;
        if (bgc && bgc !== 'rgba(0, 0, 0, 0)' && !bgc.includes('255, 255, 255')) { trackOn = bgc; break; }
      }
    }
    return { anchorCard, styleCard, headingEl, descEl, rowCard, labelEl, trackOn };
  }

  function mkSelect(id, options) {
    const sel = document.createElement('select');
    sel.id = id;
    for (const [v, t] of options) {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = t;
      sel.appendChild(o);
    }
    return sel;
  }

  function mkSwitch(id) {
    const lb = document.createElement('label');
    lb.className = 'zwy-sw';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    const tr = document.createElement('span');
    tr.className = 'zwy-tr';
    const th = document.createElement('span');
    th.className = 'zwy-th';
    tr.appendChild(th);
    lb.appendChild(input);
    lb.appendChild(tr);
    return lb;
  }

  function buildBlock(n) {
    const block = document.createElement('div');
    block.id = 'zwy-block';

    const paper = document.createElement('div');
    paper.className = 'zwy-paper';

    const h = document.createElement('h3');
    h.id = 'zwy-title';
    h.textContent = '高级选项';
    paper.appendChild(h);

    const mkRow = (id, label, desc, control) => {
      const row = document.createElement('div');
      row.className = 'zwy-rowcard';
      const lb = document.createElement('div');
      lb.className = 'zwy-lb';
      const b = document.createElement('b');
      b.textContent = label;
      lb.appendChild(b);
      const d = document.createElement('p');
      d.className = 'zwy-desc-p';
      d.textContent = desc;
      lb.appendChild(d);
      row.appendChild(lb);
      row.appendChild(control);
      paper.appendChild(row);
    };

    mkRow(
      'zwy-horizontal',
      '候选窗方向（横排为实验）',
      '打破 ChromeOS 原生横排候选词隐形限制。选【横排】候选词水平一字排开，视野开阔；选【竖排】为传统纵向列表。',
      mkSelect('zwy-horizontal', [['off', '竖排（默认）'], ['on', '横排（实验）']])
    );
    mkRow(
      'zwy-pinyinWindow',
      '拼音进候选框（搜狗同款两行布局）',
      '【功能作用】打字时文本框内保持干净无拼音虚字，候选框顶部显示拼音串、下方显示候选词，选词后汉字直接上屏。【适用场景】喜欢搜狗输入法视觉体验、或在某些网页富文本编辑框中不希望拼音虚字干扰排版与光标定位时开启。',
      mkSwitch('zwy-pinyinWindow')
    );
    mkRow(
      'zwy-tabFuzhuma',
      'Tab 进入辅码反查（偏旁部首筛选）',
      '【功能作用】输入拼音（如 zhen）后按 Tab 键进入部首辅码反查，原拼音保持不丢；输入偏旁读音（如 j/jin 金、m/mu 木、s/shui 水、c/cao 草），带对应部首的汉字置顶第 1 位，空格直接上屏。【适用场景】快速筛选同音生僻字、精准找字。仅万象拼音方案生效。',
      mkSwitch('zwy-tabFuzhuma')
    );
    mkRow(
      'zwy-pairPunct',
      '成对标点自动补全（搜狗同款）',
      '【功能作用】输入《、【、（、“、‘、「 时自动补全右半边并将光标居中；打完右标点自动跳出无需重复敲；误按左标点按一次 Backspace 成对删除。同键引号（“与‘）每次敲击均产生新配对。【适用场景】日常写作、文本引用、排版编辑。',
      mkSwitch('zwy-pairPunct')
    );
    mkRow(
      'zwy-enableCorrection',
      '自动纠错',
      '按错相邻键位时自动给出正确候选（nihap 也能出「你好」）。仅全拼、仅相邻键误触生效。',
      mkSwitch('zwy-enableCorrection')
    );
    mkRow(
      'zwy-zhTrad',
      '默认简繁',
      '每次引擎启动时的默认中文字形。强制后仍可用方案快捷键临时切换。',
      mkSelect('zwy-zhTrad', [['follow', '跟随方案'], ['simp', '简体'], ['trad', '繁体']])
    );
    mkRow(
      'zwy-emoji',
      'emoji 候选',
      '候选词旁附带 emoji（如「哈哈」带 😄）。关闭则纯文字候选。',
      mkSelect('zwy-emoji', [['follow', '跟随方案'], ['on', '开启'], ['off', '关闭']])
    );
    mkRow(
      'zwy-fullShape',
      '全半角默认',
      '标点与字母的默认形态。半角适合代码混输；全角适合中文标准排版。',
      mkSelect('zwy-fullShape', [['follow', '跟随方案'], ['half', '半角'], ['full', '全角']])
    );
    mkRow(
      'zwy-semicolonSecond',
      '分号次选',
      '出现候选时按 ; 选第 2 个候选、' + "'" + ' 选第 3 个候选。覆盖方案原有绑定。',
      mkSwitch('zwy-semicolonSecond')
    );
    mkRow(
      'zwy-bracketPaging',
      '方括号翻页',
      '出现候选时按 [ 上一页、] 下一页。覆盖方案原有绑定。',
      mkSwitch('zwy-bracketPaging')
    );
    mkRow(
      'zwy-keyGateEnabled',
      '按键锁 / 门控保护（硬件故障防御）',
      '【功能作用】将被锁定的按键置为受保护状态：只有按住门控键（如 Ctrl/Alt/搜索键）的同时按下该键，字符才会输入；不按门控键单独触发时（无论是误碰还是按键物理接触不良/老化导致的自动连发疯狂刷屏），输入法在最底层直接阻断吞掉，零字符上屏。【适用场景】老旧笔记本键盘触点老化、某个按键弹簧疲劳自发连发连打（如【键疯狂自触）时开启，可免除更换硬件的烦恼。',
      mkSwitch('zwy-keyGateEnabled')
    );
    mkRow(
      'zwy-keyGateMod',
      '门控键（与锁定键同按解锁）',
      '按住此键时，被锁定的按键才会放行输入。支持全键盘任意按键（Ctrl、Alt、Shift、搜索键、Fn 等），点击「更改」后按下目标按键即可完成录制。推荐设为常用修饰键（如 Ctrl 或 Alt）。',
      buildGateKey()
    );
    mkRow(
      'zwy-keyGateCodes',
      '锁定键列表（需要防抖/防连发的按键）',
      '列表中的所有按键在未按住门控键时都会被坚决拦截。点击「＋ 添加按键」后直接按下想锁定的按键即可录入；点击标签上的 × 即可移除解锁。默认包含 【 与 】 两个方括号键。',
      buildKeyList()
    );
    mkRow(
      'zwy-repeatImmunity',
      '成对标点防连击放大',
      '【功能作用】当长按标点键或硬件物理连击时，系统会快速发送多次按键。开启后，未松开按键期间的系统重复事件不再被连续转换为多对标点，只保留首对标点，防止成对标点疯狂刷屏。【适用场景】键盘按键略有连击、或者不希望长按括号键时打出一长串括号时开启。默认关闭。',
      mkSwitch('zwy-repeatImmunity')
    );
    mkRow(
      'zwy-phantomClean',
      '物理粘滞幽灵自清理',
      '【功能作用】当键盘硬件严重粘滞（人未碰键盘，硬件触点自发导通引发高频连发）时，输入法检测到短时间内连续无弹起重复，判定为幽灵触发，立即自动后退擦除刚打出的标点，屏幕瞬间恢复净空。【适用场景】没有开启“按键锁”，但键盘偶发自发打出括号时开启，实现免手动删除的静默自愈。默认关闭。',
      mkSwitch('zwy-phantomClean')
    );
    mkRow(
      'zwy-capsToAscii',
      '大写锁定（CapsLock）原生体验与大写反选',
      '【功能作用】空闲未打拼音时，按下 Search+Alt 开启大写锁定，打字直接原生输出大写英文 A-Z；关闭大写锁定自动恢复中文输入。而在打拼音或 Tab 辅码反选过程中，开启大写锁定不会打断拼音，输入的大写字母完整送入词库，用于触发万象拼音的大写反选、大写笔画查字。【适用场景】全面解决 ChromeOS 原生大写锁定与第三方输入法冲突、大写字母无法用于反选的痛点。默认开启。',
      mkSwitch('zwy-capsToAscii')
    );

    const resetRow = document.createElement('div');
    resetRow.className = 'zwy-resetrow';
    const reset = document.createElement('button');
    reset.id = 'zwy-reset';
    reset.textContent = '恢复默认';
    resetRow.appendChild(reset);
    paper.appendChild(resetRow);

    block.appendChild(paper);
    return block;
  }

  function adoptStyles(n, block) {
    try {
      if (n.styleCard) {
        const cs = getComputedStyle(n.styleCard);
        const paper = block.querySelector('.zwy-paper');
        paper.style.background = cs.backgroundColor;
        paper.style.borderRadius = cs.borderRadius;
        paper.style.boxShadow = cs.boxShadow !== 'none' ? cs.boxShadow : 'none';
        paper.style.color = cs.color;
        paper.style.fontFamily = cs.fontFamily;
      }
      if (n.headingEl) {
        const hs = getComputedStyle(n.headingEl);
        const t = block.querySelector('#zwy-title');
        t.style.fontSize = hs.fontSize;
        t.style.fontWeight = hs.fontWeight;
        t.style.color = hs.color;
      }
      if (n.descEl) {
        const ds = getComputedStyle(n.descEl);
        for (const d of block.querySelectorAll('.zwy-desc-p')) {
          d.style.fontSize = ds.fontSize;
          d.style.color = ds.color;
        }
      }
      if (n.labelEl) {
        const ls = getComputedStyle(n.labelEl);
        for (const b of block.querySelectorAll('.zwy-lb > b')) {
          b.style.fontSize = ls.fontSize;
          b.style.color = ls.color;
        }
      }
      if (n.rowCard) {
        const rc = getComputedStyle(n.rowCard);
        for (const row of block.querySelectorAll('.zwy-rowcard')) {
          row.style.background = rc.backgroundColor;
          row.style.borderRadius = rc.borderRadius;
          row.style.boxShadow = rc.boxShadow !== 'none' ? rc.boxShadow : 'none';
          row.style.border = rc.borderStyle !== 'none' ? rc.border : 'none';
        }
      }
    } catch (e) { /* cosmetic only */ }
  }

  function bind() {
    (async () => { hydrate(await getSettings()); })();
    for (const id of ['zwy-horizontal', 'zwy-pinyinWindow', 'zwy-tabFuzhuma', 'zwy-pairPunct', 'zwy-enableCorrection', 'zwy-zhTrad', 'zwy-emoji', 'zwy-fullShape', 'zwy-semicolonSecond', 'zwy-bracketPaging', 'zwy-keyGateEnabled', 'zwy-repeatImmunity', 'zwy-phantomClean', 'zwy-capsToAscii']) {
      $(id).addEventListener('change', applyChanges);
    }

    $('zwy-reset').addEventListener('click', () => {
      hydrate(DEFAULTS);
      applyChanges();
    });
  }

  function inject() {
    try {
      if (document.getElementById('zwy-block')) return true;
      const root = document.getElementById('root');
      if (!root) return false;
      const n = collectNative(root);
      if (!n.anchorCard && !n.styleCard) return false;

      const block = buildBlock(n);

      const st = document.createElement('style');
      st.textContent = `
        #zwy-block { font: 14px/1.6 system-ui, "Microsoft YaHei", sans-serif; margin: 16px 0 24px; }
        #zwy-block #zwy-title { margin: 0 0 10px; }
        #zwy-block .zwy-paper { padding: 6px 20px; }
        #zwy-block .zwy-rowcard { display: flex; align-items: center; gap: 16px; padding: 12px 16px; margin: 10px 0; }
        #zwy-block .zwy-lb { flex: 1; font-size: 14px; }
        #zwy-block .zwy-lb b { font-weight: 600; }
        #zwy-block .zwy-lb p { margin: 2px 0 0; color: gray; font-size: 12px; }
        #zwy-block select { font: inherit; padding: 4px 10px; border-radius: 8px; flex: none; }
        #zwy-block input[type=text] { font: inherit; padding: 4px 10px; border-radius: 8px; flex: none; width: 200px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; }
        #zwy-block .zwy-sw { position: relative; width: 34px; height: 14px; flex: none; display: inline-block; }
        #zwy-block .zwy-sw input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; z-index: 2; }
        #zwy-block .zwy-sw .zwy-tr { position: absolute; left: 0; right: 0; top: 0; bottom: 0; border-radius: 7px; background: rgba(0,0,0,.30); transition: background .15s; }
        #zwy-block .zwy-sw .zwy-th { position: absolute; top: -3px; left: -3px; width: 20px; height: 20px; border-radius: 50%; background: #fafafa; box-shadow: 0 1px 3px rgba(0,0,0,.4); transition: left .15s, background .15s; }
        #zwy-block .zwy-sw input:checked ~ .zwy-tr { background: rgba(233,30,99,.55); }
        #zwy-block .zwy-sw input:checked ~ .zwy-tr .zwy-th { left: 17px; background: #e91e63; }
        #zwy-block .zwy-keylist { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        #zwy-block .zwy-keychip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 8px; border: 1px solid rgba(128,128,128,.4); font-size: 12px; }
        #zwy-block .zwy-keychip button { border: none; background: transparent; color: inherit; cursor: pointer; font: inherit; padding: 0 2px; opacity: .7; }
        #zwy-block .zwy-keychip button:hover { opacity: 1; }
        #zwy-block .zwy-addkey { font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 8px; border: 1px dashed rgba(128,128,128,.5); background: transparent; color: inherit; cursor: pointer; }
        #zwy-block .zwy-addkey.zwy-recording { border-style: solid; background: rgba(233,30,99,.12); color: #e91e63; font-weight: 600; }
        #zwy-block .zwy-resetrow { padding: 4px 0 2px; }
        #zwy-block .zwy-resetrow button { font: inherit; font-size: 12px; padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; cursor: pointer; }
      `;
      block.appendChild(st);

      // Placement: between 字典包 and RIME 服务日志 cards.
      if (n.anchorCard && n.anchorCard.parentNode) n.anchorCard.parentNode.insertBefore(block, n.anchorCard);
      else root.appendChild(block);

      adoptStyles(n, block);
      bind();
      console.log('[zwy] ' + V + ' 已注入（RIME 日志卡片上方，改动即时生效）');
      return true;
    } catch (e) {
      console.error('[zwy] 注入失败', e);
      return false;
    }
  }

  function boot() {
    const root = document.getElementById('root');
    if (root) {
      const obs = new MutationObserver(() => { if (inject()) obs.disconnect(); });
      obs.observe(root, { childList: true, subtree: true });
      inject();
      setTimeout(() => {
        if (!document.getElementById('zwy-block')) {
          console.warn('[zwy] 未找到原生卡片，兜底注入');
          inject();
        }
      }, 5000);
    } else {
      document.addEventListener('DOMContentLoaded', boot);
    }
  }
  boot();
})();
