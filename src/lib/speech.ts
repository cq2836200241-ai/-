export function speakText(text: string, lang: string, gender: 'female' | 'male', onend?: () => void) {
  if (!("speechSynthesis" in window)) {
    if (onend) onend();
    return;
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  
  if (lang.toLowerCase().startsWith('zh')) {
    utterance.rate = 0.9; // 0.9 for Chinese
  } else {
    utterance.rate = 0.8; // 0.8 for English
  }
  
  if (onend) {
    utterance.onend = onend;
  }

  let voices = window.speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      setVoiceAndSpeak(utterance, voices, lang, gender);
      window.speechSynthesis.onvoiceschanged = null;
    };
  } else {
    setVoiceAndSpeak(utterance, voices, lang, gender);
  }
}

function setVoiceAndSpeak(utterance: SpeechSynthesisUtterance, voices: SpeechSynthesisVoice[], lang: string, gender: 'female' | 'male') {
  const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(lang.split('-')[0].toLowerCase()));
  
  let targetVoice = null;

  const enFemalePreferences = ['natural', 'premium', 'aria', 'samantha', 'victoria', 'karen', 'zira', 'google us english', 'female'];
  const enMalePreferences = ['natural', 'premium', 'guy', 'alex', 'daniel', 'david', 'mark', 'male'];
  const zhFemalePreferences = ['natural', 'premium', 'xiaoxiao', 'yaoyao', 'huihui', 'ting-ting', 'meijia', 'google 普通话', 'google 國語', 'female', 'zh-cn'];
  const zhMalePreferences = ['natural', 'premium', 'yunxi', 'yunjian', 'kangkang', 'google 普通话', 'google 國語', 'male', 'zh-cn'];

  let prefs: string[] = [];

  if (lang.toLowerCase().startsWith('en')) {
    prefs = gender === 'male' ? enMalePreferences : enFemalePreferences;
  } else if (lang.toLowerCase().startsWith('zh')) {
    prefs = gender === 'male' ? zhMalePreferences : zhFemalePreferences;
  }

  // Score each voice based on how early it matches a preference
  let bestScore = -1;
  
  for (const voice of langVoices) {
    const nameLower = voice.name.toLowerCase();
    
    // Explicitly avoid pairing a male preference with an obviously female voice if possible, 
    // but the ranked preferences usually handle this.
    // However, "Google US English" is female, but usually the only choice on Chrome OS/Linux for EN.
    // If we want a male voice but only "Google US English" is available, we'll try to find any UK Male, etc.
    if (lang.toLowerCase().startsWith('en') && gender === 'male' && nameLower.includes('female')) continue;
    if (lang.toLowerCase().startsWith('en') && gender === 'female' && nameLower.includes('male')) continue;

    let score = -1;
    for (let i = 0; i < prefs.length; i++) {
      if (nameLower.includes(prefs[i])) {
        // Higher score for earlier preference (lower index)
        // Add 100 bonus for Natural/Premium to prioritize high quality
        score = (prefs.length - i) + (nameLower.includes('natural') || nameLower.includes('premium') ? 100 : 0);
        break;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      targetVoice = voice;
    }
  }

  // Fallback if no preferred voice matched
  if (!targetVoice && langVoices.length > 0) {
    // If no voice matches, we just pick the first one, or try to be generic
    targetVoice = langVoices[0];
  }

  if (targetVoice) {
    utterance.voice = targetVoice;
    
    // Simulate gender differences using pitch if we suspect the OS only has one generic voice
    if (lang.toLowerCase().startsWith('zh')) {
      const isExplicitlyMale = ['yunxi', 'yunjian', 'kangkang', 'male'].some(n => targetVoice!.name.toLowerCase().includes(n));
      const isExplicitlyFemale = ['xiaoxiao', 'yaoyao', 'huihui', 'ting', 'meijia', 'female'].some(n => targetVoice!.name.toLowerCase().includes(n));
      
      if (gender === 'male' && !isExplicitlyMale) {
        utterance.pitch = 0.85; // Lower pitch for male simulation
      } else if (gender === 'female' && !isExplicitlyFemale) {
        utterance.pitch = 1.15; // Higher pitch for female simulation
      }
    }
  }

  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
