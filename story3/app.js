var storedChapters = [];
var storedCharacters = [];
var storedCharacterImages = {
  folder: "",
  paths: {}
};
var storedScenePrompts = {
  header: "",
  locations: [],
  byLocation: {}
};
var storedScenePromptBuildState = {
  running: false,
  total: 0,
  done: 0
};
var scenePromptCancelRequested = false;

document.addEventListener("DOMContentLoaded", function () {
  var tabContent = document.getElementById("tabContent");
  var tabButtons = document.querySelectorAll(".tab-button");
  var apiKeyButton = document.getElementById("apiKeyButton");
  var apiKeyModalOverlay = document.getElementById("apiKeyModalOverlay");
  var apiKeyModalClose = document.getElementById("apiKeyModalClose");
  var apiKeyModalCancel = document.getElementById("apiKeyModalCancel");
  var apiKeyModalSave = document.getElementById("apiKeyModalSave");
  var geminiApiKeyInput = document.getElementById("geminiApiKeyInput");
  var openaiApiKeyInput = document.getElementById("openaiApiKeyInput");

    var confirmModalOverlay = document.getElementById("confirmModalOverlay");
    var confirmModalTitle = document.getElementById("confirmModalTitle");
    var confirmModalMessage = document.getElementById("confirmModalMessage");
    var confirmModalClose = document.getElementById("confirmModalClose");
    var confirmModalCancel = document.getElementById("confirmModalCancel");
    var confirmModalOk = document.getElementById("confirmModalOk");
    var pendingConfirmResolve = null;

    function openConfirmModal(message, title) {
      return new Promise(function (resolve) {
        if (!confirmModalOverlay || !confirmModalMessage) {
          var ok = window.confirm(message);
          resolve(ok);
          return;
        }
        pendingConfirmResolve = resolve;
        confirmModalMessage.textContent = message;
        if (confirmModalTitle) {
          confirmModalTitle.textContent = title || "확인";
        }
        confirmModalOverlay.classList.remove("hidden");
      });
    }

    function closeConfirmModal(result) {
      if (confirmModalOverlay) {
        confirmModalOverlay.classList.add("hidden");
      }
      if (pendingConfirmResolve) {
        pendingConfirmResolve(result);
        pendingConfirmResolve = null;
      }
    }

  function getSelectedModel() {
    var nodes = document.querySelectorAll('input[name="model"]');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].checked) return nodes[i].value;
    }
    return "gemini";
  }

  function mapStyleToText(value) {
    if (value === "oriental_ink") return "Korean traditional oriental ink painting style";
    if (value === "webtoon") return "modern Korean webtoon illustration style";
    if (value === "realistic") return "cinematic, realistic, highly detailed illustration";
    if (value === "anime") return "Japanese anime illustration style, vibrant colors";
    if (value === "pixel") return "retro pixel art game scene";
    return "illustration";
  }

  function mapToneToText(value) {
    if (value === "mysterious") return "mysterious, dreamy, slightly surreal atmosphere";
    if (value === "dark") return "dark, eerie, horror atmosphere with strong contrast";
    if (value === "warm") return "warm, lyrical, emotional atmosphere with soft lighting";
    if (value === "epic") return "epic, grand, cinematic atmosphere";
    return "neutral atmosphere";
  }

  function mapDetailToLength(value) {
    if (value === "short") return "Use a short, concise English prompt.";
    if (value === "long") return "Use a long, detailed English prompt with many visual details.";
    return "Use a medium-length English prompt.";
  }

  var FIXED_IMAGE_STYLE =
    "EXACT SAME STYLE as reference image: " +
    "clean black outline separating character, " +
    "controlled lineart, " +
    "minimal interior lines, " +
    "soft painterly coloring, " +
    "smooth brush blending, " +
    "semi-realistic illustration, " +
    "soft facial shading, " +
    "idealized proportions, " +
    "smooth skin with subtle blush, " +
    "no pores, " +
    "no hyper realism, " +
    "balanced warm lighting, " +
    "Korean web novel illustration style. " +
    "AVOID: short legs, anime eyes, thick lines, sketchy lines, cell shading, photorealistic, 3D render.";

  function loadStoredChapters() {
    try {
      var raw = localStorage.getItem("yadam_chapters");
      if (!raw) {
        storedChapters = [];
        return;
      }
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        storedChapters = parsed;
      } else {
        storedChapters = [];
      }
    } catch (e) {
      storedChapters = [];
    }
  }

  function saveStoredChapters() {
    try {
      localStorage.setItem("yadam_chapters", JSON.stringify(storedChapters));
    } catch (e) {}
  }

  function loadStoredCharacters() {
    try {
      var raw = localStorage.getItem("yadam_characters");
      if (!raw) {
        storedCharacters = [];
        return;
      }
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        storedCharacters = parsed;
      } else {
        storedCharacters = [];
      }
    } catch (e) {
      storedCharacters = [];
    }
  }

  function saveStoredCharacters() {
    try {
      localStorage.setItem("yadam_characters", JSON.stringify(storedCharacters));
    } catch (e) {}
  }

  function loadStoredCharacterImages() {
    try {
      var raw = localStorage.getItem("yadam_character_images");
      if (!raw) {
        storedCharacterImages = { folder: "", paths: {} };
        return;
      }
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        storedCharacterImages = {
          folder: parsed.folder || "",
          paths: parsed.paths && typeof parsed.paths === "object" ? parsed.paths : {}
        };
      } else {
        storedCharacterImages = { folder: "", paths: {} };
      }
    } catch (e) {
      storedCharacterImages = { folder: "", paths: {} };
    }
  }

  function saveStoredCharacterImages() {
    try {
      localStorage.setItem("yadam_character_images", JSON.stringify(storedCharacterImages));
    } catch (e) {}
  }

  function loadStoredScenePrompts() {
    try {
      var raw = localStorage.getItem("yadam_scene_prompt_data");
      if (!raw) {
        storedScenePrompts = { header: "", locations: [], byLocation: {} };
        return;
      }
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        storedScenePrompts = {
          header: parsed.header || "",
          locations: Array.isArray(parsed.locations) ? parsed.locations : [],
          byLocation:
            parsed.byLocation && typeof parsed.byLocation === "object" ? parsed.byLocation : {}
        };
      } else {
        storedScenePrompts = { header: "", locations: [], byLocation: {} };
      }
    } catch (e) {
      storedScenePrompts = { header: "", locations: [], byLocation: {} };
    }
  }

  function saveStoredScenePrompts() {
    try {
      localStorage.setItem("yadam_scene_prompt_data", JSON.stringify(storedScenePrompts));
    } catch (e) {}
  }

  function writeUint16LE(buffer, offset, value) {
    buffer[offset] = value & 255;
    buffer[offset + 1] = (value >>> 8) & 255;
  }

  function writeUint32LE(buffer, offset, value) {
    buffer[offset] = value & 255;
    buffer[offset + 1] = (value >>> 8) & 255;
    buffer[offset + 2] = (value >>> 16) & 255;
    buffer[offset + 3] = (value >>> 24) & 255;
  }

  var CRC32_TABLE = (function () {
    var table = [];
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var j = 0; j < 8; j++) {
        if (c & 1) c = 3988292384 ^ (c >>> 1);
        else c = c >>> 1;
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    var c = 4294967295;
    for (var i = 0; i < bytes.length; i++) {
      c = CRC32_TABLE[(c ^ bytes[i]) & 255] ^ (c >>> 8);
    }
    return (c ^ 4294967295) >>> 0;
  }

  function sanitizeFileName(name) {
    var s = String(name || "").trim();
    if (!s) return "scene";
    s = s.replace(/[\\\/:*?"<>|]/g, "_");
    s = s.replace(/\s+/g, "_");
    if (!s) return "scene";
    return s;
  }

  function createZipFromTextFiles(files) {
    var encoder = new TextEncoder();
    var fileRecords = [];
    var totalSize = 0;

    files.forEach(function (file) {
      var nameBytes = encoder.encode(file.name);
      var dataBytes = encoder.encode(file.content);
      var crc = crc32(dataBytes);
      var localHeaderOffset = totalSize;
      var localHeader = new Uint8Array(30 + nameBytes.length);
      var p = 0;
      writeUint32LE(localHeader, p, 67324752);
      p += 4;
      writeUint16LE(localHeader, p, 20);
      p += 2;
      writeUint16LE(localHeader, p, 2048);
      p += 2;
      writeUint16LE(localHeader, p, 0);
      p += 2;
      writeUint16LE(localHeader, p, 0);
      p += 2;
      writeUint32LE(localHeader, p, crc);
      p += 4;
      writeUint32LE(localHeader, p, dataBytes.length);
      p += 4;
      writeUint32LE(localHeader, p, dataBytes.length);
      p += 4;
      writeUint16LE(localHeader, p, nameBytes.length);
      p += 2;
      writeUint16LE(localHeader, p, 0);
      p += 2;
      localHeader.set(nameBytes, p);

      fileRecords.push({
        nameBytes: nameBytes,
        dataBytes: dataBytes,
        crc: crc,
        size: dataBytes.length,
        offset: localHeaderOffset,
        localHeader: localHeader
      });
      totalSize += localHeader.length + dataBytes.length;
    });

    var centralParts = [];
    var centralSize = 0;

    fileRecords.forEach(function (rec) {
      var central = new Uint8Array(46 + rec.nameBytes.length);
      var p = 0;
      writeUint32LE(central, p, 33639248);
      p += 4;
      writeUint16LE(central, p, 803);
      p += 2;
      writeUint16LE(central, p, 20);
      p += 2;
      writeUint16LE(central, p, 2048);
      p += 2;
      writeUint16LE(central, p, 0);
      p += 2;
      writeUint16LE(central, p, 0);
      p += 2;
      writeUint32LE(central, p, rec.crc);
      p += 4;
      writeUint32LE(central, p, rec.size);
      p += 4;
      writeUint32LE(central, p, rec.size);
      p += 4;
      writeUint16LE(central, p, rec.nameBytes.length);
      p += 2;
      writeUint16LE(central, p, 0);
      p += 2;
      writeUint16LE(central, p, 0);
      p += 2;
      writeUint16LE(central, p, 0);
      p += 2;
      writeUint16LE(central, p, 0);
      p += 2;
      writeUint32LE(central, p, 0);
      p += 4;
      writeUint32LE(central, p, rec.offset);
      p += 4;
      central.set(rec.nameBytes, p);

      centralParts.push(central);
      centralSize += central.length;
    });

    var endRecord = new Uint8Array(22);
    var p = 0;
    writeUint32LE(endRecord, p, 101010256);
    p += 4;
    writeUint16LE(endRecord, p, 0);
    p += 2;
    writeUint16LE(endRecord, p, 0);
    p += 2;
    writeUint16LE(endRecord, p, fileRecords.length);
    p += 2;
    writeUint16LE(endRecord, p, fileRecords.length);
    p += 2;
    writeUint32LE(endRecord, p, centralSize);
    p += 4;
    writeUint32LE(endRecord, p, totalSize);
    p += 4;
    writeUint16LE(endRecord, p, 0);

    var zipSize = totalSize + centralSize + endRecord.length;
    var zipBytes = new Uint8Array(zipSize);
    var offset = 0;

    fileRecords.forEach(function (rec) {
      zipBytes.set(rec.localHeader, offset);
      offset += rec.localHeader.length;
      zipBytes.set(rec.dataBytes, offset);
      offset += rec.dataBytes.length;
    });

    centralParts.forEach(function (central) {
      zipBytes.set(central, offset);
      offset += central.length;
    });

    zipBytes.set(endRecord, offset);

    return new Blob([zipBytes], { type: "application/zip" });
  }

  function getAllScriptText() {
    if (!storedChapters || !storedChapters.length) return "";
    return storedChapters
      .map(function (chapter) {
        return chapter.text || "";
      })
      .join("\n\n");
  }

  function analyzeCharactersWithGemini(text, apiKey) {
    var url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(apiKey);
    var prompt =
      "다음은 한국 야담/소설 대본 전체입니다.\n" +
      "이 대본에서 등장하는 주요 인물을 뽑되,\n" +
      "각 인물에 대해 '이름'(원문에 나오는 호칭)과 '역할/신분/관계'를 함께 정리해 주세요.\n\n" +
      "- name: 대본에서 실제로 사용되는 고유 이름·호칭을 적습니다.\n" +
      "  예: '윤서령', '최씨 부인', '연화', '성진', '김씨', '박 서방'.\n" +
      "- 같은 인물이 여러 이름으로 불리면, 대표 이름 하나로 통일해서 name에 적습니다.\n" +
      "- role: 이 대본 안에서 그 인물이 맡은 역할/신분/관계를 짧게 적습니다.\n" +
      "  예: '맏며느리', '며느리', '시어머니', '사또', '기생', '버려진 아이'.\n" +
      "- role은 가능하면 2~5글자 정도의 짧은 표현으로 쓰고,\n" +
      "  '양반집 맏며느리'처럼 수식어가 긴 경우에는 '맏며느리'나 '며느리'로 줄입니다.\n" +
      "  '새로 부임한 사또'처럼 앞에 붙는 형용사는 빼고 '사또'만 남깁니다.\n" +
      "- '버려진 아이'처럼 이미 널리 쓰이는 표현은 그대로 사용해도 됩니다.\n" +
      "- count: 그 인물이 등장하는 대략적인 횟수(문장/대사 기준)를 적습니다.\n" +
      "- 지명(마을 이름 등)이나 일반 명사는 포함하지 않습니다.\n" +
      "- 반드시 JSON 배열 형식으로만 출력하세요. 추가 설명 문장은 쓰지 마세요.\n" +
      "- 형식 예시:\n" +
      '  [\n' +
      '    {"name": "윤서령", "role": "맏며느리", "count": 27},\n' +
      '    {"name": "최씨 부인", "role": "시어머니", "count": 22},\n' +
      '    {"name": "연화", "role": "기생", "count": 15}\n' +
      "  ]\n\n" +
      "대본:\n\n" +
      text;

    var body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40
      }
    };

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Gemini error");
        }
        return response.json();
      })
      .then(function (data) {
        var textOut = "";
        if (
          data &&
          data.candidates &&
          data.candidates.length &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts.length
        ) {
          textOut = data.candidates[0].content.parts
            .map(function (p) {
              return p.text || "";
            })
            .join("\n");
        }
        if (!textOut) return [];

        var jsonText = textOut.trim();
        var match = jsonText.match(/```json([\s\S]*?)```/i);
        if (match && match[1]) {
          jsonText = match[1].trim();
        } else {
          var firstBracket = jsonText.indexOf("[");
          var lastBracket = jsonText.lastIndexOf("]");
          if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            jsonText = jsonText.slice(firstBracket, lastBracket + 1);
          }
        }

        var parsed;
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          return [];
        }

        if (!Array.isArray(parsed)) return [];

        return parsed
          .filter(function (item) {
            return item && item.name;
          })
          .map(function (item) {
            return {
              name: String(item.name),
              role: item.role ? String(item.role) : "",
              count: typeof item.count === "number" ? item.count : 0
            };
          });
      });
  }

  function analyzeCharactersWithOpenAI(text, apiKey) {
    var url = "https://api.openai.com/v1/chat/completions";
    var systemPrompt =
      "너는 한국 야담/소설 대본에서 주요 인물을 정리하는 도우미다.\n" +
      "- 각 인물에 대해 다음 필드를 채운다.\n" +
      "  - name: 대본에서 실제로 사용되는 고유 이름·호칭을 적는다.\n" +
      "    예: '윤서령', '최씨 부인', '연화', '성진', '김씨', '박 서방'.\n" +
      "    같은 인물이 여러 이름으로 불리면 대표 이름 하나로 통일해서 name에 적는다.\n" +
      "  - role: 이 대본 안에서 그 인물이 맡은 역할/신분/관계를 짧게 적는다.\n" +
      "    예: '맏며느리', '며느리', '시어머니', '사또', '기생', '버려진 아이'.\n" +
      "    role은 가능하면 2~5글자 정도의 짧은 표현으로 쓰고,\n" +
      "    '양반집 맏며느리'처럼 수식어가 긴 경우에는 '맏며느리'나 '며느리'로 줄인다.\n" +
      "    '새로 부임한 사또'처럼 앞에 붙는 형용사는 빼고 '사또'만 남긴다.\n" +
      "    '버려진 아이'처럼 이미 널리 쓰이는 표현은 그대로 사용해도 된다.\n" +
      "  - count: 그 인물이 등장하는 대략적인 횟수(문장/대사 기준)를 적는다.\n" +
      "- 지명(마을 이름 등)이나 일반 명사는 포함하지 않는다.\n" +
      "- 반드시 JSON 배열 형식으로만 출력한다. 추가 설명 문장은 쓰지 않는다.\n" +
      "- 형식 예시:\n" +
      '  [\n' +
      '    {"name": "윤서령", "role": "맏며느리", "count": 27},\n' +
      '    {"name": "최씨 부인", "role": "시어머니", "count": 22},\n' +
      '    {"name": "연화", "role": "기생", "count": 15}\n' +
      "  ]";

    var body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0
    };

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey
      },
      body: JSON.stringify(body)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("OpenAI error");
        }
        return response.json();
      })
      .then(function (data) {
        var textOut = "";
        if (
          data &&
          data.choices &&
          data.choices.length &&
          data.choices[0].message &&
          data.choices[0].message.content
        ) {
          textOut = data.choices[0].message.content;
        }
        if (!textOut) return [];

        var jsonText = textOut.trim();
        var match = jsonText.match(/```json([\s\S]*?)```/i);
        if (match && match[1]) {
          jsonText = match[1].trim();
        } else {
          var firstBracket = jsonText.indexOf("[");
          var lastBracket = jsonText.lastIndexOf("]");
          if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            jsonText = jsonText.slice(firstBracket, lastBracket + 1);
          }
        }

        var parsed;
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          return [];
        }

        if (!Array.isArray(parsed)) return [];

        return parsed
          .filter(function (item) {
            return item && item.name;
          })
          .map(function (item) {
            return {
              name: String(item.name),
              role: item.role ? String(item.role) : "",
              count: typeof item.count === "number" ? item.count : 0
            };
          });
      });
  }

  function analyzeScenesWithGemini(text, apiKey) {
    var url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(apiKey);
    var prompt =
      "다음은 한국 야담/소설 한 챕터 전체 대본이다.\n" +
      "시간의 흐름과 인물의 이동(어디에 있다, 어디로 들어간다/나온다)을 고려해서 장면을 나눠라.\n" +
      "각 장면은 하나의 연속된 시간·장소·상황 단위가 되도록 한다.\n\n" +
      "출력 규칙:\n" +
      "- 반드시 JSON 배열만 출력한다. 다른 설명 문장은 쓰지 마라.\n" +
      "- 각 원소는 다음 필드를 가진다.\n" +
      '  { "label": "짧은 장면 설명", "start": 0, "end": 120 }\n' +
      "- start, end는 이 대본 문자열에서의 문자 인덱스(0 이상, end는 포함하지 않음)다.\n" +
      "- label에는 장소와 상황을 짧게 요약한다. 예: \"집안마당, 시어머니와 며느리 말다툼\".\n\n" +
      "JSON 예시:\n" +
      "[\n" +
      '  { "label": "서론, 나레이션", "start": 0, "end": 180 },\n' +
      '  { "label": "집안마당, 서령과 시어머니", "start": 180, "end": 950 }\n' +
      "]\n\n" +
      "대본:\n\n" +
      text;

    var body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Gemini scene error");
        }
        return response.json();
      })
      .then(function (data) {
        var textOut = "";
        if (
          data &&
          data.candidates &&
          data.candidates.length &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts.length
        ) {
          textOut = data.candidates[0].content.parts
            .map(function (p) {
              return p.text || "";
            })
            .join("\n");
        }
        if (!textOut) return [];

        var jsonText = textOut.trim();
        var match = jsonText.match(/```json([\s\S]*?)```/i);
        if (match && match[1]) {
          jsonText = match[1].trim();
        } else {
          var firstBracket = jsonText.indexOf("[");
          var lastBracket = jsonText.lastIndexOf("]");
          if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            jsonText = jsonText.slice(firstBracket, lastBracket + 1);
          }
        }

        var parsed;
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          return [];
        }

        if (!Array.isArray(parsed)) return [];

        return parsed
          .filter(function (item) {
            return (
              item &&
              typeof item.start === "number" &&
              typeof item.end === "number" &&
              item.start >= 0 &&
              item.end > item.start
            );
          })
          .map(function (item) {
            return {
              label: String(item.label || ""),
              start: item.start,
              end: item.end
            };
          });
      });
  }

  function analyzeScenesWithOpenAI(text, apiKey) {
    var url = "https://api.openai.com/v1/chat/completions";
    var systemPrompt =
      "너는 한국 야담/소설 한 챕터를 시간 순서의 장면(scene) 단위로 나누는 도우미다.\n" +
      "- 시간의 흐름, 인물의 이동(어디에 있다/어디로 들어간다/나온다), 장소 변화를 기준으로 장면 경계를 잡는다.\n" +
      "- 같은 장소와 연속된 시간에 이어지는 내용은 하나의 장면으로 묶는다.\n" +
      "- 장면 수는 너무 많지 않게, 의미 있는 덩어리만 나눈다.\n" +
      "- 인덱스를 잘못 계산하면 안 되므로, 반드시 원문 문자열 기준으로 start/end를 계산한다.\n" +
      "- start는 포함, end는 포함하지 않는 인덱스로 한다.\n" +
      "- 출력은 JSON 배열만 허용된다. 다른 설명 문장은 쓰지 않는다.\n" +
      "- 각 원소는 다음 필드를 가진다.\n" +
      '  { "label": "짧은 장면 설명", "start": 0, "end": 120 }\\n' +
      '- label에는 장소와 상황을 한 줄로 요약한다. 예: "집안마당, 시어머니와 며느리 말다툼".';

    var body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0
    };

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey
      },
      body: JSON.stringify(body)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("OpenAI scene error");
        }
        return response.json();
      })
      .then(function (data) {
        var textOut = "";
        if (
          data &&
          data.choices &&
          data.choices.length &&
          data.choices[0].message &&
          data.choices[0].message.content
        ) {
          textOut = data.choices[0].message.content;
        }
        if (!textOut) return [];

        var jsonText = textOut.trim();
        var match = jsonText.match(/```json([\s\S]*?)```/i);
        if (match && match[1]) {
          jsonText = match[1].trim();
        } else {
          var firstBracket = jsonText.indexOf("[");
          var lastBracket = jsonText.lastIndexOf("]");
          if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            jsonText = jsonText.slice(firstBracket, lastBracket + 1);
          }
        }

        var parsed;
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          return [];
        }

        if (!Array.isArray(parsed)) return [];

        return parsed
          .filter(function (item) {
            return (
              item &&
              typeof item.start === "number" &&
              typeof item.end === "number" &&
              item.start >= 0 &&
              item.end > item.start
            );
          })
          .map(function (item) {
            return {
              label: String(item.label || ""),
              start: item.start,
              end: item.end
            };
          });
      });
  }

  function generateThumbnailIdeasWithGemini(text, apiKey, relationLabel) {
    var url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      encodeURIComponent(apiKey);
    var relationLine = "";
    var roleA = "";
    var roleB = "";
    var forbiddenNames = [];
    var nameToRole = {};

    loadStoredCharacters();
    if (storedCharacters && storedCharacters.length) {
      storedCharacters.forEach(function (c) {
        if (!c || !c.name) return;
        var n = String(c.name).trim();
        if (!n) return;
        forbiddenNames.push(n);
        if (c.role && String(c.role).trim()) {
          nameToRole[n] = String(c.role).trim();
        }
      });
    }

    var strategyHint = "";
    if (relationLabel && relationLabel.trim()) {
      var labelText = relationLabel;
      var splitHint = relationLabel.split("||");
      if (splitHint.length >= 2) {
        labelText = splitHint[0];
        strategyHint = splitHint.slice(1).join("||").trim();
      }
      var parts = labelText.split("VS");
      if (parts.length >= 2) {
        roleA = parts[0].trim();
        roleB = parts[1].trim();
      }
    }

    if (roleA && roleB) {
      relationLine =
        "★절대 원칙 1: 이번 썸네일은 오직 '" +
        roleA +
        "'와 '" +
        roleB +
        "' 두 인물의 이야기다.\n" +
        "  - 대본에 나오는 머슴, 딸, 이웃, 지나가는 사람 등 제3자는 절대 등장시키지 마라.\n" +
        "  - 오직 '" +
        roleA +
        "'와 '" +
        roleB +
        "'의 대립과 관계에만 집중해라.\n\n" +
        "★절대 원칙 2: 이름(서령, 강보, 옥분 등)은 절대 쓰지 마라. 오직 직업/신분('" +
        roleA +
        "', '" +
        roleB +
        "')만 써라.\n\n" +
        "★절대 원칙 3: 짜잘한 사건은 무시해라. 두 인물의 인생을 건 결정적인 순간만 다뤄라.\n\n" +
        "★필수 구조:\n" +
        "  1줄: 주도하는 인물(" +
        (roleA || "A") +
        ")의 행동 (목적어+서술어)\n" +
        "  2줄: 상대 인물(" +
        (roleB || "B") +
        ")의 반응/상태\n" +
        "  3줄: 그로 인한 충격적 결과/반전\n\n";

      if (strategyHint) {
        relationLine +=
          "★[사용자가 입력한 이 썸네일의 핵심 의도(Tip)]★\n" +
          '"' +
          strategyHint +
          '"\n' +
          "-> AI, 너는 대본보다 이 [핵심 의도]를 더 중요하게 반영해야 한다.\n" +
          "-> 대본의 내용은 이 [핵심 의도]를 뒷받침하는 배경일 뿐이다.\n" +
          "-> 엉뚱한 사건 쓰지 말고, 이 [핵심 의도]에 맞는 반전과 드라마를 문구에 담아라.\n\n";
      } else {
        relationLine += "\n";
      }
    }

    var prompt =
      "너는 한국 야담/소설 전체 대본을 보고 유튜브 썸네일 문구를 기획하는 편집자다.\n" +
      "- 항상 인물 두 명의 관계를 축으로 잡는다.\n" +
      "- 인물은 이름이 아니라 신분/직업/역할(예: 천재 고아, 새 사또, 며느리, 시어머니)로만 표현한다.\n" +
      "- 썸네일 문구 하나(한 후보)는 정확히 3줄로 쓴다.\n" +
      "- 각 줄은 3~7글자 정도의 짧은 구(예: \"천재아이를\", \"100냥에\", \"사온 며느리\")로 쓴다.\n" +
      "- 한 후보(3줄)를 모두 합쳤을 때 20자를 크게 넘기지 않게 짧게 쓴다.\n" +
      "- 결말이나 중요한 반전을 직접 설명하지 않는다.\n" +
      "- 대신, 두 인물 사이의 '한 장면'이 떠오르도록 구체적인 행동과 결과를 써라.\n" +
      "- 특히, 각 후보는 다음 구조를 따르는 것을 기본으로 한다.\n" +
      "  1줄: 주도하는 인물(" +
      (roleA || "인물A") +
      ")의 행동 또는 선택 (목적어+서술어 구조 선호)\n" +
      "  2줄: 상대 인물(" +
      (roleB || "인물B") +
      ")의 상태/반응/위치 (조사 '을/를', '에게' 등 사용)\n" +
      "  3줄: 두 인물 관계의 결과, 역전, 복수, 파국, 화해 중 하나\n" +
      "  ★중요: 3줄을 합치면 '" +
      (roleA || "A") +
      "'와 '" +
      (roleB || "B") +
      "'가 모두 들어간 하나의 자연스러운 문장이 되어야 한다.\n" +
      "- '사랑', '진심', '운명', '가족' 같은 맥락 없는 추상 명사는 쓰지 마라.\n" +
      "- 단, '지혜', '이유', '위해', '복수' 같은 단어는 구체적인 사건과 결합될 때 적극적으로 사용해라.\n" +
      "- ★핵심 전략: 단순한 사건 나열이 아니라, '왜 그랬는지(이유)', '어떤 반전이 있는지(지혜/복수)'를 강조해라.\n" +
      "- ★절대 금지: 문장 순서를 도치하거나 뒤집지 마라. 1줄->2줄->3줄이 시간 순서대로 읽혀야 한다.\n" +
      "  (나쁜 예: '입고 돌아온 / 고운 비단옷을 / 맏며느리' -> 순서가 엉망임)\n" +
      "  (좋은 예: '고운 비단옷을 / 입고 돌아온 / 맏며느리' -> 정상 어순)\n" +
      "- 같은 핵심 장면·선택을 여러 후보에서 비슷하게 반복해서 써도 된다.\n" +
      "- 후보끼리 너무 비슷하다고 피하지 말고, 단어·어순만 조금 바꾼 여러 버전을 만들어라.\n" +
      "- 마지막 줄은 '시어머니 앞', '사또 앞'처럼 단순한 장소로 끝내지 말고,\n" +
      "  '쫓아낸 시어머니의 지혜', '무릎 꿇은 며느리의 선택'처럼 인물의 평가나 결과로 마무리해라.\n" +
      "- '마지막 선택', '운명적 선택' 같은 두루뭉술한 요약 표현으로 끝내지 마라.\n" +
      "- 문장 끝에 물음표를 쓰지 말고, '무엇일까', '어찌할까', '과연' 같은 표현도 쓰지 마라.\n" +
      "- '썸네일', '문구', '기획', '제목' 같은 메타 단어는 절대 쓰지 마라.\n" +
      relationLine +
      "- 출력에는 설명, 해설, 코멘트 없이 순수 썸네일 문구만 포함한다.\n" +
      "- 각 썸네일 후보 사이에는 빈 줄 하나로만 구분한다.\n" +
      "★최고의 예시(무조건 이 패턴을 따라해라!):\n" +
      "  며느리를\n" +
      "  쫓아낸 시어머니의\n" +
      "  숨겨진 지혜\n" +
      "\n" +
      "  쫓겨난 며느리가\n" +
      "  복수하러 온 시어머니 앞에서\n" +
      "  오열한 이유\n" +
      "\n" +
      "  며느리를 살리기 위해\n" +
      "  모진 척 쫓아낸\n" +
      "  독한 시어머니\n" +
      "\n" +
      "  며느리를 살리려\n" +
      "  쫓아낸 시어머니의\n" +
      "  지혜로운 선택\n" +
      "\n" +
      "  천재아이를\n" +
      "  100냥에\n" +
      "  사온 며느리\n" +
      "\n" +
      "  천재 쌍둥이를\n" +
      "  주워온\n" +
      "  욕쟁이 할머니\n" +
      "\n" +
      "  절세미녀를 마다하고\n" +
      "  뚱녀를 선택한\n" +
      "  떡집 총각\n" +
      "\n" +
      "  소박맞은 마님을\n" +
      "  끝까지\n" +
      "  모신 머슴\n" +
      "\n" +
      "  친정가는 며느리에게\n" +
      "  누더기를 입혀 보낸\n" +
      "  지혜로운 시어머니\n" +
      "\n" +
      "  불구로 태어나\n" +
      "  버려진 왕세자를\n" +
      "  구한 약초꾼\n" +
      "나쁜 예시는 다음과 같다(절대 이렇게 쓰지 마라):\n" +
      "  맏며느리의\n" +
      "  슬픈 선택은\n" +
      "  예고된 배신\n" +
      "  \n" +
      "  사랑과 증오\n" +
      "  두 여인의 대립\n" +
      "  이제 시작된다\n" +
      "  \n" +
      "  고운 비단옷을\n" +
      "  입고 돌아온\n" +
      "  단단한 맏며느리 (-> 너무 평범함)\n" +
      "  \n" +
      "  사랑을 지키기 위해\n" +
      "  내친 며느리의\n" +
      "  슬픈 선택 (-> 너무 추상적임)\n" +
      "  \n" +
      "위의 나쁜 예시처럼 '단순 나열'하거나 '추상적인 감정'만 쓰지 마라.\n" +
      "좋은 예시들처럼 '숨겨진 지혜', '오열한 이유', '살리기 위해 쫓아낸' 같은 반전과 의도를 담아라.\n" +
      "번호, 따옴표, 불릿 기호는 쓰지 말고, 썸네일 문구와 줄바꿈만 출력하라.\n" +
      "각 후보 사이에는 빈 줄 한 줄만 넣어 구분하라.\n\n" +
      "대본:\n\n" +
      text;

    var body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Gemini thumbnail error");
        }
        return response.json();
      })
      .then(function (data) {
        var textOut = "";
        if (
          data &&
          data.candidates &&
          data.candidates.length &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts.length
        ) {
          textOut = data.candidates[0].content.parts
            .map(function (p) {
              return p.text || "";
            })
            .join("\n");
        }

        var raw = (textOut || "").trim();
        if (!raw) return "";

        var normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        var blocks = normalized.split(/\n{2,}/);
        var kept = [];

        blocks.forEach(function (block) {
          var t = block.trim();
          if (!t) return;

          if (forbiddenNames.length) {
            forbiddenNames.forEach(function (name) {
              if (!name) return;
              if (nameToRole[name]) {
                var re = new RegExp(name, "g");
                t = t.replace(re, nameToRole[name]);
              }
            });
          }

          // if (roleA && roleB) {
          //   if (t.indexOf(roleA) === -1 || t.indexOf(roleB) === -1) return;
          // }

          kept.push(t);
        });

        if (!kept.length) {
          return "";
        }

        if (roleA && roleB && kept.length < 20) {
          var variants = [];
          var seen = {};
          function addUnique(str) {
            var v = (str || "").trim();
            if (!v) return;
            if (seen[v]) return;
            seen[v] = true;
            variants.push(v);
          }

          kept.forEach(function (t) {
            addUnique(t);
          });

          // kept = variants; // Remove variant generation that swaps lines
        }

        return kept.join("\n\n");
      });
  }

  function generateThumbnailIdeasWithOpenAI(text, apiKey, relationLabel) {
    var url = "https://api.openai.com/v1/chat/completions";
    var relationLine = "";
    var roleA = "";
    var roleB = "";
    var forbiddenNames = [];
    var nameToRole = {};

    loadStoredCharacters();
    if (storedCharacters && storedCharacters.length) {
      storedCharacters.forEach(function (c) {
        if (!c || !c.name) return;
        var n = String(c.name).trim();
        if (!n) return;
        forbiddenNames.push(n);
        if (c.role && String(c.role).trim()) {
          nameToRole[n] = String(c.role).trim();
        }
      });
    }

    var strategyHint = "";
    if (relationLabel && relationLabel.trim()) {
      var labelText = relationLabel;
      var splitHint = relationLabel.split("||");
      if (splitHint.length >= 2) {
        labelText = splitHint[0];
        strategyHint = splitHint.slice(1).join("||").trim();
      }
      var parts = labelText.split("VS");
      if (parts.length >= 2) {
        roleA = parts[0].trim();
        roleB = parts[1].trim();
      }
    }

    if (roleA && roleB) {
      relationLine =
        "★절대 원칙 1: 이번 썸네일은 오직 '" +
        roleA +
        "'와 '" +
        roleB +
        "' 두 인물의 이야기다.\n" +
        "  - 대본에 나오는 머슴, 딸, 이웃, 지나가는 사람 등 제3자는 절대 등장시키지 마라.\n" +
        "  - 오직 '" +
        roleA +
        "'와 '" +
        roleB +
        "'의 대립과 관계에만 집중해라.\n\n" +
        "★절대 원칙 2: 이름(서령, 강보, 옥분 등)은 절대 쓰지 마라. 오직 직업/신분('" +
        roleA +
        "', '" +
        roleB +
        "')만 써라.\n\n" +
        "★절대 원칙 3: 짜잘한 사건은 무시해라. 두 인물의 인생을 건 결정적인 순간만 다뤄라.\n\n" +
        "★필수 구조:\n" +
        "  1줄: 주도하는 인물(" +
        (roleA || "A") +
        ")의 행동 (목적어+서술어)\n" +
        "  2줄: 상대 인물(" +
        (roleB || "B") +
        ")의 반응/상태\n" +
        "  3줄: 그로 인한 충격적 결과/반전\n\n";

      if (strategyHint) {
        relationLine +=
          "★[사용자가 입력한 이 썸네일의 핵심 의도(Tip)]★\n" +
          '"' +
          strategyHint +
          '"\n' +
          "-> AI, 너는 대본보다 이 [핵심 의도]를 더 중요하게 반영해야 한다.\n" +
          "-> 대본의 내용은 이 [핵심 의도]를 뒷받침하는 배경일 뿐이다.\n" +
          "-> 엉뚱한 사건 쓰지 말고, 이 [핵심 의도]에 맞는 반전과 드라마를 문구에 담아라.\n\n";
      } else {
        relationLine += "\n";
      }
    }

    var systemPrompt =
      "너는 한국 야담/소설 전체 대본을 보고 유튜브 썸네일 문구를 기획하는 편집자다.\n" +
      "- 항상 인물 두 명의 관계를 축으로 잡는다.\n" +
      "- 인물은 이름이 아니라 신분/직업/역할(예: 천재 고아, 새 사또, 며느리, 시어머니)로만 표현한다.\n" +
      "- 썸네일 문구 하나(한 후보)는 정확히 3줄로 쓴다.\n" +
      "- 각 줄은 3~7글자 정도의 짧은 구(예: \"천재아이를\", \"100냥에\", \"사온 며느리\")로 쓴다.\n" +
      "- 한 후보(3줄)를 모두 합쳤을 때 20자를 크게 넘기지 않게 짧게 쓴다.\n" +
      "- 결말이나 중요한 반전을 직접 설명하지 않는다.\n" +
      "- 대신, 두 인물 사이의 '한 장면'이 떠오르도록 구체적인 행동과 결과를 써라.\n" +
      "- 특히, 각 후보는 다음 구조를 따르는 것을 기본으로 한다.\n" +
      "  1줄: 주도하는 인물(" +
      (roleA || "인물A") +
      ")의 행동 또는 선택 (목적어+서술어 구조 선호)\n" +
      "  2줄: 상대 인물(" +
      (roleB || "인물B") +
      ")의 상태/반응/위치 (조사 '을/를', '에게' 등 사용)\n" +
      "  3줄: 두 인물 관계의 결과, 역전, 복수, 파국, 화해 중 하나\n" +
      "  ★중요: 3줄을 합치면 '" +
      (roleA || "A") +
      "'와 '" +
      (roleB || "B") +
      "'가 모두 들어간 하나의 자연스러운 문장이 되어야 한다.\n" +
      "- '사랑', '진심', '운명', '가족' 같은 맥락 없는 추상 명사는 쓰지 마라.\n" +
      "- 단, '지혜', '이유', '위해', '복수' 같은 단어는 구체적인 사건과 결합될 때 적극적으로 사용해라.\n" +
      "- ★핵심 전략: 단순한 사건 나열이 아니라, '왜 그랬는지(이유)', '어떤 반전이 있는지(지혜/복수)'를 강조해라.\n" +
      "- ★절대 금지: 문장 순서를 도치하거나 뒤집지 마라. 1줄->2줄->3줄이 시간 순서대로 읽혀야 한다.\n" +
      "  (나쁜 예: '입고 돌아온 / 고운 비단옷을 / 맏며느리' -> 순서가 엉망임)\n" +
      "  (좋은 예: '고운 비단옷을 / 입고 돌아온 / 맏며느리' -> 정상 어순)\n" +
      "- 같은 핵심 장면·선택을 여러 후보에서 비슷하게 반복해서 써도 된다.\n" +
      "- 후보끼리 너무 비슷하다고 피하지 말고, 단어·어순만 조금 바꾼 여러 버전을 만들어라.\n" +
      "- 마지막 줄은 '시어머니 앞', '사또 앞'처럼 단순한 장소로 끝내지 말고,\n" +
      "  '쫓아낸 시어머니의 지혜', '무릎 꿇은 며느리의 선택'처럼 인물의 평가나 결과로 마무리해라.\n" +
      "- '마지막 선택', '운명적 선택' 같은 두루뭉술한 요약 표현으로 끝내지 마라.\n" +
      "- 문장 끝에 물음표를 쓰지 말고, '무엇일까', '어찌할까', '과연' 같은 표현도 쓰지 마라.\n" +
      "- '썸네일', '문구', '기획', '제목' 같은 메타 단어는 절대 쓰지 마라.\n" +
      relationLine +
      "- 출력에는 설명, 해설, 코멘트 없이 순수 썸네일 문구만 포함한다.\n" +
      "- 각 썸네일 후보 사이에는 빈 줄 하나로만 구분한다.\n" +
      "★최고의 예시(무조건 이 패턴을 따라해라!):\n" +
      "  며느리를\n" +
      "  쫓아낸 시어머니의\n" +
      "  숨겨진 지혜\n" +
      "\n" +
      "  쫓겨난 며느리가\n" +
      "  복수하러 온 시어머니 앞에서\n" +
      "  오열한 이유\n" +
      "\n" +
      "  며느리를 살리기 위해\n" +
      "  모진 척 쫓아낸\n" +
      "  독한 시어머니\n" +
      "\n" +
      "  며느리를 살리려\n" +
      "  쫓아낸 시어머니의\n" +
      "  지혜로운 선택\n" +
      "\n" +
      "  천재아이를\n" +
      "  100냥에\n" +
      "  사온 며느리\n" +
      "\n" +
      "  천재 쌍둥이를\n" +
      "  주워온\n" +
      "  욕쟁이 할머니\n" +
      "\n" +
      "  절세미녀를 마다하고\n" +
      "  뚱녀를 선택한\n" +
      "  떡집 총각\n" +
      "\n" +
      "  소박맞은 마님을\n" +
      "  끝까지\n" +
      "  모신 머슴\n" +
      "\n" +
      "  친정가는 며느리에게\n" +
      "  누더기를 입혀 보낸\n" +
      "  지혜로운 시어머니\n" +
      "\n" +
      "  불구로 태어나\n" +
      "  버려진 왕세자를\n" +
      "  구한 약초꾼\n" +
      "나쁜 예시는 다음과 같다(절대 이렇게 쓰지 마라):\n" +
      "  맏며느리의\n" +
      "  슬픈 선택은\n" +
      "  예고된 배신\n" +
      "  \n" +
      "  사랑과 증오\n" +
      "  두 여인의 대립\n" +
      "  이제 시작된다\n" +
      "  \n" +
      "  고운 비단옷을\n" +
      "  입고 돌아온\n" +
      "  단단한 맏며느리 (-> 너무 평범함)\n" +
      "  \n" +
      "  사랑을 지키기 위해\n" +
      "  내친 며느리의\n" +
      "  슬픈 선택 (-> 너무 추상적임)\n" +
      "  \n" +
      "위의 나쁜 예시처럼 '단순 나열'하거나 '추상적인 감정'만 쓰지 마라.\n" +
      "좋은 예시들처럼 '숨겨진 지혜', '오열한 이유', '살리기 위해 쫓아낸' 같은 반전과 의도를 담아라.\n" +
      "번호, 따옴표, 불릿 기호는 쓰지 말고, 썸네일 문구와 줄바꿈만 출력하라.";

    var body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7
    };

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey
      },
      body: JSON.stringify(body)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("OpenAI thumbnail error");
        }
        return response.json();
      })
      .then(function (data) {
        var textOut = "";
        if (
          data &&
          data.choices &&
          data.choices.length &&
          data.choices[0].message &&
          data.choices[0].message.content
        ) {
          textOut = data.choices[0].message.content;
        }

        var raw = (textOut || "").trim();
        if (!raw) return "";

        var normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        var blocks = normalized.split(/\n{2,}/);
        var kept = [];

        blocks.forEach(function (block) {
          var t = block.trim();
          if (!t) return;

          if (forbiddenNames.length) {
            forbiddenNames.forEach(function (name) {
              if (!name) return;
              if (nameToRole[name]) {
                var re = new RegExp(name, "g");
                t = t.replace(re, nameToRole[name]);
              }
            });
          }

          // if (roleA && roleB) {
          //   if (t.indexOf(roleA) === -1 || t.indexOf(roleB) === -1) return;
          // }

          kept.push(t);
        });

        if (!kept.length) {
          return "";
        }

        if (roleA && roleB && kept.length < 20) {
          var variants = [];
          var seen = {};
          function addUnique(str) {
            var v = (str || "").trim();
            if (!v) return;
            if (seen[v]) return;
            seen[v] = true;
            variants.push(v);
          }

          kept.forEach(function (t) {
            addUnique(t);
          });

          // kept = variants; // Remove variant generation that swaps lines
        }

        return kept.join("\n\n");
      });
  }

  function generateSceneDescriptionWithOpenAI(partText, partCharacters, label, apiKey) {
    var url = "https://api.openai.com/v1/chat/completions";
    var systemPrompt =
      "너는 한국 사극/야담 장면을 연출 지시문으로 풀어 쓰는 감독 겸 콘티 작가다.\n" +
      "- 인물의 얼굴, 체형 등 외형 묘사는 하지 않는다. 인물 레퍼런스 이미지는 이미 존재한다고 가정한다.\n" +
      "- 인물들의 행동, 동선, 제스처, 시선, 상호작용과 카메라 구도, 거리감, 공간 구조, 소품, 조명, 분위기에 초점을 맞춘다.\n" +
      "- 줄거리 요약이 아니라, 촬영 현장에서 그대로 찍을 수 있을 정도의 장면 연출 지시문을 쓴다.\n" +
      "- 출력 형식:\n" +
      "  1) 먼저 한국어로 한 줄을 쓴다.\n" +
      "     형식: [상황: ...] [행동: ...] [배경: ...] [조명/분위기: ...]\n" +
      "     이때 [카메라:], [인물:] 태그는 쓰지 않는다.\n" +
      "  2) 다음 줄에 '---' 한 줄을 쓴다.\n" +
      "  3) 그 아래에 영어로 한 줄을 쓴다.\n" +
      "     형식: [Situation: ...] [Action: ...] [Background: ...] [Lighting / Mood: ...]\n" +
      "  4) 위 형식 이외의 다른 문장이나 설명은 쓰지 않는다.";

    var charactersText = "";
    if (Array.isArray(partCharacters) && partCharacters.length) {
      charactersText = partCharacters.join(", ");
    }

    var userPrompt =
      "대본:\n" +
      partText +
      "\n\n장소: " +
      label +
      "\n등장인물: " +
      (charactersText || "(명시되지 않음)");

    var body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    };

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey
      },
      body: JSON.stringify(body)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("OpenAI scene description error");
        }
        return response.json();
      })
      .then(function (data) {
        var textOut = "";
        if (
          data &&
          data.choices &&
          data.choices.length &&
          data.choices[0].message &&
          data.choices[0].message.content
        ) {
          textOut = data.choices[0].message.content;
        }
        if (!textOut) {
          return { ko: "", en: "" };
        }
        var text = String(textOut || "").trim();
        if (!text) {
          return { ko: "", en: "" };
        }
        var parts = text.split(/\n\s*-{3,}\s*\n/);
        if (parts.length < 2) {
          return { ko: text, en: "" };
        }
        var ko = parts[0].trim();
        var en = parts.slice(1).join("\n").trim();
        return {
          ko: ko,
          en: en
        };
      })
      .catch(function () {
        return { ko: "", en: "" };
      });
  }

  function updateScenePromptProgress(done, total, finished) {
    storedScenePromptBuildState.running = !finished && total > 0;
    storedScenePromptBuildState.total = total;
    storedScenePromptBuildState.done = done;

    var headerEl = document.getElementById("scenePromptHeader");
    var statusEl = document.getElementById("scenePromptBuildStatus");

    if (finished) {
      if (headerEl) {
        headerEl.textContent = "장면 프롬프트 생성이 완료되었습니다.";
      }
      if (statusEl) {
        statusEl.textContent = "장면 프롬프트 생성이 완료되었습니다.";
      }
    } else {
      var msg = "장면 프롬프트 생성 중... (" + done + " / " + total + ")";
      if (headerEl) {
        headerEl.textContent = msg;
      }
      if (statusEl) {
        statusEl.textContent = msg;
      }
    }
  }

  function normalizeKoreanNameToken(token) {
    var base = token.replace(/[^가-힣]/g, "");
    if (!base) return "";
    var particles = [
      "에서",
      "에게서",
      "에게",
      "으로",
      "라고",
      "이며",
      "이자",
      "이라",
      "이란",
      "이여",
      "에서야",
      "은",
      "는",
      "이",
      "가",
      "을",
      "를",
      "의",
      "와",
      "과",
      "도",
      "만",
      "까지",
      "부터",
      "이나",
      "나",
      "야"
    ];
    var changed = true;
    while (changed) {
      changed = false;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (base.length > p.length + 1 && base.slice(-p.length) === p) {
          base = base.slice(0, -p.length);
          changed = true;
          break;
        }
      }
    }
    if (base.length >= 3) {
      base = base.slice(-2);
    }
    return base;
  }

  function extractCharacterCandidates(text) {
    var cleaned = text.replace(/\s+/g, " ");
    var tokens = cleaned.split(/[\s.,?!~"“”'‘’()\[\]{}…·ㆍ\-]+/);
    var counts = {};
    var ignore = [
      "그리고",
      "그러나",
      "하지만",
      "그래서",
      "오늘",
      "어제",
      "지금",
      "정말",
      "아주",
      "매우",
      "많이",
      "우리",
      "그녀",
      "그가",
      "나는",
      "우리는",
      "당시",
      "사람들",
      "마을",
      "이야기",
      "말했",
      "말하",
      "있었",
      "있습",
      "있습니다",
      "어머니",
      "어머님",
      "핏줄",
      "어느",
      "웃음소리",
      "같은",
      "지었",
      "비록",
      "니다",
      "지요"
    ];

    tokens.forEach(function (token) {
      if (!token) return;
      var base = normalizeKoreanNameToken(token);
      if (!base) return;
      if (base.length < 2 || base.length > 4) return;
      if (!/^[가-힣]+$/.test(base)) return;
      if (ignore.indexOf(base) !== -1) return;
      counts[base] = (counts[base] || 0) + 1;
    });

    var names = Object.keys(counts);

    var buinCount = counts["부인"] || 0;
    var ssiCandidates = names.filter(function (name) {
      return name.length === 2 && name.charAt(1) === "씨";
    });
    if (buinCount > 0 && ssiCandidates.length === 1) {
      var ssi = ssiCandidates[0];
      var combinedName = ssi + "부인";
      counts[combinedName] =
        (counts[combinedName] || 0) + (counts[ssi] || 0) + buinCount;
      counts[ssi] = 0;
      counts["부인"] = 0;
    }

    var result = Object.keys(counts)
      .filter(function (name) {
        return counts[name] >= 2;
      })
      .map(function (name) {
        return { name: name, count: counts[name] };
      });

    result.sort(function (a, b) {
      return b.count - a.count;
    });

    if (result.length > 20) {
      result = result.slice(0, 20);
    }

    return result;
  }

  function renderCharacterCards(candidates, container) {
    container.innerHTML = "";
    if (!candidates || !candidates.length) {
      var empty = document.createElement("p");
      empty.className = "helper-text";
      empty.textContent = "반복해서 등장하는 이름을 찾지 못했습니다. 나중에 AI 분석을 붙일 수 있습니다.";
      container.appendChild(empty);
      return;
    }

    candidates.forEach(function (item, index) {
      var card = document.createElement("div");
      card.className = "entity-card";

      var name = document.createElement("div");
      name.className = "entity-name";
      name.textContent = item.name;

      var meta = document.createElement("div");
      meta.className = "entity-meta";
      meta.textContent = "등장 " + item.count + "회";

      var inputRow = document.createElement("div");
      inputRow.className = "entity-input-row";

      var ageLabel = document.createElement("span");
      ageLabel.textContent = "나이:";

      var ageInput = document.createElement("input");
      ageInput.type = "text";
      ageInput.className = "entity-input entity-age-input";
      ageInput.placeholder = "예: 20대 초반";
      ageInput.value = item.age || "";

      var genderLabel = document.createElement("span");
      genderLabel.textContent = "성별:";

      var genderInput = document.createElement("input");
      genderInput.type = "text";
      genderInput.className = "entity-input entity-gender-input";
      genderInput.placeholder = "예: 여 / 남";
      genderInput.value = item.gender || "";

      ageInput.addEventListener("input", function () {
        if (!storedCharacters || !storedCharacters[index]) return;
        storedCharacters[index].age = ageInput.value;
        saveStoredCharacters();
      });

      genderInput.addEventListener("input", function () {
        if (!storedCharacters || !storedCharacters[index]) return;
        storedCharacters[index].gender = genderInput.value;
        saveStoredCharacters();
      });

      var roleRow = document.createElement("div");
      roleRow.className = "entity-input-row";

      var roleLabel = document.createElement("span");
      roleLabel.textContent = "역할:";

      var roleInput = document.createElement("input");
      roleInput.type = "text";
      roleInput.className = "entity-input entity-role-input";
      roleInput.placeholder = "예: 시어머니, 맏며느리, 첩, 딸, 아들";
      roleInput.value = item.role || "";

      roleInput.addEventListener("input", function () {
        if (!storedCharacters || !storedCharacters[index]) return;
        storedCharacters[index].role = roleInput.value;
        saveStoredCharacters();
      });

      var coreRow = document.createElement("div");
      coreRow.className = "entity-input-row";

      var coreLabel = document.createElement("span");
      coreLabel.textContent = "핵심 인물:";

      var coreInput = document.createElement("input");
      coreInput.type = "checkbox";
      coreInput.className = "entity-core-input";
      coreInput.checked = !!item.isCore;

      coreInput.addEventListener("change", function () {
        if (!storedCharacters || !storedCharacters[index]) return;
        storedCharacters[index].isCore = coreInput.checked;
        saveStoredCharacters();
      });

      inputRow.appendChild(ageLabel);
      inputRow.appendChild(ageInput);
      inputRow.appendChild(genderLabel);
      inputRow.appendChild(genderInput);

      roleRow.appendChild(roleLabel);
      roleRow.appendChild(roleInput);

      coreRow.appendChild(coreLabel);
      coreRow.appendChild(coreInput);

      card.appendChild(name);
      card.appendChild(meta);
      card.appendChild(inputRow);
      card.appendChild(roleRow);
      card.appendChild(coreRow);

      container.appendChild(card);
    });
  }

  function extractLocationSegments(text) {
    if (!text) {
      return [];
    }
    var length = text.length;
    var segments = [];
    var positions = [];
    var regex = /([가-힣]{1,12}(마당|마루|방|집|사랑채|안채|사랑방|대문|뜰|정원))/g;
    var match;
    while ((match = regex.exec(text)) !== null) {
      positions.push({
        label: match[1],
        index: match.index
      });
    }

    if (!positions.length) {
      segments.push({
        label: "전체",
        start: 0,
        end: length,
        length: length
      });
      return segments;
    }

    if (positions[0].index > 0) {
      segments.push({
        label: "서론/나레이션",
        start: 0,
        end: positions[0].index,
        length: positions[0].index
      });
    }

    for (var i = 0; i < positions.length; i++) {
      var start = positions[i].index;
      var end = i + 1 < positions.length ? positions[i + 1].index : length;
      segments.push({
        label: positions[i].label,
        start: start,
        end: end,
        length: end - start
      });
    }

    return segments;
  }

  function segmentChapterByParagraphs(text) {
    if (!text) {
      return [];
    }
    var segments = [];
    var regex = /\n\s*\n/g;
    var lastIndex = 0;
    var match;
    var length = text.length;

    while ((match = regex.exec(text)) !== null) {
      var end = match.index;
      if (end > lastIndex) {
        segments.push({
          label: "",
          start: lastIndex,
          end: end
        });
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < length) {
      segments.push({
        label: "",
        start: lastIndex,
        end: length
      });
    }

    return segments;
  }

  function alignSceneSegmentsToParagraphs(text, segments) {
    if (!text || !Array.isArray(segments) || !segments.length) {
      return [];
    }
    var paragraphs = segmentChapterByParagraphs(text);
    if (!paragraphs.length) {
      return [];
    }
    var aligned = [];
    var lastEnd = 0;
    segments.forEach(function (seg) {
      if (!seg) return;
      var rawStart = typeof seg.start === "number" ? seg.start : 0;
      var rawEnd = typeof seg.end === "number" ? seg.end : 0;
      if (rawEnd <= rawStart) return;
      if (rawStart < 0) rawStart = 0;
      if (rawEnd > text.length) rawEnd = text.length;
      var startParaIndex = 0;
      for (var i = 0; i < paragraphs.length; i++) {
        var p = paragraphs[i];
        if (rawStart >= p.start && rawStart < p.end) {
          startParaIndex = i;
          break;
        }
      }
      var endParaIndex = paragraphs.length - 1;
      for (var j = paragraphs.length - 1; j >= 0; j--) {
        var pp = paragraphs[j];
        if (rawEnd > pp.start && rawEnd <= pp.end) {
          endParaIndex = j;
          break;
        }
      }
      if (endParaIndex < startParaIndex) {
        endParaIndex = startParaIndex;
      }
      var start = paragraphs[startParaIndex].start;
      var end = paragraphs[endParaIndex].end;
      if (start < lastEnd) {
        start = lastEnd;
      }
      if (end <= start) {
        return;
      }
      aligned.push({
        label: seg.label || "",
        start: start,
        end: end
      });
      lastEnd = end;
    });
    if (!aligned.length) {
      return paragraphs.map(function (p) {
        return {
          label: "",
          start: p.start,
          end: p.end
        };
      });
    }
    var tailStart = aligned[aligned.length - 1].end;
    if (tailStart < text.length) {
      paragraphs.forEach(function (p) {
        if (p.start >= tailStart && p.start < text.length) {
          aligned.push({
            label: "",
            start: p.start,
            end: p.end
          });
        }
      });
    }
    return aligned;
  }

  function renderSceneRows(sceneList, sceneSummary) {
    sceneList.innerHTML = "";
    if (!storedChapters || !storedChapters.length) {
      if (sceneSummary) {
        sceneSummary.textContent = "저장된 챕터가 아직 없습니다.";
      }
      return;
    }

    var total = 0;
    storedChapters.forEach(function (chapter) {
      total += chapter.length || 0;
    });

    if (sceneSummary) {
      sceneSummary.textContent = "전체 글자 수: " + total + "자 (대본에서 장소 단위로 나눠서 보여줍니다)";
    }

    var globalIndex = 1;
    storedChapters.forEach(function (chapter, chapterIndex) {
      var text = chapter.text || "";
      if (!chapter.sceneSegments || !chapter.sceneSegments.length) {
        chapter.sceneSegments = segmentChapterByParagraphs(text);
      }
      var segments = chapter.sceneSegments;

      if (!segments.length) {
        segments = [
          {
            label: "전체",
            start: 0,
            end: text.length,
            length: text.length
          }
        ];
      }

      if (!chapter.sceneConfig) {
        chapter.sceneConfig = {};
      }

      function updateTotalSceneCount() {
         var total = 0;
         var inputs = sceneList.querySelectorAll(".scene-scenes-input");
         inputs.forEach(function(inp) {
            var v = parseInt(inp.value, 10);
            if (v > 0) total += v;
         });
         
         var summaryEl = document.getElementById("totalSceneCountDisplay");
         if (!summaryEl) {
             summaryEl = document.createElement("div");
             summaryEl.id = "totalSceneCountDisplay";
             summaryEl.className = "helper-text";
             summaryEl.style.fontWeight = "bold";
             summaryEl.style.fontSize = "1.1em";
             summaryEl.style.marginTop = "10px";
             summaryEl.style.color = "#2c3e50";
             // Insert after sceneSummary
             if (sceneSummary && sceneSummary.parentNode) {
                 sceneSummary.parentNode.insertBefore(summaryEl, sceneList);
             }
         }
         summaryEl.textContent = "총 장면 수: " + total + " 씬";
      }

      segments.forEach(function (segment, segmentIndex) {
        var start = typeof segment.start === "number" ? segment.start : 0;
        var end =
          typeof segment.end === "number" && segment.end > start ? segment.end : text.length;
        if (start < 0) start = 0;
        if (end > text.length) end = text.length;
        var length = end - start;
        var sceneText = text.slice(start, end);

        var row = document.createElement("div");
        row.className = "scene-row";

        var label = document.createElement("div");
        label.className = "scene-label";
        var labelText = segment.label || "";

        var labelIndex = document.createElement("span");
        labelIndex.className = "scene-label-index";
        var displayChapterNum = typeof chapter.chapterNumber === 'number' ? chapter.chapterNumber : (chapterIndex + 1);
        labelIndex.textContent =
          "#" + globalIndex + " (챕터 " + displayChapterNum + ")";

        // Show calculated scene count for this segment
        var key = labelText || "";
        var scenesCount = 1;
        if (chapter.sceneConfig) {
             // Try label as key first, then fallback to something else if needed
             if (chapter.sceneConfig[key] && chapter.sceneConfig[key] > 0) {
                 scenesCount = chapter.sceneConfig[key];
             } else if (chapter.sceneConfig[segmentIndex] && chapter.sceneConfig[segmentIndex] > 0) {
                 scenesCount = chapter.sceneConfig[segmentIndex];
             }
        }
        
        var sceneCountInfo = document.createElement("span");
        sceneCountInfo.className = "scene-count-info";
        sceneCountInfo.style.marginLeft = "10px";
        sceneCountInfo.style.fontWeight = "bold";
        sceneCountInfo.style.color = "#4a90e2";
        sceneCountInfo.textContent = "[장면 수: " + scenesCount + "]";
        sceneCountInfo.id = "sceneCountDisplay_" + chapterIndex + "_" + segmentIndex;

        var labelInput = document.createElement("input");
        labelInput.type = "text";
        labelInput.className = "scene-label-input";
        labelInput.placeholder = "장소/장면 제목 (예: 안채 마루, 시어머니와 손녀)";
        labelInput.value = labelText;
        labelInput.addEventListener("input", function () {
          if (!chapter.sceneSegments || !chapter.sceneSegments[segmentIndex]) return;
          chapter.sceneSegments[segmentIndex].label = labelInput.value;
          saveStoredChapters();
        });

        label.appendChild(labelIndex);
        label.appendChild(sceneCountInfo);
        label.appendChild(labelInput);

        var charCountEl = document.createElement("div");
        charCountEl.className = "scene-char-count";
        charCountEl.textContent =
          length + "자 (범위 " + start + " ~ " + end + " / 전체 " + text.length + "자)";

        var input = document.createElement("input");
        input.className = "scene-scenes-input";
        input.type = "number";
        input.min = "1";

        var key = labelText || "scene_" + globalIndex;
        var initialScenes =
          chapter.sceneConfig[key] && chapter.sceneConfig[key] > 0
            ? chapter.sceneConfig[key]
            : 1;
        input.value = String(initialScenes);

        var perSceneEl = document.createElement("div");
        perSceneEl.className = "scene-per-scene";

        function updatePerScene() {
          var scenes = parseInt(input.value, 10);
          if (!scenes || scenes <= 0) {
            perSceneEl.textContent = "-";
            return;
          }
          var per = Math.round(length / scenes);
          perSceneEl.textContent = per + "자/씬";
          
          // Use label as key consistently
          var currentLabel = labelInput.value.trim() || ("장소 " + (segmentIndex + 1));
          
          // Clean up old key if label changed? 
          // Ideally we should sync sceneConfig keys with labels, but for now just saving new one
          chapter.sceneConfig[currentLabel] = scenes;
          
          // Also update display
          if (sceneCountInfo) {
             sceneCountInfo.textContent = "[장면 수: " + scenes + "]";
          }
          
          // Update Total Count
          updateTotalSceneCount();

          saveStoredChapters();
        }

        input.addEventListener("input", updatePerScene);

        var controls = document.createElement("div");
        controls.className = "scene-controls-row";

        var mergeUpButton = document.createElement("button");
        mergeUpButton.type = "button";
        mergeUpButton.className = "scene-merge-button";
        mergeUpButton.textContent = "위와 합치기";
        if (segmentIndex === 0) {
          mergeUpButton.disabled = true;
        } else {
          mergeUpButton.addEventListener("click", function () {
            if (!chapter.sceneSegments) return;
            if (segmentIndex <= 0) return;
            var prev = chapter.sceneSegments[segmentIndex - 1];
            var cur = chapter.sceneSegments[segmentIndex];
            prev.end = cur.end;
            chapter.sceneSegments.splice(segmentIndex, 1);
            saveStoredChapters();
            renderSceneRows(sceneList, sceneSummary);
          });
        }

        var mergeDownButton = document.createElement("button");
        mergeDownButton.type = "button";
        mergeDownButton.className = "scene-merge-button";
        mergeDownButton.textContent = "아래와 합치기";
        if (segmentIndex === segments.length - 1) {
          mergeDownButton.disabled = true;
        } else {
          mergeDownButton.addEventListener("click", function () {
            if (!chapter.sceneSegments) return;
            if (segmentIndex >= chapter.sceneSegments.length - 1) return;
            var cur = chapter.sceneSegments[segmentIndex];
            var next = chapter.sceneSegments[segmentIndex + 1];
            cur.end = next.end;
            chapter.sceneSegments.splice(segmentIndex + 1, 1);
            saveStoredChapters();
            renderSceneRows(sceneList, sceneSummary);
          });
        }

        controls.appendChild(mergeUpButton);
        controls.appendChild(mergeDownButton);

        var textBlock = document.createElement("textarea");
        textBlock.className = "scene-text";
        textBlock.value = sceneText;
        textBlock.style.height = "auto";
        textBlock.style.height = textBlock.scrollHeight + "px";
        textBlock.addEventListener("keydown", function (event) {
          if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            var cursor = textBlock.selectionStart;
            if (typeof cursor !== "number") return;
            if (!chapter.sceneSegments || !chapter.sceneSegments[segmentIndex]) return;
            var seg = chapter.sceneSegments[segmentIndex];
            var splitIndex = seg.start + cursor;
            if (splitIndex <= seg.start || splitIndex >= seg.end) {
              return;
            }
            var newSeg = {
              label: seg.label,
              start: splitIndex,
              end: seg.end
            };
            seg.end = splitIndex;
            chapter.sceneSegments.splice(segmentIndex + 1, 0, newSeg);
            saveStoredChapters();
            renderSceneRows(sceneList, sceneSummary);
          }
        });

        row.appendChild(label);
        row.appendChild(charCountEl);
        row.appendChild(input);
        row.appendChild(perSceneEl);
        row.appendChild(controls);
        row.appendChild(textBlock);

        sceneList.appendChild(row);

        updatePerScene();
        
        globalIndex++;
      });
      
      updateTotalSceneCount();
    });
  }

  function loadStoredApiKeys() {
    if (!geminiApiKeyInput || !openaiApiKeyInput) return;
    var gemini = localStorage.getItem("yadam_gemini_api_key") || "";
    var openai = localStorage.getItem("yadam_openai_api_key") || "";
    geminiApiKeyInput.value = gemini;
    openaiApiKeyInput.value = openai;
    var hasAny = gemini || openai;
    if (apiKeyButton) {
      if (hasAny) apiKeyButton.classList.add("saved");
      else apiKeyButton.classList.remove("saved");
    }
  }

  function openApiKeyModal() {
    if (!apiKeyModalOverlay) return;
    loadStoredApiKeys();
    apiKeyModalOverlay.classList.remove("hidden");
  }

  function closeApiKeyModal() {
    if (!apiKeyModalOverlay) return;
    apiKeyModalOverlay.classList.add("hidden");
  }

  function buildMockPrompt(scriptInput, styleSelect, toneSelect, detailSelect, ratioSelect) {
    var raw = scriptInput.value.trim();
    var style = styleSelect.value;
    var tone = toneSelect.value;
    var detail = detailSelect.value;
    var ratio = ratioSelect.value;
    var model = getSelectedModel();

    var snippet = raw.length > 160 ? raw.slice(0, 160) + "…" : raw;

    var styleText = mapStyleToText(style);
    var toneText = mapToneToText(tone);
    var detailText = mapDetailToLength(detail);

    var base =
      "Based on the following Korean folktale scene, generate a high quality image prompt for a text-to-image model.\n\n" +
      'Source excerpt (Korean): "' +
      snippet +
      '"\n\n' +
      "Image style: " +
      styleText +
      "\n" +
      "Mood: " +
      toneText +
      "\n" +
      "Aspect ratio: " +
      ratio +
      "\n" +
      detailText +
      "\n" +
      "The prompt itself must be written in natural English, without mentioning that it came from a script or that it is a prompt.";

    var tag = model === "gemini" ? "[Gemini 2.5 Flash mock]" : "[GPT-4o mini mock]";
    return tag + "\n\n" + base;
  }

  function initShintongTab() {
    loadStoredCharacters();
    loadStoredCharacterImages();
    loadStoredScenePrompts();

    var folderInput = document.getElementById("characterImageFolderInput");
    var mappingList = document.getElementById("characterImageMappingList");
    var headerOutput = document.getElementById("scenePromptHeader");
    var tabsContainer = document.getElementById("sceneLocationTabs");
    var bodyOutput = document.getElementById("scenePromptByLocation");
    var addCharacterInput = document.getElementById("addCharacterNameInput");
    var addCharacterButton = document.getElementById("addCharacterButton");
    var sceneCharacterControls = document.getElementById("sceneCharacterControls");
    var copyCurrentPromptButton = document.getElementById("copyCurrentPromptButton");
    var rematchCharacterButton = document.getElementById("rematchCharacterButton");
    var cancelScenePromptBuildButton = document.getElementById("cancelScenePromptBuildButton");
    var shintongResetButton = document.getElementById("shintongResetButton");
    var shintongExportButton = document.getElementById("shintongExportButton");
    if (!folderInput || !mappingList) return;

    function normalizeFolder(folder) {
      folder = (folder || "").trim();
      if (!folder) return "";
      if (!folder.startsWith("/")) folder = "/" + folder;
      if (folder.endsWith("/")) folder = folder.slice(0, -1);
      return folder;
    }

    function buildDefaultPath(folder, name) {
      var safeName = String(name || "").trim();
      if (!safeName) return "";
      var noSpace = safeName.replace(/\s+/g, "");
      var baseFolder = normalizeFolder(folder);
      if (!baseFolder) return "/" + noSpace + ".png";
      return baseFolder + "/" + noSpace + ".png";
    }

    function renderMappingList() {
      mappingList.innerHTML = "";

      var characters = storedCharacters || [];
      if (!characters.length) {
        var empty = document.createElement("p");
        empty.className = "helper-text";
        empty.textContent = "대본/설정 탭에서 먼저 등장인물 분석을 실행해 주세요.";
        mappingList.appendChild(empty);
        return;
      }

      if (!storedCharacterImages || typeof storedCharacterImages !== "object") {
        storedCharacterImages = { folder: "", paths: {} };
      }
      if (!storedCharacterImages.paths || typeof storedCharacterImages.paths !== "object") {
        storedCharacterImages.paths = {};
      }

      var folder = normalizeFolder(folderInput.value || storedCharacterImages.folder || "");
      storedCharacterImages.folder = folder;

      characters.forEach(function (item) {
        var name = item && item.name ? String(item.name) : "";
        if (!name) return;

        var card = document.createElement("div");
        card.className = "character-image-card";

        var nameEl = document.createElement("div");
        nameEl.className = "character-image-name";
        nameEl.textContent = name;

        var pathInput = document.createElement("input");
        pathInput.type = "text";
        pathInput.className = "character-image-path-input";

        var currentPath = storedCharacterImages.paths[name];
        if (currentPath && typeof currentPath === "string") {
          pathInput.value = currentPath;
        } else {
          pathInput.value = buildDefaultPath(folder, name);
        }

        pathInput.addEventListener("input", function () {
          storedCharacterImages.paths[name] = pathInput.value.trim();
          saveStoredCharacterImages();
        });

        card.appendChild(nameEl);
        card.appendChild(pathInput);

        mappingList.appendChild(card);
      });

      saveStoredCharacterImages();
    }

    if (!storedCharacterImages || typeof storedCharacterImages !== "object") {
      storedCharacterImages = { folder: "", paths: {} };
    }
    folderInput.value = storedCharacterImages.folder || "";

    folderInput.addEventListener("input", function () {
      storedCharacterImages.folder = normalizeFolder(folderInput.value);
      saveStoredCharacterImages();
      renderMappingList();
    });

    renderMappingList();

    if (headerOutput && storedScenePrompts) {
      headerOutput.textContent = storedScenePrompts.header || "";
    }

    var currentLocation = null;

    function saveBodyForCurrent() {
      if (!bodyOutput || !storedScenePrompts || !currentLocation) return;
      if (!storedScenePrompts.byLocation || typeof storedScenePrompts.byLocation !== "object") {
        storedScenePrompts.byLocation = {};
      }
      storedScenePrompts.byLocation[currentLocation] = bodyOutput.value;
      saveStoredScenePrompts();
      
      // Update scene count on tab after saving
      updateTabCount(currentLocation);
    }
    
    function updateTabCount(locLabel) {
       if (!tabsContainer || !storedScenePrompts || !storedScenePrompts.byLocation) return;
       var content = storedScenePrompts.byLocation[locLabel] || "";
       var matches = content.match(/🎬 장면/g);
       var count = matches ? matches.length : 0;
       
       var buttons = tabsContainer.querySelectorAll(".scene-location-tab");
       buttons.forEach(function(btn) {
           if (btn.getAttribute("data-location") === locLabel) {
               btn.textContent = locLabel + " (" + count + ")";
           }
       });
    }

    function rebuildSceneCharacterControls() {
      if (!sceneCharacterControls) return;
      sceneCharacterControls.innerHTML = "";

      if (!storedScenePrompts || !currentLocation) {
        return;
      }

      var text =
        (storedScenePrompts.byLocation && storedScenePrompts.byLocation[currentLocation]) ||
        (bodyOutput ? bodyOutput.value : "") ||
        "";

      var characters = storedCharacters || [];
      if (!characters.length || !text) {
        return;
      }

      var indexes = [];
      var pos = 0;
      while (true) {
        var found = text.indexOf("🎬 장면", pos);
        if (found === -1) break;
        indexes.push(found);
        pos = found + 1;
      }

      if (!indexes.length) {
        return;
      }

      indexes.forEach(function (startPos, sceneIndex) {
        var sceneStart = startPos;
        var sceneEnd =
          sceneIndex + 1 < indexes.length ? indexes[sceneIndex + 1] : text.length;

        var block = text.slice(sceneStart, sceneEnd);
        var blockLines = block.split("\n");
        var header = blockLines.length ? blockLines[0].trim() : "장면 " + (sceneIndex + 1);

        var scriptIndex = block.indexOf("📝 [대본내용]");
        var koIndex = block.indexOf("🎯 [한국어 프롬프트]");
        var enIndex = block.indexOf("🎯 [영어 프롬프트]");
        var imageIndex = block.indexOf("🖼️ [등장 인물 이미지]");

        var scriptText = "";
        var koText = "";
        var enText = "";
        var imageText = "";

        if (scriptIndex !== -1 && koIndex !== -1) {
          scriptText = block.slice(scriptIndex, koIndex);
        } else if (scriptIndex !== -1) {
          scriptText = block.slice(scriptIndex, imageIndex !== -1 ? imageIndex : undefined);
        }

        if (koIndex !== -1 && enIndex !== -1) {
          koText = block.slice(koIndex, enIndex);
        } else if (koIndex !== -1) {
          koText = block.slice(koIndex, imageIndex !== -1 ? imageIndex : undefined);
        }

        if (enIndex !== -1 && imageIndex !== -1) {
          enText = block.slice(enIndex, imageIndex);
        } else if (enIndex !== -1) {
          enText = block.slice(enIndex);
        }

        if (imageIndex !== -1) {
          imageText = block.slice(imageIndex);
        }

        var currentCharacters = [];
        var matchKo = block.match(/\[인물:\s*([^\]]*)\]/);
        if (matchKo && matchKo[1]) {
          matchKo[1]
            .split(",")
            .map(function (s) {
              return s.trim();
            })
            .forEach(function (name) {
              if (name && currentCharacters.indexOf(name) === -1) {
                currentCharacters.push(name);
              }
            });
        }

        var row = document.createElement("div");
        row.className = "scene-character-row";

        var headerRow = document.createElement("div");
        headerRow.className = "scene-character-header-row";

        var labelEl = document.createElement("div");
        labelEl.className = "scene-character-label";
        labelEl.textContent = header;

        headerRow.appendChild(labelEl);

        var scriptPre = document.createElement("pre");
        scriptPre.className = "scene-block-text-top";
        scriptPre.textContent = scriptText;

        var koPre = document.createElement("pre");
        koPre.className = "scene-block-text-image";
        koPre.textContent = koText;

        var enPre = document.createElement("pre");
        enPre.className = "scene-block-text-image";
        enPre.textContent = enText;

        var tagsEl = document.createElement("div");
        tagsEl.className = "scene-character-tags";
        currentCharacters.forEach(function (name) {
          var chip = document.createElement("div");
          chip.className = "scene-character-chip";

          var nameSpan = document.createElement("span");
          nameSpan.textContent = name;

          var removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.className = "scene-character-chip-remove";
          removeBtn.textContent = "×";
          removeBtn.addEventListener("click", function () {
            removeCharacterFromSceneAtIndex(sceneIndex, name);
            rebuildSceneCharacterControls();
          });

          chip.appendChild(nameSpan);
          chip.appendChild(removeBtn);

          tagsEl.appendChild(chip);
        });

        var actionsEl = document.createElement("div");
        actionsEl.className = "scene-character-actions";

        var selectEl = document.createElement("select");
        selectEl.className = "scene-character-select";

        var placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "인물 선택";
        placeholder.disabled = true;
        placeholder.selected = true;
        selectEl.appendChild(placeholder);

        characters.forEach(function (ch) {
          if (!ch || !ch.name) return;
          var opt = document.createElement("option");
          opt.value = ch.name;
          opt.textContent = ch.name;
          selectEl.appendChild(opt);
        });

        var buttonEl = document.createElement("button");
        buttonEl.type = "button";
        buttonEl.className = "secondary-button small-button";
        buttonEl.textContent = "이 장면에 인물 추가";

        buttonEl.addEventListener("click", function () {
          var name = selectEl.value || "";
          if (!name) {
            alert("추가할 인물을 선택해 주세요.");
            return;
          }
          appendCharacterToSceneAtIndex(sceneIndex, name);
          rebuildSceneCharacterControls();
        });

        actionsEl.appendChild(selectEl);
        actionsEl.appendChild(buttonEl);

        var imagePre = document.createElement("textarea");
        imagePre.className = "scene-block-text-image";
        imagePre.style.width = "100%";
        imagePre.style.height = "auto";
        imagePre.style.minHeight = "60px";
        imagePre.style.resize = "vertical";
        imagePre.value = imageText;

        imagePre.addEventListener("change", function() {
           // Update the source text when user edits this textarea
           // We need to reconstruct the block and update bodyOutput
           // But bodyOutput is the source of truth for the whole location text.
           // This function (rebuildSceneCharacterControls) is called from bodyOutput value.
           // So if we edit this partial view, we must update bodyOutput.
           
           var newImageText = imagePre.value;
           
           // We need to find this block in bodyOutput again because bodyOutput might have changed?
           // Actually bodyOutput.value is the source.
           var fullText = bodyOutput.value || "";
           // We know sceneStart and sceneEnd from the closure, BUT if user edits multiple scenes, indices shift.
           // This is tricky. A safer way is to find the scene by index again.
           
           var indexes = [];
           var pos = 0;
           while (true) {
             var found = fullText.indexOf("🎬 장면", pos);
             if (found === -1) break;
             indexes.push(found);
             pos = found + 1;
           }
           if (sceneIndex >= indexes.length) return;
           
           var currentStart = indexes[sceneIndex];
           var currentEnd = sceneIndex + 1 < indexes.length ? indexes[sceneIndex + 1] : fullText.length;
           var currentBlock = fullText.slice(currentStart, currentEnd);
           
           // Replace the image part in currentBlock
           var imgIdx = currentBlock.indexOf("🖼️ [등장 인물 이미지]");
           if (imgIdx !== -1) {
             var beforeImg = currentBlock.slice(0, imgIdx);
             // The image section goes until end of block usually
             var newBlock = beforeImg + newImageText;
             // Ensure we don't lose anything that might be after image section if any (usually nothing)
             // But based on structure, image section is last.
             
             // Update bodyOutput
             var newFullText = fullText.slice(0, currentStart) + newBlock + fullText.slice(currentEnd);
             bodyOutput.value = newFullText;
             // Also update storedScenePrompts
             if (currentLocation && storedScenePrompts && storedScenePrompts.byLocation) {
                storedScenePrompts.byLocation[currentLocation] = newFullText;
                saveStoredScenePrompts();
             }
           }
        });

        row.appendChild(headerRow);
        if (scriptText) {
          row.appendChild(scriptPre);
        }
        if (koText) {
          row.appendChild(koPre);
        }
        if (enText) {
          row.appendChild(enPre);
        }
        row.appendChild(tagsEl);
        row.appendChild(actionsEl);
        if (imageText) {
          row.appendChild(imagePre);
        }

        sceneCharacterControls.appendChild(row);
      });
    }

    function selectLocation(label) {
      currentLocation = label;
      if (!tabsContainer) return;
      var buttons = tabsContainer.querySelectorAll(".scene-location-tab");
      buttons.forEach(function (btn) {
        if (btn.getAttribute("data-location") === label) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
      if (bodyOutput && storedScenePrompts && storedScenePrompts.byLocation) {
        bodyOutput.value = storedScenePrompts.byLocation[label] || "";
      }
      rebuildSceneCharacterControls();
    }

    function appendCharacterToCurrentPrompts(name) {
      if (!bodyOutput) return;
      name = (name || "").trim();
      if (!name) return;
      var text = bodyOutput.value || "";
      if (!text) return;

      var cursor =
        typeof bodyOutput.selectionStart === "number" ? bodyOutput.selectionStart : text.length;

      var sceneStart = text.lastIndexOf("🎬 장면", cursor);
      if (sceneStart === -1) sceneStart = 0;
      var sceneEnd = text.indexOf("🎬 장면", cursor + 1);
      if (sceneEnd === -1) sceneEnd = text.length;

      var before = text.slice(0, sceneStart);
      var block = text.slice(sceneStart, sceneEnd);
      var after = text.slice(sceneEnd);

      var lines = block.split("\n");

      function ensureImagePath(linesArr, characterName) {
        if (!storedCharacterImages || typeof storedCharacterImages !== "object") {
          storedCharacterImages = { folder: "", paths: {} };
        }
        var folder =
          storedCharacterImages && storedCharacterImages.folder
            ? storedCharacterImages.folder
            : "";
        var pathsMap =
          (storedCharacterImages && storedCharacterImages.paths) && typeof storedCharacterImages.paths === "object"
            ? storedCharacterImages.paths
            : {};
        var path = pathsMap[characterName];
        if (!path) {
          path = buildDefaultPath(folder, characterName);
        }
        if (!path) return;

        var headerIndex = -1;
        for (var i = 0; i < linesArr.length; i++) {
          if (linesArr[i].indexOf("🖼️ [등장 인물 이미지]") === 0) {
            headerIndex = i;
            break;
          }
        }
        if (headerIndex === -1) {
          linesArr.push("🖼️ [등장 인물 이미지]");
          linesArr.push(path);
          return;
        }

        var insertPos = headerIndex + 1;
        var exists = false;
        for (var j = headerIndex + 1; j < linesArr.length; j++) {
          var line = linesArr[j];
          if (!line.trim()) {
            insertPos = j;
            break;
          }
          if (line.trim() === path.trim()) {
            exists = true;
            break;
          }
          insertPos = j + 1;
        }
        if (!exists) {
          linesArr.splice(insertPos, 0, path);
        }
      }

      function updateBlock(headerLine, keyPrefix, labelPrefix) {
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].indexOf(headerLine) === 0) {
            var cameraIndex = -1;
            var peopleIndex = -1;
            var j = i + 1;
            while (j < lines.length) {
              var line = lines[j];
              if (line.indexOf("🎯 [영어 프롬프트]") === 0) {
                break;
              }
              if (cameraIndex === -1 && line.indexOf(labelPrefix) === 0) {
                cameraIndex = j;
              }
              if (line.indexOf(keyPrefix) === 0) {
                peopleIndex = j;
              }
              j++;
            }

            if (peopleIndex !== -1) {
              var raw = lines[peopleIndex];
              var inner = raw.replace(keyPrefix, "").replace("]", "").trim();
              var arr = inner ? inner.split(/\s*,\s*/) : [];
              var exists = false;
              for (var k = 0; k < arr.length; k++) {
                if (arr[k] === name) {
                  exists = true;
                  break;
                }
              }
              if (!exists) {
                arr.push(name);
              }
              lines[peopleIndex] = keyPrefix + " " + arr.join(", ") + "]";
            } else {
              var insertIndex = cameraIndex !== -1 ? cameraIndex + 1 : i + 1;
              lines.splice(insertIndex, 0, keyPrefix + " " + name + "]");
            }
          }
        }
      }

      updateBlock("🎯 [한국어 프롬프트]", "[인물:", "[카메라:");
      updateBlock("🎯 [영어 프롬프트]", "[Characters:", "[Camera:");

      ensureImagePath(lines, name);

      block = lines.join("\n");
      bodyOutput.value = before + block + after;
      saveBodyForCurrent();
    }

    function appendCharacterToSceneAtIndex(sceneIndex, name) {
      if (!bodyOutput) return;
      name = (name || "").trim();
      if (!name) return;
      var text = bodyOutput.value || "";
      if (!text) return;

      var positions = [];
      var pos = 0;
      while (true) {
        var found = text.indexOf("🎬 장면", pos);
        if (found === -1) break;
        positions.push(found);
        pos = found + 1;
      }
      if (!positions.length) return;
      if (sceneIndex < 0 || sceneIndex >= positions.length) return;

      var sceneStart = positions[sceneIndex];
      var sceneEnd = sceneIndex + 1 < positions.length ? positions[sceneIndex + 1] : text.length;

      var before = text.slice(0, sceneStart);
      var block = text.slice(sceneStart, sceneEnd);
      var after = text.slice(sceneEnd);

      var lines = block.split("\n");

      function ensureImagePathForScene(linesArr, characterName) {
        if (!storedCharacterImages || typeof storedCharacterImages !== "object") {
          storedCharacterImages = { folder: "", paths: {} };
        }
        var folder =
          storedCharacterImages && storedCharacterImages.folder
            ? storedCharacterImages.folder
            : "";
        var pathsMap =
          (storedCharacterImages && storedCharacterImages.paths) && typeof storedCharacterImages.paths === "object"
            ? storedCharacterImages.paths
            : {};
        var path = pathsMap[characterName];
        if (!path) {
          path = buildDefaultPath(folder, characterName);
        }
        if (!path) return;

        var headerIndex = -1;
        for (var i = 0; i < linesArr.length; i++) {
          if (linesArr[i].indexOf("🖼️ [등장 인물 이미지]") === 0) {
            headerIndex = i;
            break;
          }
        }
        if (headerIndex === -1) {
          linesArr.push("🖼️ [등장 인물 이미지]");
          linesArr.push(path);
          return;
        }

        var insertPos = headerIndex + 1;
        var exists = false;
        for (var j = headerIndex + 1; j < linesArr.length; j++) {
          var line = linesArr[j];
          if (!line.trim()) {
            insertPos = j;
            break;
          }
          if (line.trim() === path.trim()) {
            exists = true;
            break;
          }
          insertPos = j + 1;
        }
        if (!exists) {
          linesArr.splice(insertPos, 0, path);
        }
      }

      function updateBlock(headerLine, keyPrefix, labelPrefix) {
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].indexOf(headerLine) === 0) {
            var cameraIndex = -1;
            var peopleIndex = -1;
            var j = i + 1;
            while (j < lines.length) {
              var line = lines[j];
              if (line.indexOf("🎯 [영어 프롬프트]") === 0) {
                break;
              }
              if (cameraIndex === -1 && line.indexOf(labelPrefix) === 0) {
                cameraIndex = j;
              }
              if (line.indexOf(keyPrefix) === 0) {
                peopleIndex = j;
              }
              j++;
            }

            if (peopleIndex !== -1) {
              var raw = lines[peopleIndex];
              var inner = raw.replace(keyPrefix, "").replace("]", "").trim();
              var arr = inner ? inner.split(/\s*,\s*/) : [];
              var exists = false;
              for (var k = 0; k < arr.length; k++) {
                if (arr[k] === name) {
                  exists = true;
                  break;
                }
              }
              if (!exists) {
                arr.push(name);
              }
              lines[peopleIndex] = keyPrefix + " " + arr.join(", ") + "]";
            } else {
              var insertIndex = cameraIndex !== -1 ? cameraIndex + 1 : i + 1;
              lines.splice(insertIndex, 0, keyPrefix + " " + name + "]");
            }
          }
        }
      }

      updateBlock("🎯 [한국어 프롬프트]", "[인물:", "[카메라:");
      updateBlock("🎯 [영어 프롬프트]", "[Characters:", "[Camera:");

      ensureImagePathForScene(lines, name);

      block = lines.join("\n");
      bodyOutput.value = before + block + after;
      saveBodyForCurrent();
    }

    function removeCharacterFromSceneAtIndex(sceneIndex, name) {
      if (!bodyOutput) return;
      name = (name || "").trim();
      if (!name) return;
      var text = bodyOutput.value || "";
      if (!text) return;

      var positions = [];
      var pos = 0;
      while (true) {
        var found = text.indexOf("🎬 장면", pos);
        if (found === -1) break;
        positions.push(found);
        pos = found + 1;
      }
      if (!positions.length) return;
      if (sceneIndex < 0 || sceneIndex >= positions.length) return;

      var sceneStart = positions[sceneIndex];
      var sceneEnd = sceneIndex + 1 < positions.length ? positions[sceneIndex + 1] : text.length;

      var before = text.slice(0, sceneStart);
      var block = text.slice(sceneStart, sceneEnd);
      var after = text.slice(sceneEnd);

      var lines = block.split("\n");

      function removeFromPrompt(headerLine, keyPrefix) {
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].indexOf(headerLine) === 0) {
            var j = i + 1;
            while (j < lines.length) {
              var line = lines[j];
              if (line.indexOf("🎯 [영어 프롬프트]") === 0 || line.indexOf("🎬 장면") === 0) {
                break;
              }
              if (line.indexOf(keyPrefix) === 0) {
                var inner = line.replace(keyPrefix, "").replace("]", "").trim();
                var arr = inner ? inner.split(/\s*,\s*/) : [];
                var filtered = arr.filter(function (x) {
                  return x !== name;
                });
                if (filtered.length) {
                  lines[j] = keyPrefix + " " + filtered.join(", ") + "]";
                } else {
                  lines[j] = keyPrefix + " ]";
                }
              }
              j++;
            }
          }
        }
      }

      function removeImagePath() {
        if (!storedCharacterImages || typeof storedCharacterImages !== "object") {
          storedCharacterImages = { folder: "", paths: {} };
        }
        var folder =
          storedCharacterImages && storedCharacterImages.folder
            ? storedCharacterImages.folder
            : "";
        var pathsMap =
          (storedCharacterImages && storedCharacterImages.paths) &&
          typeof storedCharacterImages.paths === "object"
            ? storedCharacterImages.paths
            : {};
        var path = pathsMap[name];
        if (!path) {
          path = buildDefaultPath(folder, name);
        }
        if (!path) return;

        var headerIndex = -1;
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].indexOf("🖼️ [등장 인물 이미지]") === 0) {
            headerIndex = i;
            break;
          }
        }
        if (headerIndex === -1) return;

        for (var j = headerIndex + 1; j < lines.length; j++) {
          var line = lines[j];
          if (!line.trim()) break;
          if (line.trim() === path.trim()) {
            lines.splice(j, 1);
            break;
          }
        }
      }

      removeFromPrompt("🎯 [한국어 프롬프트]", "[인물:");
      removeFromPrompt("🎯 [영어 프롬프트]", "[Characters:");
      removeImagePath();

      block = lines.join("\n");
      bodyOutput.value = before + block + after;
      saveBodyForCurrent();
    }

    if (tabsContainer && storedScenePrompts && Array.isArray(storedScenePrompts.locations)) {
      tabsContainer.innerHTML = "";
      storedScenePrompts.locations.forEach(function (label, index) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "scene-location-tab";
        btn.setAttribute("data-location", label);
        btn.textContent = label;
        btn.addEventListener("click", function () {
          saveBodyForCurrent();
          selectLocation(label);
        });
        tabsContainer.appendChild(btn);
        if (index === 0) {
          currentLocation = label;
        }
      });
    }

    if (bodyOutput) {
      bodyOutput.addEventListener("input", function () {
        saveBodyForCurrent();
      });
    }

    if (storedScenePrompts.locations && storedScenePrompts.locations.length && bodyOutput) {
      selectLocation(storedScenePrompts.locations[0]);
    } else if (bodyOutput) {
      bodyOutput.value =
        "먼저 대본/설정 탭에서 장소·씬 분할과 장면 프롬프트 생성을 실행해 주세요.";
    }

    function addCharacterByName(name) {
      name = (name || "").trim();
      if (!name) {
        alert("추가할 인물 이름을 입력해 주세요.");
        return;
      }
      loadStoredCharacters();
      var exists =
        storedCharacters &&
        storedCharacters.some(function (c) {
          return c && c.name === name;
        });
      if (!exists) {
        storedCharacters = storedCharacters || [];
        storedCharacters.push({
          name: name,
          count: 0,
          age: "",
          gender: "",
          role: "",
          isCore: false
        });
        saveStoredCharacters();
      }
      if (!storedCharacterImages || typeof storedCharacterImages !== "object") {
        storedCharacterImages = { folder: "", paths: {} };
      }
      if (!storedCharacterImages.paths || typeof storedCharacterImages.paths !== "object") {
        storedCharacterImages.paths = {};
      }
      var folder = folderInput.value || storedCharacterImages.folder || "";
      storedCharacterImages.folder = normalizeFolder(folder);
      storedCharacterImages.paths[name] = buildDefaultPath(storedCharacterImages.folder, name);
      saveStoredCharacterImages();
      renderMappingList();

      // 향후 장면 프롬프트 재생성 시 이 인물이 포함되도록 storedCharacters 기준으로 사용
    }

    if (addCharacterButton && addCharacterInput) {
      addCharacterButton.addEventListener("click", function () {
        var name = addCharacterInput.value || "";
        addCharacterByName(name);
        if (!name) {
        addCharacterInput.value = "";
        }
        rebuildSceneCharacterControls();
      });
    }

    if (cancelScenePromptBuildButton) {
      cancelScenePromptBuildButton.addEventListener("click", function () {
        if (!storedScenePromptBuildState.running) {
          alert("현재 생성 중인 장면 프롬프트가 없습니다.");
          return;
        }
        openConfirmModal("현재 진행 중인 장면 프롬프트 생성을 중지하시겠습니까?").then(function (ok) {
          if (!ok) return;
          scenePromptCancelRequested = true;
        });
      });
    }

    if (rematchCharacterButton) {
      rematchCharacterButton.addEventListener("click", function () {
        if (!storedCharacters || !storedCharacters.length) {
          alert("재매칭할 인물이 없습니다.");
          return;
        }
        openConfirmModal("현재 폴더 기준으로 모든 인물 경로를 다시 맞추시겠습니까?").then(function (ok) {
          if (!ok) return;
          if (!storedCharacterImages || typeof storedCharacterImages !== "object") {
            storedCharacterImages = { folder: "", paths: {} };
          }
          if (!storedCharacterImages.paths || typeof storedCharacterImages.paths !== "object") {
            storedCharacterImages.paths = {};
          }
          var folder = folderInput.value || storedCharacterImages.folder || "";
          storedCharacterImages.folder = normalizeFolder(folder);
          storedCharacters.forEach(function (item) {
            if (!item || !item.name) return;
            storedCharacterImages.paths[item.name] = buildDefaultPath(
              storedCharacterImages.folder,
              item.name
            );
          });
          saveStoredCharacterImages();
          renderMappingList();
          rebuildSceneCharacterControls();
        });
      });
    }

    if (shintongResetButton) {
      shintongResetButton.addEventListener("click", function () {
        if (
          !storedScenePrompts ||
          (!storedScenePrompts.header &&
            (!storedScenePrompts.locations || !storedScenePrompts.locations.length))
        ) {
          alert("초기화할 장면 프롬프트가 없습니다.");
          return;
        }
        openConfirmModal("신통이의 장면 프롬프트 데이터를 모두 초기화하시겠습니까?").then(
          function (ok) {
            if (!ok) return;
            storedScenePrompts = { header: "", locations: [], byLocation: {} };
            saveStoredScenePrompts();
            storedScenePromptBuildState.running = false;
            storedScenePromptBuildState.total = 0;
            storedScenePromptBuildState.done = 0;
            if (headerOutput) {
              headerOutput.textContent = "";
            }
            if (tabsContainer) {
              tabsContainer.innerHTML = "";
            }
            if (bodyOutput) {
              bodyOutput.value =
                "먼저 대본/설정 탭에서 장소·씬 분할과 장면 프롬프트 생성을 실행해 주세요.";
            }
            if (sceneCharacterControls) {
              sceneCharacterControls.innerHTML = "";
            }
          }
        );
      });
    }

    if (shintongExportButton) {
      shintongExportButton.addEventListener("click", function () {
        if (
          !storedScenePrompts ||
          !storedScenePrompts.locations ||
          !storedScenePrompts.locations.length
        ) {
          alert("먼저 장면 프롬프트를 생성해 주세요.");
          return;
        }
        var files = [];
        var headerText = storedScenePrompts.header || "";
        storedScenePrompts.locations.forEach(function (label, index) {
          var body = (storedScenePrompts.byLocation && storedScenePrompts.byLocation[label]) || "";
          var content = headerText ? headerText + "\n" + body : body;
          var baseName = sanitizeFileName(label || "scene_" + (index + 1));
          var fileName = baseName + ".txt";
          var suffix = 2;
          while (
            files.some(function (f) {
              return f.name === fileName;
            })
          ) {
            fileName = baseName + "_" + suffix + ".txt";
            suffix++;
          }
          files.push({
            name: fileName,
            content: content
          });
        });
        var zipBlob = createZipFromTextFiles(files);
        var url = URL.createObjectURL(zipBlob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "shintong_prompts.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 0);
      });
    }

    if (copyCurrentPromptButton) {
      copyCurrentPromptButton.addEventListener("click", function () {
        if (
          !storedScenePrompts ||
          !storedScenePrompts.locations ||
          !storedScenePrompts.locations.length
        ) {
          alert("먼저 장면 프롬프트를 생성해 주세요.");
          return;
        }
        if (!currentLocation) {
          alert("먼저 복사할 장소 탭을 선택해 주세요.");
          return;
        }
        var headerText = storedScenePrompts.header || "";
        var bodyText =
          (storedScenePrompts.byLocation && storedScenePrompts.byLocation[currentLocation]) || "";
        var content = headerText ? headerText + "\n" + bodyText : bodyText;
        if (!content.trim()) {
          alert("현재 선택된 장소에 복사할 프롬프트가 없습니다.");
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(content)
            .then(function () {
              alert("선택한 장소의 프롬프트를 클립보드에 복사했습니다.");
            })
            .catch(function () {
              alert("클립보드 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
            });
        } else {
          var temp = document.createElement("textarea");
          temp.value = content;
          temp.style.position = "fixed";
          temp.style.left = "-9999px";
          document.body.appendChild(temp);
          temp.select();
          try {
            var ok = document.execCommand("copy");
            document.body.removeChild(temp);
            if (ok) {
              alert("선택한 장소의 프롬프트를 클립보드에 복사했습니다.");
            } else {
              alert("클립보드 복사에 실패했습니다. 수동으로 복사해 주세요.");
            }
          } catch (e) {
            document.body.removeChild(temp);
            alert("클립보드 복사에 실패했습니다. 수동으로 복사해 주세요.");
          }
        }
      });
    }
  }

  function initScriptSettingsTab() {
    var scriptInput = document.getElementById("scriptInput");
    var ratioSelect = document.getElementById("ratioSelect");
    var chapterNumberInput = document.getElementById("chapterNumberInput");
    var generateButton = document.getElementById("generateButton");
    var chapterList = document.getElementById("chapterList");
    var chapterCharCount = document.getElementById("chapterCharCount");
    var runCharacterAnalysisButton = document.getElementById("runCharacterAnalysisButton");
    var runSceneAnalysisButton = document.getElementById("runSceneAnalysisButton");
    var characterResultContainer = document.getElementById("characterAnalysisResult");
    var sceneSummary = document.getElementById("sceneSummary");
    var sceneList = document.getElementById("sceneList");
    var buildCharacterPromptButton = document.getElementById("buildCharacterPromptButton");
    var clearCharactersButton = document.getElementById("clearCharactersButton");
    var resetSceneButton = document.getElementById("resetSceneButton");
    var buildScenePromptButton = document.getElementById("buildScenePromptButton");

    function updateCharCount() {
      var len = scriptInput.value.length;
      if (chapterCharCount) {
        chapterCharCount.textContent = len + "자";
        if (len > 6000) chapterCharCount.classList.add("over-limit");
        else chapterCharCount.classList.remove("over-limit");
      }
    }

    function renderChapterList() {
      if (!chapterList) return;
      chapterList.innerHTML = "";
      var nextNum = 1;
      if (storedChapters.length > 0) {
        // Find max chapter number
        var max = 0;
        storedChapters.forEach(function(c) {
          if (typeof c.chapterNumber === 'number' && c.chapterNumber > max) {
            max = c.chapterNumber;
          }
        });
        nextNum = max + 1;
      }
      if (chapterNumberInput) {
        chapterNumberInput.value = nextNum;
      }

      storedChapters.forEach(function (chapter, index) {
        var card = document.createElement("div");
        card.className = "chapter-card";

        var header = document.createElement("div");
        header.className = "chapter-card-header";

        var title = document.createElement("div");
        title.className = "chapter-card-title";
        var displayNum = typeof chapter.chapterNumber === 'number' ? chapter.chapterNumber : (index + 1);
        title.textContent = displayNum + "챕터";

        var meta = document.createElement("div");
        meta.className = "chapter-card-meta";
        meta.textContent = chapter.length + "자";

        var deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "chapter-delete-button";
        deleteButton.textContent = "삭제";
        deleteButton.addEventListener("click", function () {
          openConfirmModal("이 챕터를 삭제하시겠습니까?").then(function (ok) {
            if (!ok) return;
            storedChapters.splice(index, 1);
            saveStoredChapters();
            renderChapterList();
          });
        });

        header.appendChild(title);
        header.appendChild(meta);
        header.appendChild(deleteButton);

        var preview = document.createElement("div");
        preview.className = "chapter-card-preview";
        preview.textContent = chapter.preview;

        card.appendChild(header);
        card.appendChild(preview);

        chapterList.appendChild(card);
      });
    }

    generateButton.addEventListener("click", function () {
      var raw = scriptInput.value.trim();
      if (!raw) {
        alert("먼저 야담 대본을 입력해 주세요.");
        scriptInput.focus();
        return;
      }
      var previewText = raw.length > 60 ? raw.slice(0, 60) + "…" : raw;
      
      var manualChapterNum = parseInt(chapterNumberInput ? chapterNumberInput.value : "0", 10);
      if (!manualChapterNum || manualChapterNum < 1) {
        // Fallback if input is invalid
        manualChapterNum = storedChapters.length + 1;
      }

      storedChapters.push({
        text: raw,
        preview: previewText,
        length: raw.length,
        style: FIXED_IMAGE_STYLE,
        ratio: ratioSelect ? ratioSelect.value : "16:9",
        chapterNumber: manualChapterNum
      });
      scriptInput.value = "";
      updateCharCount();
      saveStoredChapters();
      renderChapterList();
    });

    scriptInput.addEventListener("input", updateCharCount);
    loadStoredChapters();
    loadStoredCharacters();
    updateCharCount();
    renderChapterList();
    if (characterResultContainer && storedCharacters && storedCharacters.length) {
      renderCharacterCards(storedCharacters, characterResultContainer);
    }

    if (sceneList && sceneSummary && storedChapters && storedChapters.length) {
      var hasSceneData = storedChapters.some(function (chapter) {
        if (!chapter) return false;
        if (chapter.sceneSegments && chapter.sceneSegments.length) return true;
        if (chapter.sceneConfig && Object.keys(chapter.sceneConfig).length) return true;
        return false;
      });
      if (hasSceneData) {
        renderSceneRows(sceneList, sceneSummary);
      }
    }

    if (runCharacterAnalysisButton && characterResultContainer) {
      runCharacterAnalysisButton.addEventListener("click", function () {
        if (!storedChapters.length) {
          alert("먼저 대본을 입력하고 스토리에 추가해 주세요.");
          return;
        }
        var text = getAllScriptText();
        characterResultContainer.innerHTML = "";
        var loading = document.createElement("p");
        loading.className = "helper-text";
        loading.textContent = "OpenAI로 등장인물 분석 중...";
        characterResultContainer.appendChild(loading);

        var openaiKey = localStorage.getItem("yadam_openai_api_key") || "";
        var geminiKey = localStorage.getItem("yadam_gemini_api_key") || "";

        function setCharactersFromList(list) {
          if (!Array.isArray(list) || !list.length) {
            storedCharacters = [];
            saveStoredCharacters();
            renderCharacterCards(storedCharacters, characterResultContainer);
            return;
          }
          storedCharacters = list.map(function (item) {
            return {
              name: item.name,
              count: typeof item.count === "number" ? item.count : 0,
              age: "",
              gender: "",
              role: item.role || "",
              isCore: !!item.isCore
            };
          });
          saveStoredCharacters();
          renderCharacterCards(storedCharacters, characterResultContainer);
        }

        function fallbackHeuristic(reason) {
          if (reason) {
            alert("AI 분석에 실패했습니다 (" + reason + ").\n대신 단순 단어 빈도 분석 결과를 보여줍니다.\nAPI 키가 올바른지 확인해 주세요.");
          }
          var candidates = extractCharacterCandidates(text);
          setCharactersFromList(candidates);
        }

        function runWithGemini() {
          if (!geminiKey) {
            fallbackHeuristic("Gemini API 키가 설정되지 않음");
            return;
          }
          loading.textContent = "Gemini로 등장인물 분석 중...";
          analyzeCharactersWithGemini(text, geminiKey)
            .then(function (characters) {
              if (characters && characters.length) {
                setCharactersFromList(characters);
              } else {
                fallbackHeuristic("AI 응답 형식 오류");
              }
            })
            .catch(function (e) {
              fallbackHeuristic("API 호출 오류: " + e.message);
            });
        }

        if (openaiKey) {
          analyzeCharactersWithOpenAI(text, openaiKey)
            .then(function (characters) {
              if (characters && characters.length) {
                setCharactersFromList(characters);
              } else if (geminiKey) {
                runWithGemini();
              } else {
                fallbackHeuristic("OpenAI 응답 오류 및 Gemini 키 없음");
              }
            })
            .catch(function () {
              if (geminiKey) runWithGemini();
              else fallbackHeuristic("OpenAI API 오류 및 Gemini 키 없음");
            });
        } else if (geminiKey) {
          runWithGemini();
        } else {
          fallbackHeuristic("API 키가 설정되지 않음");
        }
      });
    }

    if (runSceneAnalysisButton && sceneList && sceneSummary) {
      runSceneAnalysisButton.addEventListener("click", function () {
        if (!storedChapters.length) {
          alert("먼저 대본을 입력하고 스토리에 추가해 주세요.");
          return;
        }

        var lastIndex = storedChapters.length - 1;
        var targetChapter = storedChapters[lastIndex];
        if (!targetChapter || !targetChapter.text) {
          alert("마지막 챕터에 분석할 대본이 없습니다.");
          return;
        }

        var hasExistingSceneConfig =
          (targetChapter.sceneSegments && targetChapter.sceneSegments.length) ||
          (targetChapter.sceneConfig && Object.keys(targetChapter.sceneConfig).length);

        function proceed() {
          sceneList.innerHTML = "";
          sceneSummary.textContent = "장소·씬 분석 중...";

          var openaiKey = localStorage.getItem("yadam_openai_api_key") || "";
          var geminiKey = localStorage.getItem("yadam_gemini_api_key") || "";

          function finishAndRender() {
            saveStoredChapters();
            renderSceneRows(sceneList, sceneSummary);
          }

          function fallbackParagraphs() {
            var text = targetChapter.text || "";
            targetChapter.sceneSegments = segmentChapterByParagraphs(text);
            finishAndRender();
          }

          function analyzeLastChapterWithOpenAI() {
            var text = targetChapter.text || "";
            analyzeScenesWithOpenAI(text, openaiKey)
              .then(function (segments) {
                var aligned = alignSceneSegmentsToParagraphs(text, segments || []);
                if (!aligned.length) {
                  aligned = segmentChapterByParagraphs(text);
                }
                targetChapter.sceneSegments = aligned;
                finishAndRender();
              })
              .catch(function () {
                var aligned = segmentChapterByParagraphs(text);
                targetChapter.sceneSegments = aligned;
                finishAndRender();
              });
          }

          function analyzeLastChapterWithGemini() {
            var text = targetChapter.text || "";
            analyzeScenesWithGemini(text, geminiKey)
              .then(function (segments) {
                var aligned = alignSceneSegmentsToParagraphs(text, segments || []);
                if (!aligned.length) {
                  aligned = segmentChapterByParagraphs(text);
                }
                targetChapter.sceneSegments = aligned;
                finishAndRender();
              })
              .catch(function () {
                var aligned = segmentChapterByParagraphs(text);
                targetChapter.sceneSegments = aligned;
                finishAndRender();
              });
          }

          if (openaiKey) {
            analyzeLastChapterWithOpenAI();
          } else if (geminiKey) {
            analyzeLastChapterWithGemini();
          } else {
            fallbackParagraphs();
          }
        }

        if (hasExistingSceneConfig) {
          openConfirmModal(
            "마지막 챕터에 이미 장소·씬 설정이 있습니다. 다시 분석해서 이 챕터의 설정을 덮어쓰시겠습니까?\n" +
              "취소를 누르면 기존 설정을 그대로 사용합니다."
          ).then(function (ok) {
            if (!ok) {
              renderSceneRows(sceneList, sceneSummary);
              return;
            }
            proceed();
          });
          return;
        }

        proceed();
      });
    }

    if (clearCharactersButton && characterResultContainer) {
      clearCharactersButton.addEventListener("click", function () {
        if (!storedCharacters || !storedCharacters.length) {
          alert("초기화할 등장인물이 없습니다.");
          return;
        }
        openConfirmModal("등장인물 정보를 모두 초기화하시겠습니까?").then(function (ok) {
          if (!ok) return;
          storedCharacters = [];
          saveStoredCharacters();
          characterResultContainer.innerHTML = "";
        });
      });
    }

    if (resetSceneButton && sceneList && sceneSummary) {
      resetSceneButton.addEventListener("click", function () {
        if (!storedChapters || !storedChapters.length) {
          alert("초기화할 장소·씬 정보가 없습니다.");
          return;
        }
        openConfirmModal("모든 장소·씬 설정을 초기화하시겠습니까?").then(function (ok) {
          if (!ok) return;
          storedChapters.forEach(function (chapter) {
            if (chapter) {
              if (chapter.scenes) {
                delete chapter.scenes;
              }
              if (chapter.sceneSegments) {
                delete chapter.sceneSegments;
              }
              if (chapter.sceneConfig) {
                delete chapter.sceneConfig;
              }
            }
          });
          saveStoredChapters();
          renderSceneRows(sceneList, sceneSummary);
        });
      });
    }

    if (buildCharacterPromptButton && characterResultContainer) {
      buildCharacterPromptButton.addEventListener("click", function () {
        var cards = characterResultContainer.querySelectorAll(".entity-card");
        if (!cards.length) {
          alert("먼저 등장인물 분석을 실행해 주세요.");
          return;
        }

        var lines = [];
        cards.forEach(function (card, index) {
          var nameEl = card.querySelector(".entity-name");
          var metaEl = card.querySelector(".entity-meta");
          var ageInput = card.querySelector(".entity-age-input");
          var genderInput = card.querySelector(".entity-gender-input");

          var name = nameEl ? nameEl.textContent.trim() : "";
          if (!name) {
            return;
          }

          var metaText = metaEl ? metaEl.textContent.trim() : "";
          var age = ageInput ? ageInput.value.trim() : "";
          var gender = genderInput ? genderInput.value.trim() : "";

          var line = (index + 1) + ". " + name;
          if (age) line += " / 나이: " + age;
          if (gender) line += " / 성별: " + gender;
          if (metaText) line += " / " + metaText;

          lines.push(line);
        });

        if (!lines.length) {
          alert("저장할 등장인물 정보가 없습니다.");
          return;
        }

        var content = "등장인물 목록\n\n" + lines.join("\n") + "\n";
        var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);

        var a = document.createElement("a");
        a.href = url;
        a.download = "characters.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 0);
      });
    }

    if (buildScenePromptButton) {
      buildScenePromptButton.addEventListener("click", function () {
        if (!storedChapters || !storedChapters.length) {
          alert("먼저 대본을 입력하고 장소·씬 분할 분석을 완료해 주세요.");
          return;
        }

        var hasSegments = storedChapters.some(function (c) {
          return c && Array.isArray(c.sceneSegments) && c.sceneSegments.length;
        });
        if (!hasSegments) {
          alert("먼저 장소·씬 분할 분석을 실행해 주세요.");
          return;
        }

        loadStoredCharacters();
        loadStoredCharacterImages();

        if (!storedScenePrompts) {
          storedScenePrompts = {
            header: "",
            locations: [],
            byLocation: {}
          };
        }

        var headerLines = [];

        headerLines.push("🎨 [전체 적용 스타일: 카드 한국 조선시대 웹 반실사]");
        headerLines.push("설명: 화려하고 아름다운 고퀄리티 디지털 일러스트");
        headerLines.push(
          "프롬프트: soft semi-realistic Korean webtoon painting, waist-up shot (waist shot), " +
            "clean bold lineart, natural earthy palette, smooth gradient shading. " +
            "Character lineart 1.5–2x thicker than background, subtle depth-of-field, " +
            "no harsh cel shading, no sticker-like outlines."
        );
        headerLines.push("✅ 인물의 옷과 인물을 분명하게 확인해서 그립니다.");
        headerLines.push("✅ 각 인물은 레퍼런스 이미지의 얼굴·머리색·헤어스타일·의상을 모든 장면에서 동일하게 유지합니다. 임의로 머리색이나 옷을 바꾸지 않습니다.");
        headerLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        headerLines.push("");

        var cameraKorean = "[카메라: 웨이스트샷 (허리부터 위)]";
        var cameraEnglish = "[Camera: waist-up shot (waist shot)]";

        var legacyKoInstruction =
          "[상황/행동/배경/조명/분위기: 위 대본내용 전체를 먼저 읽고, 인물의 외형(얼굴, 체형 등) 묘사는 하지 말고, 인물들의 행동·동선·제스처·시선과 서로 간의 상호작용, 카메라 구도와 거리감, 실내/실외 배경(공간 구조와 소품), 조명(시간대, 빛의 방향과 색감), 전체 분위기(따뜻함/긴장/불안/고요함 등)를 배우와 연출팀이 그대로 촬영할 수 있을 정도로 구체적인 한국어 문장으로 묘사해 주세요. 등장인물 이미지는 외형 레퍼런스이므로, 각 인물의 얼굴, 체형, 머리색, 헤어스타일, 의상은 레퍼런스와 완전히 동일하게 유지하고, 장면이 바뀌어도 임의로 변경하지 마세요. 줄거리 요약이 아니라 장면 연출 지시처럼 써 주세요.]";

        var legacyEnInstruction =
          "[Scene / Action / Background / Lighting / Mood: Carefully read the Korean script above. Do NOT describe characters' faces or detailed physical appearance; assume character reference images already exist. Instead, describe in English the characters' actions, movement, gestures, gaze and interactions, the camera framing and distance, the interior/exterior background (space layout and props), the lighting (time of day, direction and color of light), and the overall mood (warm, tense, anxious, serene, etc.) in rich detail so that a director and illustrator can stage the scene. Always keep each character's design exactly the same as in the reference images: same face structure, body type, hair color, hairstyle and clothing across all shots, and never change or redesign them. Do not summarize the plot; write it like a shot description.]";

        var imageFolder = storedCharacterImages && storedCharacterImages.folder
          ? storedCharacterImages.folder
          : "";
        var imagePaths = (storedCharacterImages && storedCharacterImages.paths) || {};

        var locationOrder = [];
        var locationLinesMap = {};

        // Load existing locations from storedScenePrompts to preserve them
        if (storedScenePrompts.locations) {
          storedScenePrompts.locations.forEach(function (loc) {
            locationOrder.push(loc);
            var body = storedScenePrompts.byLocation[loc] || "";
            locationLinesMap[loc] = body.split("\n");
          });
        }

        function ensureLocation(label) {
          if (!locationLinesMap[label]) {
            locationLinesMap[label] = [];
            locationOrder.push(label);
          }
          return locationLinesMap[label];
        }

        var globalSceneNumber = 1;

        // Calculate max scene number from existing prompts to continue numbering
        if (storedScenePrompts.byLocation) {
          var maxNum = 0;
          Object.keys(storedScenePrompts.byLocation).forEach(function(key) {
             var text = storedScenePrompts.byLocation[key] || "";
             var matches = text.match(/🎬 장면 (\d+)/g);
             if (matches) {
               matches.forEach(function(m) {
                 var n = parseInt(m.replace("🎬 장면 ", ""), 10);
                 if (!isNaN(n) && n > maxNum) maxNum = n;
               });
             }
          });
          if (maxNum > 0) globalSceneNumber = maxNum + 1;
        }

        var openaiKeyForScenePrompt =
          localStorage.getItem("yadam_openai_api_key") || "";

        var parts = [];

        scenePromptCancelRequested = false;

        function syncScenePromptStoreFromMaps() {
          storedScenePrompts.header = headerLines.join("\n");
          storedScenePrompts.locations = locationOrder.slice();
          storedScenePrompts.byLocation = {};
          locationOrder.forEach(function (label) {
            storedScenePrompts.byLocation[label] = (locationLinesMap[label] || []).join("\n");
          });
          saveStoredScenePrompts();
        }

        function findNearestSentenceBoundary(text, target) {
          var len = text.length;
          if (!len) return 0;
          var boundaryChars = ".?!…\n";
          function isBoundary(i) {
            var ch = text.charAt(i);
            return boundaryChars.indexOf(ch) !== -1;
          }
          var bestIndex = -1;
          var bestDist = Infinity;
          var maxStep = 200;
          var step = 0;
          var left = target;
          var right = target + 1;
          while ((left >= 0 || right < len) && step < maxStep) {
            if (left >= 0 && isBoundary(left)) {
              var dl = Math.abs(target - left);
              if (dl < bestDist) {
                bestDist = dl;
                bestIndex = left + 1;
              }
            }
            if (right < len && isBoundary(right)) {
              var dr = Math.abs(right - target);
              if (dr < bestDist) {
                bestDist = dr;
                bestIndex = right + 1;
              }
            }
            left--;
            right++;
            step++;
          }
          if (bestIndex === -1) {
            bestIndex = target;
          }
          if (bestIndex < 0) bestIndex = 0;
          if (bestIndex > len) bestIndex = len;
          return bestIndex;
        }

        function addPartToLocations(part, desc) {
          var label = part.locationLabel || "";
          var lines = ensureLocation(label);

          lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          lines.push("🎬 장면 " + part.sceneNumber + " (챕터 " + (typeof part.chapterNum === 'number' ? part.chapterNum : part.chapterIndex + 1) + ")");
          lines.push("🎭 [장면 유형: 일반]");
          lines.push("📍 [장소: " + label + "]");
          lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          lines.push("");

          lines.push("📝 [대본내용]");
          lines.push(part.partText);
          lines.push("");

          lines.push("🎯 [한국어 프롬프트]");
          lines.push(
            cameraKorean +
              " [장소: " +
              label +
              " - 이 장면에서는 동일한 장소 배경을 일관되게 유지합니다.]"
          );

          if (part.partCharacters && part.partCharacters.length) {
            lines.push("[인물: " + part.partCharacters.join(", ") + "]");
          } else {
            lines.push("[인물: ]");
          }

          if (desc && desc.ko) {
            lines.push("[상황/행동/배경/조명/분위기]");
            lines.push(desc.ko);
          } else {
            lines.push(legacyKoInstruction);
          }

          lines.push("");

          lines.push("🎯 [영어 프롬프트]");
          lines.push(
            cameraEnglish +
              " [Location: " +
              label +
              " – keep the background consistent across all shots for this location.]"
          );

          if (part.partCharacters && part.partCharacters.length) {
            lines.push("[Characters: " + part.partCharacters.join(", ") + "]");
          } else {
            lines.push("[Characters: ]");
          }

          if (desc && desc.en) {
            lines.push("[Scene / Action / Background / Lighting / Mood]");
            lines.push(desc.en);
          } else {
            lines.push(legacyEnInstruction);
          }

          lines.push("");

          lines.push("🖼️ [등장 인물 이미지]");

          var usedNames = [];
          var baseCharacters =
            part.partCharacters && part.partCharacters.length
              ? part.partCharacters
              : storedCharacters || [];

          baseCharacters.forEach(function (ch) {
            var name = typeof ch === "string" ? ch : ch && ch.name ? String(ch.name) : "";
            if (!name) return;
            var path = imagePaths[name];
            if (!path && imageFolder) {
              var noSpace = name.replace(/\s+/g, "");
              path = imageFolder + "/" + noSpace + ".png";
            }
            if (path && usedNames.indexOf(name) === -1) {
              usedNames.push(name);
              lines.push(path);
            }
          });

          lines.push("");
          lines.push("");
        }

        storedChapters.forEach(function (chapter, chapterIndex) {
          // Clear previous locations if we are regenerating everything
          if (chapterIndex === 0) {
              // But we can't clear here because forEach runs synchronously to build 'parts' array.
              // We should clear locationLinesMap before this loop. (Done above: locationOrder = [], locationLinesMap = {})
          }
          
          if (!chapter || !Array.isArray(chapter.sceneSegments)) return;
          var text = chapter.text || "";
          var sceneConfig = chapter.sceneConfig || {};

          chapter.sceneSegments.forEach(function (seg, segIndex) {
            if (!seg) return;
            var label = (seg.label || "").trim() || "장소 " + (segIndex + 1);
            
            // Fix: Check both key and label for scene count config
            var scenesCount = 1;
            // Try label as key
            if (sceneConfig[label] && sceneConfig[label] > 0) {
                scenesCount = sceneConfig[label];
            } 
            // Also check if sceneConfig stores by index (not typical but possible)
            else if (sceneConfig[segIndex] && sceneConfig[segIndex] > 0) {
                scenesCount = sceneConfig[segIndex];
            }

            var segStart = typeof seg.start === "number" ? seg.start : 0;
            var segEnd = typeof seg.end === "number" ? seg.end : segStart;
            if (segStart < 0) segStart = 0;
            if (segEnd > text.length) segEnd = text.length;
            if (segEnd <= segStart) return;

            var segText = text.slice(segStart, segEnd);
            var segLen = segText.length;

            // Simple equidistant cuts for now, adjusted to sentence boundaries
            var cutIndices = [0];
            if (scenesCount > 1) {
               var chunkSize = segLen / scenesCount;
               for (var k = 1; k < scenesCount; k++) {
                  var target = Math.floor(chunkSize * k);
                  var boundary = findNearestSentenceBoundary(segText, target);
                  // Ensure progress
                  if (boundary <= cutIndices[cutIndices.length-1] + 10) {
                     boundary = target; // Fallback to hard cut if boundary search fails
                  }
                  if (boundary >= segLen - 10) {
                     boundary = segLen;
                     break;
                  }
                  cutIndices.push(boundary);
               }
            }
            cutIndices.push(segLen);

            for (var i = 0; i < cutIndices.length - 1; i++) {
              var pStart = cutIndices[i];
              var pEnd = cutIndices[i+1];
              if (pEnd <= pStart) continue;

              var partText = segText.slice(pStart, pEnd).trim();
              if (!partText) continue;

              var partCharacters = [];
              (storedCharacters || []).forEach(function (ch) {
                if (!ch || !ch.name) return;
                var name = String(ch.name);
                if (partText.indexOf(name) !== -1) {
                   partCharacters.push(name);
                }
              });

              parts.push({
                locationLabel: label,
                chapterIndex: chapterIndex,
                chapterNum: typeof chapter.chapterNumber === 'number' ? chapter.chapterNumber : (chapterIndex + 1),
                partText: partText,
                partCharacters: partCharacters,
                sceneNumber: globalSceneNumber
              });
              
              globalSceneNumber++;
            }
          });
        });

        var totalParts = parts.length;

        if (!totalParts) {
          alert("장면 프롬프트로 만들 수 있는 분할된 씬이 없습니다.");
          return;
        }

        updateScenePromptProgress(0, totalParts, false);

        function processPartsSequentially(index) {
          if (scenePromptCancelRequested) {
            syncScenePromptStoreFromMaps();
            updateScenePromptProgress(index, totalParts, true);
            var headerEl = document.getElementById("scenePromptHeader");
            var statusEl = document.getElementById("scenePromptBuildStatus");
            var msg =
              "장면 프롬프트 생성이 중지되었습니다. (" + index + " / " + totalParts + ")";
            if (headerEl) headerEl.textContent = msg;
            if (statusEl) statusEl.textContent = msg;
            loadTab("shintong");
            return;
          }

          if (index >= parts.length) {
            syncScenePromptStoreFromMaps();
            updateScenePromptProgress(totalParts, totalParts, true);
            loadTab("shintong");
            return;
          }

          var part = parts[index];

          updateScenePromptProgress(index, totalParts, false);

          if (!openaiKeyForScenePrompt) {
            addPartToLocations(part, { ko: "", en: "" });
            syncScenePromptStoreFromMaps();
            processPartsSequentially(index + 1);
            return;
          }

          generateSceneDescriptionWithOpenAI(
            part.partText,
            part.partCharacters,
            part.locationLabel,
            openaiKeyForScenePrompt
          )
            .then(function (desc) {
              addPartToLocations(part, desc || { ko: "", en: "" });
              syncScenePromptStoreFromMaps();
              processPartsSequentially(index + 1);
            })
            .catch(function () {
              addPartToLocations(part, { ko: "", en: "" });
              syncScenePromptStoreFromMaps();
              processPartsSequentially(index + 1);
            });
        }

        processPartsSequentially(0);
      });
    }
  }

  function initBangtongTab() {
    var cardList = document.getElementById("bangThumbnailCardList");
    var relationList = document.getElementById("bangRelationList");
    var button = document.getElementById("bangGenerateThumbnailButton");
    var statusEl = document.getElementById("bangThumbnailStatus");
    var copyAllButton = document.getElementById("bangCopyThumbnailAllButton");
    var resetButton = document.getElementById("bangResetButton");
    var relationAddInput = document.getElementById("bangRelationAddInput");
    var relationAddButton = document.getElementById("bangRelationAddButton");
    var strategyInput = document.getElementById("bangThumbnailStrategyInput");
    if (!button || !cardList) return;

    var currentSelectedText = "";
    var lastThumbnailText = "";
    var currentRelation = null;
    var hasLoadedRelations = false;
    var customRelations = [];

    function normalizeRoleForThumbnail(text) {
      var n = (text || "").trim();
      if (!n) return "";
      n = n.replace(/^양반집\s*/g, "");
      n = n.replace(/^새로 부임한\s*/g, "");
      n = n.replace(/^새로 부임해 온\s*/g, "");
      n = n.replace(/^새로 부임해온\s*/g, "");
       if (n.indexOf("버려진 아이") !== -1) return "버려진 아이";
       if (n.indexOf("맏며느리") !== -1) return "맏며느리";
       if (n.indexOf("며느리") !== -1) return "며느리";
       if (n.indexOf("시어머니") !== -1) return "시어머니";
       if (n.indexOf("사또") !== -1) return "사또";
       if (n.indexOf("기생") !== -1) return "기생";
      return n;
    }

    function buildRelationLabel(text) {
      var n = normalizeRoleForThumbnail(text);
      if (!n) return "";
      return n;
    }

    function renderRelationOptions() {
      if (!relationList) return;
      relationList.innerHTML = "";
      currentRelation = null;

      loadStoredCharacters();
      var characters = storedCharacters || [];
      if (!characters.length) {
        var helper = document.createElement("p");
        helper.className = "helper-text";
        helper.textContent = "대본/설정 탭에서 먼저 등장인물 분석을 실행해 주세요.";
        relationList.appendChild(helper);
        return;
      }

      function isLowPriorityRoleLabel(roleText) {
        var r = (roleText || "").trim();
        if (!r) return false;
        if (r.indexOf("버려진 아이") !== -1) return false;
        return (
          r.indexOf("딸") !== -1 ||
          r.indexOf("아들") !== -1 ||
          r.indexOf("손녀") !== -1 ||
          r.indexOf("손자") !== -1 ||
          r.indexOf("하인") !== -1 ||
          r === "아이" ||
          r === "아이들"
        );
      }

      function isHighPriorityRoleLabel(roleText) {
        var r = (roleText || "").trim();
        if (!r) return false;
        return (
          r.indexOf("며느리") !== -1 ||
          r.indexOf("맏며느리") !== -1 ||
          r.indexOf("시어머니") !== -1 ||
          r.indexOf("사또") !== -1 ||
          r.indexOf("남편") !== -1 ||
          r.indexOf("기생") !== -1 ||
          r.indexOf("첩") !== -1
        );
      }

      function scoreCharacter(c) {
        if (!c) return 0;
        var baseCount = typeof c.count === "number" ? c.count : 0;
        var roleText = (c.role && c.role.trim()) || "";
        var score = baseCount;
        if (c.isCore) score += 1000;
        if (isHighPriorityRoleLabel(roleText)) score += 500;
        return score;
      }

      var sorted = characters
        .slice()
        .filter(function (c) {
          return c && c.name;
        })
        .sort(function (a, b) {
          return scoreCharacter(b) - scoreCharacter(a);
        });

      var maxCount = 0;
      if (sorted.length) {
        var first = sorted[0];
        maxCount = typeof first.count === "number" ? first.count : 0;
        if (maxCount < 0) maxCount = 0;
      }
      var countThreshold = maxCount > 0 ? Math.max(2, Math.floor(maxCount * 0.3)) : 0;

      var coreSorted = sorted.filter(function (c) {
        return c.isCore;
      });

      var nonLowPriority = sorted.filter(function (c) {
        if (!c) return false;
        if (c.isCore) return true;
        var label = (c.role && c.role.trim()) || c.name;
        var cnt = typeof c.count === "number" ? c.count : 0;
        if (isLowPriorityRoleLabel(label)) return false;
        if (cnt < countThreshold) return false;
        return true;
      });

      var baseList;
      if (coreSorted.length >= 2) {
        baseList = coreSorted;
      } else if (nonLowPriority.length >= 2) {
        baseList = nonLowPriority;
      } else {
        baseList = sorted;
      }

      var top = baseList.slice(0, 6);
      var relations = [];

      for (var i = 0; i < top.length; i++) {
        for (var j = i + 1; j < top.length; j++) {
          var chA = top[i];
          var chB = top[j];
          if (!chA || !chB) continue;
          var rawA = (chA.role && chA.role.trim()) || chA.name;
          var rawB = (chB.role && chB.role.trim()) || chB.name;
          var baseA = normalizeRoleForThumbnail(rawA);
          var baseB = normalizeRoleForThumbnail(rawB);
          if (!baseA || !baseB) continue;
          var labelA = buildRelationLabel(baseA);
          var labelB = buildRelationLabel(baseB);
          var label = labelA + " VS " + labelB;
          relations.push({
            id: "rel_" + i + "_" + j,
            label: label
          });
          if (relations.length >= 12) break;
        }
        if (relations.length >= 12) break;
      }

      relations.forEach(function (rel) {
        var card = document.createElement("button");
        card.type = "button";
        card.className = "bang-relation-card";
        card.setAttribute("data-relation-id", rel.id);
        card.textContent = rel.label;
        card.addEventListener("click", function () {
          if (card.classList.contains("bang-relation-card-selected")) {
            card.classList.remove("bang-relation-card-selected");
          } else {
            card.classList.add("bang-relation-card-selected");
          }
        });
        relationList.appendChild(card);
      });

      customRelations.forEach(function (rel) {
        var card = document.createElement("button");
        card.type = "button";
        card.className = "bang-relation-card";
        card.setAttribute("data-relation-id", rel.id);
        card.textContent = rel.label;
        card.addEventListener("click", function () {
          if (card.classList.contains("bang-relation-card-selected")) {
            card.classList.remove("bang-relation-card-selected");
          } else {
            card.classList.add("bang-relation-card-selected");
          }
        });
        relationList.appendChild(card);
      });

      hasLoadedRelations = true;
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        openConfirmModal(
          "방통이를 초기화하면 현재 관계 축 태그와 생성된 썸네일 문구가 모두 지워집니다.\n" +
            "다시 사용하려면 대본/설정 탭에서 등장인물 분석을 다시 실행해야 합니다.\n\n" +
            "정말 방통이를 초기화하시겠습니까?"
        ).then(function (ok) {
          if (!ok) return;

          if (statusEl) {
            statusEl.textContent = "";
          }
          cardList.innerHTML = "";
          currentSelectedText = "";
          lastThumbnailText = "";
          currentRelation = null;
          hasLoadedRelations = false;
          customRelations = [];

          if (relationList) {
            relationList.innerHTML = "";
          }
          if (strategyInput) {
            strategyInput.value = "";
          }
        });
      });
    }

    function addCustomRelationFromInput() {
      if (!relationAddInput) return;
      var value = relationAddInput.value.trim();
      if (!value) return;
      var relationLabel = value;
      var rel = {
        id: "custom_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
        label: relationLabel
      };
      customRelations.push(rel);
      relationAddInput.value = "";
      renderRelationOptions();
    }

    if (relationAddButton && relationAddInput) {
      relationAddButton.addEventListener("click", function () {
        addCustomRelationFromInput();
      });
      relationAddInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          addCustomRelationFromInput();
        }
      });
    }

    function renderThumbnailCards(rawText) {
      cardList.innerHTML = "";
      currentSelectedText = "";

      if (!rawText) {
        return;
      }

      var blocks = rawText
        .split(/\n{2,}/)
        .map(function (block) {
          return block.trim();
        })
        .filter(function (block) {
          return block.length > 0;
        });

      if (!blocks.length) {
        return;
      }

      blocks.forEach(function (block) {
        var card = document.createElement("div");
        card.className = "bang-thumbnail-card";

        var inner = document.createElement("div");
        inner.className = "bang-thumbnail-inner";

        var left = document.createElement("div");
        left.className = "bang-thumbnail-left";
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "bang-thumbnail-checkbox";
        left.appendChild(checkbox);

        var middle = document.createElement("div");
        middle.className = "bang-thumbnail-middle";
        var linesEl = document.createElement("div");
        linesEl.className = "bang-thumbnail-lines";
        linesEl.textContent = block;
        middle.appendChild(linesEl);

        var right = document.createElement("div");
        right.className = "bang-thumbnail-right";
        var planButton = document.createElement("button");
        planButton.type = "button";
        planButton.className = "bang-thumbnail-plan-button";
        planButton.textContent = "기획";
        right.appendChild(planButton);

        inner.appendChild(left);
        inner.appendChild(middle);
        inner.appendChild(right);
        card.appendChild(inner);

        function selectCard() {
          currentSelectedText = block;
          var cards = cardList.querySelectorAll(".bang-thumbnail-card");
          cards.forEach(function (node) {
            node.classList.remove("bang-thumbnail-card-selected");
            var cb = node.querySelector(".bang-thumbnail-checkbox");
            if (cb) cb.checked = false;
          });
          card.classList.add("bang-thumbnail-card-selected");
          checkbox.checked = true;
        }

        card.addEventListener("click", function (event) {
          if (event.target === planButton) {
            // 계획 버튼 동작 연결
            if (window.setupBangtongEditor) {
              window.setupBangtongEditor(block);
            }
            return;
          }
          selectCard();
        });

        checkbox.addEventListener("click", function (event) {
          event.stopPropagation();
          selectCard();
        });

        cardList.appendChild(card);
      });
    }

    button.addEventListener("click", function () {
      if (!hasLoadedRelations) {
        renderRelationOptions();
        if (statusEl) {
          statusEl.textContent = "1단계: 먼저 썸네일 관계 축 태그를 선택해 주세요.";
        }
        return;
      }
      var selectedCards = relationList
        ? relationList.querySelectorAll(".bang-relation-card-selected")
        : null;
      if (!selectedCards || !selectedCards.length) {
        alert("먼저 썸네일 관계 축 태그를 하나 이상 선택해 주세요.");
        return;
      }
      if (!storedChapters || !storedChapters.length) {
        alert("먼저 대본/설정 탭에서 대본을 스토리에 추가해 주세요.");
        return;
      }

      var text = getAllScriptText();
      if (!text || !text.trim()) {
        alert("분석할 대본이 없습니다.");
        return;
      }

      var openaiKey = localStorage.getItem("yadam_openai_api_key") || "";
      var geminiKey = localStorage.getItem("yadam_gemini_api_key") || "";

      if (!openaiKey && !geminiKey) {
        alert("먼저 오른쪽 위 API 키 설정에서 키를 저장해 주세요.");
        return;
      }

      if (statusEl) {
        statusEl.textContent = "썸네일 문구 20개 생성 중...";
      }
      cardList.innerHTML = "";
      currentSelectedText = "";
      lastThumbnailText = "";

      function setResult(textOut) {
        var value = textOut || "";
        var normalized = value
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .replace(/\\n/g, "\n");
        lastThumbnailText = normalized;
        renderThumbnailCards(normalized);
        if (statusEl) {
          if (normalized && normalized.trim()) {
            statusEl.textContent =
              "썸네일 문구 생성이 완료되었습니다. 마음에 드는 문구를 골라 수정해서 사용해 보세요.";
          } else {
            statusEl.textContent =
              "결과를 만들지 못했습니다. 직접 썸네일 문구를 작성해 주세요.";
          }
        }
      }

      function buildRelationLabelFromSelection() {
        if (!selectedCards || !selectedCards.length) return "";
        var labels = [];
        selectedCards.forEach(function (card) {
          var text = card.textContent || "";
          text = text.trim();
          if (text) {
            labels.push(text);
          }
        });
        return labels.join(" / ");
      }

      function runWithGemini() {
        if (!geminiKey) {
          setResult("");
          return;
        }
        var relationLabel = buildRelationLabelFromSelection();
        var strategyText = strategyInput && strategyInput.value && strategyInput.value.trim();
        var combinedLabel = relationLabel;
        if (relationLabel && strategyText) {
          combinedLabel = relationLabel + "||" + strategyText;
        }
        generateThumbnailIdeasWithGemini(text, geminiKey, combinedLabel || relationLabel)
          .then(function (res) {
            setResult(res);
          })
          .catch(function () {
            setResult("");
          });
      }

      if (openaiKey) {
        var relationLabel2 = buildRelationLabelFromSelection();
        var strategyText2 = strategyInput && strategyInput.value && strategyInput.value.trim();
        var combinedLabel2 = relationLabel2;
        if (relationLabel2 && strategyText2) {
          combinedLabel2 = relationLabel2 + "||" + strategyText2;
        }
        generateThumbnailIdeasWithOpenAI(
          text,
          openaiKey,
          combinedLabel2 || relationLabel2
        )
          .then(function (res) {
            if (res && res.trim()) {
              setResult(res);
            } else if (geminiKey) {
              runWithGemini();
            } else {
              setResult("");
            }
          })
          .catch(function () {
            if (geminiKey) {
              runWithGemini();
            } else {
              setResult("");
            }
          });
      } else {
        runWithGemini();
      }
    });

    if (copyAllButton) {
      copyAllButton.addEventListener("click", function () {
        var textToCopy = lastThumbnailText;
        if (!textToCopy || !textToCopy.trim()) {
          alert("먼저 썸네일 문구를 생성해 주세요.");
          return;
        }

        function doCopy(content) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
              .writeText(content)
              .then(function () {
                alert("썸네일 문구 전체를 클립보드에 복사했습니다.");
              })
              .catch(function () {
                alert("클립보드 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
              });
          } else {
            var temp = document.createElement("textarea");
            temp.value = content;
            temp.style.position = "fixed";
            temp.style.left = "-9999px";
            document.body.appendChild(temp);
            temp.select();
            try {
              var ok = document.execCommand("copy");
              document.body.removeChild(temp);
              if (ok) {
                alert("썸네일 문구 전체를 클립보드에 복사했습니다.");
              } else {
                alert("클립보드 복사에 실패했습니다. 수동으로 복사해 주세요.");
              }
            } catch (e) {
              document.body.removeChild(temp);
              alert("클립보드 복사에 실패했습니다. 수동으로 복사해 주세요.");
            }
          }
        }

        doCopy(textToCopy);
      });
    }

    if (!hasLoadedRelations) {
      renderRelationOptions();
    }

    // --- Thumbnail Editor Logic ---
    var canvas = document.getElementById("thumbnailCanvas");
    var ctx = canvas ? canvas.getContext("2d") : null;
    var bgImageInput = document.getElementById("bgImageInput");
    var uploadBgButton = document.getElementById("uploadBgButton");
    var downloadThumbnailButton = document.getElementById("downloadThumbnailButton");
    var gradientWidthInput = document.getElementById("gradientWidthInput");
    var gradientHeightInput = document.getElementById("gradientHeightInput");
    var textLayerList = document.getElementById("textLayerList");
    var addTextLayerButton = document.getElementById("addTextLayerButton");
    var layerPropertiesPanel = document.getElementById("layerPropertiesPanel");
    var deleteLayerButton = document.getElementById("deleteLayerButton");

    // Inputs
    var layerTextInput = document.getElementById("layerTextInput");
    var highlightTextBtn = document.getElementById("highlightTextBtn");
    var highlightColorInput = document.getElementById("highlightColorInput");
    var fontFamilySelect = document.getElementById("fontFamilySelect");
    var fontWeightSelect = document.getElementById("fontWeightSelect");
    var fontSizeInput = document.getElementById("fontSizeInput");
    var textColorInput = document.getElementById("textColorInput");
    var strokeColorInput = document.getElementById("strokeColorInput");
    var strokeWidthInput = document.getElementById("strokeWidthInput");
    var letterSpacingInput = document.getElementById("letterSpacingInput");
    var scaleYInput = document.getElementById("scaleYInput");
    var posXInput = document.getElementById("posXInput");
    var posYInput = document.getElementById("posYInput");
    var scanLocalFontBtn = document.getElementById("scanLocalFontBtn");
    var loadLocalFontBtn = document.getElementById("loadLocalFontBtn");
    var localFontInput = document.getElementById("localFontInput");
    var toggleFontFavoriteBtn = document.getElementById("toggleFontFavoriteBtn");
    var applyAllLayersCheckbox = document.getElementById("applyAllLayersCheckbox");
    
    // Large View
    var openLargeViewBtn = document.getElementById("openLargeViewBtn");
    var closeLargeViewBtn = document.getElementById("closeLargeViewBtn");
    var largeViewModal = document.getElementById("largeViewModal");
    var largeViewImage = document.getElementById("largeViewImage");

    var editorState = {
      bgImage: null,
      bgImageData: null, // Keep DataURL for storage
      layers: [],
      selectedIndex: -1
    };

    var favoriteFonts = [];
    var loadedLocalFonts = []; // { name: 'MyFont', family: 'MyFont' }
    var scannedLocalFonts = []; // { name: 'MyFont', family: 'MyFont' } from window.queryLocalFonts

    // --- Persistence Logic ---
    function saveEditorState() {
      try {
        var stateToSave = {
          layers: editorState.layers,
          bgImageData: editorState.bgImageData,
          gradientWidth: gradientWidthInput ? gradientWidthInput.value : 60,
          gradientHeight: gradientHeightInput ? gradientHeightInput.value : 0
        };
        localStorage.setItem("yadam_thumbnail_state", JSON.stringify(stateToSave));
      } catch (e) {
        console.error("Failed to save thumbnail state:", e);
      }
    }

    function loadEditorState() {
      try {
        var raw = localStorage.getItem("yadam_thumbnail_state");
        if (!raw) return;
        
        var data = JSON.parse(raw);
        if (data.layers && Array.isArray(data.layers)) {
           editorState.layers = data.layers;
        }
        
        if (data.gradientWidth && gradientWidthInput) {
           gradientWidthInput.value = data.gradientWidth;
        }

        if (data.gradientHeight && gradientHeightInput) {
           gradientHeightInput.value = data.gradientHeight;
        }

        if (data.bgImageData) {
           var img = new Image();
           img.onload = function() {
             editorState.bgImage = img;
             drawCanvas();
           };
           img.src = data.bgImageData;
        } else {
           drawCanvas();
        }
        
        renderLayerList();
      } catch (e) {
        console.error("Failed to load thumbnail state:", e);
      }
    }
    
    // Auto-save state on change
    function saveEditorState() {
      var state = {
        layers: editorState.layers,
        gradientWidth: gradientWidthInput ? gradientWidthInput.value : 0,
        gradientHeight: gradientHeightInput ? gradientHeightInput.value : 0,
        bgImageData: null
      };
      
      if (editorState.bgImage) {
         // If bgImage is a loaded image, we might need its data URL
         // But saving huge images to localStorage is bad.
         // Let's try to save it if it's reasonable size? 
         // Or just rely on user re-uploading?
         // User asked to persist, so we try.
         try {
             // Create a temp canvas to extract data URL if original source is not available?
             // Actually, if we loaded from file input, we don't have persistent URL.
             // We can draw it to a canvas and get dataURL.
             // But let's check if we already have a dataURL stored in editorState?
             // We didn't store it explicitly.
             
             var tempCanvas = document.createElement("canvas");
             tempCanvas.width = editorState.bgImage.width;
             tempCanvas.height = editorState.bgImage.height;
             var tCtx = tempCanvas.getContext("2d");
             tCtx.drawImage(editorState.bgImage, 0, 0);
             // Limit size/quality to avoid quota exceeded
             state.bgImageData = tempCanvas.toDataURL("image/jpeg", 0.7); 
         } catch(e) {
             console.warn("Could not save bg image to storage", e);
         }
      }
      
      try {
        localStorage.setItem("yadam_thumbnail_state", JSON.stringify(state));
      } catch (e) {
        console.warn("LocalStorage quota exceeded", e);
      }
    }

    function loadFavoriteFonts() {
      try {
        var raw = localStorage.getItem("yadam_favorite_fonts");
        if (raw) {
          favoriteFonts = JSON.parse(raw);
        }
      } catch (e) {
        favoriteFonts = [];
      }
    }

    function saveFavoriteFonts() {
      localStorage.setItem("yadam_favorite_fonts", JSON.stringify(favoriteFonts));
    }

    function renderFontOptions() {
      if (!fontFamilySelect) return;
      var currentVal = fontFamilySelect.value;
      fontFamilySelect.innerHTML = "";

      var defaults = [
        { label: "기본 (Pretendard)", value: "Pretendard, sans-serif" },
        { label: "바탕 (Noto Serif)", value: "'Noto Serif KR', serif" },
        { label: "고딕 (Noto Sans)", value: "'Noto Sans KR', sans-serif" },
        { label: "궁서체", value: "'GungSeo', serif" },
        { label: "검은고딕", value: "'Black Han Sans', sans-serif" },
        { label: "Impact", value: "Impact, sans-serif" }
      ];

      // Merge defaults + local loaded + scanned
      var allFonts = defaults.slice();
      
      loadedLocalFonts.forEach(function (f) {
        allFonts.push({ label: f.name + " (파일)", value: "'" + f.family + "', sans-serif" });
      });

      scannedLocalFonts.forEach(function (f) {
        allFonts.push({ label: f.name, value: "'" + f.family + "', sans-serif" });
      });

      // Split into Favorites and Others
      var favs = [];
      var others = [];

      allFonts.forEach(function (f) {
        if (favoriteFonts.indexOf(f.value) !== -1) {
          favs.push(f);
        } else {
          others.push(f);
        }
      });

      if (favs.length > 0) {
        var group = document.createElement("optgroup");
        group.label = "★ 즐겨찾기";
        favs.forEach(function (f) {
          var opt = document.createElement("option");
          opt.value = f.value;
          opt.textContent = f.label;
          group.appendChild(opt);
        });
        fontFamilySelect.appendChild(group);
      }

      var group2 = document.createElement("optgroup");
      group2.label = "전체 폰트";
      others.forEach(function (f) {
        var opt = document.createElement("option");
        opt.value = f.value;
        opt.textContent = f.label;
        group2.appendChild(opt);
      });
      fontFamilySelect.appendChild(group2);

      // Restore selection if possible
      if (currentVal) {
        fontFamilySelect.value = currentVal;
      }
      updateFavoriteBtnState();
    }

    function updateFavoriteBtnState() {
      if (!toggleFontFavoriteBtn || !fontFamilySelect) return;
      var val = fontFamilySelect.value;
      if (favoriteFonts.indexOf(val) !== -1) {
        toggleFontFavoriteBtn.textContent = "★";
        toggleFontFavoriteBtn.classList.add("active"); // Optional styling
        toggleFontFavoriteBtn.style.color = "#ffd700";
      } else {
        toggleFontFavoriteBtn.textContent = "☆";
        toggleFontFavoriteBtn.classList.remove("active");
        toggleFontFavoriteBtn.style.color = "";
      }
    }

    loadFavoriteFonts();
    renderFontOptions();
    loadEditorState();

    if (toggleFontFavoriteBtn) {
      toggleFontFavoriteBtn.addEventListener("click", function () {
        var val = fontFamilySelect.value;
        var idx = favoriteFonts.indexOf(val);
        if (idx !== -1) {
          favoriteFonts.splice(idx, 1);
        } else {
          favoriteFonts.push(val);
        }
        saveFavoriteFonts();
        renderFontOptions();
        // Keep selection
        fontFamilySelect.value = val;
        updateFavoriteBtnState();
      });
    }

    if (scanLocalFontBtn) {
      scanLocalFontBtn.addEventListener("click", async function() {
        if (!("queryLocalFonts" in window)) {
          alert("이 브라우저는 'PC 폰트 자동 스캔' 기능을 지원하지 않습니다.\n(Chrome, Edge 최신 버전 사용 권장)\n\n대신 아래 '폰트 파일 직접 선택'을 이용해주세요.");
          if (loadLocalFontBtn) loadLocalFontBtn.style.display = "inline-block";
          return;
        }

        try {
          var fonts = await window.queryLocalFonts();
          var newFonts = [];
          var seen = {};

          fonts.forEach(function(f) {
             // Only keep unique families
             if (!seen[f.family]) {
                seen[f.family] = true;
                newFonts.push({ name: f.family, family: f.family });
             }
          });

          // Sort alphabetically
          newFonts.sort(function(a, b) {
             return a.name.localeCompare(b.name);
          });

          scannedLocalFonts = newFonts;
          renderFontOptions();
          alert("PC에 설치된 폰트 " + newFonts.length + "개를 불러왔습니다!");
          
        } catch (err) {
          console.error(err);
          alert("폰트 목록을 가져오지 못했습니다. 권한을 허용하지 않았거나 오류가 발생했습니다.\n\n" + err);
        }
      });
    }

    if (loadLocalFontBtn && localFontInput) {
      loadLocalFontBtn.addEventListener("click", function () {
        localFontInput.click();
      });
      localFontInput.addEventListener("change", function (e) {
        var file = e.target.files[0];
        if (!file) return;
        
        var reader = new FileReader();
        reader.onload = function (evt) {
          var arrayBuffer = evt.target.result;
          var fontName = "LocalFont_" + Date.now();
          var fontFace = new FontFace(fontName, arrayBuffer);
          fontFace.load().then(function (loadedFace) {
            document.fonts.add(loadedFace);
            // Add to list
            var originalName = file.name.replace(/\.[^/.]+$/, ""); // remove extension
            loadedLocalFonts.push({ name: originalName, family: fontName });
            renderFontOptions();
            // Auto select new font
            fontFamilySelect.value = "'" + fontName + "', sans-serif";
            // Trigger change event logic manually
            if (editorState.selectedIndex !== -1) {
              editorState.layers[editorState.selectedIndex].fontFamily = fontFamilySelect.value;
              drawCanvas();
            }
            alert("폰트가 로드되었습니다: " + originalName);
          }).catch(function (err) {
            alert("폰트 로드 실패: " + err);
          });
        };
        reader.readAsArrayBuffer(file);
        // Reset input so same file can be selected again
        localFontInput.value = "";
      });
    }

    if (fontFamilySelect) {
      fontFamilySelect.addEventListener("change", function() {
        updateFavoriteBtnState();
      });
    }

    function drawCanvas() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Background Image
      if (editorState.bgImage) {
        var img = editorState.bgImage;
        var cw = canvas.width;
        var ch = canvas.height;
        var iw = img.width;
        var ih = img.height;
        var ratio = Math.max(cw / iw, ch / ih);
        var nw = iw * ratio;
        var nh = ih * ratio;
        var lx = (cw - nw) / 2;
        var ly = (ch - nh) / 2;
        ctx.drawImage(img, lx, ly, nw, nh);
      } else {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Gradient Overlay
      // (1) Left -> Right
      if (gradientWidthInput) {
        var gradWidthVal = parseInt(gradientWidthInput.value, 10);
        if (!isNaN(gradWidthVal) && gradWidthVal > 0) {
            var widthPx = canvas.width * (gradWidthVal / 100);
            var grad = ctx.createLinearGradient(0, 0, widthPx, 0);
            grad.addColorStop(0, "rgba(0,0,0,0.95)");
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      // (2) Bottom -> Top
      if (gradientHeightInput) {
        var gradHeightVal = parseInt(gradientHeightInput.value, 10);
        if (!isNaN(gradHeightVal) && gradHeightVal > 0) {
            // 최대 높이를 캔버스의 40%로 제한
            var maxAllowedHeight = canvas.height * 0.4;
            var heightPx = maxAllowedHeight * (gradHeightVal / 100);
            var grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - heightPx);
            grad.addColorStop(0, "rgba(0,0,0,0.95)");
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      
      // Save state after drawing? 
      // No, saveEditorState should be called when properties change, not every frame.
      // But we can call it here if we want to ensure everything is synced? No, too slow.

      // 3. Text Layers
      editorState.layers.forEach(function (layer, index) {
        ctx.save();
        
        // Font settings
        var fontSize = parseInt(layer.fontSize, 10) || 60;
        var fontWeight = layer.fontWeight || "700";
        ctx.font = fontWeight + " " + fontSize + "px " + layer.fontFamily;
        ctx.textBaseline = "top";
        
        var x = parseInt(layer.x, 10) || 0;
        var y = parseInt(layer.y, 10) || 0;
        var scaleY = (parseInt(layer.scaleY, 10) || 100) / 100;
        var spacing = parseInt(layer.letterSpacing, 10) || 0;

        ctx.translate(x, y);
        ctx.scale(1, scaleY);

        var text = layer.text || "";
        var strokeWidth = parseInt(layer.strokeWidth, 10) || 0;

        // ★ STROKE FIRST (Pass 1)
        if (strokeWidth > 0) {
          ctx.lineWidth = strokeWidth;
          ctx.strokeStyle = layer.strokeColor;
          ctx.lineJoin = "round"; // Smoother corners
          
          if (spacing !== 0) {
            var cursorX = 0;
            for (var i = 0; i < text.length; i++) {
              var char = text[i];
              ctx.strokeText(char, cursorX, 0);
              cursorX += ctx.measureText(char).width + spacing;
            }
          } else {
            ctx.strokeText(text, 0, 0);
          }
        }

        // ★ FILL SECOND (Pass 2) - Drawn ON TOP of strokes
        // Check for highlighted ranges
        var highlights = layer.highlights || [];
        
        var cursorX = 0;
        for (var i = 0; i < text.length; i++) {
            var char = text[i];
            
            // Determine color for this char
            var charColor = layer.color;
            for (var h = 0; h < highlights.length; h++) {
                var range = highlights[h];
                if (i >= range.start && i < range.end) {
                    charColor = range.color;
                    break;
                }
            }
            
            ctx.fillStyle = charColor;
            ctx.fillText(char, cursorX, 0);
            
            // If spacing is 0, we still need to advance cursor properly
            var w = ctx.measureText(char).width;
            cursorX += w + spacing;
        }

        ctx.restore();
      });
    }

    function renderLayerList() {
      if (!textLayerList) return;
      textLayerList.innerHTML = "";
      editorState.layers.forEach(function (layer, index) {
        var item = document.createElement("div");
        item.className = "text-layer-item";
        if (index === editorState.selectedIndex) item.classList.add("active");
        item.textContent = layer.text || "(비어있음)";
        item.addEventListener("click", function () {
          selectLayer(index);
        });
        textLayerList.appendChild(item);
      });
    }

    function selectLayer(index) {
      editorState.selectedIndex = index;
      renderLayerList();
      drawCanvas();
      updatePropertiesPanel();
    }

    function updatePropertiesPanel() {
      if (!layerPropertiesPanel) return;
      var index = editorState.selectedIndex;
      if (index === -1 || !editorState.layers[index]) {
        layerPropertiesPanel.classList.add("hidden");
        return;
      }
      layerPropertiesPanel.classList.remove("hidden");
      var layer = editorState.layers[index];
      
      if(layerTextInput) layerTextInput.value = layer.text;
      if(fontFamilySelect) fontFamilySelect.value = layer.fontFamily;
      if(fontWeightSelect) fontWeightSelect.value = layer.fontWeight || "700";
      if(fontSizeInput) fontSizeInput.value = layer.fontSize;
      if(textColorInput) textColorInput.value = layer.color;
      if(strokeColorInput) strokeColorInput.value = layer.strokeColor;
      if(strokeWidthInput) strokeWidthInput.value = layer.strokeWidth;
      if(letterSpacingInput) letterSpacingInput.value = layer.letterSpacing;
      if(scaleYInput) scaleYInput.value = layer.scaleY;
      if(posXInput) posXInput.value = layer.x;
      if(posYInput) posYInput.value = layer.y;
    }

    function addLayer(text, customProps) {
      var defaultProps = {
        text: text || "새 텍스트",
        x: 50,
        y: 100 + (editorState.layers.length * 80),
        fontSize: 80,
        fontFamily: "Pretendard, sans-serif",
        color: "#ffffff",
        strokeColor: "#000000",
        strokeWidth: 4,
        letterSpacing: 0,
        scaleY: 100
      };
      if (customProps) {
        Object.assign(defaultProps, customProps);
      }
      editorState.layers.push(defaultProps);
      selectLayer(editorState.layers.length - 1);
    }

    function deleteLayer(index) {
      editorState.layers.splice(index, 1);
      if (editorState.selectedIndex >= editorState.layers.length) {
        editorState.selectedIndex = editorState.layers.length - 1;
      }
      selectLayer(editorState.selectedIndex);
    }

    // --- Event Listeners for Editor ---
    if (uploadBgButton && bgImageInput) {
      uploadBgButton.addEventListener("click", function () {
        bgImageInput.click();
      });
      bgImageInput.addEventListener("change", function (e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (evt) {
          var img = new Image();
          img.onload = function () {
            editorState.bgImage = img;
            editorState.bgImageData = evt.target.result; // Save Data URL
            saveEditorState();
            drawCanvas();
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

      // Trigger on change
      gradientWidthInput.addEventListener("input", function() {
          drawCanvas();
          saveEditorState();
      });
      gradientHeightInput.addEventListener("input", function() {
          drawCanvas();
          saveEditorState();
      });

      addTextLayerButton.addEventListener("click", function () {
        var defaultText = "새 텍스트";
        addLayer(defaultText, {
          x: 50,
          y: 50,
          fontSize: 60,
          color: "#ffffff"
        });
        saveEditorState();
      });

      deleteLayerButton.addEventListener("click", function () {
        if (editorState.selectedIndex !== -1) {
          deleteLayer(editorState.selectedIndex);
          saveEditorState();
        }
      });


    // Property Inputs
    function bindInput(elem, prop, isInt) {
      if (!elem) return;
      elem.addEventListener("input", function () {
        if (editorState.selectedIndex !== -1) {
          var val = elem.value;
          if (isInt) val = parseInt(val, 10) || 0;
          
          // Apply to All Layers Check
          // Exclude position(x,y) AND color/text from bulk update
          if (applyAllLayersCheckbox && applyAllLayersCheckbox.checked && 
              prop !== "color" && prop !== "text") {
             
             // If changing fontSize or scaleY, we need to adjust Y positions to prevent overlap
             if (prop === "fontSize" || prop === "scaleY") {
                 
                 // Sort layers by Y position to find order
                 var sortedLayers = editorState.layers.slice().map(function(l, idx) { return {l:l, idx:idx}; });
                 sortedLayers.sort(function(a, b) { return a.l.y - b.l.y; });
                 
                 // Capture original gaps relative to previous layer height
                 var gaps = [];
                 for (var i = 1; i < sortedLayers.length; i++) {
                     var curr = sortedLayers[i].l;
                     var prev = sortedLayers[i-1].l;
                     var prevH = (parseInt(prev.fontSize, 10) || 60) * ((parseInt(prev.scaleY, 10) || 100) / 100);
                     var gap = curr.y - (prev.y + prevH);
                     gaps.push(gap);
                 }

                 // Apply new value
                 editorState.layers.forEach(function(layer) {
                    layer[prop] = val;
                 });
                 
                 // Re-calculate Y positions based on new size + OLD GAP
                 // Use the first layer's Y as start point (it stays put)
                 var currentY = sortedLayers[0].l.y;
                 
                 for (var i = 1; i < sortedLayers.length; i++) {
                     var layer = sortedLayers[i].l;
                     var prevLayer = sortedLayers[i-1].l;
                     
                     var prevSize = parseInt(prevLayer.fontSize, 10) || 60;
                     var prevScale = (parseInt(prevLayer.scaleY, 10) || 100) / 100;
                     var prevHeight = prevSize * prevScale;
                     
                     // Use stored gap
                     var gap = gaps[i-1];
                     
                     currentY = prevLayer.y + prevHeight + gap;
                     layer.y = currentY;
                 }
                 
                 // Update input if selected layer's Y changed
                 if (editorState.selectedIndex !== -1 && prop !== "y") {
                     var selLayer = editorState.layers[editorState.selectedIndex];
                     if (posYInput) posYInput.value = selLayer.y;
                 }
                 
             } 
             // Relative movement for X and Y
             else if (prop === "x" || prop === "y") {
                 var currentLayer = editorState.layers[editorState.selectedIndex];
                 var diff = val - currentLayer[prop];
                 
                 editorState.layers.forEach(function(layer) {
                     layer[prop] += diff;
                 });
                 
             }
             else {
                 editorState.layers.forEach(function(layer) {
                    layer[prop] = val;
                 });
             }

          } else {
             editorState.layers[editorState.selectedIndex][prop] = val;
          }

          drawCanvas();
          saveEditorState();
          if (prop === "text") renderLayerList();
        }
      });
    }

    bindInput(fontFamilySelect, "fontFamily");
    bindInput(fontWeightSelect, "fontWeight");
    bindInput(fontSizeInput, "fontSize", true);
    bindInput(textColorInput, "color");
    bindInput(strokeColorInput, "strokeColor");
    bindInput(strokeWidthInput, "strokeWidth", true);
    bindInput(letterSpacingInput, "letterSpacing", true);
    bindInput(scaleYInput, "scaleY", true);
    bindInput(posXInput, "x", true);
    bindInput(posYInput, "y", true);

    // Special handling for Text Input (Shift+Enter split)
    if (layerTextInput) {
      layerTextInput.addEventListener("input", function () {
        if (editorState.selectedIndex !== -1) {
          editorState.layers[editorState.selectedIndex].text = layerTextInput.value;
          drawCanvas();
          saveEditorState();
          renderLayerList();
        }
      });
      layerTextInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && (e.shiftKey || e.ctrlKey)) {
          e.preventDefault();
          if (editorState.selectedIndex === -1) return;
          
          var cursor = layerTextInput.selectionStart;
          var text = layerTextInput.value;
          var firstPart = text.slice(0, cursor);
          var secondPart = text.slice(cursor);
          
          // Update current layer
          var currentLayer = editorState.layers[editorState.selectedIndex];
          currentLayer.text = firstPart;
          
          // Create new layer with same props but new text
          var newLayerProps = JSON.parse(JSON.stringify(currentLayer));
          newLayerProps.text = secondPart;
          newLayerProps.y += (parseInt(currentLayer.fontSize, 10) || 60) + 10; // Move down
          
          editorState.layers.splice(editorState.selectedIndex + 1, 0, newLayerProps);
          
          saveEditorState();
          selectLayer(editorState.selectedIndex + 1);
          // Focus back to text input?
          layerTextInput.focus();
        }
      });
    }

    // Helper to apply highlight
    function applyHighlight() {
         if (editorState.selectedIndex === -1) return;
         if (!layerTextInput) return;
         
         var start = layerTextInput.selectionStart;
         var end = layerTextInput.selectionEnd;
         
         // If no selection (cursor only), do nothing or alert? 
         // Let's just do nothing to avoid annoying alerts on color change.
         if (start === end) {
             return;
         }
         
         var color = highlightColorInput ? highlightColorInput.value : "#ffff00";
         var layer = editorState.layers[editorState.selectedIndex];
         
         if (!layer.highlights) {
             layer.highlights = [];
         }
         
         // Remove overlapping highlights first to avoid confusion
         layer.highlights = layer.highlights.filter(function(h) {
             // Keep if ranges don't overlap with new one
             // Overlap if (StartA < EndB) and (EndA > StartB)
             return !(h.start < end && h.end > start);
         });

         // Add new highlight range
         layer.highlights.push({
             start: start,
             end: end,
             color: color
         });
         
         drawCanvas();
         saveEditorState();
    }

    if (highlightTextBtn && layerTextInput) {
      highlightTextBtn.addEventListener("click", function() {
         if (layerTextInput.selectionStart === layerTextInput.selectionEnd) {
             alert("강조할 텍스트를 드래그해서 선택해주세요.");
             return;
         }
         applyHighlight();
      });
    }

    // Also trigger on color input change if text is selected
    if (highlightColorInput && layerTextInput) {
        highlightColorInput.addEventListener("input", function() {
             // Only apply if there is a selection
             if (layerTextInput.selectionStart !== layerTextInput.selectionEnd) {
                 applyHighlight();
             }
        });
    }
    
    // Allow clearing highlights if user selects all and applies base color? 
    // Or maybe just a clear button? For now, let's keep it simple.
    // Actually, if user changes base text color, maybe we should clear highlights?
    // Let's modify the textColorInput listener above.

    if (downloadThumbnailButton) {
      downloadThumbnailButton.addEventListener("click", function () {
        if (!canvas) return;
        var link = document.createElement("a");
        link.download = "thumbnail.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }

    if (openLargeViewBtn && largeViewModal && largeViewImage && closeLargeViewBtn) {
      openLargeViewBtn.addEventListener("click", function() {
         if (!canvas) return;
         largeViewImage.src = canvas.toDataURL("image/png");
         largeViewModal.classList.remove("hidden");
      });
      closeLargeViewBtn.addEventListener("click", function() {
         largeViewModal.classList.add("hidden");
      });
      largeViewModal.addEventListener("click", function(e) {
         if (e.target === largeViewModal) {
            largeViewModal.classList.add("hidden");
         }
      });
    }

    // Expose a function to be called from the "Plan" button
    window.setupBangtongEditor = function(textBlock) {
       editorState.layers = [];
       var lines = textBlock.split("\n");
       
       // Default positioning logic
       var startY = 100;
       var fontSize = 90;
       
       lines.forEach(function(line, idx) {
         if (!line.trim()) return;
         // Special styling for line 1 (action/purpose) vs line 2 vs line 3 (subject/result)
         var color = "#ffffff";
         var fSize = fontSize;
         
         // Example heuristic: 1st line slightly smaller? 3rd line biggest?
         if (idx === 0) { fSize = 80; color = "#ffffff"; } // Purpose
         if (idx === 1) { fSize = 100; color = "#ffff00"; } // Action (Yellow highlight)
         if (idx === 2) { fSize = 120; color = "#ffffff"; } // Subject
         
         addLayer(line.trim(), {
           x: 50,
           y: startY + (idx * 130),
           fontSize: fSize,
           color: color,
           strokeWidth: 6
         });
       });
       
       // Scroll to editor
       var editorSection = document.querySelector(".bang-editor-section");
       if (editorSection) editorSection.scrollIntoView({ behavior: "smooth" });
    };

  } // End of initBangtongTab

  function loadTab(name) {
    var file;
    if (name === "script-settings") file = "tab-script-settings.html";
    else if (name === "shintong") file = "tab-shintong.html";
    else if (name === "bangtong") file = "tab-bangtong.html";
    else return;

    fetch(file)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("load failed");
        }
        return response.text();
      })
      .then(function (html) {
        tabContent.innerHTML = html;
        if (name === "script-settings") {
          initScriptSettingsTab();
        } else if (name === "shintong") {
          initShintongTab();
        } else if (name === "bangtong") {
          initBangtongTab();
        }
      })
      .catch(function () {
        var isFile = window.location.protocol === "file:";
        var message =
          '<div class="app-main"><section class="panel"><h2>탭 내용을 불러올 수 없습니다</h2>' +
          "<p>브라우저에서 index.html 파일을 직접 연 경우(tab HTML 파일을 fetch로 불러오는 것이 막힐 수 있습니다).</p>" +
          "<p>다음 중 한 가지 방법으로 다시 열어 보세요.</p>" +
          "<ul>" +
          "<li>간단한 웹 서버를 띄워 http:// 로 접속하기</li>" +
          "<li>또는 임시로 tab-script-settings.html 파일을 직접 열어 내용만 확인하기</li>" +
          "</ul>" +
          (isFile
            ? "<p>현재 주소가 file:// 로 시작하면 이런 현상이 발생할 수 있습니다.</p>"
            : "") +
          "</section></div>";
        tabContent.innerHTML = message;
      });

    tabButtons.forEach(function (button) {
      var tabName = button.getAttribute("data-tab");
      if (tabName === name) button.classList.add("active");
      else button.classList.remove("active");
    });
  }

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var name = button.getAttribute("data-tab");
      loadTab(name);
    });
  });

  if (apiKeyButton) {
    apiKeyButton.addEventListener("click", function () {
      openApiKeyModal();
    });
  }

  if (confirmModalOverlay) {
    confirmModalOverlay.addEventListener("click", function (event) {
      if (event.target === confirmModalOverlay) {
        closeConfirmModal(false);
      }
    });
  }

  if (confirmModalClose) {
    confirmModalClose.addEventListener("click", function () {
      closeConfirmModal(false);
    });
  }

  if (confirmModalCancel) {
    confirmModalCancel.addEventListener("click", function () {
      closeConfirmModal(false);
    });
  }

  if (confirmModalOk) {
    confirmModalOk.addEventListener("click", function () {
      closeConfirmModal(true);
    });
  }

  if (apiKeyModalOverlay) {
    apiKeyModalOverlay.addEventListener("click", function (event) {
      if (event.target === apiKeyModalOverlay) {
        closeApiKeyModal();
      }
    });
  }

  if (apiKeyModalClose) {
    apiKeyModalClose.addEventListener("click", function () {
      closeApiKeyModal();
    });
  }

  if (apiKeyModalCancel) {
    apiKeyModalCancel.addEventListener("click", function () {
      closeApiKeyModal();
    });
  }

  if (apiKeyModalSave) {
    apiKeyModalSave.addEventListener("click", function () {
      if (geminiApiKeyInput) {
        localStorage.setItem("yadam_gemini_api_key", geminiApiKeyInput.value.trim());
      }
      if (openaiApiKeyInput) {
        localStorage.setItem("yadam_openai_api_key", openaiApiKeyInput.value.trim());
      }
      loadStoredApiKeys();
      closeApiKeyModal();
    });
  }

  loadStoredApiKeys();
  loadStoredChapters();
  
  function initScrollControls() {
    var upBtn = document.getElementById("scrollUpBtn");
    var downBtn = document.getElementById("scrollDownBtn");
    if (!upBtn || !downBtn) return;

    function getSectionOffsets() {
      // Find all H2 headers in panels which serve as section anchors
      var headers = Array.from(document.querySelectorAll(".panel h2"));
      // Filter only visible ones (though in this SPA they are likely all visible if tab is active)
      // Sort by vertical position
      var points = headers.map(function(h) {
        return h.getBoundingClientRect().top + window.scrollY - 80; // 80px offset for header/margin
      }).sort(function(a, b) { return a - b; });
      
      // Add top (0) and bottom as points
      if (points.length === 0 || points[0] > 100) {
        points.unshift(0);
      }
      points.push(document.documentElement.scrollHeight);
      
      // Remove duplicates
      return points.filter(function(item, pos) {
        return points.indexOf(item) == pos;
      });
    }

    upBtn.addEventListener("click", function () {
      var activeTabBtn = document.querySelector(".tab-button.active");
      var isSettingsTab = activeTabBtn && activeTabBtn.getAttribute("data-tab") === "script-settings";

      if (isSettingsTab) {
        var currentScroll = window.scrollY;
        var points = getSectionOffsets();
        
        // Find the closest point that is strictly less than currentScroll (minus small tolerance)
        var target = 0;
        for (var i = points.length - 1; i >= 0; i--) {
          if (points[i] < currentScroll - 10) {
            target = points[i];
            break;
          }
        }
        window.scrollTo({ top: target, behavior: "smooth" });
      } else {
        // Normal behavior for other tabs: scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    downBtn.addEventListener("click", function () {
      var activeTabBtn = document.querySelector(".tab-button.active");
      var isSettingsTab = activeTabBtn && activeTabBtn.getAttribute("data-tab") === "script-settings";

      if (isSettingsTab) {
        var currentScroll = window.scrollY;
        var points = getSectionOffsets();
        
        // Find the closest point that is strictly greater than currentScroll (plus small tolerance)
        var target = document.documentElement.scrollHeight;
        for (var i = 0; i < points.length; i++) {
          if (points[i] > currentScroll + 10) {
            target = points[i];
            break;
          }
        }
        window.scrollTo({ top: target, behavior: "smooth" });
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      }
    });
  }

  initScrollControls();
  loadTab("script-settings");
});
