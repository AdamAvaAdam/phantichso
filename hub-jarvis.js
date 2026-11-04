'use strict';
(() => {
 const $=id=>document.getElementById(id),pref=matchMedia('(prefers-reduced-motion: reduce)');
 let quiet=pref.matches,events=[];
 try{const saved=localStorage.getItem('vt-hud-motion');if(saved!==null)quiet=saved==='quiet';}catch{}
 function motion(){document.documentElement.classList.toggle('quiet-motion',quiet);const b=$('motion-toggle');if(b){b.textContent=quiet?'Hiệu ứng: Tắt':'Hiệu ứng: Bật';b.setAttribute('aria-pressed',String(!quiet));}}
 $('motion-toggle')?.addEventListener('click',()=>{quiet=!quiet;motion();try{localStorage.setItem('vt-hud-motion',quiet?'quiet':'on');}catch{}});
 pref.addEventListener('change',e=>{quiet=e.matches;motion();});motion();
 function log(text,state='info'){
  if(!text)return;
  events.push({time:new Date().toLocaleTimeString('vi-VN',{hour12:false}),text:String(text),state});events=events.slice(-7);
  const feed=$('source-feed');if(!feed)return;feed.replaceChildren();
  for(const event of events){const row=document.createElement('div'),time=document.createElement('time'),label=document.createElement('span');row.className='feed-row '+event.state;time.textContent=event.time;label.textContent=event.text;row.append(time,label);feed.append(row);}
  feed.scrollTop=feed.scrollHeight;
 }
 window.VTHud={
  log,
  busy(value){document.body.classList.toggle('is-loading',value);$('source-feed')?.setAttribute('aria-busy',String(value));if($('hud-state'))$('hud-state').textContent=value?'ĐANG ĐỌC NGUỒN':'SẴN SÀNG';},
  data(model,audit){if($('hud-state'))$('hud-state').textContent='ĐÃ ĐỐI SOÁT';if($('hud-summary'))$('hud-summary').textContent=audit.count.toLocaleString('vi-VN')+' đơn có hiệu lực · '+audit.cancelledCount.toLocaleString('vi-VN')+' đơn hủy được giữ để đối chiếu';if($('hud-freshness')){const stamp=model.revision.DongBoLuc,date=new Date(stamp);$('hud-freshness').textContent=stamp&&Number.isFinite(date.getTime())?'Nguồn cập nhật '+date.toLocaleString('vi-VN'):'Nguồn chưa có thời điểm cập nhật';}},
  reset(){events=[];$('source-feed')?.replaceChildren();if($('hud-state'))$('hud-state').textContent='CHỜ DỮ LIỆU';if($('hud-summary'))$('hud-summary').textContent='Đăng nhập để đọc và đối soát nguồn dữ liệu.';if($('hud-freshness'))$('hud-freshness').textContent='Chưa có bản dữ liệu';document.body.classList.remove('is-loading');}
 };
})();
