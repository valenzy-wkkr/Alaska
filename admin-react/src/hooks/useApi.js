import useAuthStore from '../store/authStore.js';

// Hook para hacer peticiones a endpoints PHP de admin con Bearer token.
export default function useApi(){
  const { token, logout } = useAuthStore();
  async function request(path, { method='GET', data, params } = {}){
    const url = new URL(path, window.location.origin);
    if(params) Object.entries(params).forEach(([k,v])=> url.searchParams.append(k,v));
    const opts = { method, headers: {} };
    if(token) opts.headers['Authorization'] = 'Bearer '+token;
    if(data){
      if(data instanceof FormData){ opts.body=data; }
      else { opts.headers['Content-Type']='application/x-www-form-urlencoded'; opts.body=new URLSearchParams(data).toString(); }
    }
    const res = await fetch(url.toString(), opts);
    if(res.status===401){ logout(); throw new Error('unauthorized'); }
    const json = await res.json().catch(()=>({ ok:false,error:'bad_json'}));
    if(!res.ok || json.ok===false) throw new Error(json.error||'request_failed');
    return json;
  }
  return { request };
}