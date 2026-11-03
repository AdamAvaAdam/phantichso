(function(root){
'use strict';
function verifiedIdentity(profile){if(!profile||typeof profile.sub!=='string'||!profile.sub||profile.email_verified!==true||typeof profile.email!=='string'||!/^\S+@\S+\.\S+$/.test(profile.email))throw Error('Google chưa xác minh email của tài khoản. Hãy chọn tài khoản khác.');return Object.freeze({subject:profile.sub,email:profile.email.trim().toLowerCase()});}
async function verifyAccess(accessToken,request=fetch){if(typeof accessToken!=='string'||!accessToken)throw Error('Chưa nhận được phiên đăng nhập Google.');const response=await request('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+accessToken},credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Không xác minh được tài khoản Google. Hãy đăng nhập lại.');return verifiedIdentity(await response.json());}
const api={verifiedIdentity,verifyAccess};if(typeof module!=='undefined')module.exports=api;else root.VTHubAuth=api;
})(globalThis);
