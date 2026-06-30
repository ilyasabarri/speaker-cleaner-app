import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { WebView } from 'react-native-webview';

const html = `<!DOCTYPE html><html><body><script>
let ctx, osc, gain;
function start(f, v) {
  if (ctx) ctx.close();
  ctx = new (window.AudioContext||window.webkitAudioContext)();
  osc = ctx.createOscillator(); gain = ctx.createGain();
  osc.type='sine'; osc.frequency.value=f; gain.gain.value=v;
  osc.connect(gain); gain.connect(ctx.destination); osc.start();
}
function stop() { if(ctx){ctx.close();ctx=null;} }
window.addEventListener('message',e=>{try{const d=JSON.parse(e.data);if(d.action==='start')start(d.freq,d.vol);if(d.action==='stop')stop();}catch(x){}});
document.addEventListener('message',e=>{try{const d=JSON.parse(e.data);if(d.action==='start')start(d.freq,d.vol);if(d.action==='stop')stop();}catch(x){}});
</script></body></html>`;

const WebAudioPlayer = forwardRef((props, ref) => {
  const wvRef = useRef(null);
  useImperativeHandle(ref, () => ({
    send: (data) => wvRef.current?.postMessage(JSON.stringify(data)),
  }));
  return (
    <WebView
      ref={wvRef}
      source={{ html }}
      style={{ width: 0, height: 0 }}
      javaScriptEnabled
      mediaPlaybackRequiresUserAction={false}
    />
  );
});

export default WebAudioPlayer;
