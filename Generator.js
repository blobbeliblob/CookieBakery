//PLEASE NOTE THAT EcmaScript 6 IS REQUIRED!

//------------------------------------
//INITIAL DATA
//------------------------------------

//this is the root of the mode
var root;
//notenames
var tonics;
//this is the list of all notes in the mode
var mode;
//number of strings on instrument
var strings;
//number of frets on instrument
var frets;
//this is a list representing the tuning of the instrument
var tuning;
//the tab that can be printed, a list of Note and Chord objects
var tab = [];
//number of desired notes in the melody
var desired_notes;
//maximum fret change between successive notes
var max_fret_jump;
//maximum string change between successive notes
var max_string_jump;
//a boolean to determine whether or not the tab should be printed nicely
var nice_print;
//the type of tab to be generated
var tab_type;
//a boolean to determine whether the tab should include random notes besides modally correct notes
var random_notes;

//initializes the variables with the user defined values
function initialize() {
  root = $("#root").val();
  tonics = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"];
  mode = [];
  for(let i=0; i<tonics.length; i++) {
    if($('[id="'+tonics[i]+'_checkbox"]').is(":checked")) {
      mode.push(tonics[i]);
    }
  }
  strings = parseInt($("#strings").val());
  frets = parseInt($("#frets").val());
  tuning = [];
  for(let i=1; i<=strings; i++) {
    tuning.push($('#tuning_string_'+i).val());
  }
  desired_notes = parseInt($("#notes").val());
  max_fret_jump = parseInt($("#max_fret_jump").val());
  max_string_jump = parseInt($("#max_string_jump").val());
  nice_print = $('[id="nice_print_checkbox"]').is(":checked");
  tab_type = $("#tab_type").val();
  random_notes= $('[id="random_notes_checkbox"]').is(":checked");
}


//------------------------------------
//FUNCTIONALITY
//------------------------------------

//returns a "note" object, the d parameter should be an integer in [1,2,3,4]
function Note(s, f, d = 1) {
  let n = getNoteName(s, f);
  let p = getNotePitch(s, f);
  return {type: "note", string: s, fret: f, name: n, pitch: p, duration: d};
}

//returns a "chord" object, the chord parameter should be a list of Note objects
function Chord(chord, d = 1) {
  return {type: "chord", chord: chord, duration: d};
}

//returns the name of a note on a given string and fret
function getNoteName(s, f) {
  let stringName = $('#tuning_string_'+s).val();
  let noteName = stringName;
  for(let i=0; i<f; i++) {
    if(noteName == "G#") {
      noteName = "A";
    } else {
      noteName = tonics[tonics.indexOf(noteName)+1];
    }
  }
  return noteName;
}

//returns the pitch of a note on a given string and fret
function getNotePitch(s, f) {
  let stringName = $('#tuning_string_'+s).val();
  let noteName = stringName;
  let notePitch = $('#pitch_string_'+s).val();
  let pitchHeight = parseInt(notePitch[notePitch.length-1]);
  for(let i=0; i<f; i++) {
    if(noteName == "G#") {
      noteName = "A";
      pitchHeight++;
    } else {
      noteName = tonics[tonics.indexOf(noteName)+1];
    }
  }
  notePitch = noteName + pitchHeight;
  return notePitch;
}

//returns a random number between min and max, where min >= 0
function getRandom(min, max) {
  return Math.floor((Math.random() * (max - min + 1)) + min);
}

//returns true with a probability of p, where p must be an integer between 0 and 100
function prob(p) {
  if(getRandom(1,100) <= p) {
    return true;
  } else {
    return false;
  }
}

//update an element, apparently this was the function that caused problems
function updateElement(element_id) {
  //$(element_id).load(location.href + " " + element_id);
}

