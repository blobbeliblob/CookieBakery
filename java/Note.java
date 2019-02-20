package CookieBakery;

public class Note {
	String name;
	int duration;
	int string;
	int fret;
	
	public Note (String n, int s, int f) {
		duration = 1;
		name = n;
		string = s;
		fret = f;
	}
	
	public String getName() {
		return name;
	}
	
	public void setDuration(int d) {
		duration = d;		
	}
	
	public int getDuration() {
		return duration;
	}
	
	public int getString() {
		return string;
	}
	
	public int getFret() {
		return fret;
	}
}
