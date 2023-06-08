import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp ({
  apiKey: "AIzaSyD_-nra3CC3Wf35wJYqVg3G11S-q1OTuN4",
  authDomain: "chatapp-9cb91.firebaseapp.com",
  projectId: "chatapp-9cb91",
  storageBucket: "chatapp-9cb91.appspot.com",
  messagingSenderId: "287617265836",
  appId: "1:287617265836:web:08789948145338aff9af09"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Chat App</h1>
        <SignOut/>
      </header>

      <section>
        {user ? <ChatRoom/> : <SignIn/>}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button className='sign-in' onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className='sign-out' onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    dummy.current.scrollIntoView({behavior: 'smooth'});
  }

  return (<>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <div ref={dummy}></div>
    </main>

    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder='Write a message'/>
      <button className='sendButton' type='submit'>Send</button>
    </form>
  </>)
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'}></img>
      <p>{text}</p>
    </div>
  </>)
}

export default App;
