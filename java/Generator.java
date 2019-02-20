package CookieBakery;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Random;

public class Generator {
	//--------------
	//INITIAL DATA
	//--------------

	//notenames
	ArrayList <String> tonics = new ArrayList <String>(Arrays.asList("A","A#","B","C","C#","D","D#","E","F","F#","G","G#"));
	//this is a list representing the tuning of the instrument
	ArrayList <String> tuning = new ArrayList <>();
	//number of strings on instrument
	static int strings;
	//number of frets on instrument
	static int frets;
	//this is the list of all notes on the fretboard
	Note [][] notes;
	//this is the list of all notes in the mode
	ArrayList <String> mode;
	//this is the root of the mode
	String root;
	//the tab that can be printed
	Tab tab;

	//-------------------
	//RIFF CREATION DATA
	//-------------------

	//used for randomness
	static Random rand = new Random();
	//number of desired notes in the riff
	static int desiredNotes;
	//this is the list containing all notes in the riff
	static ArrayList <Note> allNotes = new ArrayList<Note>();
	//maximum fret change between successive notes
	static int maxFretJump;
	//maximum string change between successive notes
	static int maxStringJump;
	//maximum user defined string change between successive notes
	static int maxDefStringJump;
	//probability of single note over arpeggio (should be between 0-100)
	static int singleNoteProb;
	//probability of smart note over random note (should be between 0-100)
	static int smartNoteProb;

	//---------------
	//INITIALIZATION
	//---------------

	//!!!BEFORE GENERATING A RIFF, BE SURE TO SET ALL REQUIRED PARAMETERS!!!
	public Generator() {
	}

	//without this, you really don't have a generator, be sure to set parameters before
	public void initialize() {
		createFretboard();
		tab = new Tab(strings);
	}

	//this creates the list of lists of Notes representing the fretboard
	public void createFretboard() {
		notes = new Note[strings][frets+1];
		for(int i=0; i < notes.length; i++) {	//for each string
			String openString = tuning.get(i);	//open string note name
			int openStringIndex = 0;
			for(int j=0; j < tonics.size(); j++) {
				if(tonics.get(j).equals(openString)){
					openStringIndex = j;
					break;
				}
			}
			for(int k=0; k < notes[i].length; k++) {	//for each fret
				int noteNameIndex = openStringIndex;
				int x = k;
				while(x > 0) {
					if(noteNameIndex + 1 >= tonics.size()){
						noteNameIndex = 0;
					} else {
						noteNameIndex += 1;
					}
					x--;
				}
				String noteName = tonics.get(noteNameIndex);
				Note note = new Note(noteName, i, k);
				notes[i][k] = note;
			}
		}
	}

	//--------------
	//RIFF CREATION
	//--------------

	public void generate() {
		initialize();
		allNotes.clear();	//empties the list of notes to create a new riff
		Note newNote;
		//generating a start note for the riff
		int initialString = rand.nextInt(strings);	//random string
		int initialFret = rand.nextInt(frets);	//random fret
		String initialName = notes[initialString][initialFret].getName();	//corresponding note name
		Note lastNote = new Note(initialName, initialString, initialFret);

		for(int i=1; i<=desiredNotes; i++) {	//this loops takes care of adding the correct number of notes to the riff
			if(probability(singleNoteProb)) {	//probability of single note over arpeggio
				//the following if clause determines the maximum string distance between the previous note and the new note
				if(maxDefStringJump == 0) {
					maxStringJump = 0;
				} else if(probability(80)) {
					maxStringJump = 1;
				} else if(probability(80+15) && maxDefStringJump>=2) {
					maxStringJump = 2;
				} else {
					maxStringJump = maxDefStringJump;
				}
				if(probability(smartNoteProb)){	//probability of modally correct note over random note
					newNote = smartNote(lastNote, maxStringJump, maxFretJump);
				} else {	//generate a random note within specified boundaries
					int s = rand.nextInt((lastNote.getString() + maxStringJump) - (lastNote.getString() - maxStringJump)) + (lastNote.getString() - maxStringJump);
					int fmin = lastNote.getFret() - maxFretJump;
					int fmax = lastNote.getFret() + maxFretJump;
					newNote = getNote(fmin,fmax,s);
				}
				allNotes.add(newNote);	//adds the new note to the list of notes in the riff
				tab.addNoteToTab(newNote);	//adds the new note to the tab object
				lastNote = newNote;	//the new note becomes the most recent note for the next note
			} else {	//this is where the arpeggio option will come
				ArrayList <Note> arp = arpeggio(lastNote, i);
				for(Note n: arp) {
					allNotes.add(n);
					tab.addNoteToTab(n);
					lastNote = n;
				}
				i += arp.size()-1;
			}
		}
	}

