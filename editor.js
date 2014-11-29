var midimal = require('midimal');
var concat = require('concat-stream');
var notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'].reverse();

var create = function(html) {
  var table = document.createElement('table');
  for (var i = 0; i < 24; i++) {
    var tr = document.createElement('tr');
    for (var j = 0; j < 50; j++) {
      var td = document.createElement('td');
      if (j === 0) td.innerHTML = notes[i % 12];
      tr.appendChild(td);
    }

    table.appendChild(tr);
  }
  if (html) table.innerHTML = html;

  [].forEach.call(table.querySelectorAll('td'), function(td) {
    td.addEventListener('click', function(e) {
      e.target.className = e.target.className === '' ? 'marked': '';
    });
  });

  var getMidi = function(cb) {
    var midi = new midimal.MIDI({volume: 127});

    var createTrack = function(tr, scale) {
      var track = midi.track();
      track.instrument(midimal.utils.instrument().from_name('Acoustic Grand Piano'));

      var delta = 0;
      var noteName = tr.querySelector('td').innerHTML;

      [].forEach.call(tr.querySelectorAll('td'), function(td, i) {
        if (!i) return;
        var noteLetter = noteName[0];
        var noteSuffix = noteName[1] || '';
        if (td.className === 'marked') {
          track.note(midimal.utils.note().from_name(noteLetter, scale, noteSuffix), 150, delta);
          delta = 0;
          return;
        }
        delta += 150;
      });
    };
    [].forEach.call(table.querySelectorAll('tr'), function(tr, i) {
      if (tr.querySelectorAll('.marked').length) createTrack(tr, i > 11 ? 3 : 4);
    });

    var cs = concat(function(buf) {
      cb(buf);
    });

    midi.write(cs);
    cs.end();
  };

  return {
    table: table,
    getMidi: getMidi
  };
};

module.exports = create;
