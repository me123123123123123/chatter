import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
getDoc,
setDoc,
doc,
onSnapshot,
query,
orderBy,
runTransaction
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
getAuth,
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyBZl58Vjk_84vvNNaHRMADK4Ba0EwR_S6M",
  authDomain: "happy-vs-mad.firebaseapp.com",
  projectId: "happy-vs-mad",
  storageBucket: "happy-vs-mad.firebasestorage.app",
  messagingSenderId: "569442919002",
  appId: "1:569442919002:web:16fbfd4f36a85033196e63",
  measurementId: "G-VV5ZNERHE6"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();


let username = null;
let uid = null;

let postsListener = null;


const timeline = document.getElementById("timeline");



async function getNextNumber(type){

const ref = doc(db,"counters",type);


return await runTransaction(db, async(transaction)=>{

const snap = await transaction.get(ref);


if(!snap.exists()){

transaction.set(ref,{
count:1
});

return 1;

}


const next = snap.data().count + 1;


transaction.update(ref,{
count:next
});


return next;


});

}




// GOOGLE LOGIN

document.getElementById("btn-google").onclick = async()=>{

try{

await signInWithPopup(
auth,
provider
);

}

catch(err){

console.error(err);

alert(err.message);

}

};




// LOGOUT

document.getElementById("btn-logout").onclick=()=>{

signOut(auth);

};






// AUTH

onAuthStateChanged(auth,async(user)=>{


if(!user){


document.getElementById("auth-logged-out").style.display="block";

document.getElementById("auth-logged-in").style.display="none";

document.getElementById("main-compose").style.display="none";


return;

}



uid=user.uid;



const userRef=doc(db,"users",uid);

const snap=await getDoc(userRef);



if(!snap.exists()){


let name=prompt(
"Choose your username"
);


if(!name)
name="User"+Date.now();



const number =
await getNextNumber("users");



await setDoc(userRef,{

username:name,

userNumber:number,

email:user.email,

createdAt:Date.now()

});



username=name;


}

else{


username=snap.data().username;


}




// UI UPDATE

document.getElementById("auth-logged-out").style.display="none";

document.getElementById("auth-logged-in").style.display="block";

document.getElementById("main-compose").style.display="block";


document.getElementById("current-user-display")
.textContent="@"+username;



loadPosts();



});








// CREATE POST

document.getElementById("btn-post").onclick=async()=>{


if(!uid)
return alert("Login first");



const box=document.getElementById("tweet-input");


const text=box.value.trim();



if(!text)
return;



const postNumber =
await getNextNumber("posts");



await addDoc(
collection(db,"posts"),
{

postNumber,

body:text,

authorUID:uid,

authorUsername:username,

timestamp:Date.now(),

likes:[],

replies:[]

}

);


box.value="";


};








function loadPosts(){


if(postsListener)
postsListener();



const q=query(
collection(db,"posts"),
orderBy("timestamp","desc")
);



postsListener=onSnapshot(q,(snap)=>{


timeline.innerHTML="";


snap.forEach(post=>{


const data=post.data();



const div=document.createElement("div");

div.className="tweet";


div.innerHTML=`

<div class="tweet-header">

<b>
@${data.authorUsername}
</b>

<span>
#${data.postNumber}
</span>

</div>


<div class="tweet-body">

${data.body}

</div>

`;



timeline.appendChild(div);



});



});



}
