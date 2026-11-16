/* SVG is the default. Only a running, bounded bootstrap may temporarily conceal it. */
(()=>{
 let state='idle',timer;
 function finish(next){if(state!=='loading')return;state=next;clearTimeout(timer);const view=document.querySelector('.holo-view');view.classList.remove('holo-loading');if(next==='failed'){view.classList.remove('is-3d');document.getElementById('holo3d').hidden=true}view.setAttribute('aria-busy','false');document.getElementById('holo-loading-status').hidden=true;}
 window.holoLoading={get state(){return state},begin(){if(state!=='idle')return;state='loading';const view=document.querySelector('.holo-view');view.classList.add('holo-loading');view.setAttribute('aria-busy','true');document.getElementById('holo-loading-status').hidden=false;timer=setTimeout(()=>finish('failed'),12000)},ready(){finish('ready')},fail(){finish('failed')}};
})();
