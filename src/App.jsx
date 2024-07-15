import { useEffect, useState } from "react";
import "./App.css";
import Auth from "./components/Auth";
import { auth, db } from "./config/firebase";
import {
  getDocs,
  deleteDoc,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

function App() {
  const [movieList, setMovieList] = useState([]);
  const [title, setTitle] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [receivedOscar, setReceivedOscar] = useState(false);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [updateTitle, setUpdateTitle] = useState("");

  const handleOscarChange = (value) => {
    setReceivedOscar(value);
  };

  const deleteMovie = async (id) => {
    try {
      setPending(true);
      const docRef = doc(db, "movies", id);
      const doc = getDoc(docRef);
      const owner = doc?.user;
      if (owner && owner !== user?.uid) {
        setError(`You're not auhtorized to edit this movie`);
        return;
      } else {
        await deleteDoc(docRef);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  };

  const updateMovieTitle = async (id) => {
    try {
      setPending(true);
      const docRef = doc(db, "movies", id);
      const doc = getDoc(docRef);
      const owner = doc?.user;
      if (owner && owner !== user?.uid) {
        setError(`You're not auhtorized to edit this movie`);
        return;
      } else {
        await updateDoc(docRef, {
          title: updateTitle,
        });
      }
    } catch (error) {
      setError(error);
    } finally {
      setPending(false);
      setUpdateTitle("");
    }
  };

  const addMovie = async () => {
    try {
      setPending(true);
      const movieCollectionRef = collection(db, "movies");
      const user = auth.currentUser;
      if (!user) {
        alert(`Please log in to add movies`);
        return;
      }
      await addDoc(movieCollectionRef, {
        title,
        releaseDate,
        receivedOscar,
        user: auth?.currentUser?.uid,
      });
      setTitle("");
      setReleaseDate("");
      setReceivedOscar(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  };

  const getMovieList = async () => {
    const movieCollectionRef = collection(db, "movies");
    const data = await getDocs(movieCollectionRef);
    const filteredData = data.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMovieList(filteredData);
  };

  useEffect(() => {
    getMovieList();
  }, [db, getMovieList]);
  return (
    <div className="">
      <Auth />
      {error && <p>{error}</p>}
      <div>
        <input
          type="text"
          value={title}
          placeholder="Enter Movie Title.."
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          value={releaseDate}
          placeholder="Enter release year.."
          onChange={(e) => setReleaseDate(e.target.value)}
        />
        <label>Received Oscar</label>
        <input
          type="checkbox"
          name="oscar"
          checked={receivedOscar}
          onChange={(e) => setReceivedOscar(e.target.checked)}
        />
        <button disabled={pending} onClick={addMovie}>
          {pending ? "Adding" : "Add"} Movie
        </button>
      </div>
      <div>
        {movieList.map((movie) => (
          <div key={movie.id}>
            <h2
              style={{
                color: movie.receivedOscar ? "green" : "red",
              }}
            >
              {movie.title}
            </h2>
            <p>{movie.releaseDate}</p>
            <button onClick={() => deleteMovie(movie.id)}>Delete Movie</button>
            <input
              type="text"
              onChange={(e) => setUpdateTitle(e.target.value)}
              placeholder="New Title..."
            />
            <button
              disabled={updateTitle === "" || pending}
              onClick={() => updateMovieTitle(movie.id)}
            >
              {pending ? "Updating" : "Update"} Title
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