	//returns a well placed note in relation to previous note
	//maxStringJump=msj, maxFretJump=mfj
	private Note smartNote(Note lastNote, int msj, int mfj) {
		Note newNote;	//the note to be returned
		ArrayList <Note> posNewNotes = new ArrayList<>();	//possible new notes
		ArrayList <Note> modeNotes = handleModeNotes(mode);		//the notes in the current mode
		for(Note note : modeNotes) {	//for each note in the mode
			if(Math.abs(note.getFret() - lastNote.getFret()) <= mfj && Math.abs(note.getString() - lastNote.getString()) <= msj) {	//if the note is within the maximum fret and string change distance from the last note
				posNewNotes.add(note);	//add the note to the list of possible new notes
			}
		}
		//I'm commenting this out for now, since I'm not sure what it does
		/*
		for(int i=(posNewNotes.size()-1); i>=0; i--){	//this for loop removes the notes that are not within the specified fret boundaries
			if(posNewNotes.get(i).getFret()>frets){
				posNewNotes.remove(i);
			}
		}
		*/
		newNote = posNewNotes.get(rand.nextInt(posNewNotes.size()));	//get a random note from the list of possible new notes
		//newNote = smart_note_placement(newNote);	//commented out until smartNotePlacement() is done
		return newNote;
	}
	
	//returns an arpeggio, where successive notes are well placed in relation to each other
	private ArrayList<Note> arpeggio(Note lastNote, int currentNoteNum) {
		ArrayList<Note> arp = new ArrayList<Note>();	//the list that is returned
		ArrayList <Note> modeNotes = handleModeNotes(mode);		//the notes in the current mode
		ArrayList <Note> posNewNotes = new ArrayList<>();	//possible new notes
		ArrayList<Note> posNextNotes = new ArrayList<>();	//used for determining the next note in the arpeggio
		int noteCount = desiredNotes-currentNoteNum;	//max possible notes in the arpeggio
		int shouldArpCont = 10;	//should the arpeggio continue? works like a timer
		boolean goingUp = false, goingDown = false, arpCont = true;	//ascending, descending, does it continue?
		//should the arpeggio start by ascending or descending?
		if(probability(50)) {
			goingUp = true;
		} else {
			goingDown = true;
		}
		while(arpCont && noteCount>=0){
			while(goingUp && noteCount>=0){
				posNewNotes.clear();	//this is redundant
				posNextNotes.clear();	//this too
				for(Note note: modeNotes){	//this for loop adds the notes higher than the starting note to the list of possible notes
					if(note.getString() <= lastNote.getString() && lastNote.getFret() - Math.abs(lastNote.getString() - note.getString()) * 5 <= note.getFret()){
						posNewNotes.add(note);
					}
				}
				for(int i=(posNewNotes.size()-1); i>=0; i--){	//this for loop removes the notes that are not within the specified fret boundaries
					if(posNewNotes.get(i).getFret() > frets){
						posNewNotes.remove(i);
					}
				}
				for(Note note: posNewNotes){	//this for loop adds the possible notes in the closest vicinity of the last note to the list of possible next notes
					if(Math.abs(lastNote.getString() - note.getString()) <= 1 && Math.abs(lastNote.getFret() - note.getFret()) <= 2){	//the one is the maximum string jump, the two is the maximum fret jump, this could be changed later?
						posNextNotes.add(note);
					}
				}
				Note nextNote = posNextNotes.get(rand.nextInt(posNextNotes.size()));	//takes a random note from the list of possible next notes
				//nextNote = smart_note_placement(nextNote);	//checks if there is a better placement on the fretboard for the note, e.g. (4,7) -> (3,2)
				arp.add(nextNote);	//adds the new note to the arpeggio
				lastNote = nextNote;	//to be able to determine the following note
				noteCount-=1;	//the arpeggio can't go on forever :(
				if(probability(shouldArpCont) || equalNotes(3)){	//should the arpeggio stop going up? (also triggers if there are too many of the same note after each other, i.e. it has reached the top string highest fret)
					if(probability(50)){	//yes, but it continues down instead
						goingUp = false;
						goingDown = true;
					} else {	//should it stop completely?
						goingUp = false;
						arpCont = false;
					}
					shouldArpCont = 10;	//reset the timer
				} else {
					shouldArpCont += 10;	//less chance of the arpeggio continuing after the next note
				}
			}
			while(goingDown && noteCount >= 0){	//this while loop works similarly to the previous one
				posNewNotes.clear();
				posNextNotes.clear();
				for(Note note: modeNotes){
					if(note.getString() >= lastNote.getString() && lastNote.getFret() + Math.abs(lastNote.getString() - note.getString()) * 5 >= note.getFret()){
						posNewNotes.add(note);
					}
				}
				for(int i=(posNewNotes.size()-1); i>=0; i--){	//this for loop removes the notes that are not within the specified fret boundaries
					if(posNewNotes.get(i).getFret() > frets){
						posNewNotes.remove(i);
					}
				}
				for(Note note: posNewNotes){
					if(Math.abs(lastNote.getString() - note.getString()) <= 1 && Math.abs(lastNote.getFret() - note.getFret()) <= 3){
						posNextNotes.add(note);
					}
				}
				Note nextNote = posNextNotes.get(rand.nextInt(posNextNotes.size()));
				//nextNote = smart_note_placement(nextNote);
				arp.add(nextNote);
				lastNote = nextNote;
				noteCount-=1;
				if(probability(shouldArpCont) || equalNotes(3)){	//should the arpeggio stop going down? (also triggers if there are too many of the same note after each other, i.e. it has reached the bottom string lowest fret)
					if(probability(50)){
						goingDown = false;
						goingUp = true;
					} else {	//should it stop completely?
						goingDown = false;
						arpCont = false;
					}
					shouldArpCont = 10;
				} else {
					shouldArpCont += 10;
				}
			}
			if(goingUp || goingDown){	//if one of these is true, start the loop from the beginning
				continue;
			} else if(!goingUp && !goingDown){	//if these are both false, then the arpeggio does not continue
				arpCont = false;;
			} else {	//stop the loop, i.e. the arpeggio does not continue
				break;
			}
		}
		return arp;
	}
	
