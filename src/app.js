import React, { Component } from 'react';
import './style.scss';
import io from 'socket.io-client';
import AddNote from './components/insertnote';
import Note from './components/note';
// import * as db from './services/datastore';

const socketserver = 'https://web-socket-backend.herokuapp.com/';

const { Map } = require('immutable');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: new Map(),
      maxZIndex: 0,
    };

    this.socket = io(socketserver);
    // this.socket.on('connect', () => { console.log('socket.io connected'); });
    // this.socket.on('disconnect', () => { console.log('socket.io disconnected'); });
    // this.socket.on('reconnect', () => { console.log('socket.io reconnected'); });
    // this.socket.on('error', (error) => { console.log(error); });
  }

  componentDidMount() {
    // db.fetchNotes((notes) => {
    //   this.setState({ notes: new Map(notes) });
    // });
    this.socket.on('notes', (notes) => {
      this.setState({ notes: new Map(notes) });
    });
  }

  // Function to add a note (on firebase)
  addNote = (t) => {
    const zIdx = this.state.maxZIndex + 1;
    this.setState({ maxZIndex: zIdx });
    const newNote = {
      title: t, text: '', x: 0, y: 0, zIndex: zIdx,
    };
    // db.getDB().ref('notes').push(newNote);
    this.socket.emit('createNote', newNote);
  }

  // Function to delete a note (on firebase)
  deleteNote = (id) => {
    if (this.state.notes.count() === 1) {
      this.setState({ maxZIndex: 0 });
    }
    // db.getDB().ref('notes').child(id).remove();
    this.socket.emit('deleteNote', id);
  }

  // Function to delete all notes
  clearAll = () => {
    const keys = [];
    for (const key of this.state.notes.keySeq()) {
      keys.push(key);
    }
    for (const key of keys) {
      this.deleteNote(key);
    }
  }

  // Function to update the map on firebase
  updateMap = (id, newNote) => {
    // db.getDB().ref('notes').child(id).update(newNote);
    this.socket.emit('updateNote', id, newNote);
  }

  // Function to update the maximum z index
  updateZIndex = (newMax) => {
    this.setState({ maxZIndex: newMax });
  }

  // Getter function for max Z
  getMaxZ = () => {
    let max = 0;
    for (const note of this.state.notes.valueSeq()) {
      if (note.zIndex > max) {
        max = note.zIndex;
      }
    }
    return max;
  }

  // Render these components
  render() {
    return (
      <div>
        <h1>NOTES</h1>
        <AddNote addNew={this.addNote} clear={this.clearAll} />
        {this.state.notes.entrySeq().map(([id, note]) => {
          return <Note id={id} note={note} delete={this.deleteNote} update={this.updateMap} getMaxZ={this.getMaxZ} updateZIndex={this.updateZIndex} />;
        })}
      </div>
    );
  }
}

export default App;
