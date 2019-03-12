
//upper limits for the <select> values
var max_string_number = 8;
var max_fret_number = 24;
var max_note_number = 100;
//default values for the <select> elements
var default_root = "A";
var default_string_number = 6;
var default_fret_number = 12;
var default_note_number = 30;
var default_mode = "Aeolian";
var default_tab_type = "notes";
//default values for checkboxes, true for checked and false for unchecked
var default_nice_print = true;
var default_random_notes = false;

var root_list = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"];

//-----------------------------------------------
//INITIALIZATION
//-----------------------------------------------

//set the root selection
function set_root_select() {
  let root_select = "";
  for(let i=0; i<root_list.length; i++) {
    root_select += '<option value="'+root_list[i]+'" '+((root_list[i]==default_root)?'selected="selected"':'')+'>'+root_list[i]+'</option>';
  }
  $("#root").html(root_select);
}

//set the mode selection
function set_mode_select() {
  let mode_select = "";
  let mode_list = ["Custom","Ionian","Dorian","Phrygian","Lydian","Mixolydian","Aeolian","Locrian"];
  for(let i=0; i<mode_list.length; i++) {
    mode_select += '<option value="'+mode_list[i]+'" '+((mode_list[i]==default_mode)?'selected="selected"':'')+'>'+mode_list[i]+'</option>';
  }
  $("#mode_select").html(mode_select);
  let mode_checkboxes = "";
  for(let i=0; i<root_list.length; i++) {
    mode_checkboxes += '<label for="'+root_list[i]+'_checkbox" class="checkbox_label">'+root_list[i]+'</label>';
    mode_checkboxes += '<input type="checkbox" name="'+root_list[i]+'_checkbox" id="'+root_list[i]+'_checkbox" class="checkbox" value="'+root_list[i]+'">';
    if(i==3 || i==7) {
      mode_checkboxes += "<br>";
    }
  }
  $("#div_mode_checkboxes").html(mode_checkboxes);
  set_mode_notes();
}

//set the number of strings
function set_strings_select() {
  let string_number = "";
  for(let i=1; i<=max_string_number; i++) {
    string_number += '<option value="'+i+'" '+((i==default_string_number)?'selected="selected"':'')+'>'+i+'</option>';
  }
  $('#strings').html(string_number);
}

//set the number of frets
function set_frets_select() {
  let fret_number = "";
  for(let i=0; i<=max_fret_number; i++) {
    fret_number += '<option value="'+i+'" '+((i==default_fret_number)?'selected="selected"':'')+'>'+i+'</option>';
  }
  $('#frets').html(fret_number);
}

//set the number of desired notes selection
function set_notes_select() {
  let note_number = "";
  for(let i=1; i<=max_note_number; i++) {
    note_number += '<option value="'+i+'" '+((i==default_note_number)?'selected="selected"':'')+'>'+i+'</option>';
  }
  $('#notes').html(note_number);
}

//set the max string jump selection
function set_max_string_jump_select() {
  let max_string_number = "";
  let number_of_strings = $("#strings").val();
  for(let i=0; i<=number_of_strings-1; i++) {
    max_string_number += '<option value="'+i+'">'+i+'</option>';
  }
  $('#max_string_jump').html(max_string_number);
}

//set the max fret jump selection
function set_max_fret_jump_select() {
  let max_fret_number = "";
  let number_of_frets = $("#frets").val();
  for(let i=1; i<=number_of_frets; i++) {
    max_fret_number += '<option value="'+i+'">'+i+'</option>';
  }
  $('#max_fret_jump').html(max_fret_number);
}

//set the tuning selection
function set_tuning_select() {
  let tuning_select = "<p>Tuning</p>";
  let number_of_strings = $("#strings").val();
  for(let i=1; i<=number_of_strings; i++) {
    tuning_select += '<select required id="tuning_string_'+i+'" class="select tuning_select">';
    for(let k=0; k<root_list.length; k++) {
      tuning_select += '<option value="'+root_list[k]+'">'+root_list[k]+'</option>';
    }
    tuning_select += '</select>';
    $('#div_tuning').html(tuning_select);
    tuning_select += '&nbsp||-----<br>';
  }
  tuning_select += "<br>";
  $('#div_tuning').html(tuning_select);
  //default tuning if 6 strings
  let standard_tuning = ["E","B","G","D","A","E"];
  if($("#strings").val() == 6) {
    for(let i=1; i<=number_of_strings; i++) {
      $('#tuning_string_'+i).val(standard_tuning[i-1]);
    }
  }
  update_element("#div_tuning");
}

