import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
getFirestore,
doc,
getDoc,
collection,
query,
where,
getDocs,
orderBy
}
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBZl58Vjk_84vvNNaHRMADK4Ba0EwR_S6M",
  authDomain: "happy-vs-mad.firebaseapp.com",
  projectId: "happy-vs-mad",
  storageBucket: "happy-vs-mad.firebasestorage.app",
  messagingSenderId: "569442919002",
  appId: "1:569442919002:web:16fbfd4f36a85033196e63"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const params = new URLSearchParams(location.search);

const userID = params.get("id");


const usernameText =
document.getElementById("username");

const numberText =
document.getElementById("user-number");

const dateText =
document.getElementById("join-date");

const timeline =
document.getElementById("timeline");



async function loadProfile(){

    const userRef = doc(db,"users",userID);

    const userSnap = await getDoc(userRef);


    if(!userSnap.exists()){

        usernameText.textContent =
        "User not found";

        return;
    }


    const user = userSnap.data();


    usernameText.textContent =
    "@" + user.username;


    numberText.textContent =
    "User #" + user.userNumber;


    dateText.textContent =
    "Joined " +
    new Date(user.createdAt)
    .toLocaleDateString();



    loadPosts(user.username);

}



async function loadPosts(name){


const q = query(
collection(db,"posts"),
where("authorUsername","==",name),
orderBy("timestamp","desc")
);



const posts =
await getDocs(q);



posts.forEach(post=>{


const data = post.data();


const div =
document.createElement("div");


div.className="tweet";


div.innerHTML=`

<div class="tweet-header">
<b>@${data.authorUsername}</b>
#${data.postNumber}
</div>

<div class="tweet-body">
${data.body}
</div>

`;


timeline.appendChild(div);



});

}


loadProfile();
