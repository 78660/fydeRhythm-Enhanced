(async function () {
  const V = 'v102';
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
  };
  const $ = (id) => document.getElementById(id);

  async function getSettings() {
    const store = await chrome.storage.sync.get({ settings: {} });
    return store.settings || {};
  }
  async function saveSettings(patch) {
    const settings = await getSettings();
    Object.assign(settings, patch);
    await new Promise((res) => chrome.storage.sync.set({ settings }, res));
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
      'Chromium bug 469901669：横排候选窗在 ChromeOS 上不渲染，默认竖排；Google 修复后选横排。',
      mkSelect('zwy-horizontal', [['off', '竖排（默认）'], ['on', '横排（实验）']])
    );
    mkRow(
      'zwy-pinyinWindow',
      '拼音进候选框（搜狗式）',
      '打字时文本框内不显示拼音，候选窗顶部为与候选词等高的拼音行（如 zhen），下方为候选词，选完候选词汉字直接上屏。个别应用若出现定位异常，关闭此开关可恢复内联显示。',
      mkSwitch('zwy-pinyinWindow')
    );
    mkRow(
      'zwy-tabFuzhuma',
      'Tab 进入辅码反查（仅万象拼音方案）',
      '开启后，文本框里按 Tab：清空当前输入并进入部首辅码反查（等同原生 \u0060），输 jn（金）、mu（木）或拆字、笔画查字。需要 Tab 的原生功能（切焦点）时，关闭此开关或切换方案即可。「拼音后直接跟辅码筛选」是万象 PRO 词库级功能。',
      mkSwitch('zwy-tabFuzhuma')
    );
    mkRow(
      'zwy-pairPunct',
      '成对标点自动补全（搜狗同款）',
      '输入《、【、（、“、‘等时自动补全右半边并将光标移至中间；按退格可成对删除。',
      mkSwitch('zwy-pairPunct')
    );
    mkRow(
      'zwy-enableCorrection',
      '自动纠错',
      '按错相邻键位时自动给出正确候选（nihap 也能出「你好」）。仅全拼、仅相邻键误触。',
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
      '标点与字母的默认形态。半角适合代码混输；全角为中文排版。',
      mkSelect('zwy-fullShape', [['follow', '跟随方案'], ['half', '半角'], ['full', '全角']])
    );
    mkRow(
      'zwy-semicolonSecond',
      '分号次选',
      '出现候选时按 ; 选第 2 个候选、' + "'" + ' 选第 3 个。覆盖方案原有绑定。',
      mkSwitch('zwy-semicolonSecond')
    );
    mkRow(
      'zwy-bracketPaging',
      '方括号翻页',
      '出现候选时按 [ 上一页、] 下一页。覆盖方案原有绑定。',
      mkSwitch('zwy-bracketPaging')
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
    const markDirty = () => {
      const sb = document.getElementById('zwy-snackbar');
      if (sb) sb.style.display = 'flex';
    };
    for (const id of ['zwy-horizontal', 'zwy-pinyinWindow', 'zwy-tabFuzhuma', 'zwy-pairPunct', 'zwy-enableCorrection', 'zwy-zhTrad', 'zwy-emoji', 'zwy-fullShape', 'zwy-semicolonSecond', 'zwy-bracketPaging']) {
      $(id).addEventListener('change', markDirty);
    }

    $('zwy-reset').addEventListener('click', () => {
      hydrate(DEFAULTS);
      markDirty();
      $('zwy-status').textContent = '已恢复默认值，点「保存并应用」后生效。';
    });

    $('zwy-apply').addEventListener('click', async () => {
      $('zwy-apply').disabled = true;
      $('zwy-status').textContent = '引擎后台重载中…';
      await saveSettings({
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
      });
      await reloadEngine();
      $('zwy-apply').disabled = false;
      $('zwy-status').textContent = '已生效。';
      setTimeout(() => { const sb = document.getElementById('zwy-snackbar'); if (sb) sb.style.display = 'none'; }, 1500);
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
        #zwy-block .zwy-sw { position: relative; width: 34px; height: 14px; flex: none; display: inline-block; }
        #zwy-block .zwy-sw input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; z-index: 2; }
        #zwy-block .zwy-sw .zwy-tr { position: absolute; left: 0; right: 0; top: 0; bottom: 0; border-radius: 7px; background: rgba(0,0,0,.30); transition: background .15s; }
        #zwy-block .zwy-sw .zwy-th { position: absolute; top: -3px; left: -3px; width: 20px; height: 20px; border-radius: 50%; background: #fafafa; box-shadow: 0 1px 3px rgba(0,0,0,.4); transition: left .15s, background .15s; }
        #zwy-block .zwy-sw input:checked ~ .zwy-tr { background: rgba(233,30,99,.55); }
        #zwy-block .zwy-sw input:checked ~ .zwy-tr .zwy-th { left: 17px; background: #e91e63; }
        #zwy-block .zwy-resetrow { padding: 4px 0 2px; }
        #zwy-block .zwy-resetrow button { font: inherit; font-size: 12px; padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; cursor: pointer; }
        #zwy-snackbar { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); display: none; align-items: center; gap: 16px; background: #202124; color: #fff; border-radius: 10px; padding: 12px 18px; font: 14px/1.4 system-ui, "Microsoft YaHei", sans-serif; box-shadow: 0 4px 16px rgba(0,0,0,.35); z-index: 99999; }
        #zwy-snackbar #zwy-apply { font: inherit; font-weight: 600; padding: 8px 16px; border-radius: 8px; border: none; background: #e91e63; color: #fff; cursor: pointer; }
        #zwy-snackbar #zwy-status { font-size: 12px; opacity: .8; }
      `;
      block.appendChild(st);

      // Snackbar (native-style dirty-settings bar).
      if (!document.getElementById('zwy-snackbar')) {
        const sb = document.createElement('div');
        sb.id = 'zwy-snackbar';
        sb.style.display = 'none';
        sb.innerHTML = '<span>设置已更改。</span><button id="zwy-apply">保存并应用</button><span id="zwy-status"></span>';
        document.body.appendChild(sb);
      }

      // Placement: between 字典包 and RIME 服务日志 cards.
      if (n.anchorCard && n.anchorCard.parentNode) n.anchorCard.parentNode.insertBefore(block, n.anchorCard);
      else root.appendChild(block);

      adoptStyles(n, block);
      bind();
      console.log('[zwy] ' + V + ' 已注入（RIME 日志卡片上方，含底部弹窗）');
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
