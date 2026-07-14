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
runTransaction // <-- Added runTransaction for safe counting
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



const timeline = document.getElementById("timeline");


//
// NEW: HELPER TO SAFELY INCREMENT COUNTERS
//
async function getNextNumber(type) { // type is either 'users' or 'posts'
  const counterRef = doc(db, "counters", type);

  return await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    
    if (!counterDoc.exists()) {
      throw "Counter document does not exist!";
    }

    // Read current count, add 1, write it back, then return it
    const newCount = counterDoc.data().count + 1;
    transaction.update(counterRef, { count: newCount });
    return newCount;
  });
}


//
// GOOGLE LOGIN
//
document
.getElementById("btn-google")
.onclick = async () => {
  await signInWithPopup(auth, provider);
};



//
// LOGOUT
//
document
.getElementById("btn-logout")
.onclick = () => {
  signOut(auth);
};



//
// AUTH CHECK (Handles User Registration with userNumber)
//
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    document.getElementById("auth-logged-out").style.display = "block";
    document.getElementById("auth-logged-in").style.display = "none";
    return;
  }

  uid = user.uid;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    let name = prompt("Choose your username");

    if (!name) {
      name = "User" + Date.now();
    }

    // Get the next sequential user ID!
    const nextUserNumber = await getNextNumber("users");

    await setDoc(userRef, {
      username: name,
      userNumber: nextUserNumber, // <-- Saved here!
      email: user.email,
      createdAt: Date.now()
    });

    username = name;
  } else {
    username = snap.data().username;
  }

  document.getElementById("auth-logged-out").style.display = "none";
  document.getElementById("auth-logged-in").style.display = "block";
  document.getElementById("current-user-display").textContent = "@" + username;

  loadPosts();
});





//
// CREATE POST (Saves post with postNumber)
//
document
.getElementById("btn-post")
.onclick = async () => {

  let box = document.getElementById("tweet-input");
  let text = box.value.trim();

  if (!text) return;

  // Get the next sequential post ID!
  const nextPostNumber = await getNextNumber("posts");

  await addDoc(collection(db, "posts"), {
    postNumber: nextPostNumber, // <-- Saved here!
    body: text,
    authorUID: uid,
    authorUsername: username,
    timestamp: Date.now(),
    likes: [],
    replies: []
  });

  box.value = "";
};





//
// LOAD POSTS
//
function loadPosts() {
  const q = query(
    collection(db, "posts"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snap) => {
    timeline.innerHTML = "";

    snap.forEach(post => {
      let data = post.data();
      let div = document.createElement("div");
      div.className = "tweet";

      div.innerHTML = `
        <div class="tweet-header">
          <b>@${data.authorUsername}</b> 
          <!-- You can optionally show post numbers here like this: -->
          <span style="color: gray; font-size: 0.8em;">#${data.postNumber || ''}</span>
        </div>
        <div class="tweet-body">
          ${data.body}
        </div>
      `;

      timeline.appendChild(div);
    });
  });
}
