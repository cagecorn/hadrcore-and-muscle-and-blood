export const MBTI_TRAITS = {
  ENFJ:{ aggression:.55,risk:.35,teamwork:.9,support:.9,focus:.65,kite:.45,burst:.5,sustain:.8,objective:.7 },
  ENFP:{ aggression:.6 ,risk:.75,teamwork:.6,support:.55,focus:.5 ,kite:.65,burst:.8,sustain:.4,objective:.55 },
  ENTJ:{ aggression:.85,risk:.6 ,teamwork:.7,support:.25,focus:.85,kite:.35,burst:.75,sustain:.45,objective:.9 },
  ENTP:{ aggression:.65,risk:.8 ,teamwork:.55,support:.3,focus:.55,kite:.55,burst:.85,sustain:.35,objective:.6 },
  ESFJ:{ aggression:.4 ,risk:.25,teamwork:.9,support:.9,focus:.6 ,kite:.4 ,burst:.45,sustain:.85,objective:.7 },
  ESFP:{ aggression:.7 ,risk:.85,teamwork:.55,support:.4,focus:.4 ,kite:.6 ,burst:.75,sustain:.35,objective:.5 },
  ESTJ:{ aggression:.8 ,risk:.55,teamwork:.7,support:.3,focus:.8 ,kite:.35,burst:.7 ,sustain:.55,objective:.9 },
  ESTP:{ aggression:.85,risk:.9 ,teamwork:.45,support:.2,focus:.45,kite:.55,burst:.9 ,sustain:.3 ,objective:.55 },

  INFJ:{ aggression:.45,risk:.25,teamwork:.75,support:.8,focus:.8 ,kite:.55,burst:.45,sustain:.8 ,objective:.75 },
  INFP:{ aggression:.4 ,risk:.35,teamwork:.6 ,support:.7,focus:.55,kite:.6 ,burst:.5 ,sustain:.6 ,objective:.55 },
  INTJ:{ aggression:.6 ,risk:.35,teamwork:.65,support:.35,focus:.9 ,kite:.5 ,burst:.6 ,sustain:.6 ,objective:.95 },
  INTP:{ aggression:.5 ,risk:.55,teamwork:.55,support:.3,focus:.85,kite:.55,burst:.65,sustain:.45,objective:.85 },
  ISFJ:{ aggression:.35,risk:.2 ,teamwork:.85,support:.95,focus:.65,kite:.45,burst:.35,sustain:.9 ,objective:.65 },
  ISFP:{ aggression:.55,risk:.65,teamwork:.55,support:.45,focus:.45,kite:.6 ,burst:.6 ,sustain:.4 ,objective:.5 },
  ISTJ:{ aggression:.55,risk:.3 ,teamwork:.7 ,support:.35,focus:.85,kite:.35,burst:.5 ,sustain:.7 ,objective:.9 },
  ISTP:{ aggression:.65,risk:.7 ,teamwork:.45,support:.25,focus:.75,kite:.6 ,burst:.65,sustain:.45,objective:.7 }
};

export function getMBTIString(unit){
  if(!unit?.mbti) return null;
  const m = unit.mbti;
  return (m.E>m.I?'E':'I')+(m.S>m.N?'S':'N')+(m.T>m.F?'T':'F')+(m.J>m.P?'J':'P');
}