	//returns a list of notes in the correct mode
	private ArrayList <Note> handleModeNotes(ArrayList<String> m) {
		ArrayList <Note> modeNotes = new ArrayList<>();	//list to be returned
		for(Note [] s : notes){	//for every string on the instrument
			for(Note n : s)	{	//for every fret
				if(m.contains(n.getName())) {	//if the note is in the mode
					modeNotes.add(n);	//add the note to the list to be returned
				}
			}
		}
		return modeNotes;
	}
	
	//this method returns true if the specified number of the specified number of successive notes are equal
	int equalNoteCooldown = 0;	//used to prevent equalNotes() from entering loop once it returns true
	public boolean equalNotes(int checkValue){
		int i=0;
		if(equalNoteCooldown > 0){
			equalNoteCooldown--;
			return false;
		}
        while(i<=checkValue){
        	try{
        		if(allNotes.get(allNotes.size()-1).getString() != allNotes.get(allNotes.size()-1-i).getString() && allNotes.get(allNotes.size()-1).getFret() != allNotes.get(allNotes.size()-1-i).getFret()){
        			return false;	//the notes are not identical
        		}
        	} catch(IndexOutOfBoundsException e){
        		return false;	//not enough notes to determine if there are too many successive identical notes
        	}
        	i++;
        }
        equalNoteCooldown = 4;
        return true;	//the notes are identical
	}

	//returns a random note on the fretboard
	private Note getNote() {
		int string = rand.nextInt(notes.length);
		int fret = rand.nextInt(notes[string].length+1);
		String name = notes[string][fret].getName();
		return new Note(name, string, fret);
	}

	//returns a random note between the minimum and maximum specified fret, string is random
	private Note getNote(int minimum, int maximum) {
		int min, max;
		int string = rand.nextInt(notes.length);
		if(minimum < 0){
			min = 0;
		} else if(minimum > notes[string].length) {
			min = notes[string].length;
		} else {
			min = minimum;
		}
		if(maximum > notes[string].length){
			max = notes[string].length;
		} else if(maximum < min) {
			max = min;
		} else {
			max = maximum;
		}
		int fret = rand.nextInt(max+1-min)+min;
		String name = notes[string][fret].getName();
		return new Note(name, string, fret);
	}

	//returns a random note between minimum and maximum specified fret on the selected string
	private Note getNote(int minimum, int maximum, int selectedString) {
		int string, min, max;
		if(0 <= selectedString && selectedString <= notes.length){
			string = selectedString;
		} else {
			string = rand.nextInt(notes.length);
		}
		if(minimum < 0){
			min = 0;
		} else if(minimum > notes[string].length) {
			min = notes[string].length;
		} else {
			min = minimum;
		}
		if(maximum > notes[string].length){
			max = notes[string].length;
		} else if(maximum < min) {
			max = min;
		} else {
			max = maximum;
		}
		int fret = rand.nextInt(max+1-min)+min;
		String name = notes[string][fret].getName();
		return new Note(name, string, fret);
	}

	//----------------
	//UTILITY METHODS
	//----------------

	//this is used to easily get a true/false with a certain probability
	private boolean probability(int prob){	//prob should be between 1 and 100
		if(rand.nextInt(100)+1<=prob){
			return true;
		}
        return false;
	}

	//------------------------------
	//METHODS FOR CHANGING SETTINGS
	//------------------------------

	public void setStrings(int s) {
		strings = s;
	}
	public void setFrets(int f) {
		frets = f;
	}
	public void setTuning(ArrayList<String> t) {
		tuning = t;
	}
	public void setMode(ArrayList<String> m) {
		mode = m;
	}
	public void setRoot(String r) {
		root = r;
	}
	public void setDesiredNotes(int d) {
		desiredNotes = d;
	}
	public void setMaxFretJump(int mfj) {
		maxFretJump = mfj;
	}
	public void setMaxDefStringJump(int msj) {
		maxDefStringJump = msj;
	}
	public void setSingleNoteProb(int snp) {
		singleNoteProb = snp;
	}
	public void setSmartNoteProb(int snp) {
		smartNoteProb = snp;
	}
}
