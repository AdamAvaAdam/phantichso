(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./hub-core.js'):root.VTHub;
const labels={customer:'Chưa khớp khách',lines:'Lệch số dòng',details:'Thiếu chi tiết',product:'Chưa khớp sản phẩm',values:'Thiếu số lượng / đơn giá'};
const present=v=>v!==''&&v!==null&&v!==undefined;
function analyze(model,filters={}){
 const counts=Object.fromEntries(Object.keys(labels).map(k=>[k,0])),rows=[];
 for(const order of model.orders){
  if(C.isCancelled(order)||!C.matches(model,order,filters))continue;
  const details=order.details||[],issues=[],issue=(type,description,action)=>{issues.push({type,label:labels[type],description,action});counts[type]++;};
  if(!order.customer)issue('customer','Mã '+(order.CustomerCode||'(trống)')+' chưa có trong danh mục khách đã tải.','Kiểm tra mã khách trong danh mục Warehouse/Bravo. Nếu nguồn đã có, đồng bộ lại Khách hàng và cập nhật Hub. Không ghép theo tên.');
  const raw=order.TotalLine,expected=present(raw)&&Number.isInteger(Number(raw))&&Number(raw)>=0?Number(raw):null;
  if(!details.length)issue('details','Chưa có chi tiết đi kèm đầu đơn.','Chọn cả Đơn bán và Chi tiết đơn bán rồi đồng bộ lại kỳ của đơn. Nếu vẫn thiếu, kiểm tra nguồn.');
  if(present(raw)&&(expected===null||expected!==details.length))issue('lines',expected===null?'Số dòng trên đầu đơn không hợp lệ.':'Đầu đơn khai '+expected+' dòng; bản đã tải có '+details.length+' dòng ('+(details.length<expected?'thiếu '+(expected-details.length):'nhiều hơn '+(details.length-expected))+').','Đối chiếu đầu đơn và chi tiết trong Warehouse/Bravo. Không tự xóa dòng hoặc đổi số dòng để ép khớp.');
  const paid=details.filter(d=>!['true','1'].includes(String(d.IsGift).trim().toLowerCase())&&Number(d.Quantity)!==0);
  const missing=[...new Set(paid.filter(d=>!model.products.has(d.ProductCode)).map(d=>String(d.ProductCode||'(trống)')))];
  if(missing.length)issue('product','Có '+missing.length+' mã sản phẩm chưa khớp: '+missing.slice(0,5).join(', ')+(missing.length>5?'…':''),'Kiểm tra mã sản phẩm nguồn và đồng bộ lại Sản phẩm. Chưa tự đoán hãng hoặc điều kiện quà tặng.');
  const invalid=details.filter(d=>!present(d.Quantity)||!present(d.UnitPrice)||!Number.isFinite(Number(d.Quantity))||!Number.isFinite(Number(d.UnitPrice)));
  if(invalid.length)issue('values',invalid.length+' dòng thiếu hoặc không hợp lệ số lượng / đơn giá.','Đối chiếu dòng nguồn. Giữ tiền đầu đơn; chưa dùng các dòng này để phân loại chương trình.');
  if(issues.length)rows.push({order,issues,expectedLines:expected,actualLines:details.length,actions:[...new Set(issues.map(i=>i.action))]});
 }
 rows.sort((a,b)=>b.order.DocDate.localeCompare(a.order.DocDate)||String(a.order.OrderRefNo).localeCompare(String(b.order.OrderRefNo)));
 return {rows,counts,total:rows.length,affectedTotal:C.sum(rows.map(r=>r.order.amount)),revision:model.revision};
}
function select(report,kind=''){return report.rows.filter(r=>!kind||r.issues.some(i=>i.type===kind));}
function csv(report,kind=''){
 const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
 const rows=[['Ngày','Mã đơn','Số đơn','Mã khách','Tên khách nguồn','Trạng thái','Tiền đầu đơn vẫn tính gồm VAT','Số dòng đầu đơn','Số dòng đã tải','Vấn đề','Mô tả','Việc cần kiểm tra'],...select(report,kind).map(r=>{const o=r.order;return [o.DocDate,o.AppOrderId,o.OrderRefNo,o.CustomerCode,o.customer?.CustomerName||o.CustomerName,o.DocStatus,o.amount,r.expectedLines??'',r.actualLines,r.issues.map(i=>i.label).join('; '),r.issues.map(i=>i.description).join('; '),r.actions.join('; ')];})];
 return '\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
const api={labels,analyze,select,csv};if(typeof module!=='undefined')module.exports=api;else root.VTHubQuality=api;
})(globalThis);
