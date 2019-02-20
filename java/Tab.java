package CookieBakery;

import java.util.ArrayList;

public class Tab {
	//contains all notes in the tab,
		//tab[element representing a tab row][element representing string in the row]
		ArrayList<ArrayList<StringBuilder>> tab;
		//what location in the tab does the note have?
		int currentPosition = 3;
		//what tab row number is currently being written on
		int currentRow = -1;
		//number of strings on instrument
		int strings;
		//maximum number of symbols on one tab row
		int maxNum = 64;
		//the jump in symbols between notes on the tab
		int jump = 4;
		//the number of the current note being written to the tab
		int currentNoteNumOnRow = 0;
		//the number of "whole beat" notes on each tab row
		int maxNoteNumOnRow = 15;


		public Tab(int s) {
			strings = s;	//number of strings for the tab
			tab = new ArrayList<ArrayList<StringBuilder>>();	//the tab itself
			createTabRow();
		}

		//this method creates a new "tab row", e.g. the string rows representing the instrument
		public void createTabRow() {
			currentRow+=1;
			currentPosition = 3;
			tab.add(new ArrayList<StringBuilder>());	//creates a new tab row
			for(int i=0; i<strings; i++){	//for each string on the fretboard
				tab.get(currentRow).add(new StringBuilder());	//add a new string on the tab
				for(int k=0; k<maxNum; k++){
					if(k==0 || k==maxNum-1){
						tab.get(currentRow).get(i).append('|');
					} else {
						tab.get(currentRow).get(i).append('-');
					}
				}
			}
		}

		//this method adds a given note to the tab
		public void addNoteToTab(Note note) {
			checkRows();
			if(note.getFret()>=10){
				tab.get(currentRow).get(note.getString()).deleteCharAt(currentPosition);	//deletes the char at the specified index
				tab.get(currentRow).get(note.getString()).deleteCharAt(currentPosition);	//does it again to compensate for note with two numbers
			} else {
				tab.get(currentRow).get(note.getString()).deleteCharAt(currentPosition);	//deletes the char at the specified index
			}
			tab.get(currentRow).get(note.getString()).insert(currentPosition, note.getFret());	//inserts the new note at that same position
			currentPosition+=(jump*note.getDuration());	//moves the "marker" to the next position for the following note
			currentNoteNumOnRow++;
		}

		private void checkRows() {
			if(currentNoteNumOnRow >= maxNoteNumOnRow) {
				createTabRow();
				currentNoteNumOnRow = 0;
			}
		}

		//this method prints the tab to the console
		public void print() {
			for(int i=0; i<tab.size(); i++) {	//for every tab row
				System.out.println();	//print an empty line for visibility between tab rows
				for(StringBuilder str: tab.get(i)) {	//for every string on the tab row
					System.out.println(str.toString());	//print the string
				}
			}
		}
}
