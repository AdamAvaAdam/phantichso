'use strict';
// Only the local application reads the protected source. No source address or credentials in the browser.
window.VTHubData=(()=>{
 if(new URL(location.href).hostname!=='127.0.0.1')return window.VTWebData;
 let startupToken='';
 function capture(){try{const u=new URL(location.href);if(u.hostname==='127.0.0.1'&&/^#[a-f0-9]{64}$/.test(u.hash)){startupToken=u.hash.slice(1);history.replaceState(null,'',u.pathname+u.search);}}catch{}}
 capture();
 async function request(path,{signal,method='GET',headers={}}={}){
  if(new URL(location.href).hostname!=='127.0.0.1')throw Error('Mở VT Hub bằng biểu tượng trên máy để tải dữ liệu.');
  const r=await fetch(path,{method,headers,signal,credentials:'same-origin',cache:'no-store',referrerPolicy:'no-referrer'});
  if(!r.ok){if(r.status===401)throw Error('Phiên ứng dụng đã đóng. Mở lại VT Hub bằng biểu tượng trên máy.');if(r.status===409)throw Error('Dữ liệu đang được cập nhật. Vui lòng chờ rồi thử lại.');throw Error('Chưa tải được dữ liệu. Kiểm tra kết nối và thử lại.');}
  return r.json();
 }
 return {
  get local(){return new URL(location.href).hostname==='127.0.0.1';},
  openInstalled(){if(this.local)return false;location.href='vthub://open';return true;},
  async session(){capture();if(startupToken){const token=startupToken;startupToken='';try{return await request('/api/session',{method:'POST',headers:{'X-App-Token':token}});}catch(e){startupToken=token;throw e;}}return request('/api/session');},
  snapshot:signal=>request('/api/data',{signal}),
  logout:()=>request('/api/logout',{method:'POST'})
 };
})();
