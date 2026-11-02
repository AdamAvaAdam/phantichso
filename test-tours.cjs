const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script); // Check the entire application syntax.
const context = vm.createContext({});
// Run actual calculation functions without browser startup or network access.
vm.runInContext(script.slice(script.indexOf('function tier('), script.indexOf('function render()')), context);
vm.runInContext(`
const norm = value => String(value ?? '').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/đ/g,'d').toLowerCase().trim().replace(/\\s+/g,' ');
const START='2026-10-22', END='2026-10-31', TOUR_START='2026-10-23', TOUR_END='2027-01-23';
const SHARP_START='2026-10-01', SHARP_END='2026-12-31', SHARP_TARGET=250000000;
const TOUR_CUSTOM=[], TOUR_DEFAULT={north:700000000,mangDen:1200000000};
const RULES={regular:[],svip:[]};
let data={customers:['Đại lý không có Sharp'],lines:[]};
`, context);
const run = code => vm.runInContext(code, context);
run(`const line={customer:'Điện Máy Đức Thúy HY',date:'2026-10-27',product:'Tủ lạnh Toshiba',brand:'Toshiba',amount:10800000,vat:true,cancelled:false,classification:'auto'};`);
assert.equal(run('eligibleTour(line)'), true);
assert.equal(run("eligibleTour({...line,brand:'Daikin',classification:'include'})"), false);
assert.equal(run("eligibleTour({...line,product:'SSUB',classification:'review'})"), true);
assert.equal(run("eligible({...line,product:'SSUB'})"), false);
assert.equal(run("eligibleSharp({...line,brand:'Sharp',product:'Nồi cơm',classification:'review'})"), true);
assert.equal(run("eligibleTour({...line,brand:'Sharp'})"), true);
assert.equal(run("eligibleSharp({...line,brand:'Toshiba',product:'Quà Sharp'})"), false);
for (const expression of ['{cancelled:true}','{vat:false}',"{date:'2026-10-22'}","{date:'2027-01-24'}"]) {
  assert.equal(run('eligibleTour({...line,...'+expression+'})'), false);
}
assert.equal(run("eligibleSharp({...line,brand:'Sharp',date:'2026-10-01'})"), true);
assert.equal(run("eligibleSharp({...line,brand:'Sharp',date:'2027-01-01'})"), false);
assert.equal(run('sharpNet({...line,amount:270000000})'), 250000000);
// Reconstructed Bravo example: amounts supplied in the referenced conversation, ex VAT.
const net = [10230000,22600000,16000000,13130000,17300000,16000000,35600000,51560000,11250000,24000000];
assert.equal(net.reduce((a,b)=>a+b,0), 217670000);
context.amounts = net;
run("data.lines=amounts.map(amount=>({...line,amount:amount*1.08}));");
assert.equal(Math.round(run('customers().find(c=>c.name===line.customer).tourTotal')), 235083600);
assert.equal(run('customers()[0].sharpTotal'), 0);
assert.ok(html.includes('tourDetail + sharpDetail'));
assert.ok(!html.includes('Tách sang Sharp'));
console.log('Tour regression checks passed; Bravo net 217,670,000 = gross 235,083,600.');