//returns a string with a <p> element containing info about the tab
function tabInfo() {
  let tab_info = '<p id="tab_info">';
  tab_info += 'tuning: ';
  for(let i=0; i<tuning.length; i++) {
    tab_info += tuning[i];
    if(i < tuning.length - 1) {
      tab_info += ', ';
    }
  }
  tab_info += '</p><br><br>';
  return tab_info;
}

//prints the tab to the "#div_tab" element
function printTab(npr = 15) {
  let notes_per_row = npr;  //number of notes per tab row
  let tab_text = '';
  tab_text += tabInfo();    //add information about the tab
  tab_text += '<p id= "tab_sheet">';    //create a <p> element for the tab itself
  let tab_rows = Math.ceil(tab.length/notes_per_row);   //number of tab rows
  let tab_row_elements = '';
  for(let row=0; row<tab_rows; row++) {   //for each tab row
    for(let i=1; i<=strings; i++) {   //for each string, notice the start on i=1
      tab_row_elements += '<span id="row_'+row+'_string_'+i+'" class="tab_row"></span><br>';  //add a <span> element for each string
    }
    tab_row_elements += '<br><br>';   //empty row between tab rows
  }
  tab_text += tab_row_elements;
  tab_text += '</p>';
  $("#div_tab").html(tab_text);   //add the new elements to the "#div_tab" element
  let note_index = 0;   //current note in the tab
  let nice_print_length = 0;    //this is used to determine the longest string, used for the nice print hack
  for(let row=0; row<tab_rows; row++) {   //for each tab row
    let string_list = [];    //this list is for containing a string for each string
    for(let i=1; i<=strings; i++) {   //for each string, notice the start on i=1
      string_list[i-1] = '|---';    //add the default start to the string
    }
    for(let i=0; i<notes_per_row && note_index < tab.length; i++) {
      if(tab[note_index].type == "note") {    //if the note type is a note
        let note = tab[note_index];   //the note
        for(let k=1; k<=strings; k++) {   //for each string, notice the start on i=1
          if(note.string == k) {    //if the note is located on the current string
            string_list[k-1] += note.fret.toString() + '-' + '--'.repeat(note.duration);   //add the note to the string
          } else {
            string_list[k-1] += '--' + '--'.repeat(note.duration);   //add an empty space
            if(note.fret.toString().length == 2) {
              string_list[k-1] += '-';   //add an extra empty space to compensate for double digit
            }
          }
        }
      } else if(tab[note_index].type == "chord") {    //if the note type is a chord
        let chord = tab[note_index];    //the chord
        let occupied_strings = [];    //list used to check if a string already has a note
        let double_digit = false;   //used to determine if the chord has notes with double digit frets
        //this for loop check for double digit frets in the chord
        for(let k=0; k<chord.chord.length; k++) {   //for each note in the chord
          let note = chord.chord[k];    //the note
          if(note.fret.toString().length == 2) {    //if the fret of the note in the chord has two digits
            double_digit = true;    //the chord has a double digit fret
          }
        }
        //this for loop adds the note to corresponding strings
        for(let k=0; k<chord.chord.length; k++) {   //for each note in the chord
          let note = chord.chord[k];    //the note
          if(!occupied_strings.includes(note.string)) {   //if the string does not already have a note
            if(double_digit == true) {    //if the chord has notes with double digit frets
              if(note.fret.toString().length == 2) {    //if the fret of the note has two digits
                string_list[note.string-1] += note.fret.toString() + '-' + '--'.repeat(chord.duration);   //add the note to the string
              } else {    //the fret of the note has only one digit
                string_list[note.string-1] += note.fret.toString() + '--' + '--'.repeat(chord.duration);   //add the note to the string
              }
            } else {    //the chord does not have notes with double digit frets
              string_list[note.string-1] += note.fret.toString() + '-' + '--'.repeat(chord.duration);   //add the note to the string
            }
            occupied_strings.push(note.string);
          }
        }
        //this for loop adds empty space to corresponding strings
        for(let k=1; k<=strings; k++) {   //for each string, notice the start on i=1
          if(!occupied_strings.includes(k)) {   //if the string does not already have a note
            string_list[k-1] += '--' + '--'.repeat(chord.duration);   //add an empty space
            if(double_digit == true) {    //if the chord has notes with double digit frets
              string_list[k-1] += '-';   //add an extra empty space to compensate for double digit
            }
            occupied_strings.push(k);
          }
        }
      }
      note_index++;   //move to the next note in the tab
    }
    //this for loop adds the strings to corresponding <span> elements
    for(let i=1; i<=strings; i++) {   //for each string, notice the start on i=1
      //string_list[i-1] += '|';    //add a final line to the end of the tab row
      $('#row_'+row+'_string_'+i).html(string_list[i-1]);   //add the string text to the corresponding <span> element
    }
  }
  //this is the nice print "pro hacker" fix
  if(nice_print == true) {
    //determine the length of the longest string
    for(let row=0; row<tab_rows; row++) {
      for(let i=1; i<=strings; i++) {
        let str = $('#row_'+row+'_string_'+i).text();
        if(str.length > nice_print_length) {
          nice_print_length = str.length;
        }
      }
    }
    //extend the string until it is of adequate length
    for(let row=0; row<tab_rows; row++) {
      for(let i=1; i<=strings; i++) {
        let str = $('#row_'+row+'_string_'+i).text();
        while(str.length < nice_print_length) {
          str += '-';
        }
        str += '|';
        $('#row_'+row+'_string_'+i).html(str);
      }
    }
  }
  updateElement("#div_tab");    //update the "#div_tab" element
}

