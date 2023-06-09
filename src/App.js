import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import HCaptcha from '@hcaptcha/react-hcaptcha';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef(null);

  const onLoad = () => {
    captchaRef.current.execute();
  };

  useEffect(() => {
    if (captchaToken)
      console.log(`hCaptcha Token: ${captchaToken}`);
  }, [captchaToken]);

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  const signInWithEmailAndPassword = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setErrorMessage('Please complete the CAPTCHA validation.');
      return;
    }

    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      setErrorMessage(error);
    }
  };

  // Unused for now
  const signUpWithEmailAndPassword = async (e) => {
    e.preventDefault();

    try {
      await auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
      setErrorMessage(error);
    }
  };

  return (<>
    <div>
      <div className='captcha-text'>
        Please complete the Captcha before email login
      </div>
      <HCaptcha
        sitekey="0cd94277-a276-458f-9765-9ada00843da3"
        onLoad={onLoad}
        onVerify={setCaptchaToken}
        ref={captchaRef}
      />
      <form className="email-sign-in-form" onSubmit={signInWithEmailAndPassword}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <h4>{errorMessage}</h4>

        <button type="submit">Sign in</button>
      </form>

      <hr/>

      <button className="sign-in-google" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  </>)
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

    <form className='send-message-form' onSubmit={sendMessage}>
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
      <img alt='User profile picture' src={photoURL || 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'}></img>
      <p>{text}</p>
    </div>
  </>)
}

export default App;
