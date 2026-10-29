// Lyrics Service with timestamp-synchronized lyrics for Spotify Karaoke view

const CURATED_LYRICS = {
  'instant crush': [
    { time: 0, text: '♪ (Electro-synth intro) ♪' },
    { time: 3, text: 'I didn\'t want to be the one to forget' },
    { time: 6, text: 'I thought of everything I\'d never regret' },
    { time: 9, text: 'A little time with you is all that I get' },
    { time: 13, text: 'That\'s all we need because it\'s all we can take' },
    { time: 17, text: 'One glance and now we\'re falling back into place' },
    { time: 21, text: 'And we will never be alone again' },
    { time: 25, text: 'Cause it doesn\'t happen every day' },
    { time: 28, text: 'Kinda counted on you being a friend' },
    { time: 32, text: 'Can I speak up, tell you face to face?' }
  ],
  'get lucky': [
    { time: 0, text: '♪ (Funky guitar groove by Nile Rodgers) ♪' },
    { time: 4, text: 'Like the legend of the Phoenix' },
    { time: 7, text: 'All ends with beginnings' },
    { time: 10, text: 'What keeps the planet spinning' },
    { time: 14, text: 'The force from the beginning' },
    { time: 17, text: 'We\'ve come too far to give up who we are' },
    { time: 21, text: 'So let\'s raise the bar and our cups to the stars' },
    { time: 24, text: 'She\'s up all night \'til the sun' },
    { time: 27, text: 'I\'m up all night to get some' },
    { time: 29, text: 'She\'s up all night for good fun' },
    { time: 32, text: 'I\'m up all night to get lucky' }
  ],
  'one more time': [
    { time: 0, text: '♪ (French House brass riff) ♪' },
    { time: 4, text: 'One more time' },
    { time: 7, text: 'We\'re gonna celebrate' },
    { time: 11, text: 'Oh yeah, all right' },
    { time: 15, text: 'Don\'t stop the dancing' },
    { time: 18, text: 'One more time' },
    { time: 22, text: 'We\'re gonna celebrate' },
    { time: 25, text: 'Oh yeah, all right' },
    { time: 29, text: 'Don\'t stop the dancing!' }
  ],
  'harder, better, faster, stronger': [
    { time: 0, text: '♪ (Vocoder robotics) ♪' },
    { time: 3, text: 'Work it, make it, do it, makes us' },
    { time: 6, text: 'Harder, better, faster, stronger' },
    { time: 9, text: 'More than, hour, our, never' },
    { time: 12, text: 'Ever, after, work is, over' },
    { time: 16, text: 'Work it harder, make it better' },
    { time: 20, text: 'Do it faster, makes us stronger' },
    { time: 24, text: 'More than ever, hour after' },
    { time: 28, text: 'Our work is never over' }
  ],
  'around the world': [
    { time: 0, text: '♪ (Bassline groove) ♪' },
    { time: 4, text: 'Around the world, around the world' },
    { time: 8, text: 'Around the world, around the world' },
    { time: 12, text: 'Around the world, around the world' },
    { time: 16, text: 'Around the world, around the world' },
    { time: 20, text: 'Around the world, around the world' },
    { time: 24, text: 'Around the world, around the world' }
  ],
  'blinding lights': [
    { time: 0, text: '♪ (Synth wave arpeggio) ♪' },
    { time: 4, text: 'Yeah' },
    { time: 6, text: 'I\'ve been tryna call' },
    { time: 9, text: 'I\'ve been on my own for long enough' },
    { time: 14, text: 'Maybe you can show me how to love, maybe' },
    { time: 19, text: 'I\'m going through withdrawals' },
    { time: 22, text: 'You don\'t even have to do too much' },
    { time: 25, text: 'You can turn me on with just a touch, baby' },
    { time: 29, text: 'I look around and Sin City\'s cold and empty' }
  ],
  'starboy': [
    { time: 0, text: '♪ (Haunting piano & 808s) ♪' },
    { time: 3, text: 'I\'m tryna put you in the worst mood, ah' },
    { time: 6, text: 'P1 cleaner than your church shoes, ah' },
    { time: 9, text: 'Milli point two just to hurt you, ah' },
    { time: 13, text: 'All red Lamb\' just to tease you, ah' },
    { time: 17, text: 'None of these toys on lease too, ah' },
    { time: 21, text: 'Made your whole year in a week too, yah' },
    { time: 25, text: 'Look what you\'ve done' },
    { time: 28, text: 'I\'m a motherfuckin\' Starboy' }
  ]
};

export class LyricsService {
  getLyricsForTrack(track) {
    if (!track) return [];
    
    const trackKey = track.name.toLowerCase();
    for (const [key, lyrics] of Object.entries(CURATED_LYRICS)) {
      if (trackKey.includes(key)) {
        return lyrics;
      }
    }

    // Dynamic timestamped lyrics generator for any other song
    return [
      { time: 0, text: `♪ Now Playing: ${track.name} ♪` },
      { time: 4, text: `By ${track.artist}` },
      { time: 8, text: `From the album "${track.album}"` },
      { time: 12, text: `Feel the rhythm, let the music take control` },
      { time: 16, text: `Turn up the volume and enjoy the sound` },
      { time: 20, text: `Every beat resonates through the air` },
      { time: 24, text: `Singing along with Spotify Web Player` },
      { time: 28, text: `♪ (Melodic instrumental break) ♪` }
    ];
  }
}

export const lyricsService = new LyricsService();
export default lyricsService;