//------------------------------------
//GENERATOR LOGIC
//------------------------------------

function generate() {
  tab.length = 0;   //resets tab, this can be changed to tab = []; if needed
  //start note, this will not be added to the tab, but used as a reference for the first note
  let init_str = getRandom(1, strings);
  let init_fret = getRandom(0, frets);
  let last = Note(init_str, init_fret);
  if(tab_type=="notes") {
    generate_notes(last);
  } else if(tab_type=="notes & chords") {
    generate_notes_and_chords(last);
  } else if(tab_type=="chords") {
    generate_chords(last);
  }
}

function generate_notes(last) {
  for(let i=0; i<desired_notes; i++) {
    let new_note;
    if(random_notes && prob(5)) {   //probability of a random note
      if(prob(70)) {    //not so random note
        new_note = get_random_note(last, last.string);
      } else if(prob(50)) {   //more random note
        new_note = get_random_note(last);
      } else {  //completely random note
        new_note = get_random_note();
      }
    } else {
      new_note = get_smart_note(last);
    }
    tab.push(new_note);
    last = new_note;
  }
}

//this is just a combination of generate_notes and generate_chords
function generate_notes_and_chords(last) {
  for(let i=0; i<desired_notes; i++) {
    if(prob(75)) {  //note
      if(last.type == "chord") {
        last = last.chord[getRandom(0, last.chord.length - 1)];
      }
      let new_note;
      if(random_notes && prob(5)) {   //probability of a random note
        if(prob(70)) {    //not so random note
          new_note = get_random_note(last, last.string);
        } else if(prob(50)) {   //more random note
          new_note = get_random_note(last);
        } else {  //completely random note
          new_note = get_random_note();
        }
      } else {
        new_note = get_smart_note(last);
      }
      tab.push(new_note);
      last = new_note;
    } else {  //chord
      let new_chord = get_smart_chord(last);
      tab.push(new_chord);
      last = new_chord;
    }
  }
}

function generate_chords(last) {
  for(let i=0; i<desired_notes; i++) {
    let new_chord = get_smart_chord(last);
    tab.push(new_chord);
    last = new_chord;
  }
}

