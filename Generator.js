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
  for(var i=0; i<tonics.length; i++) {
    if($('[id="'+tonics[i]+'_checkbox"]').is(":checked")) {
      mode.push(tonics[i]);
    }
  }
  strings = parseInt($("#strings").val());
  frets = parseInt($("#frets").val());
  tuning = [];
  for(var i=1; i<=strings; i++) {
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
  var n = getNoteName(s, f);
  return {type: "note", string: s, fret: f, name: n, duration: d};
}

//returns a "chord" object, the chord parameter should be a list of Note objects
function Chord(chord, d = 1) {
  return {type: "chord", chord: chord, duration: d};
}

//returns the name of a note on a given string and fret
function getNoteName(s, f) {
  var stringName = $('#tuning_string_'+s).val();
  var openStringIndex = tonics.indexOf(stringName);
  var noteName = stringName;
  for(var i=0; i<f; i++) {
    if(noteName == "G#") {
      noteName = "A";
    } else {
      noteName = tonics[tonics.indexOf(noteName)+1];
    }
  }
  return noteName;
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

//update an element
function updateElement(element_id) {
  $(element_id).load(location.href + " " + element_id);
}

//returns a string with a <p> element containing info about the tab
function tabInfo() {
  var tab_info = '<p id="tab_info">';
  tab_info += 'tuning: ';
  for(var i=0; i<tuning.length; i++) {
    tab_info += tuning[i];
    if(i < tuning.length - 1) {
      tab_info += ', ';
    }
  }
  tab_info += '</p><br>';
  return tab_info;
}

//prints the tab to the "#div_tab" element
function printTab(npr = 15) {
  var notes_per_row = npr;  //number of notes per tab row
  var tab_text = '';
  tab_text += tabInfo();    //add information about the tab
  tab_text += '<p id= "tab_sheet">';    //create a <p> element for the tab itself
  var tab_rows = Math.ceil(tab.length/notes_per_row);   //number of tab rows
  var tab_row_elements = '';
  for(var row=0; row<tab_rows; row++) {   //for each tab row
    for(var i=1; i<=strings; i++) {   //for each string, notice the start on i=1
      tab_row_elements += '<span id="row_'+row+'_string_'+i+'" class="tab_row"></span><br>';  //add a <span> element for each string
    }
    tab_row_elements += '<br><br>';   //empty row between tab rows
  }
  tab_text += tab_row_elements;
  tab_text += '</p>';
  $("#div_tab").html(tab_text);   //add the new elements to the "#div_tab" element
  var note_index = 0;   //current note in the tab
  var nice_print_length = 0;    //this is used to determine the longest string, used for the nice print hack
  for(var row=0; row<tab_rows; row++) {   //for each tab row
    var string_list = [];    //this list is for containing a string for each string
    for(var i=1; i<=strings; i++) {   //for each string, notice the start on i=1
      string_list[i-1] = '|---';    //add the default start to the string
    }
    for(var i=0; i<notes_per_row && note_index < tab.length; i++) {
      if(tab[note_index].type == "note") {    //if the note type is a note
        var note = tab[note_index];   //the note
        for(var k=1; k<=strings; k++) {   //for each string, notice the start on i=1
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
        var chord = tab[note_index];    //the chord
        var occupied_strings = [];    //list used to check if a string already has a note
        var double_digit = false;   //used to determine if the chord has notes with double digit frets
        //this for loop check for double digit frets in the chord
        for(var k=0; k<chord.chord.length; k++) {   //for each note in the chord
          var note = chord.chord[k];    //the note
          if(note.fret.toString().length == 2) {    //if the fret of the note in the chord has two digits
            double_digit = true;    //the chord has a double digit fret
          }
        }
        //this for loop adds the note to corresponding strings
        for(var k=0; k<chord.chord.length; k++) {   //for each note in the chord
          var note = chord.chord[k];    //the note
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
        for(var k=1; k<=strings; k++) {   //for each string, notice the start on i=1
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
    for(var i=1; i<=strings; i++) {   //for each string, notice the start on i=1
      //string_list[i-1] += '|';    //add a final line to the end of the tab row
      $('#row_'+row+'_string_'+i).html(string_list[i-1]);   //add the string text to the corresponding <span> element
    }
  }
  //this is the nice print "pro hacker" fix
  if(nice_print == true) {
    //determine the length of the longest string
    for(var row=0; row<tab_rows; row++) {
      for(var i=1; i<=strings; i++) {
        var str = $('#row_'+row+'_string_'+i).text();
        if(str.length > nice_print_length) {
          nice_print_length = str.length;
        }
      }
    }
    //extend the string until it is of adequate length
    for(var row=0; row<tab_rows; row++) {
      for(var i=1; i<=strings; i++) {
        var str = $('#row_'+row+'_string_'+i).text();
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
  if(tab_type=="notes") {
    generate_notes();
  } else if(tab_type=="notes & chords") {
    generate_notes_and_chords();
  } else if(tab_type=="chords") {
    generate_chords();
  }
}

function generate_notes() {
  //start note, this will not be added to the tab, but used as a reference for the first note
  var init_str = getRandom(1, strings);
  var init_fret = getRandom(0, frets);
  var last = Note(init_str, init_fret);
  for(var i=0; i<desired_notes; i++) {  //this loop takes care of adding the correct number of notes to the riff
    var new_note;
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

function generate_notes_and_chords() {
  for(var i=0; i<20; i++) {
    var note = Note(i%2+1,i,i%2+2);
    var chord = Chord([Note(i%2+1,i),Note(i%2+2,i)],i%2+1);
    tab.push(note);
    tab.push(chord);
  }
  tab.push(Note(1,0,1));
  tab.push(Note(1,0,2));
  tab.push(Note(1,0,3));
  tab.push(Note(1,0));
}

function generate_chords() {

}

//returns a Note object, last is the previous note in the tab, str is the desired string of the note
function get_random_note(last = null, str = null) {
  if(last==null) {
    var s = getRandom(1, strings);
    var f = getRandom(0, frets);
    var d = getRandom(1, 4);
    return Note(s, f, d);
  } else if(str==null) {
    var min = get_fret_interval(last).min;
    var max = get_fret_interval(last).max;
    var s = getRandom(1, strings);
    var f = getRandom(min, max);
    var d = getRandom(1, 4);
    return Note(s, f, d);
  } else {
    var min = get_fret_interval(last).min;
    var max = get_fret_interval(last).max;
    var s = str;
    var f = getRandom(min, max);
    var d = getRandom(1, 4);
    return Note(s, f, d);
  }
}

//returns a modally correct Note object, last is the previous note in the tab
function get_smart_note(last) {
  var min_fret = get_fret_interval(last).min;
  var max_fret = get_fret_interval(last).max;
  var min_str = get_string_interval(last).min;
  var max_str = get_string_interval(last).max;
  var mode_notes = get_mode_notes(min_str, max_str, min_fret, max_fret);
  if(mode_notes.length == 0)  {
    return get_random_note(last, getRandom(min_str,max_str));
  } else {
    var new_note = mode_notes[getRandom(0, mode_notes.length-1)];
    return new_note;
  }
}

//returns a list of modally correct note in the given interval
function get_mode_notes(min_str, max_str, min_fret, max_fret) {
  var mode_notes = [];
  for(var f=min_fret; f<=max_fret; f++) {
    for(var s=min_str; s<=max_str; s++) {
      if(mode.includes(Note(s, f).name)) {
        mode_notes.push(Note(s, f));
      }
    }
  }
  return mode_notes;
}

//returns a smart string interval, last is the previous note in the tab
function get_string_interval(last) {
  var min_str;
  var max_str;
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
  var min_fret = (last.fret - max_fret_jump < 0) ? 0 : (last.fret - max_fret_jump);
  var max_fret = (last.fret + max_fret_jump > frets) ? frets : (last.fret + max_fret_jump);
  return {min: min_fret, max: max_fret};
}

//returns a duration based on the duration of previous notes in the tab
function get_smart_duration() {

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
