(function(root){'use strict';
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/\s+/g,' ').trim();
const province=v=>/^\d{1,2}$/.test(String(v).trim())?String(v).trim().padStart(2,'0'):String(v||'unknown');
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const rules={regular:[[216000000,'Lò vi sóng Electrolux'],[432000000,'Máy giặt Toshiba AW-M905BV (MK)'],[540000000,'Máy giặt Panasonic NA-F90S10BRV'],[756000000,'Máy sấy Electrolux EDV904H3WC'],[1080000000,'Điều hòa Daikin FTF50XV1V/RF50XV1V']],svip:[[324000000,'Lò vi sóng Electrolux'],[594000000,'Máy giặt Toshiba AW-M905BV (MK)'],[756000000,'Máy giặt Panasonic NA-F90S10BRV'],[1080000000,'Máy giặt Electrolux EWF1024D3SC']]};
const targets=[['hung thanh',1281652775.7,1514680553.1],['hoang kien',1125728267.4,1330406134.2],['chuyen quyen',1144779808.9,null],['duc thuy',1389957149.9,1642676631.7],['tuan ngoan',2759136515.3,3260797699.9],['tuyen quang',714625645.5,null]];
const programs=[{id:'gift',name:'Quà tặng',start:'2026-10-22',end:'2026-10-31',net:false},{id:'travel',name:'Du lịch Hương Anh',start:'2026-10-23',end:'2027-01-23',net:false},{id:'sharp',name:'Du lịch Sharp',start:'2026-10-01',end:'2026-12-31',net:true}];
function qualified(p,id){if(!p||!norm(p.ProductName))return null;const name=norm(p.ProductName),brand=norm(p.BrandCode),text=name+' '+brand;
 if(id==='sharp')return /\bsharp\b/.test(brand||name);
 if(/\bdaikin\b/.test(text))return id==='travel'?false:(/dieu hoa|dan lanh|dan nong|may lanh/.test(text)?false:null);
 if(id==='gift'&&(/\bssub\b|\bksub\b|\bbasic[ -]*panasonic\b|\bpanasonic[ -]*basic\b/.test(name)||(/\bbasic\b/.test(name)&&brand.includes('panasonic')&&/goi|bay mau|trung bay/.test(name))))return false;
 return true;
}
function contribution(o,products,id){const amount=o.amount,all=o.details||[],gift=d=>['true','1'].includes(String(d.IsGift).toLowerCase()),pending=reason=>({state:'pending',gross:0,reason});
 if(!all.length)return pending('Thiếu chi tiết đơn');
 if(o.TotalLine!==''&&o.TotalLine!=null&&(!Number.isInteger(Number(o.TotalLine))||Number(o.TotalLine)!==all.length))return pending('Số dòng chi tiết không khớp đầu đơn');
 if(all.some(d=>!Number.isFinite(Number(d.Quantity))||!Number.isFinite(Number(d.UnitPrice))||d.Quantity===''||d.UnitPrice===''))return pending('Thiếu số lượng hoặc đơn giá');
 if(all.some(d=>gift(d)&&Number(d.Quantity)*Number(d.UnitPrice)!==0))return pending('Dòng quà có tiền cần đối chiếu');
 const paid=all.filter(d=>!gift(d)&&Number(d.Quantity)!==0);if(!paid.length)return pending('Chưa có dòng bán để phân loại');
 const flags=paid.map(d=>qualified(products.get(d.ProductCode),id));if(flags.some(f=>f===null))return pending('Chưa xác định được sản phẩm / điều kiện');
 if(flags.every(Boolean))return {state:'included',gross:amount,reason:'Toàn bộ sản phẩm đủ điều kiện: dùng TotalAmount đầu đơn, gồm chiết khấu và điều chỉnh'};
 if(flags.every(f=>!f))return {state:'excluded',gross:0,reason:'Toàn bộ sản phẩm ngoài điều kiện'};
 const values=paid.map(d=>Number(d.Quantity)*Number(d.UnitPrice)),sum=values.reduce((a,b)=>a+b,0);
 if(o.TotalDiscount===''||o.TotalDiscount==null||Number(o.TotalDiscount)!==0||sum!==amount||values.some(n=>!Number.isSafeInteger(n)))return pending('Đơn có cả hàng được tính và bị loại; chưa có tiền thực tế từng dòng sau chiết khấu/VAT');
 return {state:'included',gross:values.reduce((n,v,i)=>n+(flags[i]?v:0),0),reason:'Chi tiết khớp chính xác TotalAmount, không có chiết khấu; cộng riêng hàng đủ điều kiện'};
}
function evaluate(model,f={},day=today()){
 const seen=new Set();for(const o of model.orders){if(!o.AppOrderId||seen.has(o.AppOrderId))throw Error('Mã đơn thiếu hoặc trùng; chưa tính doanh số');seen.add(o.AppOrderId);if(!Number.isSafeInteger(o.amount))throw Error('Tiền đầu đơn không hợp lệ');}
 const names=new Map(model.customers),customers=new Map();
 const match=c=>(!f.province||province(c?.ProvinceId)===f.province)&&(!f.staff||String(c?.SalesStaffCode||'')===f.staff);
 for(const [code,c]of names)if(match(c)&&(!f.query||norm(code+' '+c.CustomerName).includes(norm(f.query))))customers.set(code,{code,name:c.CustomerName,customer:c,total:0,orders:[],programs:{}});
 for(const o of model.orders){const c=o.customer||names.get(o.CustomerCode);if(!match(c))continue;if(f.query&&!norm(o.CustomerCode+' '+(c?.CustomerName||o.CustomerName)).includes(norm(f.query)))continue;let row=customers.get(o.CustomerCode);if(!row){row={code:o.CustomerCode,name:c?.CustomerName||o.CustomerName||o.CustomerCode,customer:c||{},total:0,orders:[],programs:{}};customers.set(o.CustomerCode,row);}row.total+=o.amount;row.orders.push(o);}
 const summaries=programs.map(p=>{const until=p.end<day?p.end:day,complete=model.revision.DonTuNgay<=p.start&&model.revision.DonDenNgay>=until,lifecycle=day<p.start?'upcoming':day>p.end?'ended':'live';let gross=0,source=0,pending=0,excluded=0,pendingCount=0;
  for(const c of customers.values()){const rows=c.orders.filter(o=>o.DocDate>=p.start&&o.DocDate<=p.end&&o.DocDate<=day).map(o=>({order:o,...contribution(o,model.products,p.id)}));const sum=rows.reduce((n,r)=>n+r.gross,0),wait=rows.filter(r=>r.state==='pending'),raw=rows.reduce((n,r)=>n+r.order.amount,0);const item={gross:sum,amount:p.net?sum/1.08:sum,source:raw,pending:wait.reduce((n,r)=>n+r.order.amount,0),pendingCount:wait.length,rows,complete:complete&&!wait.length};c.programs[p.id]=item;gross+=sum;source+=raw;pending+=item.pending;pendingCount+=wait.length;excluded+=raw-sum-item.pending;}
  return {...p,lifecycle,coverageComplete:complete,complete:complete&&!pendingCount,gross,amount:p.net?gross/1.08:gross,source,pending,pendingCount,excluded};
 });
 const list=[...customers.values()].sort((a,b)=>b.total-a.total||a.code.localeCompare(b.code));const total=list.reduce((n,c)=>n+c.total,0);if(!Number.isSafeInteger(total))throw Error('Tổng vượt giới hạn số nguyên');return {customers:list,programs:summaries,total,orders:list.reduce((n,c)=>n+c.orders.length,0),revision:model.revision};
}
function milestones(c,id){const name=norm(c.name);if(id==='sharp')return [[250000000,'1 chuyến Đà Nẵng — đối chiếu đăng ký đúng hạn']];if(id==='travel'){const custom=targets.find(([key])=>new RegExp('(^| )'+key+'( |$)').test(name));return custom?[[custom[1],'Mộc Châu'],...(custom[2]==null?[]:[[custom[2],'Măng Đen']])]:[[500000000,'Tủ lạnh Electrolux nhỏ'],[700000000,'Mộc Châu'],[1200000000,'Măng Đen']];}return rules[/(^| )(hung thanh|tuan ngoan)( |$)/.test(name)?'svip':'regular'];}
const api={norm,province,today,programs,qualified,contribution,evaluate,milestones};if(typeof module!=='undefined')module.exports=api;else root.VTHubPromotions=api;
})(globalThis);