//returns a Note object, last is the previous note in the tab, str is the desired string of the note
function get_random_note(last = null, str = null) {
  if(last==null) {
    let s = getRandom(1, strings);
    let f = getRandom(0, frets);
    let d = getRandom(1, 4);
    return Note(s, f, d);
  } else if(str==null) {
    let min = get_fret_interval(last).min;
    let max = get_fret_interval(last).max;
    let s = getRandom(1, strings);
    let f = getRandom(min, max);
    let d = getRandom(1, 4);
    return Note(s, f, d);
  } else {
    let min = get_fret_interval(last).min;
    let max = get_fret_interval(last).max;
    let s = str;
    let f = getRandom(min, max);
    let d = getRandom(1, 4);
    return Note(s, f, d);
  }
}

//returns a modally correct Note object, last is the previous note in the tab
function get_smart_note(last) {
  let fret_int = get_fret_interval(last);
  let min_fret = fret_int.min;
  let max_fret = fret_int.max;
  let str_int = get_string_interval(last);
  let min_str = str_int.min;
  let max_str = str_int.max;
  let mode_notes = get_mode_notes(min_str, max_str, min_fret, max_fret);
  let new_note;
  if(mode_notes.length == 0)  {
    new_note = get_random_note(last, getRandom(min_str,max_str));
  } else {
    new_note = mode_notes[getRandom(0, mode_notes.length-1)];
  }
  new_note.duration = get_smart_duration();
  return new_note;
}

//returns a list of modally correct note in the given interval
function get_mode_notes(min_str, max_str, min_fret, max_fret) {
  let mode_notes = [];
  for(let f=min_fret; f<=max_fret; f++) {
    for(let s=min_str; s<=max_str; s++) {
      if(mode.includes(Note(s, f).name)) {
        mode_notes.push(Note(s, f));
      }
    }
  }
  return mode_notes;
}

//returns a smart string interval, last is the previous note in the tab
function get_string_interval(last) {
  let min_str;
  let max_str;
  if(max_string_jump==0) {
    min_str = last.string;
    max_str = last.string;
  } else if(prob(80)) {
    min_str = (last.string - 1 < 1) ? 1 : (last.string - 1);
    max_str = (last.string + 1 > strings) ? strings : (last.string + 1);
  } else if(prob(80+15) && max_string_jump>=2) {
    min_str = (last.string - 2 < 1) ? 1 : (last.string - 2);
    max_str = (last.string + 2 > strings) ? strings : (last.string + 2);
  } else {
    min_str = (last.string - max_string_jump < 1) ? 1 : (last.string - max_string_jump);
    max_str = (last.string + max_string_jump > strings) ? strings : (last.string + max_string_jump);
  }
  return {min: min_str, max: max_str};
}

//returns a smart fret interval, last is the previous note in the tab
function get_fret_interval(last) {
  let min_fret = (last.fret - max_fret_jump < 0) ? 0 : (last.fret - max_fret_jump);
  let max_fret = (last.fret + max_fret_jump > frets) ? frets : (last.fret + max_fret_jump);
  return {min: min_fret, max: max_fret};
}

//returns a duration based on the duration of previous notes in the tab
function get_smart_duration() {
  return 2;
}

//returns a Chord object, last is the previous Note/Chord object in the tab
function get_smart_chord(last) {
  let new_chord = [];
  let size = get_chord_size(last);
  let start_str = get_chord_start_string(size);
  let fret_int = get_chord_fret_interval(last);
  let min_fret = fret_int.min;
  let max_fret = fret_int.max;
  for(let i=0; i<size; i++) {
    let new_note;
    let mode_notes = get_mode_notes(start_str + i, start_str + i, min_fret, max_fret);
    if(mode_notes.length == 0) {
      new_note = Note(start_str + i, getRandom(min_fret,max_fret));
    } else {
      new_note = mode_notes[getRandom(0, mode_notes.length-1)];
    }
    new_chord.duration = get_smart_duration();
    new_chord.push(new_note);
  }
  return Chord(new_chord);
}

