import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPausedCard } from '../store/session';
import YouTube from 'react-youtube';
import PlayerContext from '../contexts/PlayerContext';
import FlowPlayerControls from './FlowPlayerControls';
import NoteButton from './NoteButton';
import NewNoteForm from './NewNoteForm';
import styles from '../css-modules/EditFlowPage.module.css';
import NoteCard from './NoteCard';
import FlowTitleAndForm from './FlowTitleAndForm';
import { Redirect, withRouter } from 'react-router-dom';

const EditFlowPage = (props) => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.session.id);
  const currentFlow = useSelector(
    (state) => state.entities.flows[props.match.params.id]
  );
  const myFlow = useSelector((state) =>
    currentFlow ? currentFlow.userId === state.session.id : false
  );
  const notes = useSelector((state) =>
    currentFlow
      ? Object.values(state.entities.notes)
          .filter((note) => currentFlow.notes.includes(note.id))
          .sort(sortNotes)
      : []
  );
  const pausedCard = useSelector((state) => state.session);
  const { newNoteForm, editNoteForm, titleForm } = useSelector(
    (state) => state.ui.flow
  );
  const [playing, setPlaying] = useState(false);
  const [player, setPlayer] = useState(null);
  const [timestamp, setTimestamp] = useState(0);

  function sortNotes(a, b) {
    const timeA = parseFloat(a.timestamp);
    const timeB = parseFloat(b.timestamp);

    let comparison = 0;
    if (timeA > timeB) {
      comparison = 1;
    } else if (timeA < timeB) {
      comparison = -1;
    }
    return comparison;
  }

  const handleKeyUp = (event) => {
    event.stopPropagation();
    if (newNoteForm || editNoteForm || titleForm) {
      return;
    } else if (event.code === 'ArrowLeft') {
      document.querySelector('#rewind').click();
    } else if (event.code === 'Space') {
      document.getElementById('play/pause').click();
    } else if (event.code === 'ArrowRight') {
      document.querySelector('#forward').click();
    }
  };

  useEffect(() => {
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      dispatch(setPausedCard(null));
      clearInterval(setTimestampInterval);
    };
  }, [dispatch]);

  const opts = {
    playerVars: {
      disablekb: 1,
      autoplay: 1,
    },
  };

  let setTimestampInterval;

  const onReady = (event) => {
    setPlayer(event.target);
  };

  const onPlay = () => {
    setPlaying(true);
    setTimestampInterval = setInterval(() => {
      setTimestamp(player.getCurrentTime(), 2);
    }, 50);
    setTimeout(() => {
      dispatch(setPausedCard(null));
    }, 100);
  };

  const onPause = () => {
    setPlaying(false);
    setTimestamp(player.getCurrentTime(), 2);
    clearInterval(setTimestampInterval);
  };

  const togglePlay = () => {
    if (newNoteForm || editNoteForm || titleForm) {
      return;
    }

    if (playing) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const seek = (event) => {
    if (newNoteForm || editNoteForm || titleForm) {
      return;
    }

    if (playing) {
      let time = player.getCurrentTime();

      if (event.target.id === 'rewind') {
        player.seekTo(time - 2);
      }

      if (event.target.id === 'forward') {
        player.seekTo(time + 2);
      }

      dispatch(setPausedCard(null));
    }
  };

  const value = {
    id: props.match.params.id,
    player,
    playing,
    handlers: {
      togglePlay,
      seek,
    },
    timestamp,
    pausedCard,
    currentFlow,
    myFlow,
  };

  if (!currentFlow) {
    return <Redirect to="/not-found" />;
  }

  return (
    <PlayerContext.Provider value={value}>
      <div className={styles.pageContainer}>
        <div
          id="formAndPlayerContainer"
          className={styles.formAndPlayerContainer}
        >
          <FlowTitleAndForm flowName={currentFlow.name} id={currentFlow.id} />
          <div className={styles.videoContainer}>
            <YouTube
              opts={opts}
              onPlay={onPlay}
              onPause={onPause}
              onReady={onReady}
              videoId={currentFlow.videoId}
              className={styles.videoPlayer}
            />
            {currentFlow.userId === userId ? <NewNoteForm /> : <></>}
          </div>
          <div className={styles.buttonContainer}>
            {currentFlow.userId === userId ? <NoteButton /> : <div></div>}
            <FlowPlayerControls />
          </div>
        </div>
        <div className="noteCardContainer">
          <h5 className={styles.noteContainerHeader + ' font-weight-bold'}>
            Notes
          </h5>
          {notes && notes.length ? (
            notes.map((note, i) => {
              return (
                <NoteCard
                  key={`note-${i + 1}`}
                  length={notes.length}
                  content={note.content}
                  timestamp={note.timestamp}
                  noteId={note.id}
                  i={i + 1}
                  myFlow={userId === currentFlow.userId}
                />
              );
            })
          ) : (
            <> </>
          )}
        </div>
      </div>
    </PlayerContext.Provider>
  );
};

export default withRouter(EditFlowPage);
