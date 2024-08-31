class MessageParser {
    constructor(actionProvider, state) {
      this.actionProvider = actionProvider;
      this.state = state;
    }
  
    parse(message) {
        const moodKeywords = [
            'happy', 
            'sad', 
            'excited', 
            'bored', 
            'energetic', 
            'up', 
            'down', 
            'angry', 
            'calm', 
            'anxious', 
            'confident', 
            'fearful', 
            'hopeful', 
            'nostalgic', 
            'relaxed', 
            'frustrated', 
            'motivated', 
            'disappointed', 
            'inspired', 
            'content', 
            'curious', 
            'surprised', 
            'lonely', 
            'overwhelmed', 
            'determined', 
            'resentful'
          ];
           // Add more moods as needed
       const foundMood = moodKeywords.find((mood) => message.toLowerCase().includes(mood));
  
      if (foundMood) {
        this.actionProvider.handleMoodInput(foundMood);
      } else {
        // Handle other types of messages here
      }
    }
  }
  
  export default MessageParser;
  