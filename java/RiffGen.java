package CookieBakery;

import java.util.ArrayList;
import java.util.Scanner;

public class RiffGen {
	
	//-----------
	//PARAMETERS
	//-----------

	static int strings = 0;
	static int frets = 0;
	static int desiredNotes = 0;
	static int maxFretJump = 0;
	static int maxDefStringJump = 0;
	static int singleNoteProb = 0;
	static int smartNoteProb = 0;
	static ArrayList <String> mode = new ArrayList <>();
	static ArrayList <String> tuning = new ArrayList <>();
	static String root = "";
	
	public static void main(String[] args) {

		Scanner scan = new Scanner(System.in);	//this is used for user input
		Generator gen = new Generator();
		
		//--------------
		//INITIAL SETUP
		//--------------
		
		System.out.print("Welcome to the CookieBakery riff generator!\n\n");	//initial welcome message
		boolean initial_setup_done = false;
		while(!initial_setup_done) {
			try {
				//set strings
				System.out.println("strings: ");
				strings = Integer.parseInt(scan.nextLine());
				gen.setStrings(strings);
				//set frets
				System.out.println("frets: ");
				frets = Integer.parseInt(scan.nextLine());
				gen.setFrets(frets);
				//set tuning
				System.out.println("tuning (comma separated, high to low): ");
				String[] rawTuning = scan.nextLine().split(",");
				for(String s: rawTuning) {
					tuning.add(s);
				}
				gen.setTuning(tuning);
				//set desired notes
				System.out.println("number of notes: ");
				desiredNotes = Integer.parseInt(scan.nextLine());
				gen.setDesiredNotes(desiredNotes);
				//set max fret jump
				System.out.println("maximum fret jump between notes: ");
				maxFretJump = Integer.parseInt(scan.nextLine());
				gen.setMaxFretJump(maxFretJump);
				//set max defined string jump
				System.out.println("maximum string jump between notes: ");
				maxDefStringJump = Integer.parseInt(scan.nextLine());
				gen.setMaxDefStringJump(maxDefStringJump);
				//set single note probability
				System.out.println("probability of single note over arpeggio: ");
				singleNoteProb = Integer.parseInt(scan.nextLine());
				gen.setSingleNoteProb(singleNoteProb);
				//set smart note probability
				System.out.println("probability of smart note over random note: ");
				smartNoteProb = Integer.parseInt(scan.nextLine());
				gen.setSmartNoteProb(smartNoteProb);
				//set mode
				System.out.println("notes in mode (comma separated): ");
				String[] rawMode = scan.nextLine().split(",");
				for(String n: rawMode) {
					mode.add(n);
				}
				gen.setMode(mode);
				//set root note in mode
				System.out.println("root: ");
				root = scan.nextLine();
				boolean rootExists = false;
				for(String n: mode) {
					if(n.contains(root)) {
						rootExists = true;
					}
				}
				if(!rootExists) {
					mode.add(root);
				}
				gen.setRoot(root);
				
				initial_setup_done = true;
			} catch(Exception e) {
				System.out.println("Please give correct input!");
			}
			
		}
		
		//-------------
		//PROGRAM LOOP
		//-------------
		
		while(true) {
			System.out.println("command: ");
			String input = scan.nextLine();
			if(input.equals("generate") || input.equals("g") || input.equals("gen")) {		//generate a new tab
				gen.generate();
			} else if(input.equals("print") || input.equals("p")) {		//output the tab in console
				gen.tab.print();
			} else if(input.equals("help") || input.equals("h")) {
				help();
			} else if(input.equals("info") || input.equals("i")) {
				info();
			} else if(input.contains("strings")) {
				String[] i = input.split(" ");
				strings = Integer.parseInt(i[i.length-1]);
				gen.setStrings(strings);
			} else if(input.contains("frets")) {
				String[] i = input.split(" ");
				frets = Integer.parseInt(i[i.length-1]);
				gen.setFrets(frets);
			} else if(input.contains("tuning")) {
				tuning.clear();
				String[] i = input.split(" ");
				String[] rawTuning = i[i.length-1].split(",");
				for(String s: rawTuning) {
					tuning.add(s);
				}
				gen.setTuning(tuning);
			} else if(input.contains("mode")) {
				mode.clear();
				String[] i = input.split(" ");
				String[] rawMode = i[i.length-1].split(",");
				for(String n: rawMode) {
					mode.add(n);
				}
				gen.setTuning(tuning);
			} else if(input.contains("root")) {
				String[] i = input.split(" ");
				root = i[i.length-1];
				boolean rootExists = false;
				for(String n: mode) {
					if(n.contains(root)) {
						rootExists = true;
					}
				}
				if(!rootExists) {
					mode.add(root);
				}
				gen.setRoot(root);
			} else if(input.contains("des")) {
				String[] i = input.split(" ");
				desiredNotes = Integer.parseInt(i[i.length-1]);
				gen.setDesiredNotes(desiredNotes);
			} else if(input.contains("maxfret")) {
				String[] i = input.split(" ");
				maxFretJump = Integer.parseInt(i[i.length-1]);
				gen.setMaxFretJump(maxFretJump);
			} else if(input.contains("maxstring")) {
				String[] i = input.split(" ");
				maxDefStringJump = Integer.parseInt(i[i.length-1]);
				gen.setMaxDefStringJump(maxDefStringJump);
			} else if(input.contains("singleprob")) {
				String[] i = input.split(" ");
				singleNoteProb = Integer.parseInt(i[i.length-1]);
				gen.setSingleNoteProb(singleNoteProb);
			} else if(input.contains("smartprob")) {
				String[] i = input.split(" ");
				smartNoteProb = Integer.parseInt(i[i.length-1]);
				gen.setSmartNoteProb(smartNoteProb);
			} else if(input.equals("exit") || input.equals("quit") || input.equals("q")) {		//close the program
				break;
			}
		}
		scan.close();
	}
	