//update an element
function update_element(element_id) {
  $(element_id).load(location.href + " " + element_id);
}

//select the appropriate notes for the chosen mode
function set_mode_notes() {
  let mode = $("#mode_select").val();
  if(mode == "Custom") {
    for(let i=0; i<root_list.length; i++) {
      $('[id="'+root_list[i]+'_checkbox"]').prop("checked", false);
      $('[id="'+root_list[i]+'_checkbox"]').attr("disabled", false);
    }
    $('[id="'+$("#root").val()+'_checkbox"]').prop("checked", true);
    $('[id="'+$("#root").val()+'_checkbox"]').attr("disabled", true);
  } else {
    for(let i=0; i<root_list.length; i++) {
      $('[id="'+root_list[i]+'_checkbox"]').prop("checked", false);
      $('[id="'+root_list[i]+'_checkbox"]').attr("disabled", true);
    }
    let root = $("#root").val();
    let intervals = [];   //  1=half step (semitone), 2=whole step
    if(mode == "Ionian") {
      intervals = [2,2,1,2,2,2,1];
    } else if(mode == "Dorian") {
      intervals = [2,1,2,2,2,1,2];
    } else if(mode == "Phrygian") {
      intervals = [1,2,2,2,1,2,2];
    } else if(mode == "Lydian") {
      intervals = [2,2,2,1,2,2,1];
    } else if(mode == "Mixolydian") {
      intervals = [2,2,1,2,2,1,2];
    } else if(mode == "Aeolian") {
      intervals = [2,1,2,2,1,2,2];
    } else if(mode == "Locrian") {
      intervals = [1,2,2,1,2,2,2];
    }
    let noteName = root;
    for(let i=0; i<intervals.length; i++) {
      for(let k=0; k<intervals[i]; k++) {
        if(noteName == "G#") {
          noteName = "A";
        } else {
          noteName = root_list[root_list.indexOf(noteName)+1];
        }
      }
      $('[id="'+noteName+'_checkbox"]').prop("checked", true);
    }
  }
}

//set the tab type select
function set_tab_type_select() {
  let tab_type_list = ["notes","notes &amp; chords","chords"];
  let tab_type_select = "";
  for(let i=0; i<tab_type_list.length; i++) {
    tab_type_select += '<option value="'+tab_type_list[i]+'" '+((tab_type_list[i]==default_tab_type)?'selected="selected"':'')+'>'+tab_type_list[i]+'</option>';
  }
  $("#tab_type").html(tab_type_select);
}

//set the tempo display
function set_tempo_display() {
  let tempo_value = $("#tempo").val();
  $("#tempo_display").html(tempo_value);
}

//when the page is ready, set all the settings
$(document).ready(function() {
  //initialize fields
  set_root_select();
  set_mode_select();
  set_notes_select();
  set_strings_select();
  set_frets_select();
  set_max_string_jump_select();
  set_max_fret_jump_select();
  set_tuning_select();
  set_tab_type_select();
  set_tempo_display();

  //set nice print to its default value
  $("#nice_print_checkbox").prop("checked", default_nice_print);
  update_element("#nice_print_checkbox");

  //set random notes to its default value
  $("#random_notes_checkbox").prop("checked", default_random_notes);
  update_element("#random_notes_checkbox");
});

//-----------------------------------------------
//UPDATING
//-----------------------------------------------

//update the max string jump select and tuning select when the string number changes
$("#strings").change(function() {
  set_max_string_jump_select();
  update_element("#strings");
  set_tuning_select();
  update_element("#div_tuning");
});
//update the mode select when root is changed or mode is changed
$("#root").change(function() {
  set_mode_notes();
});
$("#mode_select").change(function() {
  set_mode_notes();
});
//update the max fret jump select when the fret number changes
$("#frets").change(function() {set_max_fret_jump_select();update_element("#frets");});
//update the tuning select when it is changed
$("#div_tuning").change(function() {
  update_element("#div_tuning");
});

//update the tempo display when the slider is moved
$("#tempo").change(function() {
  set_tempo_display();
});
