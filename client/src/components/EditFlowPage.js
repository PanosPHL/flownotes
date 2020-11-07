import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import YouTube from 'react-youtube';
import PlayerContext from '../contexts/PlayerContext';
import FlowPlayerControls from './FlowPlayerControls';
import NoteButton from './NoteButton';
import NewNoteForm from './NewNoteForm';
import styles from '../css-modules/EditFlowPage.module.css';
import NoteCard from './NoteCard';
import FlowTitleAndForm from './FlowTitleAndForm';
import SideNavComponent from './SideNavComponent';
import { withRouter } from 'react-router-dom';

const EditFlowPage = (props) => {
    const id = Number(window.location.toString().split('/')[4]);
    const userId = useSelector(state => state.auth.id);

    const currentFlow = useSelector(state => state.entities.flows[id]);
    const myFlow = useSelector(state => currentFlow.userId === state.auth.id);
    const notes = useSelector(state => currentFlow.notes ? Object.values(state.entities.notes).filter((note) => currentFlow.notes.includes(note.id)) : []);
    const [playing, setPlaying] = useState(false);
    const [player, setPlayer] = useState(null);
    const [timestamp, setTimestamp] = useState(0);
    const [controllable, setControllable] = useState(true);
    const [pausedCard, setPausedCard] = useState(-1);

    const sortNotes = (a, b) => {
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
        if (!controllable) {
            return;
        }

        else if (event.code === 'ArrowLeft') {
            document.querySelector('#rewind').click();
        } else if (event.code === 'Space') {
            document.getElementById('play/pause').click();
        } else if (event.code === 'ArrowRight') {
            document.querySelector('#forward').click();
        }
    }


    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keyup', handleKeyUp);
        }
    });

    // useEffect(() => {
    //     const fetchCurrentFlow = async () => {
    //         const res = await fetch(`/api/flows/${id}`);
    //         res.data = await res.json();
    //         if (res.ok && res.data.flow !== null) {
    //             setCurrentFlow(res.data.flow);

    //             if (res.data.flow.userId === userId) {
    //                 setMyFlow(true);
    //             }
    //             return;
    //         }

    //         props.history.push('/not-found');
    //     }

    //         fetchCurrentFlow();
    // }, [id, userId, props.history]);

    // const addNoteToFlow = (note) => {
    //     const notes = [...currentFlow.Notes];
    //     notes.push(note);
    //     notes.sort(sortNotes);
    //     const newState = Object.assign({}, currentFlow);
    //     newState.Notes = notes;
    //     setCurrentFlow(newState);
    // }

    // const deleteNoteFromFlow = (noteId) => {
    //     const newState = Object.assign({}, currentFlow);
    //     let slice;
    //     for (let i = 0; i < newState.Notes.length; i++) {
    //         if (newState.Notes[i].id === noteId) {
    //             slice = i;
    //             break;
    //         }
    //     }
    //     newState.Notes = [...newState.Notes.slice(0, slice), ...newState.Notes.slice(slice + 1)];
    //     setCurrentFlow(newState);
    // }

    const toggleControllable = () => {
        setControllable(!controllable);
    }

    const toggleDisplayNoteForm = () => {
        toggleControllable();
        document.querySelector('.submit-note').classList.toggle('hidden');
    }

    const opts = {
        height: 630,
        width: 1120,
        playerVars: {
            disablekb: 1,
            autoplay: 1
        }
    }

    let setTimestampInterval;

    const onReady = (event) => {
        setPlayer(event.target);
    }

    const onPlay = () => {
        setPlaying(true);
        setTimestampInterval = setInterval(() => {
            setTimestamp(player.getCurrentTime(), 2);
        }, 50);
        setTimeout(() => {
            setPausedCard(-1);
        }, 100);
    }

    const onPause = () => {
        setPlaying(false);
        setTimestamp(player.getCurrentTime(), 2);
        clearInterval(setTimestampInterval);
    }

    const togglePlay = () => {
        if (!controllable) {
            return;
        }

        if (playing) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }

    const seek = (event) => {
        if (!controllable) {
            return;
        }

        if (playing) {
            let time = player.getCurrentTime();

            if (event.target.id === 'rewind') {
                player.seekTo(time - 2);
            }

            if (event.target.id === 'forward') {
                player.seekTo(time + 2)
            }

            setPausedCard(-1);
        }
    }

    const value = {
        id,
        player,
        playing,
        controllable,
        handlers: {
            togglePlay,
            seek,
            toggleDisplayNoteForm,
        },
        timestamp,
        setControllable,
        pausedCard,
        setPausedCard,
        currentFlow,
        myFlow
    }

    return (
        <>
        <SideNavComponent />
        <PlayerContext.Provider value={value}>
            <div className={styles.pageContainer}>
            <div id='formAndPlayerContainer' className={styles.formAndPlayerContainer}>
            <FlowTitleAndForm flowName={currentFlow.name} id={currentFlow.id}/>
                <YouTube opts={opts} onPlay={onPlay} onPause={onPause} onReady={onReady} videoId={currentFlow.videoId} />
                <div className={styles.buttonContainer}>
                { currentFlow.userId === userId ?
                <>
                <NewNoteForm />
                <NoteButton />
                </> :
                <div>
                </div>}
                <FlowPlayerControls />
                </div>
            </div>
            <div className='noteCardContainer'>
                <h5 className={styles.noteContainerHeader + ' font-weight-bold'}>Notes</h5>
                {notes && notes.length ?
                    notes.map((note, i) => {
                        return (
                            <NoteCard key={`note-${i + 1}`} content={note.content} timestamp={note.timestamp} noteId={note.id} i={i + 1} myFlow={userId === currentFlow.userId}/>
                        )
                    }) : <> </>}
            </div>
            </div>
        </PlayerContext.Provider>
        </>
    )
}

export default withRouter(EditFlowPage);