	//-------------
	//HELPER METHODS
	//-------------
	
	//displays the possible commands in console
	private static void help() {
		System.out.println("generate => generate a new tab based on current settings");
		System.out.println("print => shows the current tab");
		System.out.println("help => shows possible commands");
		System.out.println("info => shows the current settings");
		System.out.println("strings # => set the number of strings to #");
		System.out.println("frets # => set the number of strings to #");
		System.out.println("tuning #,#,# => set the tuning, from high to low, separated by commas");
		System.out.println("mode #,#,# => set the mode, separated by commas");
		System.out.println("root # => set the root of the mode");
		System.out.println("des # => set the desired number of notes in the riff");
		System.out.println("maxfret # => set the maximum fret jump between successive notes");
		System.out.println("maxstring # => set the maximum string jump between successive notes");
		System.out.println("singleprob # => set the probability of single note over arpeggio (0-100)");
		System.out.println("smartprob # => set the probability of smart note over random note (0-100)");
		System.out.println("exit => quit the program");
	}
	//displays the current settings
	private static void info() {
		System.out.println("strings: \t" + strings);
		System.out.println("frets: \t" + frets);
		System.out.print("tuning: \t");
		tuning.forEach((t)->{
			if(tuning.lastIndexOf(t)==tuning.size()-1){
				System.out.print(t + "\n");
			} else {
				System.out.print(t + ",");
			}
		});
		System.out.print("mode: \t");
		mode.forEach((t)->{
			if(mode.lastIndexOf(t)==mode.size()-1){
				System.out.print(t + "\n");
			} else {
				System.out.print(t + ",");
			}
		});
		System.out.println("root: \t" + root);
		System.out.println("desired notes: \t" + desiredNotes);
		System.out.println("max fret jump: \t" + maxFretJump);
		System.out.println("max string jump: \t" + maxDefStringJump);
		System.out.println("single note probability: \t" + singleNoteProb);
		System.out.println("smart note probability: \t" + smartNoteProb);
	}
}
