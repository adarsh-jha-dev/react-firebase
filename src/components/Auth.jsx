import React, { useEffect, useState } from "react";
import { auth, googleProvider } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inputType, setInputType] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = auth?.currentUser;
    if (user) {
      setUser(user);
      console.log(user);
    }
  }, [user]);

  const signIn = async () => {
    setPending(true);
    await createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        setPending(false);
      })
      .catch((err) => {
        setError(err.message);
        setPending(false);
      })
      .finally(() => {
        setEmail("");
        setPassword("");
      });
  };

  const signInWithGoogle = async () => {
    try {
      setPending(true);
      const user = await signInWithPopup(auth, googleProvider);
      setUser(user.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="">
      {pending && <p>Loading...</p>}
      {user && <p>Welcome {user.email}</p>}
      {user && (
        <img
          src={user.photoURL}
          style={{
            borderRadius: "50%",
            width: "100px",
            height: "100px",
          }}
          alt="user"
          width={100}
          height={100}
        />
      )}
      {user && (
        <button onClick={logout} disabled={pending}>
          {pending ? "Logging you out" : "Logout"}
        </button>
      )}
      {error && <p>{error}</p>}
      {!user && (
        <div>
          <input
            type="text"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            value={email}
          />
          <input
            type={inputType ? "password" : "text"}
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => setInputType((prev) => !prev)}>
            {inputType ? "Show" : "Hide"} Password
          </button>
          <button onClick={signIn} disabled={pending}>
            {pending ? "Signing" : "Sign"} In
          </button>

          <button onClick={signInWithGoogle}>Sign In with Google</button>
        </div>
      )}
    </div>
  );
};

export default Auth;
