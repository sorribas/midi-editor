var editor = require('./editor');
var MIDIFile = require('midifile');
var MIDIPlayer = require('midiplayer');
var levelup = require('levelup');
var leveljs = require('level-js');
var hutModal = require('hut-modal');

db = levelup('foo', { db: leveljs });

var ed = editor();
document.querySelector('#main').appendChild(ed.table);

document.querySelector('#get-midi').addEventListener('click', function() {
  ed.getMidi(function(buf) {
    var a = document.createElement('a');
    a.href = 'data:application/octet-stream;base64,' + buf.toString('base64');
    a.download = 'song.mid'
    a.click();
  });
});

document.querySelector('#play').addEventListener('click', function() {
  ed.getMidi(function(buf) {
    navigator.requestMIDIAccess().then(function(midiAccess) {

      console.log(midiAccess.outputs());
      var midiPlayer = new MIDIPlayer({
        'output': midiAccess.outputs()[2]
      });

      var midiFile = new MIDIFile(buf.toArrayBuffer());

      midiPlayer.load(midiFile);

      midiPlayer.play(function() {
        console.log('Play ended');
      });
    }, function() {});
  });
});

document.querySelector('#save').addEventListener('click', function() {
  var html = ed.table.innerHTML;
  var modal = hutModal(document.querySelector('#save-modal'));
  modal.on('result', function() {
    db.put(document.querySelector('#song-name').value, html, function(err) {
      console.log(err);
    });
  });
  modal.show();
});

var openSong = function(key, modal) {
  return function() {
    db.get(key, function(err, data) {
      document.querySelector('#main').removeChild(ed.table);
      ed = editor(data);
      document.querySelector('#main').appendChild(ed.table);
      modal.hide();
    });
  };
};

document.querySelector('#open').addEventListener('click', function() {
  var list = document.querySelector('#song-list');
  list.innerHTML = '';
  db.createKeyStream().on('data', function(key) {
    var p = document.createElement('p');
    var a = document.createElement('a');
    a.innerHTML = key;
    a.href = '#';
    a.addEventListener('click', openSong(key, modal))
    p.appendChild(a);
    list.appendChild(p);
  });

  var modal = hutModal(document.querySelector('#open-modal'));
  modal.show();
});
