interface Reader {
  /** 읽던 문장이 끝나면 멈춘다 */
  pause: () => void;
  stop: () => void;
}

export function readSentences(
  sentences: string[],
  from: number,
  onSentence: (i: number) => void,
  onStop: (i: number) => void,
): Reader {
  const synth = window.speechSynthesis;
  let i = from;
  let pausing = false;
  let stopped = false;

  const next = () => {
    if (stopped || i >= sentences.length) return onStop(Math.min(i, sentences.length - 1));
    onSentence(i);
    const u = new SpeechSynthesisUtterance(sentences[i]);
    u.lang = "ko-KR";
    u.onend = () => {
      i++;
      if (pausing) return onStop(Math.min(i, sentences.length - 1));
      next();
    };
    u.onerror = () => onStop(i);
    synth.speak(u);
  };

  synth.cancel();
  next();

  return {
    pause: () => (pausing = true),
    stop: () => {
      stopped = true;
      synth.cancel();
    },
  };
}
