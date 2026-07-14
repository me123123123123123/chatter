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
orderBy
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
  apiKey: "AIzaSyAIWg9Z55PeMTryDlAX8xWIrdZmgwX5BGs",
  authDomain: "chatter-62b1a.firebaseapp.com",
  projectId: "chatter-62b1a",
  storageBucket: "chatter-62b1a.firebasestorage.app",
  messagingSenderId: "321568451104",
  appId: "1:321568451104:web:b8cdd5f4f10b6b7f65aa45",
  measurementId: "G-542HZ96F2G"
};



const app = initializeApp(firebaseConfig);

const db=getFirestore(app);

const auth=getAuth(app);

const provider=new GoogleAuthProvider();



let username=null;
let uid=null;



const timeline=document.getElementById("timeline");



//
// GOOGLE LOGIN
//

document
.getElementById("btn-google")
.onclick=async()=>{

await signInWithPopup(
auth,
provider
);

};



//
// LOGOUT
//

document
.getElementById("btn-logout")
.onclick=()=>{

signOut(auth);

};



//
// AUTH CHECK
//

onAuthStateChanged(auth,async(user)=>{


if(!user){

document
.getElementById("auth-logged-out")
.style.display="block";


document
.getElementById("auth-logged-in")
.style.display="none";


return;

}



uid=user.uid;



const userRef=doc(
db,
"users",
uid
);


const snap=await getDoc(userRef);



if(!snap.exists()){


let name=prompt(
"Choose your username"
);


if(!name)
name="User"+Date.now();



await setDoc(
userRef,
{
username:name,
email:user.email,
createdAt:Date.now()
}
);



username=name;


}else{


username=snap.data().username;


}



document
.getElementById("auth-logged-out")
.style.display="none";


document
.getElementById("auth-logged-in")
.style.display="block";


document
.getElementById("current-user-display")
.textContent="@"+username;



loadPosts();



});





//
// CREATE POST
//

document
.getElementById("btn-post")
.onclick=async()=>{


let box=
document.getElementById("tweet-input");


let text=box.value.trim();



if(!text)
return;



await addDoc(
collection(db,"posts"),
{

body:text,

authorUID:uid,

authorUsername:username,

timestamp:Date.now(),

likes:[],

replies:[]

});


box.value="";


};





//
// LOAD POSTS
//

function loadPosts(){


const q=query(
collection(db,"posts"),
orderBy("timestamp","desc")
);



onSnapshot(q,(snap)=>{


timeline.innerHTML="";



snap.forEach(post=>{


let data=post.data();



let div=document.createElement("div");


div.className="tweet";


div.innerHTML=`

<div class="tweet-header">

<b>@${data.authorUsername}</b>

</div>


<div class="tweet-body">

${data.body}

</div>

`;



timeline.appendChild(div);



});



});



}