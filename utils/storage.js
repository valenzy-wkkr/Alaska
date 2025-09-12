// Utilidad de almacenamiento en localStorage para Alaska
(function(){
  const NAMESPACE = 'alaska_';

  function safeParse(json, fallback){
    try { return JSON.parse(json); } catch { return fallback; }
  }

  function key(k){ return NAMESPACE + k; }

  function get(k, fallback = []){
    const raw = localStorage.getItem(key(k));
    if (raw === null || raw === undefined) return fallback;
    return safeParse(raw, fallback);
  }

  function set(k, value){
    localStorage.setItem(key(k), JSON.stringify(value));
  }

  function genId(){
    return `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  }

  function add(k, item){
    const arr = get(k, []);
    const withId = { id: genId(), ...item };
    arr.push(withId);
    set(k, arr);
    return withId;
  }

  function update(k, id, patch){
    const arr = get(k, []);
    const idx = arr.findIndex(x => x.id === id);
    if (idx >= 0){
      arr[idx] = { ...arr[idx], ...patch };
      set(k, arr);
      return arr[idx];
    }
    return null;
  }

  function remove(k, id){
    const arr = get(k, []);
    const next = arr.filter(x => x.id !== id);
    set(k, next);
    return arr.length !== next.length;
  }

  function clear(k){
    localStorage.removeItem(key(k));
  }

  const AlaskaStore = { get, set, add, update, remove, clear, genId };

  if (typeof window !== 'undefined') {
    window.AlaskaStore = AlaskaStore;
  }
})();
