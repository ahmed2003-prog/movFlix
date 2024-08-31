import { GoogleGenerativeAI } from '@google/generative-ai';

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  replaceItem(array, oldItem, newItem) {
    return array.map(item => item === oldItem ? newItem : item);
  }

  handleMoodInput = (mood) => {
    const message = this.createChatBotMessage(this.getMoodResponse(mood));
    
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));

    // Trigger movie suggestion after the bot message
    this.suggestMoviesBasedOnMood(mood);
  };

  getMoodResponse(mood) {
    switch(mood) {
      case 'happy':
        return 'Great to hear you are happy! How about a comedy movie?';
      case 'sad':
        return 'Sorry to hear you are feeling sad. Maybe a feel-good movie could help.';
      case 'excited':
        return 'Feeling excited? A thrilling movie might be just what you need!';
      case 'bored':
        return 'Feeling bored? How about a movie with lots of action?';
      case 'energetic':
        return 'You seem full of energy! Perhaps an adventurous movie is in order.';
      case 'up':
        return 'You are in high spirits! A fun, upbeat movie could be perfect.';
      case 'down':
        return 'Feeling down? A heartwarming movie might lift your spirits.';
      case 'angry':
        return 'It sounds like you’re feeling angry. Maybe a movie with a strong resolution will help.';
      case 'calm':
        return 'Feeling calm? A relaxing movie might be just right.';
      case 'anxious':
        return 'If you’re feeling anxious, a soothing movie could help you unwind.';
      case 'confident':
        return 'You’re feeling confident! How about a movie with a strong, determined protagonist?';
      case 'fearful':
        return 'Feeling fearful? A comforting or inspirational movie might help.';
      case 'hopeful':
        return 'You’re feeling hopeful! An uplifting movie could be a great choice.';
      case 'nostalgic':
        return 'Feeling nostalgic? A classic film might bring back fond memories.';
      case 'relaxed':
        return 'You’re feeling relaxed! A calming, gentle movie might suit your mood.';
      case 'frustrated':
        return 'It sounds like you’re frustrated. A movie with a satisfying ending might be good.';
      case 'motivated':
        return 'You’re feeling motivated! A movie with a strong message could inspire you further.';
      case 'disappointed':
        return 'Feeling disappointed? Maybe a feel-good movie can help lift your spirits.';
      case 'inspired':
        return 'You’re feeling inspired! A movie with a powerful story could be just right.';
      case 'content':
        return 'You’re feeling content. A feel-good or light-hearted movie could be perfect.';
      case 'curious':
        return 'Feeling curious? A movie with a mystery or intriguing plot might be engaging.';
      case 'surprised':
        return 'You’re feeling surprised! A movie with unexpected twists could be exciting.';
      case 'lonely':
        return 'Feeling lonely? A heartwarming or emotionally engaging movie might help.';
      case 'overwhelmed':
        return 'If you’re feeling overwhelmed, a calming movie might provide some relief.';
      case 'determined':
        return 'You’re feeling determined! A movie with a strong protagonist overcoming challenges might be inspiring.';
      case 'resentful':
        return 'Feeling resentful? A movie with a theme of resolution or redemption might be satisfying.';
      default:
        return 'Not sure about that mood. Can you describe how you feel in another way?';
    }
  }

  suggestMoviesBasedOnMood = async (mood) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('API key is missing.');
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    };

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      const prompt = `I am feeling ${mood}. Can you suggest some movies?`;
      const result = await chatSession.sendMessage(prompt);

      // Check if the result.response is a proper object
      const data = result.response;
      const responseText = typeof data.text === 'function' ? data.text() : data.text;

      let movieSuggestions = [];
      if (responseText) {
        // Parse the JSON response
        try {
          const parsedResponse = JSON.parse(responseText);
          if (parsedResponse && Array.isArray(parsedResponse.movies)) {
            movieSuggestions = parsedResponse.movies;
          }
        } catch (parseError) {
          console.error('Error parsing movie suggestions response:', parseError);
        }
      }

      // Prepare the chatbot message
      const movieMessage = movieSuggestions.length > 0
        ? this.createChatBotMessage(`Based on your mood, here are some movies you might like: ${movieSuggestions.join(', ')}`)
        : this.createChatBotMessage('Sorry, I couldn’t find any movie suggestions right now.');

      this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, movieMessage],
      }));
    } catch (error) {
      console.error('Error fetching movie suggestions:', error);
      const errorMessage = this.createChatBotMessage(
        'Something went wrong while fetching movie suggestions.'
      );
      this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    }
  };
}

export default ActionProvider;
