const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const m=JSON.parse(fs.readFileSync('trinhkho/assets/model.json'));
test('authorized full location snapshot has safe public fields',()=>{
 assert.equal(m.locations.length,3346);
 const allowed=new Set(['code','name','lat','lon','province','tier','matched','activeOctober']);
 for(const p of m.locations){assert.ok(p.name);assert.ok(Number.isFinite(p.lat)&&Number.isFinite(p.lon));for(const k of Object.keys(p))assert.ok(allowed.has(k),k);}
});
test('source depots and study candidates remain distinct',()=>{
 assert.equal(m.nodes.filter(n=>n.status==='existing').length,8);
 assert.equal(m.nodes.filter(n=>n.status==='priority').length,2);
 assert.equal(m.nodes.filter(n=>n.status==='review').length,5);
 assert.ok(!m.nodes.some(n=>/^Kho.*Yên Bái|Hạ Long/.test(n.name)));
 assert.ok(m.nodes.some(n=>n.code==='V6'&&n.status==='existing'));
 assert.ok(m.nodes.some(n=>n.code==='V7'&&n.status==='existing'));
 assert.match(m.nodes.find(n=>n.code==='S4').role,/Lai Châu/);
});
test('all connection endpoints exist',()=>{for(const r of m.routes){assert.ok(m.nodes[r.from]);assert.ok(m.nodes[r.to]);}});
