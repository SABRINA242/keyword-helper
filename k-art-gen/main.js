function splitSentences(text) {
  const raw = text.replace(/\r/g, "").replace(/\s+/g, " ").trim();
  if (!raw) return [];
  const sentences = [];
  let current = "";
  const isQuote = (ch) => ch === '"' || ch === "“" || ch === "”";
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    current += ch;
    if (isQuote(ch)) {
      if (current.trim()) {
        sentences.push(current.trim());
        current = "";
      }
      continue;
    }
    if (ch === "." || ch === "!" || ch === "?") {
      const next = raw[i + 1] || "";
      if (/\s/.test(next)) {
        if (current.trim()) {
          sentences.push(current.trim());
          current = "";
        }
      }
    }
  }
  if (current.trim()) sentences.push(current.trim());
  return sentences;
}

function chunkStructure(sentences) {
  const n = sentences.length;
  if (!n) return [];
  const labels = [
    "세계·시대·배경 도입",
    "주인공·상황 설정",
    "이상 징조·사건 발단",
    "갈등·위기 심화",
    "전환점·진실 드러남",
    "결과·벌과 보상",
    "교훈·여운 정리",
  ];
  const containsAny = (s, words) => words.some((w) => s.includes(w));
  const introWords = ["옛날", "옛적", "조선", "한양", "마을", "당시", "시절", "때는"];
  const eventWords = ["어느 날", "어느날", "그날", "그 해", "그해", "사건", "이날", "그 무렵"];
  const conflictWords = [
    "분노",
    "싸움",
    "다투",
    "욕심",
    "탐욕",
    "질투",
    "위험",
    "위기",
    "공포",
    "무섭",
    "겁",
    "괴이",
    "괴물",
    "귀신",
    "도깨비",
  ];
  const turningWords = ["알게", "드러나", "밝혀", "사실은", "그제서야", "그제야", "한편"];
  const resolutionWords = [
    "결국",
    "마침내",
    "마지막",
    "그 후",
    "그후",
    "그 뒤",
    "그뒤",
    "이후",
  ];
  const moralWords = [
    "교훈",
    "라는 것이다",
    "라는 말이 있다",
    "우리가 알아야",
    "이야기의 끝",
    "이야기는 여기까지",
  ];
  const approx = (ratio) => Math.min(n - 1, Math.max(0, Math.floor(n * ratio)));
  const findFirstIndex = (pred, startIdx, endIdx) => {
    for (let i = startIdx; i < endIdx; i++) {
      if (pred(sentences[i])) return i;
    }
    return -1;
  };
  const findLastIndex = (pred, startIdx, endIdx) => {
    for (let i = endIdx - 1; i >= startIdx; i--) {
      if (pred(sentences[i])) return i;
    }
    return -1;
  };
  const introEnd = findLastIndex(
    (s) => containsAny(s, introWords),
    0,
    Math.max(1, approx(0.2))
  );
  const inciting = findFirstIndex(
    (s) => containsAny(s, eventWords),
    introEnd >= 0 ? introEnd + 1 : 0,
    Math.max(1, approx(0.4))
  );
  const conflictStart = findFirstIndex(
    (s) => containsAny(s, conflictWords),
    inciting >= 0 ? inciting : approx(0.15),
    Math.max(1, approx(0.7))
  );
  const turning = findFirstIndex(
    (s) => containsAny(s, turningWords),
    conflictStart >= 0 ? conflictStart : approx(0.3),
    Math.max(1, approx(0.9))
  );
  const resolutionStart = findFirstIndex(
    (s) => containsAny(s, resolutionWords),
    turning >= 0 ? turning : approx(0.6),
    n
  );
  const moralStart = findFirstIndex(
    (s) => containsAny(s, moralWords),
    approx(0.7),
    n
  );
  let boundaries = [0];
  if (introEnd >= 0) boundaries.push(introEnd + 1);
  if (inciting >= 0) boundaries.push(inciting + 1);
  if (conflictStart >= 0) boundaries.push(conflictStart);
  if (turning >= 0) boundaries.push(turning);
  if (resolutionStart >= 0) boundaries.push(resolutionStart);
  if (moralStart >= 0) boundaries.push(moralStart);
  boundaries.push(n);
  boundaries = boundaries
    .map((v) => Math.min(n, Math.max(0, v)))
    .sort((a, b) => a - b)
    .filter((v, i, arr) => i === 0 || v > arr[i - 1]);
  if (boundaries[0] !== 0) boundaries.unshift(0);
  if (boundaries[boundaries.length - 1] !== n) boundaries.push(n);
  const chunks = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    const slice = sentences.slice(start, end);
    if (!slice.length) continue;
    chunks.push({
      label: labels[i] || `부분${i + 1}`,
      startIndex: start,
      endIndex: end - 1,
      text: slice.join(" "),
    });
  }
  return chunks;
}