//returns an integer describing the amount of notes in the Chord object to be generated, last is the previous Note/Chord object in the tab
function get_chord_size(last) {
  let size;
  if(last.type == "note") {
    size = prob(50) ? 2 : 3;
  } else if(last.type == "chord") {
    let min_size = (last.chord.length - 1 < 2) ? 2 : (last.chord.length - 1);
    let max_size = (last.chord.length + 1 > strings) ? strings : (last.chord.length + 1);
    size = getRandom(min_size, max_size);
  }
  return size;
}

//returns the starting string for the chord, size is the size of the new chord
function get_chord_start_string(size) {
  return getRandom(1, strings - size + 1);
}

//returns a smart chord fret interval, last is the previous Note/Chord object in the tab
function get_chord_fret_interval(last) {
  if(last.type == "chord") {
    last = last.chord[getRandom(0, last.chord.length - 1)];
  }
  let down = prob(50) ? 1 : 2;
  let up = (down == 1) ? 2 : 1;
  let min_fret = (last.fret - down < 0) ? 0 : (last.fret - down);
  let max_fret = (last.fret + up > frets) ? frets : (last.fret + up);
  return {min: min_fret, max: max_fret};
}

//------------------------------------
//RUN THE GENERATOR
//------------------------------------

//when generate button is clicked
$("#button_generate").click(function() {
  initialize();
  generate();
  printTab(15);
});

//part of the "nice print hack", this runs the printTab() method if the nice print checkbox is ticked/unticked
$("#nice_print_checkbox").change(function() {
  if(this.checked) {
    nice_print = true;
  } else {
    nice_print = false;
  }
  printTab();
});

//------------------------------------
//AFTERMATH
//------------------------------------

//when the save button is clicked
$("#button_save").click(function() {
  download_tab();
});

//download the tab
function download_tab() {
  let data = $("#tab_info").text() + '\n' + '\n' + $("#tab_sheet").text();
  for(let i=0, str=1; i<data.length; i++) {
    if(data[i] == '|') {
      if(data[i-1] == '|') {
        data = data.slice(0, i) + '\n' + data.slice(i);
        i++;  //increase i to compensate for the newline character
        if(str == strings) {
          data = data.slice(0, i) + '\n' + data.slice(i);
          i++;
          str = 1;
        } else {
          str++;
        }
      }
    }
  }
  let file = new Blob([data], {type: 'text/plain'});
  let link = document.createElement("a");
  let url = URL.createObjectURL(file);
  link.href = url;
  link.download = "tab.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

//------------------------------------
//AUDIO
//------------------------------------

/*
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const audio_element = document.createElement('audio');
audio_element.src = "tab25.wav";
const track = audioContext.createMediaElementSource(audio_element);
track.connect(audioContext.destination);

const button_play = document.querySelector('#button_play');

button_play.addEventListener('click', function() {
  if(audioContext.state === 'suspended') {
    audioContext.resume();
  }
  if (this.dataset.playing === 'false') {
    audio_element.play();
    this.dataset.playing = 'true';
  } else if(this.dataset.playing === 'true') {
    audio_element.pause();
    this.dataset.playing = 'false';
  }
});

audio_element.addEventListener('ended', () => {
    $("#button_play").dataset.playing = 'false';
}, false);
*/

var synth = new Tone.Synth().toMaster()

function get_real_duration(d) {
  if(d == 1) {return "8n";}
  if(d == 2) {return "4n";}
  if(d == 3) {return "2n";}
  if(d == 4) {return "1m";}
}

function play_note(note) {
  synth.triggerAttackRelease(note.pitch, get_real_duration(note.duration));
}

function play_tab() {
  Tone.Transport.bpm.value = parseInt($("#tempo").val());
  for(let i=0; i<tab.length; i++) {
    let note = tab[i];
    if(note.type == "note") {
      Tone.Transport.schedule(play_note);
    }
  }
}

let currently_playing = false;
$("#button_play").click(function() {
  if(currently_playing) {
    Tone.Transport.toggle()
  } else {
    currently_playing = true;
    play_tab();
  }
});
