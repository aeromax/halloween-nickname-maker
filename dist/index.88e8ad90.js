let e,t;const n=document.querySelector(".typing-form"),o=document.querySelector(".chat-history"),l=document.querySelector(".chat-list"),s=document.querySelector("#delete-chat-button");document.querySelector("#send-message-button");const r=document.querySelector("#nameField"),a=document.querySelector("#costumeField");let i=[],c=!1;const d=function(e){let t=e.indexOf("*"),n=e.lastIndexOf("*");return -1===t||-1===n?{before:e,after:""}:{before:e.substring(0,t).trim(),after:e.substring(n+1).trim()}},u=function(e){let t=e.match(/\*(.*?)\*/);return t?t[1]:null},h=async e=>{try{if(!(await fetch("http://localhost:3000/log",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({entryID:e})})).ok)throw Error(err);m()}catch(e){console.log(e.stack)}},m=async()=>{let e=`<div class="message-content">
					<p class="text"></p>
                </div>
				<span class="material-symbols-rounded icon hide">delete</span>`;try{let t=await fetch("http://localhost:3000/log",{method:"GET",headers:{"Content-Type":"application/json"}});if(!t.ok)throw Error("Failed to fetch log data");let n=await t.json();for(entry in n=n.sessionHistory){i.push(n[entry]);let t=n[entry].result,l=n[entry].msgID,s=p(e);s.setAttribute("data-id",l),s.querySelector(".text").append(t),o.prepend(s)}console.log(`Refreshed log with ${n.length} entries`)}catch(e){console.log(e)}},p=(e,...t)=>{let n=document.createElement("div");return n.classList.add("message",...t),n.innerHTML=e,n},y=(e,t,n)=>{let l=d(e),s=[l.before.split(" "),[u(e)],l.after.split(" ")];for(let e=0;e<t.length;e++){let n=s[e],l=t[e],r=0,a=setInterval(()=>{l.innerText+=(0===r?"":" ")+n[r++],r===n.length&&(clearInterval(a),c=!1),o.scrollTo(0,o.scrollHeight)},50)}},g=async n=>{let l=n.querySelectorAll(".text");try{let s=await fetch("http://localhost:3000/generate-nickname",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e,costume:t})}),r=await s.json();if(!s.ok)throw Error(r.err);let a=r.nickname;y(a,l,n),o.innerHTML=" ",m()}catch(e){console.log(`Couldn't fetch nickname: ${e}`),c=!1,l[1].innerText=e,l[1].parentElement.closest(".message").classList.add("error.message")}finally{n.classList.remove("loading")}},f=()=>{let e=p(`<div class="message-content">
	<p class="text text1"></p>
	<p class="text text3 nickname-bold"></p>
	<p class="text text2"></p>
	<div class="loading-indicator">
		<div class="loading-bar"></div>
		<div class="loading-bar"></div>
		<div class="loading-bar"></div>
	</div>
</div>
`,"incoming","loading");l.appendChild(e),g(e)},v=()=>{e=r.value,t=a.value,e&&t&&!c&&(c=!0,n.reset(),l.innerHTML="",setTimeout(f,500))};s.addEventListener("click",()=>{confirm("Are you sure you want to delete all the chats?")&&h()}),n.addEventListener("submit",e=>{e.preventDefault(),v()}),m();
//# sourceMappingURL=index.88e8ad90.js.map