function isDialogSentence(s) {
  const dialogVerbs = [
    "말했",
    "말하였",
    "말하며",
    "말하니",
    "소리쳤",
    "외쳤",
    "대답했",
    "대답하며",
    "물었다",
    "물어보았",
    "질문했",
    "되물었다",
  ];
  const containsAny = (text, words) => words.some((w) => text.includes(w));
  if (/^[\"“”'\[]/.test(s)) return true;
  if (s.includes("라고") || s.includes("라며")) return true;
  if (/"[^"]*"/.test(s) || /“[^”]*”/.test(s) || /『[^』]*』/.test(s)) return true;
  if (containsAny(s, dialogVerbs)) return true;
  return false;
}

function basicStats(sentences) {
  if (!sentences.length) {
    return {
      numSentences: 0,
      avgCharLen: 0,
      avgWordLen: 0,
    };
  }
  const charLens = sentences.map((s) => s.length);
  const wordLens = sentences.map((s) => s.split(/\s+/g).filter(Boolean).length);
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  return {
    numSentences: sentences.length,
    avgCharLen: +(sum(charLens) / charLens.length).toFixed(1),
    avgWordLen: +(sum(wordLens) / wordLens.length).toFixed(2),
  };
}

function detectDialogRatio(sentences) {
  let dialog = 0;
  let narrative = 0;
  for (const s of sentences) {
    if (isDialogSentence(s)) {
      dialog += 1;
    } else {
      narrative += 1;
    }
  }
  const total = dialog + narrative || 1;
  return {
    dialogRatio: +(dialog / total).toFixed(2),
    narrativeRatio: +(narrative / total).toFixed(2),
    dialogCount: dialog,
    narrativeCount: narrative,
  };
}

function topWords(text, topn = 20) {
  const tokens = text.match(/[가-힣]+/g) || [];
  const stopwords = new Set([
    "그리고",
    "그러나",
    "그래서",
    "하지만",
    "그러던",
    "오늘",
    "이야기",
    "정도",
    "때문",
  ]);
  const filtered = tokens.filter((t) => t.length > 1 && !stopwords.has(t));
  const counts = new Map();
  for (const t of filtered) {
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, topn);
}

function classifySentenceTypes(sentences) {
  const actionWords = [
    "걸어",
    "달려",
    "뛰어",
    "앉아",
    "일어나",
    "들어가",
    "나오",
    "쳐다보",
    "웃었",
    "울었",
    "소리치",
    "두드리",
    "밀어",
    "당겨",
    "끌어",
    "쫓아",
    "따라가",
  ];
  const effectWords = [
    "드르륵",
    "드르르륵",
    "삐걱",
    "삐거덕",
    "끼익",
    "쿵",
    "쾅",
    "탁",
    "철컥",
    "덜컥",
  ];
  const firstPersonWords = [
    "나는",
    "내가",
    "난",
    "나도",
    "제가",
    "전",
  ];
  const secondPersonWords = [
    "너",
    "네가",
    "니가",
    "너도",
    "당신",
    "당신들",
    "여러분",
  ];
  const monologueEndings = [
    "거야",
    "거지",
    "거든",
    "잖아",
    "겠어",
    "겠지",
    "일까",
    "일까?",
    "인가",
    "구나",
    "구나?",
    "구만",
    "구만?",
    "구먼",
    "구먼?",
    "네",
    "네?",
    "냐",
    "냐?",
    "할까",
    "할까?",
    "하는걸",
    "하는거야",
    "하는거지",
  ];
  const containsAny = (s, words) => words.some((w) => s.includes(w));
  const endsWithAny = (s, endings) => {
    const noPunct = s.replace(/[\.!?…]+$/g, "");
    return endings.some((e) => noPunct.endsWith(e));
  };
  const types = [];
  let dialog = 0;
  let monologue = 0;
  let action = 0;
  let effect = 0;
  let narration = 0;
  for (const s of sentences) {
    const line = s.trim();
    let t = "narration";
    if (!line) {
      narration += 1;
    } else if (
      endsWithAny(line, monologueEndings) &&
      !containsAny(line, secondPersonWords)
    ) {
      t = "monologue";
      monologue += 1;
    } else if (isDialogSentence(line)) {
      t = "dialog";
      dialog += 1;
    } else if (containsAny(line, effectWords)) {
      t = "effect";
      effect += 1;
    } else if (containsAny(line, actionWords) || /었다|했다|하였다/.test(line)) {
      t = "action";
      action += 1;
    } else {
      narration += 1;
    }
    types.push(t);
  }
  const total = sentences.length || 1;
  return {
    types,
    summary: {
      dialog,
      monologue,
      action,
      effect,
      narration,
      dialogRatio: +(dialog / total).toFixed(2),
      monologueRatio: +(monologue / total).toFixed(2),
      actionRatio: +(action / total).toFixed(2),
      effectRatio: +(effect / total).toFixed(2),
      narrationRatio: +(narration / total).toFixed(2),
    },
  };
}

function buildNarrationDetail(sentences, types) {
  const narrationSentences = [];
  for (let i = 0; i < sentences.length; i++) {
    if (types[i] === "narration") narrationSentences.push(sentences[i]);
  }
  if (!narrationSentences.length) return "";
  const endingCounts = new Map();
  for (const s of narrationSentences) {
    const cleaned = s.replace(/[\"“”'”“\[\]\(\)]/g, "").trim();
    if (!cleaned) continue;
    const noPunct = cleaned.replace(/[\.!?…]+$/g, "");
    if (!noPunct) continue;
    const len = noPunct.length;
    const size = Math.min(3, len);
    const ending = noPunct.slice(len - size);
    if (!ending) continue;
    endingCounts.set(ending, (endingCounts.get(ending) || 0) + 1);
  }
  const endings = Array.from(endingCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const lines = [];
  lines.push(`나레이션 문장 수: ${narrationSentences.length}문장`);
  if (endings.length) {
    lines.push("자주 쓰는 문장 끝맺음:");
    endings.forEach(([e, c]) => {
      lines.push(`- "${e}" 계열: ${c}회`);
    });
  }
  return lines.join("\n");
}

function buildActionDetail(sentences, types) {
  const actionIndexes = [];
  for (let i = 0; i < sentences.length; i++) {
    if (types[i] === "action") actionIndexes.push(i);
  }
  if (!actionIndexes.length) return "";
  const actionWords = [
    "걸어",
    "달려",
    "뛰어",
    "앉아",
    "일어나",
    "들어가",
    "나오",
    "쳐다보",
    "웃었",
    "울었",
    "소리치",
    "두드리",
    "밀어",
    "당겨",
    "끌어",
    "쫓아",
    "따라가",
  ];
  const verbCounts = new Map();
  for (const idx of actionIndexes) {
    const s = sentences[idx];
    for (const w of actionWords) {
      if (s.includes(w)) {
        verbCounts.set(w, (verbCounts.get(w) || 0) + 1);
      }
    }
  }
  const verbs = Array.from(verbCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const samples = actionIndexes.slice(0, 3).map((idx) => {
    const s = sentences[idx];
    const preview = s.length > 70 ? s.slice(0, 70) + "…" : s;
    return `문장 ${idx + 1}: ${preview}`;
  });
  const lines = [];
  lines.push(`행동 묘사 문장 수: ${actionIndexes.length}문장`);
  if (verbs.length) {
    lines.push("자주 쓰는 행동 동사:");
    verbs.forEach(([w, c]) => {
      lines.push(`- "${w}" 동작: ${c}회`);
    });
  }
  if (samples.length) {
    lines.push("대표 행동 묘사 예시:");
    samples.forEach((s) => lines.push(`- ${s}`));
  }
  return lines.join("\n");
}

function buildDialogDetail(sentences, types, chunks) {
  const dialogIndexes = [];
  for (let i = 0; i < sentences.length; i++) {
    if (types[i] === "dialog") dialogIndexes.push(i);
  }
  if (!dialogIndexes.length) return "";
  const speakerCounts = new Map();
  const namePatterns = [
    /([가-힣]+)(이|가)\s[^\.!?]*말했/,
    /([가-힣]+)(이|가)\s[^\.!?]*소리쳤/,
    /([가-힣]+)(이|가)\s[^\.!?]*외쳤/,
    /([가-힣]+)(이|가)\s[^\.!?]*대답했/,
    /([가-힣]+)(이|가)\s[^\.!?]*물었다/,
  ];
  for (const idx of dialogIndexes) {
    const s = sentences[idx];
    let name = "";
    for (const re of namePatterns) {
      const m = s.match(re);
      if (m && m[1]) {
        name = m[1];
        break;
      }
    }
    if (name) {
      speakerCounts.set(name, (speakerCounts.get(name) || 0) + 1);
    }
  }
  const speakers = Array.from(speakerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const placementLines = [];
  if (chunks && chunks.length) {
    for (const chunk of chunks) {
      let count = 0;
      for (const idx of dialogIndexes) {
        if (idx >= chunk.startIndex && idx <= chunk.endIndex) count += 1;
      }
      placementLines.push(
        `- ${chunk.label}: 대사 ${count}문장 (문장 ${chunk.startIndex + 1}~${
          chunk.endIndex + 1
        })`
      );
    }
  }
  const samples = dialogIndexes.slice(0, 3).map((idx) => {
    const s = sentences[idx];
    const preview = s.length > 70 ? s.slice(0, 70) + "…" : s;
    return `문장 ${idx + 1}: ${preview}`;
  });
  const lines = [];
  lines.push(`대사 문장 수: ${dialogIndexes.length}문장`);
  if (speakers.length) {
    lines.push("자주 등장하는 화자:");
    speakers.forEach(([name, c]) => {
      lines.push(`- ${name}: ${c}회 발화`);
    });
  }
  if (placementLines.length) {
    lines.push("7단계 구조에서 대사가 많이 쓰인 구간:");
    placementLines.forEach((l) => lines.push(l));
  }
  if (samples.length) {
    lines.push("대표 대사 예시:");
    samples.forEach((s) => lines.push(`- ${s}`));
  }
  return lines.join("\n");
}

function analyzeStyleRegister(text, sentences) {
  const tokens = text.match(/[가-힣]+/g) || [];
  if (!tokens.length) return "";
  const totalTokens = tokens.length;
  const countWords = (words) => {
    const m = new Map();
    for (const t of tokens) {
      for (const w of words) {
        if (t.includes(w)) {
          m.set(w, (m.get(w) || 0) + 1);
        }
      }
    }
    return m;
  };
  const dialectWords = ["데이", "카이", "하이", "하제", "허이", "허요", "하구마"];
  const joseonWords = [
    "도령",
    "대감",
    "상감",
    "마마",
    "아씨",
    "첩",
    "종",
    "관아",
    "관하",
    "참봉",
    "진사",
    "포졸",
    "사또",
    "옥리",
    "형틀",
    "장터",
    "주막",
    "기와",
    "초가",
  ];
  const honorificAddressWords = [
    "어르신",
    "대감",
    "대감마님",
    "나리",
    "상감",
    "상감마마",
    "마님",
    "영감",
    "영감님",
    "전하",
    "대감께",
    "전하께",
    "아버님",
    "어머님",
    "선생님",
  ];
  const dialectMap = countWords(dialectWords);
  const joseonMap = countWords(joseonWords);
  const addrMap = countWords(honorificAddressWords);
  const countEndings = (endings) => {
    const m = new Map();
    let sentenceCount = 0;
    for (const raw of sentences) {
      const cleaned = raw.replace(/[\"“”'”“\[\]\(\)]/g, "").trim();
      if (!cleaned) continue;
      const noPunct = cleaned.replace(/[\.!?…]+$/g, "");
      if (!noPunct) continue;
      let hit = false;
      for (const e of endings) {
        if (noPunct.endsWith(e)) {
          m.set(e, (m.get(e) || 0) + 1);
          hit = true;
        }
      }
      if (hit) sentenceCount += 1;
    }
    return { map: m, sentenceCount };
  };
  const naturalEndings = [
    "하더라",
    "하였더라",
    "하더군",
    "하거든",
    "하잖아",
    "했잖아",
    "거야",
    "거지",
    "거든",
    "거라",
    "거냐",
  ];
  const honorificEndings = [
    "옵니다",
    "사옵니다",
    "하옵나이다",
    "옵소서",
    "하소서",
    "시옵소서",
    "십니다",
    "십시오",
    "습니다",
    "읍니다",
  ];
  const naturalInfo = countEndings(naturalEndings);
  const honorInfo = countEndings(honorificEndings);
  const sortTop = (m, n) =>
    Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n);
  const dialectTotal = Array.from(dialectMap.values()).reduce(
    (a, b) => a + b,
    0
  );
  const joseonTotal = Array.from(joseonMap.values()).reduce(
    (a, b) => a + b,
    0
  );
  const addrTotal = Array.from(addrMap.values()).reduce((a, b) => a + b, 0);
  const lines = [];
  if (joseonTotal) {
    const top = sortTop(joseonMap, 6)
      .map(([w, c]) => `${w} · ${c}`)
      .join(", ");
    lines.push(
      `조선 시대 배경 어휘 단서: 약 ${joseonTotal}회 (주요: ${top})`
    );
  }
  if (addrTotal || honorInfo.sentenceCount) {
    const addrTop = sortTop(addrMap, 5)
      .map(([w, c]) => `${w} · ${c}`)
      .join(", ");
    const honorTop = sortTop(honorInfo.map, 5)
      .map(([e, c]) => `${e} · ${c}`)
      .join(", ");
    lines.push(
      `윗사람에게 쓰는 존대 표현: 약 ${
        honorInfo.sentenceCount
      }문장에서 사용 (주요 어미: ${honorTop || "표준 '-습니다' 계열 중심"})`
    );
    if (addrTop) {
      lines.push(`호칭 어휘: ${addrTop}`);
    }
  }
  if (naturalInfo.sentenceCount) {
    const natTop = sortTop(naturalInfo.map, 5)
      .map(([e, c]) => `${e} · ${c}`)
      .join(", ");
    lines.push(
      `구어체·자연어 느낌 어미: 약 ${naturalInfo.sentenceCount}문장에서 사용 (주요: ${natTop})`
    );
  }
  if (dialectTotal) {
    const diaTop = sortTop(dialectMap, 5)
      .map(([w, c]) => `${w} · ${c}`)
      .join(", ");
    lines.push(`사투리·방언 단서: 약 ${dialectTotal}회 (주요: ${diaTop})`);
  }
  if (!lines.length) {
    lines.push(
      "뚜렷한 사투리나 특수 어휘보다는 비교적 표준적인 서술 어투가 중심입니다."
    );
  }
  lines.push(`전체 토큰 수 기준 분석: 약 ${totalTokens}개 단어`);
  return lines.join("\n");
}

function segmentEpisodes(sentences) {
  const n = sentences.length;
  if (!n) return [];
  const boundaryWords = [
    "며칠 뒤",
    "며칠 후",
    "몇 날 며칠",
    "몇 해 뒤",
    "몇 년 뒤",
    "그해",
    "그 해",
    "그 무렵",
    "한편",
    "그 시각",
    "그 사이",
    "그즈음",
  ];
  const containsAny = (s, words) => words.some((w) => s.includes(w));
  const minGap = Math.max(5, Math.floor(n * 0.03));
  const boundaries = [0];
  let last = 0;
  for (let i = 1; i < n - 1; i++) {
    if (i - last < minGap) continue;
    const s = sentences[i];
    if (containsAny(s, boundaryWords)) {
      boundaries.push(i);
      last = i;
    }
  }
  if (n - 1 - last > minGap * 2) {
    boundaries.push(Math.floor((last + n - 1) / 2));
  }
  if (boundaries[boundaries.length - 1] !== n) boundaries.push(n);
  const segments = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    const slice = sentences.slice(start, end);
    if (!slice.length) continue;
    segments.push({
      index: i + 1,
      startIndex: start,
      endIndex: end - 1,
      text: slice.join(" "),
      length: end - start,
    });
  }
  return segments;
}

function pacingProfile(sentences, types, bins = 10) {
  const n = sentences.length;
  if (!n) return [];
  const profile = [];
  for (let b = 0; b < bins; b++) {
    const start = Math.floor((n * b) / bins);
    const end = b === bins - 1 ? n : Math.floor((n * (b + 1)) / bins);
    const sliceTypes = types.slice(start, end);
    const len = sliceTypes.length || 1;
    const dialog = sliceTypes.filter((t) => t === "dialog").length;
    const monologue = sliceTypes.filter((t) => t === "monologue").length;
    const action = sliceTypes.filter((t) => t === "action").length;
    const effect = sliceTypes.filter((t) => t === "effect").length;
    const narration = sliceTypes.filter((t) => t === "narration").length;
    const intensity = (dialog + monologue + action + effect) / len;
    profile.push({
      segment: b + 1,
      startIndex: start,
      endIndex: end - 1,
      dialog,
      monologue,
      action,
      effect,
      narration,
      intensity: +intensity.toFixed(2),
    });
  }
  return profile;
}

function summarizeStructure(chunks) {
  if (!chunks.length) return "";
  return chunks
    .map((c) => {
      const preview = c.text.slice(0, 80) + (c.text.length > 80 ? "…" : "");
      return `- [${c.label}] 문장 ${c.startIndex + 1}~${c.endIndex + 1} : ${preview}`;
    })
    .join("\n");
}

function summarizeEpisodes(episodes) {
  if (!episodes.length) return "";
  return episodes
    .map((e) => {
      const preview = e.text.slice(0, 80) + (e.text.length > 80 ? "…" : "");
      return `- 에피소드 ${e.index} (문장 ${e.startIndex + 1}~${e.endIndex + 1}, 약 ${
        e.length
      }문장)\n  ${preview}`;
    })
    .join("\n");
}

function summarizePacing(profile) {
  if (!profile.length) return "";
  return profile
    .map(
      (p) =>
        `${p.segment}구간(문장 ${p.startIndex + 1}~${p.endIndex + 1}) · 강도 ${p.intensity} (나레이션 ${p.narration}, 독백 ${p.monologue}, 대사 ${p.dialog}, 행동 ${p.action}, 효과 ${p.effect})`
    )
    .join("\n");
}

function buildBlueprint(chunks) {
  if (!chunks.length) return "";
  const templates = {
    "세계·시대·배경 도입": "언제, 어디, 어떤 세계인지와 기본 분위기를 한 문단으로 잡습니다.",
    "주인공·상황 설정": "주요 인물과 평소 상태, 욕망이나 결핍을 드러냅니다.",
    "이상 징조·사건 발단": "평범한 일상 속에 이상한 징조나 사건 하나를 강하게 꽂습니다.",
    "갈등·위기 심화": "선택과 행동을 반복시키며 위험과 손해를 점점 키웁니다.",
    "전환점·진실 드러남": "숨겨진 진실이나 반전, 결정적 정보를 한 번에 드러냅니다.",
    "결과·벌과 보상": "인물들이 선택의 대가를 받고 관계와 상황이 정리됩니다.",
    "교훈·여운 정리": "이야기가 말하려는 교훈, 씁쓸함, 여운을 한두 문장으로 남깁니다.",
  };
  return chunks
    .map((c, idx) => {
      const guide = templates[c.label] || "";
      return `${idx + 1}단계 ${c.label}\n- 현재 대본: 문장 ${c.startIndex + 1}~${
        c.endIndex + 1
      }\n- 설계 가이드: ${guide}`;
    })
    .join("\n\n");
}

function guessNarrationStyle(sentences, stats, dialog, types) {
  const narrationSentences = [];
  for (let i = 0; i < sentences.length; i++) {
    if (!types || (types[i] !== "dialog" && types[i] !== "monologue")) {
      narrationSentences.push(sentences[i]);
    }
  }
  const povSource = narrationSentences.length
    ? narrationSentences.slice(0, 5).join(" ")
    : sentences.slice(0, 5).join(" ");
  const text = sentences.join(" ");
  let pov = "3인칭 서술자 중심";
  if (/(나는|내가|제가)\s/.test(povSource)) {
    pov = "1인칭 화자 중심";
  }
  let tone = "구어체에 가까운 설명";
  if (/[하였더라|하였으니|하였는데]/.test(text)) {
    tone = "고전·문어체 느낌의 서술";
  } else if (/입니다|합니다/.test(text)) {
    tone = "설명 방송 같은 평서형";
  }
  const rhythm =
    stats.avgCharLen <= 25
      ? "짧은 문장을 자주 써서 말하듯이 전개"
      : stats.avgCharLen >= 60
      ? "한 문장에 정보를 많이 넣는 느린 리듬"
      : "중간 길이의 문장으로 안정적인 리듬";
  const dialogLevel =
    dialog.dialogRatio >= 0.5
      ? "대사 비중이 높아 인물 중심 느낌"
      : dialog.dialogRatio <= 0.2
      ? "해설자 설명이 대부분인 구조"
      : "대사와 서술이 적당히 섞인 구조";
  return { pov, tone, rhythm, dialogLevel };
}

function aggregateChannel(analyses) {
  const n = analyses.length;
  if (!n) return null;
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const numSentences = sum(analyses.map((a) => a.stats.numSentences)) / n;
  const avgDialog = sum(analyses.map((a) => a.dialog.dialogRatio)) / n;
  const pacingLen = Math.min(...analyses.map((a) => a.pacing.length || 0)) || 0;
  const pacing = [];
  for (let i = 0; i < pacingLen; i++) {
    const segmentData = analyses
      .map((a) => a.pacing[i])
      .filter(Boolean);
    if (!segmentData.length) continue;
    const intensity =
      sum(segmentData.map((p) => p.intensity)) / segmentData.length;
    pacing.push({
      segment: i + 1,
      intensity: +intensity.toFixed(2),
    });
  }
  return {
    count: n,
    avgNumSentences: +numSentences.toFixed(1),
    avgDialogRatio: +avgDialog.toFixed(2),
    pacing,
  };
}

function buildCreationPlan(summary) {
  if (!summary) return "";
  const total = summary.avgNumSentences || 0;
  const perStage = total ? Math.max(5, Math.floor(total / 7)) : 0;
  const labels = [
    "1단계 세계·시대·배경 도입",
    "2단계 주인공·상황 설정",
    "3단계 이상 징조·사건 발단",
    "4단계 갈등·위기 심화",
    "5단계 전환점·진실 드러남",
    "6단계 결과·벌과 보상",
    "7단계 교훈·여운 정리",
  ];
  const lines = [];
  lines.push("채널의 평균 분량과 전개 리듬을 기준으로 한 설계 초안입니다.");
  lines.push(`- 에피소드 평균 문장 수: 약 ${total}문장`);
  lines.push(`- 7단계당 권장 최소 문장 수: 약 ${perStage}문장 이상`);
  lines.push("");
  labels.forEach((label, idx) => {
    lines.push(`${label}`);
    lines.push(`- 이 단계에서 채우고 싶은 내용 메모:`);
    lines.push(`- 예상 분량: ${perStage}문장 이상`);
    lines.push("");
  });
  if (summary.pacing && summary.pacing.length) {
    lines.push("추가 참고: 채널 공통 전개 리듬");
    summary.pacing.forEach((p) => {
      lines.push(
        `- ${p.segment}구간: 평균 전개 강도 ${p.intensity} (긴장/사건 밀도가 높은 부분)`
      );
    });
  }
  return lines.join("\n");
}

function analyzeScript(text) {
  const sentences = splitSentences(text);
  const stats = basicStats(sentences);
  const chunks = chunkStructure(sentences);
  const dialog = detectDialogRatio(sentences);
  const keywords = topWords(text);
  const typesInfo = classifySentenceTypes(sentences);
  const style = guessNarrationStyle(sentences, stats, dialog, typesInfo.types);
  const blueprint = buildBlueprint(chunks);
  const episodes = segmentEpisodes(sentences);
  const pacing = pacingProfile(sentences, typesInfo.types);
  const narrationDetail = buildNarrationDetail(sentences, typesInfo.types);
  const actionDetail = buildActionDetail(sentences, typesInfo.types);
  const dialogDetail = buildDialogDetail(sentences, typesInfo.types, chunks);
  const styleRegister = analyzeStyleRegister(text, sentences);
  return {
    stats,
    chunks,
    dialog,
    keywords,
    style,
    blueprint,
    types: typesInfo.summary,
    typeSequence: typesInfo.types,
    narrationDetail,
    actionDetail,
    dialogDetail,
    styleRegister,
    episodes,
    pacing,
  };
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeJsonText(text) {
  const raw = typeof text === "string" ? text.trim() : "";
  if (!raw) return "";
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence && fence[1]) {
    return fence[1].trim();
  }
  return raw;
}

function sanitizeCommentLine(text) {
  return String(text || "")
    .replace(/```json|```/gi, "")
    .replace(/^\s*["'{[]+\s*/, "")
    .replace(/\s*["'}\],]+\s*$/g, "")
    .replace(/^\s*comments?\s*:\s*/i, "")
    .replace(/^\s*-\s*/, "")
    .trim();
}

function extractTextFromResponse(data) {
  if (!data || typeof data !== "object") return "";
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const out = Array.isArray(data.output) ? data.output : [];
  const parts = [];
  for (const item of out) {
    const content = Array.isArray(item && item.content) ? item.content : [];
    for (const c of content) {
      if (typeof c.text === "string" && c.text.trim()) {
        parts.push(c.text.trim());
      }
    }
  }
  return parts.join("\n").trim();
}

async function requestOpenAIComments(payload) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${payload.apiKey}`,
    },
    body: JSON.stringify({
      model: payload.model,
      temperature: 0.9,
      max_output_tokens: 1000,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "당신은 유튜브 시니어 시청층 댓글 작성 전문가입니다. 반드시 존댓말로 작성하고, 각 댓글은 사람이 직접 쓴 것처럼 자연스럽게 다르게 작성하세요. 모든 댓글은 긍정적이어야 하며 비속어를 포함하면 안 됩니다. 너무 젊은 표현, 유행어, 인터넷 말투(ㅋㅋ, ㅎㅎ, ㄷㄷ, 레전드, 찐)는 금지하고 차분하고 성숙한 말투로 작성하세요. 각 댓글의 마지막 문장은 매번 다르게 자연스럽게 마무리하세요.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                `아래 대본 정보를 참고해 댓글 10개를 생성해 주세요.\n` +
                `반드시 JSON만 출력하고 형식은 {"points":["..."],"comments":["..."]} 로 맞춰 주세요.\n` +
                `댓글 조건:\n` +
                `- 존댓말\n` +
                `- 각 댓글은 짧게, 1문장 또는 최대 2문장\n` +
                `- 대본의 느낌/장점이 드러나게 작성\n` +
                `- 마지막 문장은 매번 다른 감사 표현 사용\n` +
                `- 대본을 먼저 읽고 핵심 내용 3가지를 points에 요약\n` +
                `- comments는 points의 내용을 자연스럽게 반영\n` +
                `- 각 댓글에 반드시 "어느 부분이 왜 좋았는지"가 들어가야 함\n` +
                `- 댓글마다 어떤 장면이 좋았는지 또는 어떤 느낌이었는지 포함\n` +
                `- 감정 전달이 느껴지도록 표현 (예: 인상 깊었습니다, 울컥했습니다, 몰입되었습니다)\n` +
                `- 형식적인 칭찬 대신 진심이 느껴지게 솔직한 감상으로 작성\n` +
                `- 모호한 칭찬만 반복하지 말고 장면/전개/감정선 중 최소 1개를 구체적으로 언급\n` +
                `- 마지막 문장은 절대 "감사합니다", "고맙습니다"로 끝내지 말 것\n` +
                `- 마지막 문장은 매 댓글마다 새롭게 작성하고 반복 금지 (예: 영상 잘 보고 갑니다, 좋은 영상으로 시간 잘 보냈어요 같은 결)\n` +
                `- comments 배열 길이는 반드시 10\n` +
                `${
                  payload.retryMode
                    ? "- 이전 생성과 최대한 다른 각도/장면/표현으로 새롭게 작성\n"
                    : ""
                }` +
                `${
                  payload.previousComments && payload.previousComments.length
                    ? `이전 생성 댓글(중복 회피 참고):\n${payload.previousComments.join("\n")}\n`
                    : ""
                }` +
                `핵심 어휘: ${payload.keywords.join(", ")}\n` +
                `문장 수: ${payload.sentenceCount}\n` +
                `문장 유형 요약: 대사 ${payload.types.dialog}, 독백 ${payload.types.monologue || 0}, 행동 ${payload.types.action}, 효과 ${payload.types.effect || 0}, 나레이션 ${payload.types.narration}\n` +
                `원문 대본:\n${payload.text}`,
            },
          ],
        },
      ],
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (data && data.error && data.error.message) ||
      "OpenAI API 요청에 실패했습니다.";
    throw new Error(message);
  }
  const rawText = extractTextFromResponse(data);
  const normalized = normalizeJsonText(rawText);
  const parsed = safeJsonParse(normalized);
  if (parsed && Array.isArray(parsed.comments)) {
    return {
      points: Array.isArray(parsed.points) ? parsed.points : [],
      comments: parsed.comments.map((line) => sanitizeCommentLine(line)),
    };
  }
  const fallback = normalized
    .split("\n")
    .map((line) => line.replace(/^\s*[-\d\.\)]\s*/, "").trim())
    .map((line) => sanitizeCommentLine(line))
    .filter((line) => line && line.length > 4);
  return {
    points: [],
    comments: fallback,
  };
}

async function generateCommentsFromScript(text, options) {
  const sentences = splitSentences(text);
  const keywords = topWords(text, 12).map(([word]) => word);
  const types = classifySentenceTypes(sentences).summary;
  const generated = await requestOpenAIComments({
    apiKey: options.apiKey,
    model: options.model,
    count: options.count,
    text,
    keywords: keywords.slice(0, 8),
    sentenceCount: sentences.length,
    types,
    retryMode: Boolean(options.retryMode),
    previousComments: Array.isArray(options.previousComments)
      ? options.previousComments.slice(0, 10)
      : [],
  });
  return {
    sentenceCount: sentences.length,
    keywords: keywords.slice(0, 6),
    points: (generated.points || []).slice(0, 3),
    comments: (generated.comments || [])
      .map((line) => sanitizeCommentLine(line))
      .filter(Boolean)
      .slice(0, 10),
    model: options.model,
  };
}

function renderGeneratedComments(target, result) {
  target.innerHTML = "";
  if (!result) {
    const empty = document.createElement("div");
    empty.className = "result-block";
    empty.textContent = "대본을 붙여 넣고 [댓글 자동 생성] 버튼을 눌러주세요.";
    target.appendChild(empty);
    return;
  }
  const infoBlock = document.createElement("div");
  infoBlock.className = "result-block";
  infoBlock.innerHTML =
    '<div class="result-title">생성 기준 요약</div>' +
    `<div class="result-body">문장 수: ${result.sentenceCount}\n핵심 어휘: ${
      result.keywords.join(", ") || "없음"
    }\n모델: ${result.model || "알 수 없음"}</div>`;
  if (Array.isArray(result.points) && result.points.length) {
    const pointBlock = document.createElement("div");
    pointBlock.className = "result-block";
    const pointLines = result.points
      .map((line, idx) => `${idx + 1}. ${line}`)
      .join("\n");
    pointBlock.innerHTML =
      '<div class="result-title">대본 핵심 포인트</div>' +
      `<div class="result-body">${pointLines}</div>`;
    target.appendChild(infoBlock);
    target.appendChild(pointBlock);
  } else {
    target.appendChild(infoBlock);
  }
  const commentsBlock = document.createElement("div");
  commentsBlock.className = "result-block";
  const title = document.createElement("div");
  title.className = "result-title";
  title.textContent = "댓글 후보";
  const list = document.createElement("div");
  list.className = "comment-list";
  result.comments.forEach((line, idx) => {
    const item = document.createElement("div");
    item.className = "comment-item";
    const text = document.createElement("div");
    text.className = "comment-text";
    text.textContent = `${idx + 1}. ${line}`;
    const copyButton = document.createElement("button");
    copyButton.className = "secondary-button";
    copyButton.textContent = "복사";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(line);
        copyButton.textContent = "복사됨";
        setTimeout(() => {
          copyButton.textContent = "복사";
        }, 1000);
      } catch {
        copyButton.textContent = "실패";
        setTimeout(() => {
          copyButton.textContent = "복사";
        }, 1000);
      }
    });
    item.appendChild(text);
    item.appendChild(copyButton);
    list.appendChild(item);
  });
  commentsBlock.appendChild(title);
  commentsBlock.appendChild(list);
  target.appendChild(commentsBlock);
}

function renderResults(target, result, meta) {
  target.innerHTML = "";
  if (!result) {
    const empty = document.createElement("div");
    empty.className = "result-block";
    empty.textContent = "먼저 왼쪽에 대본을 붙여 넣고 [분석하기]를 눌러주세요.";
    target.appendChild(empty);
    return;
  }

  if (meta && meta.title) {
    const titleBlock = document.createElement("div");
    titleBlock.className = "result-block";
    titleBlock.innerHTML =
      '<div class="result-title">에피소드</div>' +
      `<div class="result-body">${meta.title}</div>`;
    target.appendChild(titleBlock);
  }

  const statsBlock = document.createElement("div");
  statsBlock.className = "result-block";
  statsBlock.innerHTML =
    '<div class="result-title">기본 통계</div>' +
    `<div class="result-body">전체 문장 수: ${result.stats.numSentences}\n` +
    `평균 문장 길이(글자): ${result.stats.avgCharLen}\n` +
    `평균 단어 수(문장당): ${result.stats.avgWordLen}</div>`;

  const structBlock = document.createElement("div");
  structBlock.className = "result-block";
  structBlock.innerHTML =
    '<div class="result-title">전개 구조 후보(7단계 이론을 참고한 자동 추정)</div>' +
    `<div class="result-body">${summarizeStructure(result.chunks) || "문장을 더 붙여 넣으면 전개 구조 후보를 볼 수 있습니다. 실제 구조 판단은 사람이 직접 읽고 나누는 것이 더 정확합니다."}</div>`;

  const styleBlock = document.createElement("div");
  styleBlock.className = "result-block";
  styleBlock.innerHTML =
    '<div class="result-title">서술 방식 추정</div>' +
    `<div class="result-body">시점: ${result.style.pov}\n` +
    `문체: ${result.style.tone}\n` +
    `리듬: ${result.style.rhythm}\n` +
    `대사/서술 비율: ${result.style.dialogLevel} (대사 ${result.dialog.dialogRatio}, 서술 ${result.dialog.narrativeRatio})</div>`;

  const keywordBlock = document.createElement("div");
  keywordBlock.className = "result-block";
  const badges = document.createElement("div");
  badges.className = "list-inline";
  for (const [word, count] of result.keywords) {
    const span = document.createElement("span");
    span.className = "badge";
    span.textContent = `${word} · ${count}`;
    badges.appendChild(span);
  }
  const kbTitle = document.createElement("div");
  kbTitle.className = "result-title";
  kbTitle.textContent = "자주 등장하는 어휘";
  const kbBody = document.createElement("div");
  kbBody.className = "result-body";
  kbBody.appendChild(badges);
  keywordBlock.appendChild(kbTitle);
  keywordBlock.appendChild(kbBody);

  const blueprintBlock = document.createElement("div");
  blueprintBlock.className = "result-block";
  blueprintBlock.innerHTML =
    '<div class="result-title">새 대본을 위한 7단계 설계 청사진</div>' +
    `<div class="result-body">${result.blueprint || "충분한 분량의 대본을 붙여 넣으면 7단계 설계 가이드를 볼 수 있습니다."}</div>`;

  const typeBlock = document.createElement("div");
  typeBlock.className = "result-block";
  const speakerTotal =
    (result.types.dialog || 0) + (result.types.monologue || 0);
  const speakerRatio = (
    (result.types.dialogRatio || 0) +
    (result.types.monologueRatio || 0)
  ).toFixed(2);
  typeBlock.innerHTML =
    '<div class="result-title">문장 유형 비율</div>' +
    `<div class="result-body">대사: ${result.types.dialog}문장 (${result.types.dialogRatio})\n` +
    `독백: ${result.types.monologue || 0}문장 (${result.types.monologueRatio || "0.00"})\n` +
    `화자 계열(대사+독백): ${speakerTotal}문장 (${speakerRatio})\n` +
    `행동 묘사: ${result.types.action}문장 (${result.types.actionRatio})\n` +
    `효과구절: ${result.types.effect || 0}문장 (${result.types.effectRatio || "0.00"})\n` +
    `나레이션: ${result.types.narration}문장 (${result.types.narrationRatio})</div>`;

  const narrationDetailBlock = document.createElement("div");
  narrationDetailBlock.className = "result-block";
  narrationDetailBlock.innerHTML =
    '<div class="result-title">나레이션 문체·끝맺음 패턴</div>' +
    `<div class="result-body">${
      result.narrationDetail ||
      "나레이션 문장이 더 많아지면 문체와 끝맺음 패턴을 보여 줍니다."
    }</div>`;

  const actionDetailBlock = document.createElement("div");
  actionDetailBlock.className = "result-block";
  actionDetailBlock.innerHTML =
    '<div class="result-title">행동 묘사·폼새 패턴</div>' +
    `<div class="result-body">${
      result.actionDetail ||
      "걸음걸이, 몸짓 같은 행동 묘사가 늘어나면 대표 패턴과 예시 문장을 정리해 줍니다."
    }</div>`;

  const dialogDetailBlock = document.createElement("div");
  dialogDetailBlock.className = "result-block";
  dialogDetailBlock.innerHTML =
    '<div class="result-title">대사 배치·화자 패턴</div>' +
    `<div class="result-body">${
      result.dialogDetail ||
      "대사가 충분히 나오면 어떤 인물이 어디에서 얼마나 자주 말하는지 정리해서 보여 줍니다."
    }</div>`;

  const styleRegisterBlock = document.createElement("div");
  styleRegisterBlock.className = "result-block";
  styleRegisterBlock.innerHTML =
    '<div class="result-title">사투리·조선어·존대어 사용 패턴</div>' +
    `<div class="result-body">${
      result.styleRegister ||
      "사투리, 조선 시대 어휘, 윗사람에게 쓰는 존대 표현 사용 패턴을 여기에서 요약합니다."
    }</div>`;

  const episodeBlock = document.createElement("div");
  episodeBlock.className = "result-block";
  episodeBlock.innerHTML =
    '<div class="result-title">에피소드 전환 후보</div>' +
    `<div class="result-body">${summarizeEpisodes(result.episodes) || "전환 단서를 찾지 못했습니다. 이 경우에는 사람이 직접 에피소드를 나눠 보는 것이 좋습니다."}</div>`;

  const pacingBlock = document.createElement("div");
  pacingBlock.className = "result-block";
  pacingBlock.innerHTML =
    '<div class="result-title">전개 속도 프로필</div>' +
    `<div class="result-body">${summarizePacing(result.pacing) || "분량이 늘어나면 전개 속도 변화를 보여줍니다."}</div>`;

  target.appendChild(statsBlock);
  target.appendChild(structBlock);
  target.appendChild(styleBlock);
  target.appendChild(keywordBlock);
  target.appendChild(blueprintBlock);
  target.appendChild(typeBlock);
  target.appendChild(narrationDetailBlock);
  target.appendChild(actionDetailBlock);
  target.appendChild(dialogDetailBlock);
  target.appendChild(styleRegisterBlock);
  target.appendChild(episodeBlock);
  target.appendChild(pacingBlock);
}

function renderChannelSummary(target, analyses) {
  if (!target) return;
  target.innerHTML = "";
  if (!analyses.length) {
    const empty = document.createElement("div");
    empty.className = "result-block";
    empty.textContent =
      "같은 채널의 대본을 여러 개 분석하면 여기에서 공통 패턴을 요약해 줍니다.";
    target.appendChild(empty);
    return;
  }
  const summary = aggregateChannel(analyses);
  if (!summary) return;
  const baseBlock = document.createElement("div");
  baseBlock.className = "result-block";
  baseBlock.innerHTML =
    '<div class="result-title">채널 기본 통계</div>' +
    `<div class="result-body">분석한 에피소드 수: ${summary.count}\n` +
    `평균 문장 수: ${summary.avgNumSentences}\n` +
    `평균 대사 비율: ${summary.avgDialogRatio}</div>`;
  target.appendChild(baseBlock);
  if (summary.pacing.length) {
    const paceBlock = document.createElement("div");
    paceBlock.className = "result-block";
    const lines = summary.pacing
      .map((p) => `${p.segment}구간 · 평균 전개 강도 ${p.intensity}`)
      .join("\n");
    paceBlock.innerHTML =
      '<div class="result-title">채널 공통 전개 리듬</div>' +
      `<div class="result-body">${lines}</div>`;
    target.appendChild(paceBlock);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "scriptCommentGenerator:lastResult";
  const SETTINGS_KEY = "scriptCommentGenerator:settings";
  const API_KEY_STORAGE_KEY = "scriptCommentGenerator:apiKey";
  const input = document.getElementById("script-input");
  const button = document.getElementById("analyze-button");
  const regenerateButton = document.getElementById("regenerate-button");
  const resetButton = document.getElementById("reset-button");
  const saveApiKeyButton = document.getElementById("save-api-key-button");
  const results = document.getElementById("results");
  const apiKeyInput = document.getElementById("openai-api-key");
  const modelInput = document.getElementById("openai-model");
  const countInput = document.getElementById("comment-count");
  if (
    !input ||
    !button ||
    !regenerateButton ||
    !resetButton ||
    !saveApiKeyButton ||
    !results ||
    !apiKeyInput ||
    !modelInput ||
    !countInput
  ) {
    return;
  }
  let lastResult = null;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.comments)) {
        lastResult = parsed;
      }
    }
  } catch {}
  try {
    const savedSettings = window.localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed && typeof parsed.model === "string") {
        modelInput.value = parsed.model;
      }
      if (parsed && typeof parsed.count === "number") {
        countInput.value = "10";
      }
    }
  } catch {}
  try {
    const savedApiKey = window.localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedApiKey) {
      apiKeyInput.value = savedApiKey;
    }
  } catch {}
  renderGeneratedComments(results, lastResult);
  countInput.value = "10";
  countInput.disabled = true;
  saveApiKeyButton.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      alert("저장할 API Key를 먼저 입력해 주세요.");
      return;
    }
    try {
      window.localStorage.setItem(API_KEY_STORAGE_KEY, key);
      alert("API Key를 저장했습니다.");
    } catch {
      alert("API Key 저장에 실패했습니다.");
    }
  });
  async function runGeneration(retryMode) {
    const text = input.value.trim();
    if (!text) {
      alert("댓글을 만들 대본을 먼저 붙여 넣어 주세요.");
      return;
    }
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      alert("OpenAI API Key를 입력해 주세요.");
      return;
    }
    const model = modelInput.value.trim() || "gpt-4o-mini";
    const count = 10;
    countInput.value = "10";
    button.disabled = true;
    regenerateButton.disabled = true;
    const prevText = button.textContent;
    const prevRetryText = regenerateButton.textContent;
    if (retryMode) {
      regenerateButton.textContent = "다시 생성 중...";
    } else {
      button.textContent = "생성 중...";
    }
    try {
      const generated = await generateCommentsFromScript(text, {
        apiKey,
        model,
        count,
        retryMode,
        previousComments: lastResult && Array.isArray(lastResult.comments)
          ? lastResult.comments
          : [],
      });
      lastResult = generated;
      renderGeneratedComments(results, generated);
      try {
        window.localStorage.setItem(
          SETTINGS_KEY,
          JSON.stringify({ model, count: 10 })
        );
      } catch {}
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(generated));
      } catch {}
    } catch (error) {
      alert(
        `댓글 생성에 실패했습니다: ${
          error && error.message ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      button.disabled = false;
      regenerateButton.disabled = false;
      button.textContent = prevText || "댓글 자동 생성";
      regenerateButton.textContent = prevRetryText || "다시 분석 후 생성";
    }
  }
  button.addEventListener("click", () => {
    runGeneration(false);
  });
  regenerateButton.addEventListener("click", () => {
    runGeneration(true);
  });
  resetButton.addEventListener("click", () => {
    if (!input.value.trim() && !lastResult) {
      alert("초기화할 데이터가 없습니다.");
      return;
    }
    const ok = window.confirm("입력한 대본과 생성된 댓글을 모두 지울까요?");
    if (!ok) return;
    input.value = "";
    lastResult = null;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    try {
      window.localStorage.removeItem(SETTINGS_KEY);
    } catch {}
    try {
      window.localStorage.removeItem(API_KEY_STORAGE_KEY);
    } catch {}
    apiKeyInput.value = "";
    modelInput.value = "gpt-4o-mini";
    countInput.value = "10";
    renderGeneratedComments(results, null);
  });
});
