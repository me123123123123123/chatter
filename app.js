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


//
// FIXED: SAFELY GET THE NEXT SEQUENTIAL NUMBER
//
async function getNextNumber(type) {
  const ref = doc(db, "counters", type);

  return await runTransaction(db, async (transaction) => {
    // Correct transaction read
    const snap = await transaction.get(ref);
    
    let nextCount = 1;

    if (snap.exists()) {
      nextCount = (snap.data().count || 0) + 1;
    }

    // Set or update the document safely
    transaction.set(ref, { count: nextCount }, { merge: true });

    return nextCount;
  });
}


// GOOGLE LOGIN
document.getElementById("btn-google").onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};


// LOGOUT
document.getElementById("btn-logout").onclick = () => {
  signOut(auth);
};


// AUTH
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    document.getElementById("auth-logged-out").style.display = "block";
    document.getElementById("auth-logged-in").style.display = "none";
    document.getElementById("main-compose").style.display = "none";
    return;
  }

  uid = user.uid;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    let name = prompt("Choose your username");

    if (!name) name = "User" + Date.now();

    const number = await getNextNumber("users");

    await setDoc(userRef, {
      username: name,
      userNumber: number,
      email: user.email,
      createdAt: Date.now()
    });

    username = name;
  } else {
    username = snap.data().username;
  }

  // UI UPDATE
  document.getElementById("auth-logged-out").style.display = "none";
  document.getElementById("auth-logged-in").style.display = "block";
  document.getElementById("main-compose").style.display = "block";
  document.getElementById("current-user-display").textContent = "@" + username;

  loadPosts();
});


// CREATE POST
document.getElementById("btn-post").onclick = async () => {
  if (!uid) return alert("Login first");

  const box = document.getElementById("tweet-input");
  const text = box.value.trim();

  if (!text) return;

  try {
    const postNumber = await getNextNumber("posts");

    await addDoc(collection(db, "posts"), {
      postNumber,
      body: text,
      authorUID: uid,
      authorUsername: username,
      timestamp: Date.now(),
      likes: [],
      replies: []
    });

    box.value = "";
  } catch (error) {
    console.error("Error creating post:", error);
    alert("Could not publish post. Check developer console.");
  }
};


// LOAD POSTS
function loadPosts() {
  if (postsListener) postsListener();

  const q = query(
    collection(db, "posts"),
    orderBy("timestamp", "desc")
  );

  postsListener = onSnapshot(q, (snap) => {
    timeline.innerHTML = "";

    snap.forEach(post => {
      const data = post.data();
      const div = document.createElement("div");
      div.className = "tweet";

      // Display '#' followed by the post number (or blank if it doesn't have one yet)
      const displayNum = data.postNumber !== undefined ? `#${data.postNumber}` : '';

      div.innerHTML = `
        <div class="tweet-header">
          <b>@${data.authorUsername}</b>
          <span style="color: gray; font-size: 0.8em; margin-left: 5px;">${displayNum}</span>
        </div>
        <div class="tweet-body">
          ${data.body}
        </div>
      `;

      timeline.appendChild(div);
    });
  });
}
