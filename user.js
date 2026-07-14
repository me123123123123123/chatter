import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";


import {
getFirestore,
doc,
getDoc,
collection,
query,
where,
orderBy,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";



const firebaseConfig = {

apiKey: "AIzaSyBZl58Vjk_84vvNNaHRMADK4Ba0EwR_S6M",

authDomain: "happy-vs-mad.firebaseapp.com",

projectId: "happy-vs-mad",

storageBucket: "happy-vs-mad.firebasestorage.app",

messagingSenderId: "569442919002",

appId: "1:569442919002:web:16fbfd4f36a85033196e63",

measurementId: "G-VV5ZNERHE6"

};



const app =
initializeApp(firebaseConfig);


const db =
getFirestore(app);




const params =
new URLSearchParams(
window.location.search
);



const userID =
params.get("id");




if(!userID){

document.getElementById("username").textContent =
"No user";

}




// LOAD USER

async function loadUser(){


const ref =
doc(db,"users",userID);



const snap =
await getDoc(ref);



if(!snap.exists()){


document.getElementById("username")
.textContent =
"User not found";


return;


}




const data =
snap.data();



document.getElementById("username")
.textContent =
"@"+data.username;



document.getElementById("userid")
.textContent =
"User #"+data.userNumber;



loadPosts(data.username);



}




// LOAD USER POSTS

function loadPosts(username){


const timeline =
document.getElementById(
"timeline"
);



const q =
query(

collection(db,"posts"),

where(
"authorUsername",
"==",
username
),

orderBy(
"timestamp",
"desc"
)

);



onSnapshot(
q,
(snapshot)=>{


timeline.innerHTML="";



document.getElementById(
"post-count"
)
.textContent =
snapshot.size;




snapshot.forEach(
(post)=>{


const data =
post.data();



const div =
document.createElement(
"div"
);



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



}

);



}

);


}




loadUser();
