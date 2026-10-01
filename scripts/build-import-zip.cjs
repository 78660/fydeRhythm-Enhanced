# 用 schema-src/ 里的预编译 RIME 资产与共享文件重打万象方案导入包，
# 并用扩展同款导入逻辑（verify-import.cjs）做导入校验。
#
# 用法：
#   cd scripts && npm install
#   node build-import-zip.cjs
#   node build-import-zip.cjs <自定义输出.zip>   # 可选
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const SRC = path.join(__dirname, '..', 'schema-src');
const OUT = process.argv[2]
  || path.join(__dirname, '..', 'release', '万象拼音方案-在真文韵设置页导入这个.zip');

function collect(rel) {
  const abs = path.join(SRC, rel);
  const out = [];
  for (const f of fs.readdirSync(abs)) {
    const r = rel ? rel + '/' + f : f;
    if (fs.statSync(abs + '/' + f).isDirectory()) out.push(...collect(r));
    else out.push(r);
  }
  return out;
}

(async () => {
  const files = [...collect('build'), ...collect('shared')];
  const zip = new JSZip();
  for (const rel of files) {
    zip.file(rel, fs.readFileSync(path.join(SRC, rel)));
  }
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  fs.writeFileSync(OUT, buf);
  console.log('JSZip-built zip:', files.length, 'files,', Math.round(buf.length / 1048576) + 'MB,', 'exact bytes:', buf.length);

  // validate with the real importer
  delete require.cache[require.resolve('./verify-import.cjs')];
  const { importSchemaFromZip } = require('./verify-import.cjs');
  const written = {};
  const stub = {
    readEntry: async (p) => (written[p] ? { isDirectory: false } : null),
    writeWholeFile: async (p, b) => { written[p] = b.length; },
    deleteDirectory: async () => {},
    collectGarbage: async () => {},
  };
  const blob = new Blob([buf]);
  const r = await importSchemaFromZip(blob, stub, { onProgress: () => {} });
  console.log('IMPORT OK:', r.schemaId, r.schemaName, Object.keys(written).length, 'files,', Math.round(Object.keys(written).reduce((a, k) => a + written[k], 0) / 1048576) + 'MB');
})().catch((e) => { console.error('FAILED:', e); process.exit(1); });
