"use strict";
/**
 * VT Intelligence Hub authentication server.
 * Requires Node.js >= 18. No third-party dependencies or credentials in git.
 * This protects pages served by THIS process; GitHub Pages is not protected.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;
const PROXY_TLS = process.env.TRUST_TLS_PROXY === "1";
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12 || !SESSION_SECRET || SESSION_SECRET.length < 32) {
  console.error("Configure ADMIN_PASSWORD (12+ chars) and SESSION_SECRET (32+ chars) in environment variables.");
  process.exit(1);
}
if (HOST !== "127.0.0.1" && HOST !== "::1" && !PROXY_TLS) {
  console.error("Remote deployment requires HTTPS reverse proxy and TRUST_TLS_PROXY=1.");
  process.exit(1);
}
const salt = crypto.randomBytes(32);
const derivedPassword = crypto.scryptSync(ADMIN_PASSWORD, salt, 64);
const attempts = new Map();
const maxBody = 8192;
const htmlEscape = v => String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tokenSign = payload => crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
const sessionCookie = token => `vt_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${PROXY_TLS ? "; Secure" : ""}`;
const expireCookie = `vt_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${PROXY_TLS ? "; Secure" : ""}`;
function createSession() {
  const value = Buffer.from(JSON.stringify({user:ADMIN_USER, exp:Date.now()+8*60*60*1000, nonce:crypto.randomBytes(16).toString("hex")})).toString("base64url");
  return value+"."+tokenSign(value);
}
function validSession(req) {
  const cookie=(req.headers.cookie || "").split(";").map(s=>s.trim()).find(s=>s.startsWith("vt_session="));
  if(!cookie)return false;
  const [data,mac,...rest]=cookie.slice(11).split(".");
  if(!data || !mac || rest.length)return false;
  const expected=tokenSign(data);
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac),Buffer.from(expected))) return false;
  try {const p=JSON.parse(Buffer.from(data,"base64url").toString("utf8"));return p.user===ADMIN_USER && Number.isFinite(p.exp) && p.exp>Date.now();}catch{return false;}
}
function send(res,status,body,type="text/html; charset=utf-8",headers={}){
  res.writeHead(status,{"Content-Type":type,"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","X-Frame-Options":"SAMEORIGIN","Referrer-Policy":"strict-origin-when-cross-origin","Content-Security-Policy":"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client; connect-src 'self' https://sheets.googleapis.com https://openidconnect.googleapis.com https://accounts.google.com/gsi/ https://router.project-osrm.org https://valhalla1.openstreetmap.de https://nominatim.openstreetmap.org; frame-src 'self' https://accounts.google.com/gsi/; img-src 'self' data: blob: https://tile.openstreetmap.org https://server.arcgisonline.com; form-action 'self'; frame-ancestors 'self'",...headers});
  res.end(body);
}
function redirect(res,target,headers={}){send(res,303,"", "text/plain; charset=utf-8",{"Location":target,...headers});}
function loginPage(message="") {
 return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Đăng nhập · Việt Tuấn</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#edf4ee;font-family:system-ui,"Segoe UI",sans-serif;color:#173b2b;padding:16px}main{width:min(100%,410px);background:white;border-radius:20px;padding:35px;box-shadow:0 18px 55px #153b2520}h1{font-size:25px;margin:0}p{color:#667f70;line-height:1.6}label{display:block;font-size:13px;margin:17px 0 7px}input{display:block;width:100%;padding:13px;border:1px solid #c9dbce;border-radius:10px;font:inherit}button{width:100%;margin-top:22px;padding:13px;border:0;border-radius:10px;background:#285940;color:white;font:inherit;cursor:pointer}.error{color:#a52c20;background:#fff0ef;padding:10px;border-radius:8px}</style></head><body><main><h1>VT INTELLIGENCE</h1><p>Đăng nhập quản trị để truy cập trung tâm điều hành.</p>${message?`<p class="error" role="alert">${htmlEscape(message)}</p>`:""}<form method="post" action="/login" autocomplete="on"><label for="username">Tên đăng nhập</label><input id="username" name="username" autocomplete="username" required><label for="password">Mật khẩu</label><input id="password" type="password" name="password" autocomplete="current-password" required><button type="submit">Đăng nhập an toàn</button></form></main></body></html>`;
}
function isSameOrigin(req){
 const origin=req.headers.origin;
 if(!origin)return true;
 const scheme=PROXY_TLS?"https":"http";
 const host=req.headers.host;
 return origin===scheme+"://"+host;
}
function parsePost(req){
 return new Promise((resolve,reject)=>{
  let raw="";
  req.on("data",b=>{raw+=b;if(raw.length>maxBody){reject(new Error("Too large"));req.destroy();}});
  req.on("end",()=>resolve(new URLSearchParams(raw)));
  req.on("error",reject);
 });
}
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,"http://localhost").pathname;
 if(req.method==="GET" && pathname==="/login"){
   return validSession(req)?redirect(res,"/hub.html"):send(res,200,loginPage());
 }
 if(req.method==="POST" && pathname==="/login"){
   if(!isSameOrigin(req))return send(res,403,"Forbidden","text/plain");
   const ip=req.socket.remoteAddress||"unknown",now=Date.now();
   const record=attempts.get(ip)||{count:0,until:0};
   if(record.until>now)return send(res,429,loginPage("Quá nhiều lần thử. Hãy thử lại sau."));
   let data;try{data=await parsePost(req);}catch{return send(res,400,loginPage("Yêu cầu không hợp lệ."));}
   const username=data.get("username")||"",password=data.get("password")||"";
   const candidate=crypto.scryptSync(password,salt,64);
   const authenticated=username===ADMIN_USER && crypto.timingSafeEqual(derivedPassword,candidate);
   if(!authenticated){
     record.count++;
     if(record.count>=5){record.until=now+15*60*1000;record.count=0;}
     attempts.set(ip,record);
     return send(res,401,loginPage("Tên đăng nhập hoặc mật khẩu không chính xác."));
   }
   attempts.delete(ip);
   return redirect(res,"/hub.html",{"Set-Cookie":sessionCookie(createSession())});
 }
 if(req.method==="POST" && pathname==="/logout"){
   if(!isSameOrigin(req))return send(res,403,"Forbidden","text/plain");
   return redirect(res,"/login",{"Set-Cookie":expireCookie});
 }
 const assets={"/hub-auth.js":"text/javascript; charset=utf-8","/hub.js":"text/javascript; charset=utf-8","/hub-core.js":"text/javascript; charset=utf-8","/hub.css":"text/css; charset=utf-8","/assets/leaflet.js":"text/javascript; charset=utf-8","/assets/leaflet.css":"text/css; charset=utf-8"};
 for(const name of ['entry.js','hub-device.js','hub-modules.js','bh-map-loader.js','tours-loader.js','hub-jarvis.js','hub-promotions.js','order-inspector.js','tours-app.js'])assets['/'+name]='text/javascript; charset=utf-8';
 for(const name of ['bh-map.html','tours.html'])assets['/'+name]='text/html; charset=utf-8';
 for(const name of ['hub-jarvis.css','hub-brand.css','tours.css'])assets['/'+name]='text/css; charset=utf-8';
 assets['/assets/bhver1/manifest.json']='application/json';
 if(/^\/assets\/bhver1\/part-\d{2}\.txt$/.test(pathname))assets[pathname]='text/plain; charset=utf-8';
 if(req.method==="GET" && assets[pathname]){
   if(!validSession(req))return send(res,401,"Authentication required","text/plain");
   try{return send(res,200,fs.readFileSync(path.join(__dirname,pathname.slice(1))),assets[pathname]);}catch{return send(res,404,"Not found","text/plain");}
 }
 if(req.method==="GET" && (pathname==="/"||pathname==="/hub.html"||pathname==="/index.html")){
   if(!validSession(req))return redirect(res,"/login");
   const file=pathname==="/index.html"?"index.html":"hub.html";
   let html;try{html=fs.readFileSync(path.join(__dirname,file),"utf8");}catch{return send(res,500,"File unavailable","text/plain");}
   const logout='<form method="post" action="/logout" style="margin:0"><button type="submit" style="padding:10px 14px;border:1px solid #d4e3d8;border-radius:9px;background:#fff;color:#285940">Đăng xuất</button></form>';
   html=html.replace('</main>',logout+'</main>');
   return send(res,200,html);
 }
 return send(res,404,"Not found","text/plain");
});
server.listen(PORT,HOST,()=>console.log(`VT Hub: http://${HOST}:${PORT}/login`));
