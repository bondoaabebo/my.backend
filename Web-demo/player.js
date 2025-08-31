function getDeviceId(){
  let id = localStorage.getItem('deviceId');
  if(!id){ id = crypto.randomUUID(); localStorage.setItem('deviceId',id); }
  return id;
}

function applyCaptureGuards(videoEl){
  document.addEventListener('visibilitychange',()=>{
    videoEl.classList.toggle('blurred', document.hidden);
  });
  if('disablePictureInPicture' in videoEl){ videoEl.disablePictureInPicture=true; }
}

async function api(path, method='GET', body, token){
  const res = await fetch(`http://localhost:4000${path}`,{
    method,
    headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}: {}) },
    body: body?JSON.stringify(body):undefined
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

document.getElementById('playBtn').addEventListener('click', async()=>{
  const token = document.getElementById('authToken').value.trim();
  const courseId = document.getElementById('courseId').value.trim();
  const videoId = document.getElementById('videoId').value.trim();
  const deviceId = getDeviceId();

  try{
    await api('/devices/register','POST',{deviceId}, token);
    const { playbackUrl, watermark } = await api('/playback/token','POST',{courseId, videoId, deviceId}, token);
    const vid = document.getElementById('vid');
    const wm = document.getElementById('wm');
    wm.textContent = `Student: ${watermark.name} | ID: ${watermark.id} | Device: ${deviceId}`;
    applyCaptureGuards(vid);
    vid.src = `http://localhost:4000${playbackUrl}`;
    await vid.play();
  }catch(e){ alert(`Error: ${e.message}`); }
});
