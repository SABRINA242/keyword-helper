(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // index.tsx
  var import_react6 = __toESM(__require("react"));
  var import_client = __toESM(__require("react-dom/client"));

  // App.tsx
  var import_react5 = __require("react");

  // types.ts
  var AnalysisType = /* @__PURE__ */ ((AnalysisType2) => {
    AnalysisType2["BlogPost"] = "blog post";
    AnalysisType2["TechnicalGuide"] = "technical guide";
    AnalysisType2["CodeSummary"] = "code summary";
    return AnalysisType2;
  })(AnalysisType || {});
  var Audience = /* @__PURE__ */ ((Audience2) => {
    Audience2["Beginner"] = "beginner";
    Audience2["Intermediate"] = "intermediate developer";
    Audience2["Expert"] = "expert developer";
    return Audience2;
  })(Audience || {});
  var Tone = /* @__PURE__ */ ((Tone2) => {
    Tone2["Formal"] = "formal";
    Tone2["Casual"] = "casual";
    Tone2["Humorous"] = "humorous";
    return Tone2;
  })(Tone || {});

  // services/geminiService.ts
  var import_genai = __require("@google/genai");
  var analysisTypeToKorean = (type) => {
    switch (type) {
      case "blog post" /* BlogPost */:
        return "\uBE14\uB85C\uADF8 \uD3EC\uC2A4\uD2B8";
      case "technical guide" /* TechnicalGuide */:
        return "\uAE30\uC220 \uAC00\uC774\uB4DC";
      case "code summary" /* CodeSummary */:
        return "\uCF54\uB4DC \uC694\uC57D";
      default:
        return "\uBB38\uC11C";
    }
  };
  var audienceToKorean = (audience) => {
    switch (audience) {
      case "beginner" /* Beginner */:
        return "\uCEF4\uD4E8\uD130 \uCD08\uBCF4\uC790";
      case "intermediate developer" /* Intermediate */:
        return "\uC911\uAE09 \uAC1C\uBC1C\uC790";
      case "expert developer" /* Expert */:
        return "\uC804\uBB38\uAC00";
      default:
        return "\uAC1C\uBC1C\uC790";
    }
  };
  var toneToKorean = (tone) => {
    switch (tone) {
      case "formal" /* Formal */:
        return "\uACA9\uC2DD \uC788\uB294";
      case "casual" /* Casual */:
        return "\uCE5C\uADFC\uD558\uACE0 \uCE90\uC8FC\uC5BC\uD55C";
      case "humorous" /* Humorous */:
        return "\uC720\uBA38\uB7EC\uC2A4\uD558\uACE0 \uC7AC\uCE58\uC788\uB294";
      default:
        return "\uC77C\uBC18\uC801\uC778";
    }
  };
  var identifyFeaturesInCode = async (code, apiKey, model) => {
    if (!apiKey) {
      throw new Error("Gemini API \uD0A4\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC88C\uCE21 \uC0C1\uB2E8\uC5D0 API \uD0A4\uB97C \uC785\uB825\uD558\uACE0 \uC800\uC7A5\uD574\uC8FC\uC138\uC694.");
    }
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const prompt = `
        \uB2F9\uC2E0\uC740 \uC0AC\uC6A9\uC790\uC758 \uAD00\uC810\uC5D0\uC11C \uC18C\uD504\uD2B8\uC6E8\uC5B4\uC758 \uD575\uC2EC \uAE30\uB2A5\uC744 \uC2DD\uBCC4\uD558\uB294 \uC804\uBB38 \uC18C\uD504\uD2B8\uC6E8\uC5B4 \uC544\uD0A4\uD14D\uD2B8\uC785\uB2C8\uB2E4.

        [\uC784\uBB34]
        \uC81C\uACF5\uB41C \uCF54\uB4DC\uB97C \uBD84\uC11D\uD558\uC5EC \uC0AC\uC6A9\uC790\uAC00 \uD558\uB098\uC758 '\uD504\uB85C\uADF8\uB7A8' \uB610\uB294 '\uC8FC\uC694 \uBAA8\uB4DC'\uB85C \uC778\uC2DD\uD560 \uB9CC\uD55C \uD070 \uB2E8\uC704\uC758 \uAE30\uB2A5 \uBAA9\uB85D\uC744 \uCC3E\uC544\uB0B4\uC138\uC694.

        [\uADDC\uCE59]
        1.  **\uAE30\uB2A5 \uB2E8\uC704 (\uB9E4\uC6B0 \uC911\uC694):** \uAE30\uB2A5\uC744 \uB108\uBB34 \uC138\uBD84\uD654\uD558\uC9C0 \uB9C8\uC138\uC694. '\uD30C\uC77C \uC5F4\uAE30', '\uC800\uC7A5\uD558\uAE30' \uAC19\uC740 \uC791\uC740 \uB2E8\uC704\uAC00 \uC544\uB2C8\uB77C, \uC0AC\uC6A9\uC790\uAC00 \uB3C5\uB9BD\uC801\uC778 \uD504\uB85C\uADF8\uB7A8\uC73C\uB85C \uC778\uC2DD\uD560 \uC218 \uC788\uB294 \uD070 \uAC1C\uB150\uC73C\uB85C \uAE30\uB2A5\uC744 \uBB36\uC5B4\uC57C \uD569\uB2C8\uB2E4.
        2.  **\uC5B8\uC5B4 (\uB9E4\uC6B0 \uC911\uC694):** \uAE30\uB2A5 \uC774\uB984\uC740 \uBC18\uB4DC\uC2DC **\uD55C\uAD6D\uC5B4**\uB85C \uC791\uC131\uD574\uC57C \uD569\uB2C8\uB2E4.
        3.  **\uACB0\uACFC \uD615\uC2DD:** \uACB0\uACFC\uB294 \uC624\uC9C1 JSON \uBB38\uC790\uC5F4 \uBC30\uC5F4 \uD615\uC2DD\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4. \uC55E\uB4A4\uC5D0 \uB2E4\uB978 \uD14D\uC2A4\uD2B8\uB97C \uC808\uB300 \uCD94\uAC00\uD558\uC9C0 \uB9C8\uC138\uC694.
        4.  \uB2E8\uC77C \uAE30\uB2A5 \uD504\uB85C\uADF8\uB7A8\uC758 \uACBD\uC6B0, \uD574\uB2F9 \uAE30\uB2A5 \uC774\uB984 \uD558\uB098\uB9CC \uD3EC\uD568\uB41C \uBC30\uC5F4\uC744 \uBC18\uD658\uD558\uC138\uC694.

        [\uC88B\uC740 \uC608\uC2DC]
        - \uBE14\uB85C\uADF8 \uD3EC\uC2A4\uD305\uACFC \uC694\uB9AC \uB808\uC2DC\uD53C \uC0DD\uC131 \uAE30\uB2A5\uC774 \uC788\uB294 \uCF54\uB4DC\uC758 \uACBD\uC6B0: \`["\uBE14\uB85C\uADF8 \uD3EC\uC2A4\uD305 \uC0DD\uC131\uAE30", "\uC694\uB9AC \uB808\uC2DC\uD53C \uC0DD\uC131\uAE30"]\`
        - \uACC4\uC0B0\uAE30 \uAE30\uB2A5\uB9CC \uC788\uB294 \uCF54\uB4DC\uC758 \uACBD\uC6B0: \`["\uACC4\uC0B0\uAE30 \uD504\uB85C\uADF8\uB7A8"]\`

        [\uB098\uC05C \uC608\uC2DC]
        - \`["\uD30C\uC77C \uC5F4\uAE30 \uAE30\uB2A5", "\uD14D\uC2A4\uD2B8 \uBD84\uC11D \uAE30\uB2A5", "\uACB0\uACFC \uC800\uC7A5 \uAE30\uB2A5"]\` -> \uB108\uBB34 \uC138\uBD84\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD558\uB098\uC758 \uD504\uB85C\uADF8\uB7A8\uC73C\uB85C \uBB36\uC73C\uC138\uC694.
        - \`["Blog Post Generator", "Recipe Generator"]\` -> \uC601\uBB38\uC785\uB2C8\uB2E4. \uBC18\uB4DC\uC2DC \uD55C\uAD6D\uC5B4\uB85C \uC791\uC131\uD558\uC138\uC694.

        ---
        [\uBD84\uC11D\uD560 \uCF54\uB4DC]
        \`\`\`
        ${code}
        \`\`\`
        ---

        \uAE30\uB2A5 \uBAA9\uB85D\uC744 JSON \uBC30\uC5F4\uB85C \uBC18\uD658\uD558\uC138\uC694.
    `;
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.STRING
            }
          }
        }
      });
      const jsonStr = response.text.trim();
      const cleanedJson = jsonStr.replace(/^```json\s*|```$/g, "");
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error("Error identifying features with Gemini API:", error);
      throw new Error("Gemini API\uC640 \uD1B5\uC2E0\uD558\uB294 \uB370 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. API \uD0A4\uAC00 \uC720\uD6A8\uD55C\uC9C0 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
    }
  };
  var analyzeCode = async (code, analysisType, audience, tone, customTemplate, featureToFocusOn, apiKey, model) => {
    if (!apiKey) {
      throw new Error("Gemini API \uD0A4\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC88C\uCE21 \uC0C1\uB2E8\uC5D0 API \uD0A4\uB97C \uC785\uB825\uD558\uACE0 \uC800\uC7A5\uD574\uC8FC\uC138\uC694.");
    }
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const koreanAnalysisType = analysisTypeToKorean(analysisType);
    const koreanTone = toneToKorean(tone);
    let koreanAudienceDescription = audienceToKorean(audience);
    let detailedInstructions = "";
    const useCustomTemplate = customTemplate.trim() !== "";
    const formattingInstructions = useCustomTemplate ? `
        - **\uD615\uC2DD (\uB9E4\uC6B0 \uC911\uC694):** \uB9C8\uD06C\uB2E4\uC6B4(Markdown)\uC744 \uC808\uB300 \uC0AC\uC6A9\uD558\uC9C0 \uB9C8\uC138\uC694. \uB300\uC2E0, \uC544\uB798 [\uCEE4\uC2A4\uD140 \uD0DC\uADF8 \uD15C\uD50C\uB9BF]\uC5D0 \uC81C\uACF5\uB41C \uD0DC\uADF8\uB9CC\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC804\uCCB4 \uACB0\uACFC\uBB3C\uC744 \uC791\uC131\uD574\uC57C \uD569\uB2C8\uB2E4. \uAC01 \uD0DC\uADF8\uC758 \uC6A9\uB3C4\uB97C \uD30C\uC545\uD558\uC5EC \uB0B4\uC6A9\uC744 \uB17C\uB9AC\uC801\uC73C\uB85C \uAD6C\uC131\uD558\uC138\uC694.
        - **\uC2A4\uD0C0\uC77C (\uB9E4\uC6B0 \uC911\uC694):** \uC0DD\uC131\uD558\uB294 HTML \uD0DC\uADF8 \uC548\uC5D0 \uC808\uB300\uB85C \uC778\uB77C\uC778 \uC2A4\uD0C0\uC77C(\uC608: \`style="..."\`)\uC744 \uC9C1\uC811 \uCD94\uAC00\uD558\uC9C0 \uB9C8\uC138\uC694. \uBAA8\uB4E0 \uB514\uC790\uC778\uACFC \uC0C9\uC0C1\uC740 \uC81C\uACF5\uB41C \uD15C\uD50C\uB9BF\uC5D0 \uC774\uBBF8 \uC644\uBCBD\uD558\uAC8C \uC815\uC758\uB418\uC5B4 \uC788\uC73C\uBBC0\uB85C, \uC2A4\uD0C0\uC77C \uC18D\uC131\uC744 \uCD94\uAC00\uD558\uBA74 \uB514\uC790\uC778\uC774 \uAE68\uC9D1\uB2C8\uB2E4.
        ` : `
        - **\uD615\uC2DD:** \uAC00\uB3C5\uC131\uC774 \uB6F0\uC5B4\uB09C \uB9C8\uD06C\uB2E4\uC6B4(Markdown) \uD615\uC2DD (\uC81C\uBAA9, \uC18C\uC81C\uBAA9, \uBAA9\uB85D \uB4F1 \uD65C\uC6A9)\uC744 \uC0AC\uC6A9\uD558\uC138\uC694.
        `;
    const focusInstruction = featureToFocusOn ? `**[\uD575\uC2EC \uC9C0\uCE68]** \uC774 \uAC00\uC774\uB4DC\uC758 \uC8FC\uC81C\uB294 \uC624\uC9C1 '${featureToFocusOn}' \uAE30\uB2A5 \uD558\uB098\uC785\uB2C8\uB2E4. \uCF54\uB4DC\uC5D0 \uB2E4\uB978 \uAE30\uB2A5\uC774 \uC788\uB354\uB77C\uB3C4 \uC808\uB300 \uC5B8\uAE09\uD558\uC9C0 \uB9D0\uACE0, \uC624\uC9C1 \uC774 \uAE30\uB2A5\uC758 \uC18C\uAC1C\uC640 \uC0AC\uC6A9\uBC95\uC5D0\uB9CC 100% \uC9D1\uC911\uD558\uC5EC \uD3EC\uC2A4\uD305\uC744 \uC791\uC131\uD574\uC57C \uD569\uB2C8\uB2E4.` : "\uC774 \uD504\uB85C\uADF8\uB7A8\uC758 \uC804\uBC18\uC801\uC778 \uAE30\uB2A5\uC5D0 \uB300\uD574 \uC124\uBA85\uD574\uC8FC\uC138\uC694.";
    const isPythonProject = code.includes(".py ---") || code.includes("import ") && code.includes("def ");
    let pythonSpecificInstructions = "";
    if (isPythonProject) {
      pythonSpecificInstructions = `
            **[Python \uD504\uB85C\uC81D\uD2B8 \uD2B9\uBCC4 \uC9C0\uCE68]**
            \uC774 \uD504\uB85C\uC81D\uD2B8\uB294 Python\uC73C\uB85C \uC791\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC0DD\uC131\uB418\uB294 '\uC0AC\uC6A9 \uBC29\uBC95' \uC139\uC158\uC5D0 \uC544\uB798 \uB0B4\uC6A9\uC744 \uBC18\uB4DC\uC2DC \uD3EC\uD568\uC2DC\uCF1C \uC8FC\uC138\uC694.
            1.  **\uC0AC\uC804 \uC900\uBE44:** Python\uC774 \uCEF4\uD4E8\uD130\uC5D0 \uC124\uCE58\uB418\uC5B4 \uC788\uC5B4\uC57C \uD568\uC744 \uC54C\uB824\uC8FC\uC138\uC694.
            2.  **\uB77C\uC774\uBE0C\uB7EC\uB9AC \uC124\uCE58:** \uCF54\uB4DC\uC5D0 'requirements.txt' \uD30C\uC77C \uB0B4\uC6A9\uC774 \uD3EC\uD568\uB418\uC5B4 \uC788\uB2E4\uBA74, \uD130\uBBF8\uB110(\uBA85\uB839 \uD504\uB86C\uD504\uD2B8)\uC5D0\uC11C 'pip install -r requirements.txt' \uBA85\uB839\uC5B4\uB85C \uD544\uC694\uD55C \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB97C \uD55C \uBC88\uC5D0 \uC124\uCE58\uD558\uB294 \uBC29\uBC95\uC744 \uC548\uB0B4\uD574\uC8FC\uC138\uC694. \uB9CC\uC57D 'requirements.txt' \uD30C\uC77C\uC774 \uC5C6\uB2E4\uBA74, \uCF54\uB4DC\uC5D0 \uC0AC\uC6A9\uB41C \uC8FC\uC694 'import' \uAD6C\uBB38\uC744 \uBCF4\uACE0 \uD544\uC694\uD55C \uB77C\uC774\uBE0C\uB7EC\uB9AC(\uC608: 'pip install pandas')\uB97C \uAC1C\uBCC4\uC801\uC73C\uB85C \uC124\uCE58\uD558\uB294 \uBC29\uBC95\uC744 \uC548\uB0B4\uD574\uC8FC\uC138\uC694.
            3.  **\uD504\uB85C\uADF8\uB7A8 \uC2E4\uD589:** \uD504\uB85C\uC81D\uD2B8\uC758 \uD575\uC2EC \uC2E4\uD589 \uD30C\uC77C(\uC608: 'main.py', 'app.py' \uB4F1)\uC744 \uCC3E\uC544\uC11C, \uD130\uBBF8\uB110\uC5D0\uC11C 'python main.py'\uC640 \uAC19\uC774 \uC2E4\uD589\uD558\uB294 \uBC29\uBC95\uC744 \uBA85\uD655\uD558\uAC8C \uC548\uB0B4\uD574\uC8FC\uC138\uC694.
        `;
    }
    if (audience === "beginner" /* Beginner */) {
      koreanAudienceDescription = "\uCEF4\uD4E8\uD130, \uD504\uB85C\uADF8\uB7A8, \uBE14\uB85C\uADF8 \uC0AC\uC6A9\uC5D0 \uC775\uC219\uD558\uC9C0 \uC54A\uC740 \uC644\uC804 \uCD08\uBCF4\uC790 \uBC0F \uC911\uC7A5\uB144\uCE35";
      detailedInstructions = `
            -   **\uC9E7\uC740 \uC18C\uAC1C:** \uC774 \uAE30\uB2A5\uC758 \uBAA9\uC801\uACFC \uD575\uC2EC \uC5ED\uD560\uC744 2~3\uBB38\uC7A5\uC73C\uB85C \uAC04\uACB0\uD558\uAC8C \uC694\uC57D\uD558\uC5EC \uC18C\uAC1C\uD574\uC8FC\uC138\uC694.
            -   **\uC8FC\uC694 \uD2B9\uC9D5:** \uC5B4\uB824\uC6B4 \uAE30\uC220 \uC6A9\uC5B4 \uC5C6\uC774, \uC774 \uAE30\uB2A5\uC774 \uD560 \uC218 \uC788\uB294 \uC77C\uB4E4\uC744 \uAC04\uB2E8\uD55C \uBAA9\uB85D\uC73C\uB85C \uBCF4\uC5EC\uC8FC\uC138\uC694.
            -   **\uC0C1\uC138\uD55C \uC0AC\uC6A9 \uBC29\uBC95 (\uAC00\uC7A5 \uC911\uC694):** \uC0AC\uC6A9\uC790\uB294 \uCEF4\uD4E8\uD130\uC5D0 \uC775\uC219\uD558\uC9C0 \uC54A\uC740 \uC911\uC7A5\uB144\uCE35\uC774\uB77C\uACE0 \uAC00\uC815\uD569\uB2C8\uB2E4. \uC544\uB798 \uADDC\uCE59\uC744 \uBC18\uB4DC\uC2DC \uC9C0\uCF1C\uC11C, **\uC544\uC8FC \uC0AC\uC18C\uD55C \uB2E8\uACC4\uB3C4 \uC808\uB300 \uC0DD\uB7B5\uD558\uC9C0 \uC54A\uB294** \uCE5C\uC808\uD558\uACE0 \uC0C1\uC138\uD55C \uB2E8\uACC4\uBCC4 \uAC00\uC774\uB4DC\uB97C \uC791\uC131\uD574\uC8FC\uC138\uC694.
                1.  **\uB204\uB77D \uAE08\uC9C0 (\uB9E4\uC6B0 \uC911\uC694):** '\uD504\uB85C\uADF8\uB7A8 \uC2E4\uD589' \uBD80\uD130 '\uACB0\uACFC \uD655\uC778' \uAE4C\uC9C0, \uC0AC\uC6A9\uC790\uAC00 \uD574\uC57C \uD560 \uBAA8\uB4E0 \uD589\uB3D9\uC744 \uD558\uB098\uB3C4 \uBE60\uC9D0\uC5C6\uC774, \uC21C\uC11C\uB300\uB85C \uC124\uBA85\uD574\uC57C \uD569\uB2C8\uB2E4. \uAC1C\uBC1C\uC790\uC5D0\uAC8C\uB294 \uB2F9\uC5F0\uD574 \uBCF4\uC774\uB294 \uC0AC\uC18C\uD55C \uACFC\uC815(\uC608: '\uD30C\uC77C\uC744 \uC800\uC7A5\uD560 \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694')\uB3C4 \uC808\uB300 \uC0DD\uB7B5\uD558\uBA74 \uC548 \uB429\uB2C8\uB2E4.
                2.  **\uB2E8\uACC4\uBCC4 \uBC88\uD638:** \uBAA8\uB4E0 \uB2E8\uACC4\uC5D0 \uBC88\uD638\uB97C \uBD99\uC5EC\uC8FC\uC138\uC694 (1., 2., 3., ...).
                3.  **\uB2E8\uC77C \uD589\uB3D9:** \uD55C \uB2E8\uACC4\uC5D0\uB294 \uD558\uB098\uC758 \uD589\uB3D9\uB9CC \uBA85\uD655\uD558\uAC8C \uC9C0\uC2DC\uD574\uC8FC\uC138\uC694. (\uB098\uC05C \uC608: '\uD30C\uC77C\uC744 \uC5F4\uACE0 \uB0B4\uC6A9\uC744 \uBCF5\uC0AC\uD558\uC138\uC694' -> \uC88B\uC740 \uC608: 1. '\uD30C\uC77C' \uBA54\uB274\uB97C \uD074\uB9AD\uD569\uB2C8\uB2E4. 2. '\uC5F4\uAE30'\uB97C \uC120\uD0DD\uD569\uB2C8\uB2E4. 3. ... )
                4.  **\uC815\uD655\uD55C \uBA85\uCE6D:** \uBC84\uD2BC \uC774\uB984, \uBA54\uB274 \uC774\uB984, \uC785\uB825 \uD544\uB4DC \uB4F1\uC740 \uC791\uC740\uB530\uC634\uD45C('')\uB85C \uAC15\uC870\uD574\uC11C \uC815\uD655\uD558\uAC8C \uC54C\uB824\uC8FC\uC138\uC694. (\uC608: '\uC800\uC7A5' \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uC138\uC694.)
                5.  **\uAD6C\uCCB4\uC801\uC778 \uBB18\uC0AC:** \uC0AC\uC6A9\uC790\uAC00 \uD604\uC7AC \uC5B4\uB5A4 \uD654\uBA74\uC744 \uBCF4\uACE0 \uC788\uB294\uC9C0, \uADF8\uB9AC\uACE0 \uB2E4\uC74C \uD589\uB3D9\uC744 \uD588\uC744 \uB54C \uD654\uBA74\uC774 \uC5B4\uB5BB\uAC8C \uBCC0\uD558\uB294\uC9C0 \uAD6C\uCCB4\uC801\uC73C\uB85C \uBB18\uC0AC\uD574\uC8FC\uC138\uC694.
                ${isPythonProject ? `6. ${pythonSpecificInstructions.replace(/\*\*\[.*?\]\*\*/g, "").replace(/(\d\.)/g, "\n- ")}` : ""}
            -   **\uAE30\uB300 \uD6A8\uACFC:** \uC774 \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD558\uBA74 \uC5B4\uB5A4 \uC791\uC5C5\uC744 \uB354 \uD6A8\uC728\uC801\uC73C\uB85C \uD560 \uC218 \uC788\uB294\uC9C0, \uAD11\uACE0\uAC00 \uC544\uB2CC \uC0AC\uC2E4\uC5D0 \uAE30\uBC18\uD558\uC5EC 1~2\uAC00\uC9C0 \uD575\uC2EC\uB9CC \uAC04\uACB0\uD558\uAC8C \uC124\uBA85\uD574\uC8FC\uC138\uC694.
        `;
    } else {
      koreanAudienceDescription = audienceToKorean(audience);
      detailedInstructions = `
            ${isPythonProject ? pythonSpecificInstructions : ""}
            -   **\uC18C\uAC1C:** \uC774 \uAE30\uB2A5\uC758 \uBAA9\uC801\uACFC \uD575\uC2EC \uC5ED\uD560\uC744 \uAC04\uACB0\uD558\uAC8C \uC694\uC57D\uD558\uC5EC \uC18C\uAC1C\uD574\uC8FC\uC138\uC694.
            -   **\uC8FC\uC694 \uD2B9\uC9D5:** \uAE30\uB2A5\uC758 \uC8FC\uC694 \uD2B9\uC9D5\uC744 \uBAA9\uB85D \uD615\uD0DC\uB85C \uBA85\uD655\uD558\uAC8C \uC124\uBA85\uD574\uC8FC\uC138\uC694.
            -   **\uC0AC\uC6A9 \uBC29\uBC95:** \uAE30\uB2A5\uC758 \uAE30\uBCF8\uC801\uC778 \uC0AC\uC6A9\uBC95\uC774\uB098 \uC2E4\uD589 \uBC29\uBC95\uC744 \uB2E8\uACC4\uBCC4\uB85C \uC54C\uAE30 \uC27D\uAC8C \uC124\uBA85\uD574\uC8FC\uC138\uC694.
            -   **\uAE30\uB300 \uD6A8\uACFC:** \uC774 \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD588\uC744 \uB54C \uC5BB\uC744 \uC218 \uC788\uB294 \uAE30\uC220\uC801\uC778 \uC774\uC810\uC744 \uAC1D\uAD00\uC801\uC73C\uB85C \uC124\uBA85\uD574\uC8FC\uC138\uC694.
        `;
    }
    const imageInsertionInstructions = useCustomTemplate ? `
- **\uC774\uBBF8\uC9C0 \uC0BD\uC785 (\uB9E4\uC6B0 \uC911\uC694):** '\uC0C1\uC138\uD55C \uC0AC\uC6A9 \uBC29\uBC95'\uC744 \uC124\uBA85\uD560 \uB54C, \uB3C5\uC790\uC758 \uC774\uD574\uB97C \uB3D5\uAE30 \uC704\uD574 \uC2A4\uD06C\uB9B0\uC0F7\uC774 \uD544\uC694\uD558\uB2E4\uACE0 \uD310\uB2E8\uB418\uBA74, \uBC18\uB4DC\uC2DC [\uCEE4\uC2A4\uD140 \uD0DC\uADF8 \uD15C\uD50C\uB9BF]\uC5D0 \uC788\uB294 'image_block_with_caption' \uBE14\uB85D\uC744 \uC0BD\uC785\uD558\uC138\uC694. \uC774\uBBF8\uC9C0 \uBE14\uB85D \uC0AC\uC6A9 \uC2DC \uC544\uB798 \uADDC\uCE59\uC744 \uBC18\uB4DC\uC2DC \uC900\uC218\uD574\uC57C \uD569\uB2C8\uB2E4.
    1.  **\`alt\` \uC18D\uC131:** \`<img>\` \uD0DC\uADF8\uC758 \`alt\` \uC18D\uC131\uC5D0\uB294 \uBE14\uB85C\uADF8 \uAE00\uC744 \uB9CC\uB4DC\uB294 **\uC791\uC131\uC790**\uB97C \uC704\uD55C \uC9C0\uC2DC\uC0AC\uD56D\uC744 \uB123\uC73C\uC138\uC694. **\uC5B4\uB5A4 \uD654\uBA74\uC744, \uC5B4\uB5BB\uAC8C \uCEA1\uCC98\uD574\uC57C \uD558\uB294\uC9C0** \uBA85\uD655\uD558\uACE0 \uAD6C\uCCB4\uC801\uC73C\uB85C \uC9C0\uC2DC\uD574\uC57C \uD569\uB2C8\uB2E4. (\uC608: \`alt="\uD504\uB85C\uADF8\uB7A8\uC758 '\uD30C\uC77C' \uBA54\uB274\uB97C \uD074\uB9AD\uD574\uC11C '\uC0C8\uB85C \uB9CC\uB4E4\uAE30'\uB97C \uC120\uD0DD\uD558\uB294 \uC7A5\uBA74 \uC2A4\uD06C\uB9B0\uC0F7"\`)
    2.  **\`<figcaption>\` \uB0B4\uC6A9:** \uC774\uBBF8\uC9C0 \uC544\uB798\uC758 \uCEA1\uC158\uC5D0\uB294 **\uBE14\uB85C\uADF8 \uB3C5\uC790**\uB97C \uC704\uD55C \uCE5C\uC808\uD55C \uC124\uBA85\uC744 \uC791\uC131\uD558\uC138\uC694. (\uC608: \`<figcaption>\uC0C1\uB2E8 \uBA54\uB274\uC5D0\uC11C '\uD30C\uC77C'\uC744 \uB204\uB974\uBA74 \uB2E4\uC74C\uACFC \uAC19\uC740 \uBA54\uB274\uAC00 \uB098\uD0C0\uB0A9\uB2C8\uB2E4.</figcaption>\`)
    3.  **\`src\` \uC18D\uC131:** \`src\` \uC18D\uC131\uC740 \uC808\uB300 \uBCC0\uACBD\uD558\uC9C0 \uB9D0\uACE0 "image_placeholder.png" \uADF8\uB300\uB85C \uB450\uC138\uC694.` : "";
    const prompt = `
        You are a technical writer who creates clear, concise, and trustworthy software guides.
        Your mission is to analyze the provided code and generate a guide post according to the requirements below.

        [Primary Instructions]
        1.  **Goal:** Create a clear guide to help users trust and easily use the program.
        2.  **Tone:** Maintain an objective, trustworthy tone. Avoid exaggerated marketing phrases.
        3.  ${focusInstruction}
        4.  **Output Type:** '${koreanAnalysisType}'
        5.  **Target Audience:** '${koreanAudienceDescription}'
        6.  **Tone of Voice:** '${koreanTone}'
        7.  **Language:** All output must be in Korean.
        8.  ${formattingInstructions}

        [Content Structure]
        ${detailedInstructions}
        ${imageInsertionInstructions}

        [SEO Metadata Generation]
        After generating the main content, create SEO metadata based on it.

        [Final Output Format]
        Your ENTIRE output must be a single, valid JSON object. Do not add any text before or after it.

        ---
        [Custom Tag Template (If applicable)]
        \`\`\`
        ${useCustomTemplate ? customTemplate : "N/A"}
        \`\`\`
        ---
        [Code to Analyze]
        \`\`\`
        ${code}
        \`\`\`
    `;
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              content: { type: import_genai.Type.STRING, description: "\uC0DD\uC131\uB41C \uC804\uCCB4 \uD3EC\uC2A4\uD2B8 \uB0B4\uC6A9. (HTML \uB610\uB294 \uB9C8\uD06C\uB2E4\uC6B4)" },
              tags: { type: import_genai.Type.STRING, description: "\uCF58\uD150\uCE20\uC640 \uAD00\uB828\uB41C \uCF64\uB9C8\uB85C \uAD6C\uBD84\uB41C \uD0DC\uADF8 7\uAC1C." },
              permalink: { type: import_genai.Type.STRING, description: "URL\uC5D0 \uC0AC\uC6A9\uB420 \uC9E7\uACE0 \uAC04\uACB0\uD55C \uC601\uBB38 \uD0A4\uC6CC\uB4DC 1\uAC1C." },
              metaDescription: { type: import_genai.Type.STRING, description: "\uAC80\uC0C9 \uC5D4\uC9C4\uC744 \uC704\uD55C 100\uC790 \uC774\uB0B4\uC758 \uBA54\uD0C0 \uB514\uC2A4\uD06C\uB9BD\uC158." }
            },
            required: ["content", "tags", "permalink", "metaDescription"]
          }
        }
      });
      const result = JSON.parse(response.text);
      return result;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error("Gemini API\uC640 \uD1B5\uC2E0\uD558\uB294 \uB370 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. API \uD0A4\uAC00 \uC720\uD6A8\uD55C\uC9C0 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
    }
  };
  var generateVideoScript = async (frames, audience, tone, apiKey, model) => {
    if (!apiKey) {
      throw new Error("Gemini API \uD0A4\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC88C\uCE21 \uC0C1\uB2E8\uC5D0 API \uD0A4\uB97C \uC785\uB825\uD558\uACE0 \uC800\uC7A5\uD574\uC8FC\uC138\uC694.");
    }
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const koreanTone = toneToKorean(tone);
    let koreanAudienceDescription = audienceToKorean(audience);
    let detailedInstructions = "";
    if (audience === "beginner" /* Beginner */) {
      koreanAudienceDescription = "\uCEF4\uD4E8\uD130, \uD504\uB85C\uADF8\uB7A8, \uBE14\uB85C\uADF8 \uC0AC\uC6A9\uC5D0 \uC775\uC219\uD558\uC9C0 \uC54A\uC740 \uC644\uC804 \uCD08\uBCF4\uC790 \uBC0F \uC911\uC7A5\uB144\uCE35";
      detailedInstructions = `
            -   **\uC9C1\uC811\uC801\uC778 \uD589\uB3D9 \uBB18\uC0AC:** \uAC01 \uC7A5\uBA74\uC5D0\uC11C \uC0AC\uC6A9\uC790\uAC00 '\uBB34\uC5C7\uC744', '\uC5B4\uB5BB\uAC8C' \uD574\uC57C \uD558\uB294\uC9C0 \uC9C1\uC811\uC801\uC774\uACE0 \uBA85\uD655\uD55C \uC9C0\uC2DC\uBB38 \uD615\uD0DC\uB85C \uC124\uBA85\uD574\uC8FC\uC138\uC694. (\uC608: "'\uD30C\uC77C' \uBA54\uB274\uB97C \uD074\uB9AD\uD558\uC138\uC694.")
            -   **\uC26C\uC6B4 \uC6A9\uC5B4 \uC0AC\uC6A9:** \uC804\uBB38 \uC6A9\uC5B4\uB97C \uD53C\uD558\uACE0, \uAC00\uC7A5 \uC26C\uC6B4 \uB2E8\uC5B4\uB85C \uC124\uBA85\uD574\uC8FC\uC138\uC694.
            -   **\uCE5C\uC808\uD55C \uC548\uB0B4:** \uC0AC\uC6A9\uC790\uAC00 \uC798 \uB530\uB77C\uC62C \uC218 \uC788\uB3C4\uB85D "\uC774\uC81C OOO\uC744 \uD074\uB9AD\uD574\uBCFC\uAE4C\uC694?", "\uD654\uBA74\uC5D0 OOO\uC774 \uB098\uD0C0\uB0AC\uC8E0?" \uC640 \uAC19\uC774 \uCE5C\uC808\uD55C \uC548\uB0B4 \uBA58\uD2B8\uB97C \uCD94\uAC00\uD574\uC8FC\uC138\uC694.
        `;
    } else {
      koreanAudienceDescription = audienceToKorean(audience);
      detailedInstructions = `
            -   **\uD575\uC2EC \uC704\uC8FC \uC124\uBA85:** \uAC01 \uC7A5\uBA74\uC758 \uD575\uC2EC\uC801\uC778 \uD589\uB3D9\uACFC \uADF8 \uACB0\uACFC\uC5D0 \uB300\uD574 \uBA85\uD655\uD558\uACE0 \uAC04\uACB0\uD558\uAC8C \uC124\uBA85\uD574\uC8FC\uC138\uC694.
            -   **\uC815\uD655\uD55C \uC6A9\uC5B4:** \uAE30\uC220\uC801\uC73C\uB85C \uC815\uD655\uD55C \uC6A9\uC5B4\uB97C \uC0AC\uC6A9\uD558\uB418, \uAC04\uACB0\uD568\uC744 \uC720\uC9C0\uD574\uC8FC\uC138\uC694.
            -   **\uB2E8\uACC4\uC758 \uBAA9\uC801:** \uAC01 \uB2E8\uACC4\uAC00 \uC804\uCCB4 \uACFC\uC815\uC5D0\uC11C \uC5B4\uB5A4 \uC5ED\uD560\uC744 \uD558\uB294\uC9C0 \uAC04\uB7B5\uD558\uAC8C \uC5B8\uAE09\uD574\uC8FC\uC138\uC694.
        `;
    }
    const prompt = `
        You are an expert scriptwriter for software tutorial videos.
        Your mission is to create a narration script based on the ordered video frames provided below.

        [Primary Instructions]
        1.  **Goal:** Write a trustworthy guide script that helps users follow along with the video.
        2.  **Tone:** Use a clear, objective tone focused on explaining functionality. Avoid fluff.
        3.  **Target Audience:** '${koreanAudienceDescription}'
        4.  **Script Tone:** '${koreanTone}'
        5.  **Language:** All output must be in Korean.
        6.  **Format (Crucial):** Write a continuous, flowing narration based on the sequence of frames. Do NOT include any scene markers like "Scene #1", "\uC7A5\uBA74 1:", or similar labels in the final output. The script should be a single, clean block of text ready for narration.

        [Detailed Content Instructions]
        ${detailedInstructions}

        [SEO Metadata Generation]
        After generating the main script, create SEO metadata for the video.

        [Final Output Format]
        Your ENTIRE output must be a single, valid JSON object. Do not add any text before or after it.
    `;
    const imageParts = frames.map((frame) => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: frame
      }
    }));
    try {
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }, ...imageParts] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              content: { type: import_genai.Type.STRING, description: "\uC0DD\uC131\uB41C \uC804\uCCB4 \uC601\uC0C1 \uB300\uBCF8." },
              tags: { type: import_genai.Type.STRING, description: "\uC601\uC0C1\uACFC \uAD00\uB828\uB41C \uCF64\uB9C8\uB85C \uAD6C\uBD84\uB41C \uD0DC\uADF8 7\uAC1C." },
              permalink: { type: import_genai.Type.STRING, description: "URL\uC5D0 \uC0AC\uC6A9\uB420 \uC9E7\uACE0 \uAC04\uACB0\uD55C \uC601\uBB38 \uD0A4\uC6CC\uB4DC 1\uAC1C." },
              metaDescription: { type: import_genai.Type.STRING, description: "\uAC80\uC0C9 \uC5D4\uC9C4\uC744 \uC704\uD55C 100\uC790 \uC774\uB0B4\uC758 \uC601\uC0C1 \uC124\uBA85." }
            },
            required: ["content", "tags", "permalink", "metaDescription"]
          }
        }
      });
      const result = JSON.parse(response.text);
      return result;
    } catch (error) {
      console.error("Error calling Gemini API (Video):", error);
      throw new Error("Gemini API\uC640 \uD1B5\uC2E0\uD558\uB294 \uB370 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. API \uD0A4\uAC00 \uC720\uD6A8\uD55C\uC9C0 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
    }
  };
  var combineVideoScripts = async (segments, audience, tone, apiKey, model) => {
    if (!apiKey) {
      throw new Error("Gemini API \uD0A4\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC88C\uCE21 \uC0C1\uB2E8\uC5D0 API \uD0A4\uB97C \uC785\uB825\uD558\uACE0 \uC800\uC7A5\uD574\uC8FC\uC138\uC694.");
    }
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const koreanTone = toneToKorean(tone);
    const koreanAudienceDescription = audienceToKorean(audience);
    const scriptParts = segments.map((segment, index) => `--- \uD074\uB9BD #${index + 1} \uB300\uBCF8 ---
${segment}`).join("\n\n");
    const prompt = `
        You are an expert video script editor tasked with merging several script segments into one master script.

        [Primary Instructions]
        1.  **Goal:** Combine the provided script segments into a single, cohesive, and natural-sounding script for one complete video.
        2.  **Hooking Introduction (Crucial):** At the very beginning of the script, you MUST add a powerful, curiosity-provoking introduction (1-2 sentences). This intro should act as a 'hook' to make the viewer absolutely want to watch the rest of the video.
        3.  **Cohesion:** Ensure smooth and logical transitions between the original parts. The final script must flow as if it was written for a single, continuous recording.
        4.  **Redundancy Removal:** Eliminate repetitive introductions, conclusions, or greetings from the intermediate script segments. Keep only one main intro and one main outro for the entire script.
        5.  **Scene Marker Removal (Crucial):** If any of the provided script segments contain markers like "Scene #1:", "\uC7A5\uBA74 1:", etc., you MUST remove them. The final script should be a clean, continuous narration without any such labels.
        6.  **Target Audience:** '${koreanAudienceDescription}'
        7.  **Script Tone:** '${koreanTone}'
        8.  **Language:** All output must be in Korean.

        [Content to Process]
        Here are the sequential script segments you need to combine:
        ${scriptParts}
        ---

        [SEO Metadata Generation]
        After generating the final unified script, create new, consolidated SEO metadata (tags, permalink, meta description) that accurately reflects the entire combined content.

        [Final Output Format]
        Your ENTIRE output must be a single, valid JSON object, identical in structure to the initial generation.
    `;
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              content: { type: import_genai.Type.STRING, description: "\uC790\uC5F0\uC2A4\uB7FD\uAC8C \uD558\uB098\uB85C \uD569\uCCD0\uC9C4 \uCD5C\uC885 \uC601\uC0C1 \uB300\uBCF8." },
              tags: { type: import_genai.Type.STRING, description: "\uC804\uCCB4 \uC601\uC0C1\uACFC \uAD00\uB828\uB41C \uCF64\uB9C8\uB85C \uAD6C\uBD84\uB41C \uD0DC\uADF8 7\uAC1C." },
              permalink: { type: import_genai.Type.STRING, description: "URL\uC5D0 \uC0AC\uC6A9\uB420 \uC9E7\uACE0 \uAC04\uACB0\uD55C \uC601\uBB38 \uD0A4\uC6CC\uB4DC 1\uAC1C." },
              metaDescription: { type: import_genai.Type.STRING, description: "\uAC80\uC0C9 \uC5D4\uC9C4\uC744 \uC704\uD55C 100\uC790 \uC774\uB0B4\uC758 \uC804\uCCB4 \uC601\uC0C1 \uC124\uBA85." }
            },
            required: ["content", "tags", "permalink", "metaDescription"]
          }
        }
      });
      const result = JSON.parse(response.text);
      return result;
    } catch (error) {
      console.error("Error calling Gemini API (Combine Scripts):", error);
      throw new Error("Gemini API\uC640 \uD1B5\uC2E0\uD558\uC5EC \uCD5C\uC885 \uB300\uBCF8\uC744 \uC0DD\uC131\uD558\uB294 \uB370 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
    }
  };

  // components/OptionSelector.tsx
  var import_jsx_runtime = __require("react/jsx-runtime");
  var OptionSelector = ({ label, options, optionLabels, selectedValue, onChange }) => {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-slate-300 mb-2", children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex flex-wrap gap-2", children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          onClick: () => onChange(option),
          className: `px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${selectedValue === option ? "bg-cyan-500 text-white shadow-md" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`,
          children: optionLabels[option]
        },
        option
      )) })
    ] });
  };
  var OptionSelector_default = OptionSelector;

  // components/CodeInput.tsx
  var import_react = __require("react");

  // components/Icons.tsx
  var import_jsx_runtime2 = __require("react/jsx-runtime");
  var CodeIcon = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" }) });
  var WandIcon = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }) });
  var UploadIcon = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" }) });
  var FolderIcon = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" }) });
  var VideoIcon = ({ size = "small" }) => {
    const className = size === "large" ? "h-12 w-12" : "h-5 w-5";
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" }) });
  };
  var CopyIcon = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) });

  // components/CodeInput.tsx
  var import_jsx_runtime3 = __require("react/jsx-runtime");
  var IGNORED_DIRS = ["node_modules", ".git", "dist", "build", "__pycache__", "venv", ".venv", "env"];
  var IGNORED_EXTENSIONS = [".lock", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".env"];
  var CodeInput = ({ code, setCode }) => {
    const fileInputRef = (0, import_react.useRef)(null);
    const folderInputRef = (0, import_react.useRef)(null);
    const [isReadingFiles, setIsReadingFiles] = (0, import_react.useState)(false);
    const handleFileChange = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result;
          setCode(text);
        };
        reader.readAsText(file);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    const handleFolderChange = async (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        return;
      }
      setIsReadingFiles(true);
      setCode("\uD3F4\uB354\uC758 \uD30C\uC77C\uB4E4\uC744 \uC77D\uB294 \uC911...");
      const filteredFiles = Array.from(files).filter((file) => {
        const pathParts = file.webkitRelativePath.split("/");
        const isIgnoredDir = pathParts.some((part) => IGNORED_DIRS.includes(part));
        const isIgnoredExt = IGNORED_EXTENSIONS.some((ext) => file.name.endsWith(ext));
        return !isIgnoredDir && !isIgnoredExt;
      });
      const fileReadPromises = filteredFiles.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result;
            const formattedContent = `// --- File: ${file.webkitRelativePath} ---

${content}

`;
            resolve(formattedContent);
          };
          reader.onerror = () => {
            resolve(`// --- Error reading file: ${file.webkitRelativePath} ---

`);
          };
          reader.readAsText(file);
        });
      });
      try {
        const allFileContents = await Promise.all(fileReadPromises);
        if (allFileContents.length > 0) {
          setCode(allFileContents.join(""));
        } else {
          setCode("\uC5C5\uB85C\uB4DC\uD55C \uD3F4\uB354\uC5D0\uC11C \uBD84\uC11D\uD560 \uC218 \uC788\uB294 \uCF54\uB4DC \uD30C\uC77C\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. (node_modules \uB4F1\uC740 \uC790\uB3D9\uC73C\uB85C \uC81C\uC678\uB429\uB2C8\uB2E4)");
        }
      } catch (error) {
        console.error(error);
        setCode("\uD3F4\uB354\uB97C \uC77D\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC77C\uBD80 \uD30C\uC77C\uC774 \uD14D\uC2A4\uD2B8 \uD615\uC2DD\uC774 \uC544\uB2D0 \uC218 \uC788\uC2B5\uB2C8\uB2E4.");
      } finally {
        setIsReadingFiles(false);
        if (folderInputRef.current) {
          folderInputRef.current.value = "";
        }
      }
    };
    const handleFileButtonClick = () => {
      fileInputRef.current?.click();
    };
    const handleFolderButtonClick = () => {
      folderInputRef.current?.click();
    };
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "relative flex-grow flex flex-col", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "textarea",
        {
          value: code,
          onChange: (e) => setCode(e.target.value),
          placeholder: "\uC5EC\uAE30\uC5D0 \uBD84\uC11D\uD560 \uCF54\uB4DC\uB97C \uBD99\uC5EC\uB123\uAC70\uB098 \uD30C\uC77C/\uD3F4\uB354\uB97C \uC5C5\uB85C\uB4DC\uD558\uC138\uC694...",
          className: "w-full h-full flex-grow p-4 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors custom-scrollbar disabled:opacity-50",
          style: { minHeight: "200px", resize: "vertical" },
          disabled: isReadingFiles
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "input",
        {
          type: "file",
          ref: fileInputRef,
          onChange: handleFileChange,
          className: "hidden",
          accept: ".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.rs,.html,.css,.md, .txt"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "input",
        {
          type: "file",
          ref: folderInputRef,
          onChange: handleFolderChange,
          className: "hidden",
          webkitdirectory: "",
          mozdirectory: ""
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "absolute bottom-3 right-3 flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            onClick: handleFolderButtonClick,
            className: "flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1.5 px-3 rounded-md text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            title: "\uD3F4\uB354 \uC5C5\uB85C\uB4DC",
            disabled: isReadingFiles,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FolderIcon, {}),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "\uD3F4\uB354 \uC5C5\uB85C\uB4DC" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            onClick: handleFileButtonClick,
            className: "flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1.5 px-3 rounded-md text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            title: "\uD30C\uC77C \uC5C5\uB85C\uB4DC",
            disabled: isReadingFiles,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(UploadIcon, {}),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "\uD30C\uC77C \uC5C5\uB85C\uB4DC" })
            ]
          }
        )
      ] })
    ] });
  };
  var CodeInput_default = CodeInput;

  // components/VideoInput.tsx
  var import_react2 = __require("react");
  var import_jsx_runtime4 = __require("react/jsx-runtime");
  var FRAME_CAPTURE_INTERVAL_MS = 1e3;
  var VideoInput = ({ onFramesExtracted, setIsLoading, setParentError, processedClipToken }) => {
    const videoRef = (0, import_react2.useRef)(null);
    const canvasRef = (0, import_react2.useRef)(null);
    const fileInputRef = (0, import_react2.useRef)(null);
    const abortControllerRef = (0, import_react2.useRef)(null);
    const videoSrcRef = (0, import_react2.useRef)(null);
    const [statusMessage, setStatusMessage] = (0, import_react2.useState)("\uC5C5\uB85C\uB4DC\uD560 \uC601\uC0C1\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694.");
    const [isProcessing, setIsProcessing] = (0, import_react2.useState)(false);
    const isFirstRun = (0, import_react2.useRef)(true);
    const fullReset = (0, import_react2.useCallback)(() => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      if (videoSrcRef.current) {
        URL.revokeObjectURL(videoSrcRef.current);
        videoSrcRef.current = null;
      }
      const video = videoRef.current;
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
      onFramesExtracted([]);
      setStatusMessage("\uC5C5\uB85C\uB4DC\uD560 \uC601\uC0C1\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsProcessing(false);
      setIsLoading(false);
    }, [onFramesExtracted, setIsLoading]);
    (0, import_react2.useEffect)(() => {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }
      fullReset();
    }, [processedClipToken, fullReset]);
    (0, import_react2.useEffect)(() => {
      return () => {
        fullReset();
      };
    }, [fullReset]);
    const handleFileChange = async (event) => {
      const file = event.target.files?.[0];
      if (!file)
        return;
      fullReset();
      setParentError(null);
      setIsProcessing(true);
      setIsLoading(true);
      setStatusMessage("\uC601\uC0C1 \uB85C\uB529 \uC911...");
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        setParentError("\uBE44\uB514\uC624 \uB610\uB294 \uCE94\uBC84\uC2A4 \uC694\uC18C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
        setIsProcessing(false);
        setIsLoading(false);
        return;
      }
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;
      videoSrcRef.current = URL.createObjectURL(file);
      video.src = videoSrcRef.current;
      try {
        await new Promise((resolve, reject) => {
          const handleAbort = () => reject(new DOMException("Aborted", "AbortError"));
          signal.addEventListener("abort", handleAbort, { once: true });
          video.addEventListener("error", () => reject(new Error("\uBE44\uB514\uC624 \uD30C\uC77C\uC744 \uC77D\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.")), { once: true });
          video.addEventListener("loadedmetadata", () => {
            signal.removeEventListener("abort", handleAbort);
            resolve();
          }, { once: true });
        });
        if (video.duration > 120) {
          throw new Error("\uC601\uC0C1 \uAE38\uC774\uB294 2\uBD84\uC744 \uCD08\uACFC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          throw new Error("\uCE94\uBC84\uC2A4\uB97C \uCD08\uAE30\uD654\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
        }
        const frames = [];
        const duration = video.duration;
        let currentTime = 0;
        video.muted = true;
        while (currentTime <= duration) {
          signal.throwIfAborted();
          video.currentTime = currentTime;
          await new Promise((resolve) => {
            video.addEventListener("seeked", () => resolve(), { once: true });
          });
          signal.throwIfAborted();
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          frames.push(frameDataUrl.split(",")[1]);
          setStatusMessage(`\uC601\uC0C1 \uD504\uB808\uC784 \uCD94\uCD9C \uC911... (${Math.round(Math.min(currentTime, duration) / duration * 100)}%)`);
          currentTime += FRAME_CAPTURE_INTERVAL_MS / 1e3;
        }
        onFramesExtracted(frames);
        setStatusMessage(`\uD504\uB808\uC784 ${frames.length}\uAC1C \uCD94\uCD9C \uC644\uB8CC! '\uD604\uC7AC \uD074\uB9BD \uB300\uBCF8 \uC0DD\uC131' \uBC84\uD2BC\uC744 \uB204\uB974\uC138\uC694.`);
      } catch (error) {
        if (error.name !== "AbortError") {
          setParentError(error.message || "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");
          setStatusMessage(`\uC624\uB958: ${error.message}`);
        } else {
          setStatusMessage("\uC791\uC5C5\uC774 \uCDE8\uC18C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
        }
        onFramesExtracted([]);
      } finally {
        setIsProcessing(false);
        setIsLoading(false);
        if (videoSrcRef.current) {
          URL.revokeObjectURL(videoSrcRef.current);
          videoSrcRef.current = null;
        }
        if (fileInputRef.current)
          fileInputRef.current.value = "";
      }
    };
    const handleUploadClick = () => {
      fileInputRef.current?.click();
    };
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex flex-col items-center justify-center w-full h-full p-4 bg-slate-900 border-2 border-dashed border-slate-700 rounded-lg text-slate-400 min-h-[300px]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("video", { ref: videoRef, className: "hidden", muted: true, playsInline: true }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("canvas", { ref: canvasRef, className: "hidden" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "file",
          ref: fileInputRef,
          onChange: handleFileChange,
          className: "hidden",
          accept: "video/mp4,video/webm,video/ogg",
          disabled: isProcessing
        }
      ),
      isProcessing ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("svg", { className: "animate-spin h-10 w-10 text-teal-500 mb-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "mt-4 text-lg font-semibold text-slate-300 text-center", children: statusMessage })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(VideoIcon, { size: "large" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "mt-4 text-lg font-semibold text-slate-300 text-center", children: statusMessage }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-sm text-slate-500 mt-1", children: "\uD504\uB85C\uADF8\uB7A8 \uC0AC\uC6A9\uBC95\uC744 \uB179\uD654\uD55C \uC601\uC0C1\uC744 \uC5C5\uB85C\uB4DC\uD558\uC138\uC694. (\uCD5C\uB300 2\uBD84)" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "button",
          {
            onClick: handleUploadClick,
            className: "mt-6 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-5 rounded-lg transition-colors",
            disabled: isProcessing,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(UploadIcon, {}),
              "\uC601\uC0C1 \uC5C5\uB85C\uB4DC"
            ]
          }
        )
      ] })
    ] });
  };
  var VideoInput_default = VideoInput;

  // components/GeneratedContentDisplay.tsx
  var import_react3 = __require("react");
  var import_jsx_runtime5 = __require("react/jsx-runtime");
  var loadingMessages = [
    "AI\uAC00 \uCF58\uD150\uCE20\uB97C \uC0DD\uC131\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4...",
    "\uD504\uB85C\uC81D\uD2B8 \uAD6C\uC870 \uBD84\uC11D \uC911...",
    "\uD575\uC2EC \uAE30\uB2A5 \uD30C\uC545 \uC911...",
    "AI\uAC00 \uCD08\uC548\uC744 \uC791\uC131\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4...",
    "\uAC70\uC758 \uB2E4 \uB410\uC2B5\uB2C8\uB2E4! \uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824\uC8FC\uC138\uC694."
  ];
  var SimpleMarkdown = ({ text }) => {
    const createMarkup = (text2) => {
      let html = text2.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/__(.*?)__/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/_(.*?)_/g, "<em>$1</em>").replace(/`(.*?)`/g, "<code>$1</code>").replace(/^(#{1,6})\s(.*)/gm, (match, hashes, content) => {
        const level = hashes.length;
        return `<h${level}>${content}</h${level}>`;
      }).replace(/^- (.*)/gm, "<li>$1</li>").replace(/(?:\r\n|\r|\n){2,}/g, "<br/><br/>");
      html = html.replace(/(<li.*<\/li>)/gs, "<ul>$1</ul>");
      return { __html: html };
    };
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { dangerouslySetInnerHTML: createMarkup(text) });
  };
  var CustomTagDisplay = ({ text, onContentUpdate }) => {
    const containerRef = (0, import_react3.useRef)(null);
    const fileInputRef = (0, import_react3.useRef)(null);
    const currentImageToUpdateId = (0, import_react3.useRef)(null);
    (0, import_react3.useEffect)(() => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const images = doc.querySelectorAll("img");
      let wasChanged = false;
      images.forEach((img) => {
        if (!img.dataset.imageId) {
          img.dataset.imageId = `interactive-img-${crypto.randomUUID()}`;
          wasChanged = true;
        }
      });
      if (wasChanged) {
        onContentUpdate(doc.body.innerHTML);
        return;
      }
      const container = containerRef.current;
      if (!container)
        return;
      const handleClick = (e) => {
        const target = e.target;
        if (target.tagName === "IMG" && target.dataset.imageId) {
          e.preventDefault();
          currentImageToUpdateId.current = target.dataset.imageId;
          fileInputRef.current?.click();
        }
      };
      const handleMouseOver = (e) => {
        const target = e.target;
        if (target.tagName === "IMG") {
          target.style.cursor = "pointer";
          target.style.transition = "outline 0.2s ease-in-out";
          target.title = "\uD074\uB9AD\uD558\uC5EC \uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC";
          target.style.outline = "3px solid #4caf50";
          target.style.outlineOffset = "2px";
        }
      };
      const handleMouseOut = (e) => {
        const target = e.target;
        if (target.tagName === "IMG") {
          target.style.outline = "none";
        }
      };
      container.addEventListener("click", handleClick);
      container.addEventListener("mouseover", handleMouseOver);
      container.addEventListener("mouseout", handleMouseOut);
      return () => {
        container.removeEventListener("click", handleClick);
        container.removeEventListener("mouseover", handleMouseOver);
        container.removeEventListener("mouseout", handleMouseOut);
      };
    }, [text, onContentUpdate]);
    const handleFileChange = (0, import_react3.useCallback)((event) => {
      const file = event.target.files?.[0];
      const imageId = currentImageToUpdateId.current;
      if (!file || !imageId || !text) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result;
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        const imageToUpdate = doc.querySelector(`img[data-image-id="${imageId}"]`);
        if (imageToUpdate) {
          imageToUpdate.setAttribute("src", dataUrl);
          const newHtmlContent = doc.body.innerHTML;
          onContentUpdate(newHtmlContent);
        }
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      currentImageToUpdateId.current = null;
    }, [text, onContentUpdate]);
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "div",
        {
          ref: containerRef,
          dangerouslySetInnerHTML: { __html: text }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "input",
        {
          type: "file",
          ref: fileInputRef,
          className: "hidden",
          accept: "image/png,image/jpeg,image/gif,image/webp",
          onChange: handleFileChange
        }
      )
    ] });
  };
  var CopyButton = ({ textToCopy }) => {
    const [copied, setCopied] = (0, import_react3.useState)(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
      "button",
      {
        onClick: handleCopy,
        className: `flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-md transition-colors ${copied ? "bg-emerald-500 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CopyIcon, {}),
          copied ? "\uBCF5\uC0AC \uC644\uB8CC!" : "\uBCF5\uC0AC"
        ]
      }
    );
  };
  var ScriptChunk = ({ chunk, index }) => {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50 relative", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "absolute top-2 right-2", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CopyButton, { textToCopy: chunk }) }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: "text-xs font-bold text-slate-500 mb-2", children: [
        "\uB300\uBCF8 #",
        index + 1,
        " (\uAE00\uC790 \uC218: ",
        chunk.length,
        ")"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("pre", { className: "whitespace-pre-wrap font-sans text-sm text-slate-700", children: chunk })
    ] });
  };
  var GeneratedContentDisplay = ({
    content,
    isLoading,
    error,
    isCustomTemplate,
    features,
    selectedFeature,
    tags,
    permalink,
    metaDescription,
    scriptSegments,
    mode,
    onFeatureSelect,
    onBackToFeatures,
    onContentUpdate
  }) => {
    const [displayedContent, setDisplayedContent] = (0, import_react3.useState)("");
    const [currentLoadingMessage, setCurrentLoadingMessage] = (0, import_react3.useState)(loadingMessages[0]);
    (0, import_react3.useEffect)(() => {
      if (isLoading) {
        const intervalId = setInterval(() => {
          setCurrentLoadingMessage((prevMessage) => {
            const currentIndex = loadingMessages.indexOf(prevMessage);
            const nextIndex = (currentIndex + 1) % loadingMessages.length;
            return loadingMessages[nextIndex];
          });
        }, 3e3);
        return () => clearInterval(intervalId);
      }
    }, [isLoading]);
    (0, import_react3.useEffect)(() => {
      if (isLoading || error || !content) {
        setDisplayedContent("");
        return;
      }
      if (mode === "video" || isCustomTemplate) {
        setDisplayedContent(content);
        return;
      }
      let i = 0;
      const typingSpeed = 10;
      setDisplayedContent("");
      const intervalId = setInterval(() => {
        if (i < content.length) {
          i = Math.min(i + 10, content.length);
          setDisplayedContent(content.substring(0, i));
        } else {
          setDisplayedContent(content);
          clearInterval(intervalId);
        }
      }, typingSpeed);
      return () => clearInterval(intervalId);
    }, [content, isLoading, error, isCustomTemplate, mode]);
    const chunkString = (str, length) => {
      const chunks = [];
      for (let i = 0; i < str.length; i += length) {
        chunks.push(str.substring(i, i + length));
      }
      return chunks;
    };
    const finalScriptChunks = mode === "video" && content ? chunkString(content, 1e3) : [];
    const showSeoSection = !isLoading && !error && content && tags;
    if (isLoading) {
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "w-full h-full flex flex-col items-center justify-center text-slate-500", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("svg", { className: "animate-spin h-10 w-10 text-teal-500 mb-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "font-semibold text-lg text-slate-700", children: currentLoadingMessage }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "text-sm text-slate-500", children: "\uB300\uC6A9\uB7C9 \uD3F4\uB354 \uB610\uB294 \uC601\uC0C1\uC740 \uC2DC\uAC04\uC774 \uB354 \uC18C\uC694\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4." })
      ] });
    }
    if (error) {
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "w-full h-full flex flex-col items-center justify-center text-red-700 bg-red-50 border border-red-200 rounded-lg p-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: "font-bold text-xl mb-2", children: "\uC624\uB958 \uBC1C\uC0DD" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { children: error })
      ] });
    }
    if (features.length > 0 && !selectedFeature) {
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "w-full h-full flex flex-col", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { className: "text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2", children: "\uAE30\uB2A5 \uC120\uD0DD" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex-grow flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: "text-slate-600 mb-6 text-center", children: [
            "\uC774 \uD504\uB85C\uADF8\uB7A8\uC5D0\uC11C \uB2E4\uC74C \uAE30\uB2A5\uB4E4\uC744 \uBC1C\uACAC\uD588\uC2B5\uB2C8\uB2E4.",
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("br", {}),
            "\uAC00\uC774\uB4DC\uB97C \uC0DD\uC131\uD560 \uAE30\uB2A5\uC744 \uC120\uD0DD\uD558\uC138\uC694."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "flex flex-wrap gap-4 justify-center", children: features.map((feature, index) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "button",
            {
              onClick: () => onFeatureSelect(feature),
              className: "bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-teal-500/50",
              children: feature
            },
            index
          )) })
        ] })
      ] });
    }
    if (mode === "video" && scriptSegments.length > 0) {
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "w-full h-full flex flex-col", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { className: "text-2xl font-bold text-slate-800 mb-4 border-b-2 border-slate-200 pb-2", children: "\uC0DD\uC131\uB41C \uD074\uB9BD\uBCC4 \uB300\uBCF8" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "w-full flex-grow overflow-y-auto light-scrollbar pr-2", children: scriptSegments.map((segment, index) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: "text-sm font-bold text-slate-600 mb-2", children: [
            "\uD074\uB9BD #",
            index + 1,
            " \uB300\uBCF8"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "text-slate-700 whitespace-pre-wrap", children: segment.content })
        ] }, segment.id)) })
      ] });
    }
    if (!content && !isLoading) {
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "w-full h-full flex flex-col items-center justify-center text-slate-400", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "text-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", className: "mx-auto h-12 w-12", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: "mt-2 text-lg font-medium text-slate-700", children: "\uC0DD\uC131\uB41C \uCF58\uD150\uCE20\uAC00 \uC5EC\uAE30\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4." }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "mt-1 text-sm text-slate-500", children: "\uC635\uC158\uC744 \uC120\uD0DD\uD558\uACE0 '\uC0DD\uC131' \uBC84\uD2BC\uC744 \uB20C\uB7EC\uC8FC\uC138\uC694." })
      ] }) });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "w-full h-full flex flex-col", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex justify-between items-center mb-4 border-b-2 border-slate-200 pb-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { className: "text-2xl font-bold text-slate-800", children: mode === "video" ? "\uCD5C\uC885 \uC644\uC131 \uB300\uBCF8" : selectedFeature ? `'${selectedFeature}' \uAC00\uC774\uB4DC` : "\uC0DD\uC131\uB41C \uCF58\uD150\uCE20" }),
        selectedFeature && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            onClick: onBackToFeatures,
            className: "bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-1.5 px-3 rounded-md text-xs transition-colors",
            children: "\u2190 \uAE30\uB2A5 \uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "w-full flex-grow overflow-y-auto light-scrollbar pr-2", id: "content-container", children: finalScriptChunks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { children: finalScriptChunks.map((chunk, index) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(ScriptChunk, { chunk, index }, index)) }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: isCustomTemplate ? "custom-template-view max-w-none" : "prose-light-styles max-w-none", children: isCustomTemplate ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CustomTagDisplay, { text: content, onContentUpdate }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(SimpleMarkdown, { text: displayedContent }) }) }),
      showSeoSection && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "mt-6 pt-4 border-t-2 border-slate-200", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { className: "text-xl font-bold text-slate-800 mb-3", children: "\uBE14\uB85C\uADF8 SEO \uC815\uBCF4" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "space-y-3 text-sm", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "font-semibold text-slate-600 w-28 shrink-0", children: "\uD0DC\uADF8:" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "flex-grow text-slate-800 bg-slate-100 p-2 rounded-md", children: tags }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CopyButton, { textToCopy: tags })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "font-semibold text-slate-600 w-28 shrink-0", children: "\uD37C\uBA38\uB9C1\uD06C:" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "flex-grow text-slate-800 bg-slate-100 p-2 rounded-md font-mono", children: permalink }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CopyButton, { textToCopy: permalink })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "font-semibold text-slate-600 w-28 shrink-0", children: "\uBA54\uD0C0 \uB514\uC2A4\uD06C\uB9BD\uC158:" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "flex-grow text-slate-800 bg-slate-100 p-2 rounded-md", children: metaDescription }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CopyButton, { textToCopy: metaDescription })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "mt-4 pt-4 border-t border-slate-200", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "button",
          {
            onClick: () => navigator.clipboard.writeText(content),
            className: "w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CopyIcon, {}),
              mode === "video" ? "\uC804\uCCB4 \uB300\uBCF8 \uBCF5\uC0AC\uD558\uAE30" : "\uC804\uCCB4 HTML \uBCF5\uC0AC\uD558\uAE30"
            ]
          }
        ) })
      ] })
    ] });
  };
  var GeneratedContentDisplay_default = GeneratedContentDisplay;

  // components/ApiKeyInput.tsx
  var import_react4 = __require("react");
  var import_jsx_runtime6 = __require("react/jsx-runtime");
  var ApiKeyInput = ({ onApiKeyUpdate }) => {
    const [apiKey, setApiKey] = (0, import_react4.useState)("");
    const [isSaved, setIsSaved] = (0, import_react4.useState)(false);
    (0, import_react4.useEffect)(() => {
      const savedKey = localStorage.getItem("gemini-api-key");
      if (savedKey) {
        setApiKey(savedKey);
        onApiKeyUpdate(savedKey);
      }
    }, [onApiKeyUpdate]);
    const handleSave = () => {
      localStorage.setItem("gemini-api-key", apiKey);
      onApiKeyUpdate(apiKey);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3e3);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("label", { htmlFor: "api-key-input", className: "block text-sm font-medium text-slate-300 mb-2", children: "Gemini API \uD0A4" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            id: "api-key-input",
            type: "password",
            value: apiKey,
            onChange: (e) => setApiKey(e.target.value),
            placeholder: "API \uD0A4\uB97C \uC5EC\uAE30\uC5D0 \uC785\uB825\uD558\uC138\uC694",
            className: "flex-grow p-2 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            onClick: handleSave,
            className: "bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm",
            children: "\uC800\uC7A5"
          }
        )
      ] }),
      isSaved && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-xs text-emerald-400 mt-2", children: "API \uD0A4\uAC00 \uBE0C\uB77C\uC6B0\uC800\uC5D0 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4." })
    ] });
  };
  var ApiKeyInput_default = ApiKeyInput;

  // App.tsx
  var import_jsx_runtime7 = __require("react/jsx-runtime");
  var defaultCustomTemplate = `<!-- \u2705 \uC81C\uBAA9: title_block -->
<h1>\uD504\uB85C\uADF8\uB7A8 \uC774\uB984</h1>

<!-- \u2705 \uC778\uC0BF\uB9D0 \uBC15\uC2A4: intro_hook_block -->
<div style="background: #ffffff; border-radius: 20px; padding: 30px; margin: 30px 0; box-shadow: 0 10px 25px #4caf501a; font-family: 'Noto Sans KR', sans-serif; border: 1px solid #4caf5026; position: relative;">
  <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: linear-gradient(135deg, #4caf501a, transparent); border-radius: 0 20px 0 100%;"></div>
  <p style="font-size: 1.2rem; line-height: 1.8; margin-bottom: 1.2em; color: #4caf50; font-weight: 700;">
    "\uBE14\uB85C\uADF8 \uD3EC\uC2A4\uD305, \uB354 \uC774\uC0C1 \uC5B4\uB835\uC9C0 \uC54A\uC544\uC694!"
  </p>
  <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 0; color: #4caf50;">
    \uB9E4\uBC88 \uAE00\uC4F0\uAE30\uAC00 \uB9C9\uB9C9\uD558\uC168\uB098\uC694? \uC774 \uD504\uB85C\uADF8\uB7A8\uC774 \uC5EC\uB7EC\uBD84\uC758 \uCC3D\uC758\uC801\uC778 \uC544\uC774\uB514\uC5B4\uB97C \uBA4B\uC9C4 \uBE14\uB85C\uADF8 \uD3EC\uC2A4\uD2B8\uB85C \uC644\uC131\uD574 \uB4DC\uB9BD\uB2C8\uB2E4. \uAC04\uB2E8\uD55C \uD0A4\uC6CC\uB4DC \uC785\uB825\uB9CC\uC73C\uB85C \uC804\uBB38\uAC00 \uC218\uC900\uC758 \uAE00\uC744 \uB9CC\uB098\uBCF4\uC138\uC694.
  </p>
</div>

<!-- \u2705 \uC18C\uC81C\uBAA9 \uC2A4\uD0C0\uC77C (H2 \uBC88\uD638 \uBC15\uC2A4 \uD3EC\uD568): subtitle_h2_block -->
<div style="position: relative; background-color: #ffffff; padding: 20px 25px 20px 70px; border: 1px solid #4caf5080; margin-bottom: 20px;"><div style="position: absolute; top: -1px; left: 15px; width: 28px; height: 36px; background-color: #4caf50; clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%); color: #ffffff; font-size: 16px; font-weight: bold; display: flex; align-items: center; justify-content: center;">1</div><h2 id="intro" style="margin: 0; color: #4caf50;"><b>\uD504\uB85C\uADF8\uB7A8 \uC18C\uAC1C</b></h2></div>

<!-- \u2705 \uC77C\uBC18 \uBCF8\uBB38\uBC0F \uC11C\uB860 \uD14D\uC2A4\uD2B8 \uC2A4\uD0C0\uC77C: text_paragraph_block -->
<p style="font-size: 1.1rem; line-height: 1.8; color: #333333; margin-bottom: 1em;">\uBCF8 \uD504\uB85C\uADF8\uB7A8\uC740 \uBCF5\uC7A1\uD55C \uC124\uC815 \uC5C6\uC774 \uB204\uAD6C\uB098 \uC27D\uAC8C \uBE14\uB85C\uADF8 \uD3EC\uC2A4\uD305\uC744 \uC791\uC131\uD560 \uC218 \uC788\uB3C4\uB85D \uB3D5\uB294 \uAC15\uB825\uD55C \uC790\uB3D9 \uAE00\uC4F0\uAE30 \uB3C4\uC6B0\uBBF8\uC785\uB2C8\uB2E4. \uCD5C\uC2E0 AI \uAE30\uC220\uC744 \uD65C\uC6A9\uD558\uC5EC \uC0AC\uC6A9\uC790\uAC00 \uC6D0\uD558\uB294 \uC8FC\uC81C\uC640 \uC2A4\uD0C0\uC77C\uC5D0 \uB9DE\uB294 \uACE0\uD488\uC9C8\uC758 \uCF58\uD150\uCE20\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4.</p>

<!-- \u2705 \uB9AC\uC2A4\uD2B8 \uC2A4\uD0C0\uC77C: list_block_01 -->
<ul style="list-style: none; padding: 0; margin: 20px 0;"><li style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 20px; color: #333333;"><div><p style="margin: 0 0 5px 0; font-weight: 700; font-size: 16px; color: #4caf50;">1. \uC8FC\uC694 \uAE30\uB2A5</p><p style="margin: 0; font-weight: 400; font-size: 16px; line-height: 1.9;">\uB2E4\uC591\uD55C \uAE00\uC4F0\uAE30 \uBAA8\uB4DC(\uC77C\uBC18, \uC804\uBB38, \uC694\uB9AC \uB4F1)\uB97C \uC9C0\uC6D0\uD558\uC5EC \uC5B4\uB5A4 \uC8FC\uC81C\uB4E0 \uB9DE\uCDA4\uD615 \uC791\uC131\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4.</p></div></li></ul>

<!-- \u2705 \uD14C\uC774\uBE14 \uC2A4\uD0C0\uC77C: table_block_01 -->
<div style="overflow-x: auto; margin: 30px 0;"><table style="width: 100%; border-collapse: collapse; border: 2px solid #4caf50; font-weight: 600; font-family: 'Noto Sans KR', sans-serif;"><thead style="background: #4caf50; color: white;"><tr><th style="padding: 15px; border: 1px solid #4caf5080;">\uAE30\uB2A5</th><th style="padding: 15px; border: 1px solid #4caf5080;">\uC124\uBA85</th><th style="padding: 15px; border: 1px solid #4caf5080;">\uC0AC\uC6A9\uBC95</th></tr></thead><tbody><tr style="background: #ffffff;"><td style="padding: 15px; border: 1px solid #4caf5080; color: #333333;">\uC790\uB3D9 \uCD08\uC548 \uC791\uC131</td><td style="padding: 15px; border: 1px solid #4caf5080; color: #333333;">\uD575\uC2EC \uD0A4\uC6CC\uB4DC \uC785\uB825 \uC2DC AI\uAC00 \uAE00\uC758 \uBF08\uB300\uB97C \uB9CC\uB4ED\uB2C8\uB2E4.</td><td style="padding: 15px; border: 1px solid #4caf5080; color: #333333;">'\uCD08\uC548' \uBC84\uD2BC \uD074\uB9AD \uD6C4 \uD0A4\uC6CC\uB4DC \uC785\uB825</td></tr></tbody></table></div>

<!-- \u2705 \uC774\uBBF8\uC9C0 + \uCEA1\uC158: image_block_with_caption -->
<div style="margin: 30px 0; text-align: center;">
  <figure style="margin: 0; padding: 15px; background: #ffffff; border: 1px solid #4caf5026; border-radius: 20px; box-shadow: 0 10px 25px #4caf501a;">
    <img src="image_placeholder.png" alt="\uC0AC\uC6A9\uC790\uAC00 \uCEA1\uCC98\uD574\uC57C \uD560 \uD654\uBA74\uC5D0 \uB300\uD55C \uAD6C\uCCB4\uC801\uC778 \uC9C0\uC2DC\uC0AC\uD56D\uC774 \uC5EC\uAE30\uC5D0 \uB4E4\uC5B4\uAC11\uB2C8\uB2E4." style="max-width: 100%; height: auto; border-radius: 12px; border: 1px solid #4caf5026;">
    <figcaption style="margin-top: 15px; font-size: 0.95rem; color: #4caf50; line-height: 1.6;">
      \uC774\uBBF8\uC9C0\uC5D0 \uB300\uD55C \uCE5C\uC808\uD55C \uC124\uBA85(\uCEA1\uC158)\uC774 \uC5EC\uAE30\uC5D0 \uB4E4\uC5B4\uAC11\uB2C8\uB2E4.
    </figcaption>
  </figure>
</div>

<!-- \u2705 \uC774\uBBF8\uC9C0\uD14D\uC2A4\uD2B8\uC870\uD569 \uC2A4\uD0C0\uC77C: image_text_combo_block_01 -->
<div style="background: #ffffff; border-radius: 20px; padding: 30px; box-shadow: 0 10px 25px #4caf501a; font-family: 'Noto Sans KR', sans-serif; display: flex; flex-direction: column; gap: 30px; margin: 30px 0;"><h3 style="font-size: 2em; margin-bottom: 40px; color: #4caf50;">\uC0AC\uC6A9 \uC804 \uC900\uBE44\uC0AC\uD56D</h3><div style="display: flex; gap: 20px;  align-items: center;"><img src="image_placeholder.png" alt="\uD504\uB85C\uADF8\uB7A8 \uC124\uCE58 \uC544\uC774\uCF58" style="width: 150px; height: auto; border-radius: 8px; box-shadow: 0 6px 15px #4caf501a; border: 1px solid #4caf5026;"><div style="flex: 1;"><h3 style="font-size: 1.3rem; margin-bottom: 10px; color: #4caf50;">1. \uD504\uB85C\uADF8\uB7A8 \uC124\uCE58</h3><p style="font-size: 1.1rem; line-height: 1.8; color: #333333;">\uACF5\uC2DD \uD648\uD398\uC774\uC9C0\uC5D0\uC11C \uCD5C\uC2E0 \uBC84\uC804\uC758 \uC124\uCE58 \uD30C\uC77C\uC744 \uB2E4\uC6B4\uB85C\uB4DC\uD558\uC5EC \uC2E4\uD589\uD569\uB2C8\uB2E4. \uC124\uCE58 \uACFC\uC815\uC740 \uB9E4\uC6B0 \uAC04\uB2E8\uD558\uBA70, \uBA87 \uBC88\uC758 \uD074\uB9AD\uB9CC\uC73C\uB85C \uC644\uB8CC\uB429\uB2C8\uB2E4.</p></div></div><div style="display: flex; gap: 20px;  align-items: center;"><img src="image_placeholder.png" alt="API \uD0A4 \uBC1C\uAE09 \uD654\uBA74 \uC608\uC2DC" style="width: 150px; height: auto; border-radius: 8px; box-shadow: 0 6px 15px #4caf501a; border: 1px solid #4caf5026;"><div style="flex: 1;"><h3 style="font-size: 1.3rem; margin-bottom: 10px; color: #4caf50;">2. (\uC120\uD0DD) API \uD0A4 \uB4F1\uB85D</h3><p style="font-size: 1.1rem; line-height: 1.8; color: #333333;">\uB354 \uAC15\uB825\uD55C AI \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD558\uACE0 \uC2F6\uB2E4\uBA74, \uC124\uC815 \uBA54\uB274\uC5D0\uC11C \uAC1C\uC778 API \uD0A4\uB97C \uB4F1\uB85D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uB4F1\uB85D \uBC29\uBC95\uC740 \uACF5\uC2DD \uBB38\uC11C\uB97C \uCC38\uACE0\uD574 \uC8FC\uC138\uC694.</p></div></div></div>

<!-- \u2705 \uCE74\uB4DC \uC2A4\uD0C0\uC77C: card_block_01 -->
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: stretch; gap: 20px; margin-bottom: 30px;"><div style="width: calc(50% - 10px); background: #ffffff; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px #4caf501a; box-sizing: border-box;"><h4 style="margin-top: 0; color: #4caf50;">\uB2E4\uC591\uD55C \uAE00\uC4F0\uAE30 \uBAA8\uB4DC</h4><p style="color: #333333;">'\uC77C\uBC18 \uD3EC\uC2A4\uD305' \uBAA8\uB4DC\uB294 \uB17C\uB9AC\uC801\uC774\uACE0 \uC815\uBCF4 \uC804\uB2EC\uC5D0 \uCDA9\uC2E4\uD55C \uAE00\uC744 \uC791\uC131\uD569\uB2C8\uB2E4. \uBC29\uBB38\uC790\uC5D0\uAC8C \uC2E0\uB8B0\uAC10\uC744 \uC8FC\uB294 \uC804\uBB38\uC801\uC778 \uBE14\uB85C\uADF8\uC5D0 \uCD5C\uC801\uD654\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.</p></div><div style="width: calc(50% - 10px); background: #ffffff; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px #4caf501a; box-sizing: border-box;"><h4 style="margin-top: 0; color: #4caf50;">\uB9DE\uCDA4 \uD15C\uD50C\uB9BF \uC9C0\uC6D0</h4><p style="color: #333333;">'\uC694\uB9AC \uB808\uC2DC\uD53C'\uB098 '\uC5EC\uD589 \uD6C4\uAE30'\uCC98\uB7FC \uD2B9\uC815 \uBAA9\uC801\uC5D0 \uB9DE\uB294 \uD15C\uD50C\uB9BF\uC744 \uC81C\uACF5\uD558\uC5EC, \uB354\uC6B1 \uBE60\uB974\uACE0 \uC27D\uAC8C \uD574\uB2F9 \uC8FC\uC81C\uC758 \uD3EC\uC2A4\uD305\uC744 \uC644\uC131\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p></div></div>

<!-- \u2705 \uAC15\uC870 \uBC15\uC2A4: highlight_block_01 -->
<div style="background: #ffffff; border-radius: 15px; padding: 30px; margin: 30px 0; box-shadow: 0 6px 20px #0055001a; border: 2px dashed #005500; position: relative;"><div style="position: absolute; top: -15px; left: 20px; background: #005500; color: white; padding: 0 15px; border-radius: 20px; font-size: 1.1rem; font-weight: 700;">\u{1F3AF} \uD575\uC2EC \uD3EC\uC778\uD2B8</div><p style="color: #005500; margin: 0; line-height: 1.8; text-align: left; font-size: 1.1rem;">\uC774 \uD504\uB85C\uADF8\uB7A8\uC758 \uD575\uC2EC\uC740 '\uC2DC\uAC04 \uC808\uC57D'\uC785\uB2C8\uB2E4. \uBCF5\uC7A1\uD55C \uAE00\uC4F0\uAE30 \uACFC\uC815 \uC5C6\uC774, \uC544\uC774\uB514\uC5B4\uB97C \uACE7\uBC14\uB85C \uC644\uC131\uB41C \uAE00\uB85C \uB9CC\uB4E4 \uC218 \uC788\uB2E4\uB294 \uC810\uC744 \uAE30\uC5B5\uD574 \uC8FC\uC138\uC694.</p></div>

<!-- \u2705 \uC8FC\uC758\uC0AC\uD56D \uBC15\uC2A4: caution_block_01 -->
<div style="background: #FFF1EC; border-radius: 15px; padding: 25px; margin: 30px 0; border: 1px solid #ff0000; position: relative; color: #ff0000; font-weight: 600; text-shadow: 0 1px 1px rgba(0,0,0,0.05);"><div style="position: absolute; top: -12px; left: 20px; background: #ff0000; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.9rem;">\u26A0\uFE0F \uC8FC\uC758\uC0AC\uD56D</div><p style="margin: 0; line-height: 1.6;">AI\uAC00 \uC0DD\uC131\uD55C \uAE00\uC740 \uBC18\uB4DC\uC2DC \uCD5C\uC885 \uAC80\uD1A0\uB97C \uAC70\uCCD0\uC57C \uD569\uB2C8\uB2E4. \uC0AC\uC2E4 \uAD00\uACC4\uB97C \uD655\uC778\uD558\uACE0, \uC790\uC2E0\uB9CC\uC758 \uBB38\uCCB4\uB85C \uC218\uC815\uD558\uC5EC \uAE00\uC758 \uC644\uC131\uB3C4\uB97C \uB192\uC5EC\uC8FC\uC138\uC694.</p></div>

<!-- \u2705 \uBA54\uBAA8 \uBC15\uC2A4: memo_block_01 -->
<div style="background: #E3F2FD; border-radius: 15px; padding: 25px; margin: 30px 0; border: 1px solid #0055ff; position: relative; color: #0055ff; font-weight: 600; text-shadow: 0 1px 1px rgba(0,0,0,0.1);"><div style="position: absolute; top: -12px; left: 20px; background: #0055ff; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.9rem;">\u{1F4DD} \uBA54\uBAA8</div><p style="margin: 0; line-height: 1.6;">\uC0DD\uC131\uB41C \uAE00\uC774 \uB9C8\uC74C\uC5D0 \uB4E4\uC9C0 \uC54A\uB294\uB2E4\uBA74, '\uB2E4\uC2DC \uC0DD\uC131' \uBC84\uD2BC\uC744 \uB20C\uB7EC\uBCF4\uC138\uC694. AI\uAC00 \uC0C8\uB85C\uC6B4 \uAD00\uC810\uC5D0\uC11C \uB2E4\uB978 \uBC84\uC804\uC758 \uAE00\uC744 \uC81C\uC548\uD574 \uC904 \uAC83\uC785\uB2C8\uB2E4.</p></div>

<!-- \u2705 Q&A \uBE14\uB85D: qa_block_01 -->
<div style="background: white; border-radius: 20px; border: 1px solid #4caf5026; margin-bottom: 20px; overflow: hidden; padding: 5px; box-shadow: 0 4px 15px #4caf500d;"><div style="background-color: #4caf501a; border-radius: 15px 15px 0 0; padding: 20px;"><p style="color: #4caf50; font-size: 18px; font-weight: bold; margin: 0;">Q. \uC0DD\uC131\uB41C \uAE00\uC758 \uC800\uC791\uAD8C\uC740 \uB204\uAD6C\uC5D0\uAC8C \uC788\uB098\uC694?</p></div><div style="padding: 20px;"><p style="color: #333333; font-size: 16px; line-height: 2.2; margin: 0;">A. AI\uB97C \uD65C\uC6A9\uD558\uC5EC \uC0DD\uC131\uB41C \uCF58\uD150\uCE20\uC758 \uCD5C\uC885 \uC800\uC791\uAD8C\uC740 \uC0AC\uC6A9\uC790\uC5D0\uAC8C \uADC0\uC18D\uB429\uB2C8\uB2E4. \uC790\uC720\uB86D\uAC8C \uC218\uC815\uD558\uACE0 \uBE14\uB85C\uADF8\uC5D0 \uAC8C\uC2DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p></div></div>

<!-- \u2705 \uB9C8\uBB34\uB9AC \uBC15\uC2A4: closing_block_01 -->
<div style="background: #ffffff; border-radius: 20px; padding: 30px; margin: 30px 0; box-shadow: 0 10px 25px #4caf501a; font-family: 'Noto Sans KR', sans-serif; border: 1px solid #4caf5026; position: relative;"><div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: linear-gradient(135deg, #4caf501a, transparent); border-radius: 0 20px 0 100%;"></div><p style="color: #4caf50; font-size: 1.2rem; font-weight: 500; line-height: 1.8; text-align: center;">\uC774\uC81C \uC5EC\uB7EC\uBD84\uB3C4 \uCF58\uD150\uCE20 \uD06C\uB9AC\uC5D0\uC774\uD130\uAC00 \uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC774 \uD504\uB85C\uADF8\uB7A8\uACFC \uD568\uAED8\uB77C\uBA74 \uAE00\uC4F0\uAE30\uC758 \uC7A5\uBCBD\uC740 \uB0AE\uC544\uC9C0\uACE0, \uCC3D\uC791\uC758 \uC990\uAC70\uC6C0\uC740 \uBC30\uAC00 \uB420 \uAC83\uC785\uB2C8\uB2E4. \uC9C0\uAE08 \uBC14\uB85C \uC5EC\uB7EC\uBD84\uC758 \uC774\uC57C\uAE30\uB97C \uC138\uC0C1\uC5D0 \uACF5\uC720\uD574 \uBCF4\uC138\uC694!</p></div>
`;
  var App = () => {
    const [mode, setMode] = (0, import_react5.useState)("code");
    const [audience, setAudience] = (0, import_react5.useState)("beginner" /* Beginner */);
    const [tone, setTone] = (0, import_react5.useState)("casual" /* Casual */);
    const [generatedContent, setGeneratedContent] = (0, import_react5.useState)("");
    const [isLoading, setIsLoading] = (0, import_react5.useState)(false);
    const [error, setError] = (0, import_react5.useState)(null);
    const [appStage, setAppStage] = (0, import_react5.useState)("idle");
    const [apiKey, setApiKey] = (0, import_react5.useState)("");
    const [textModel, setTextModel] = (0, import_react5.useState)("gemini-2.5-flash");
    const [analysisType, setAnalysisType] = (0, import_react5.useState)("blog post" /* BlogPost */);
    const [code, setCode] = (0, import_react5.useState)("");
    const [customTemplate, setCustomTemplate] = (0, import_react5.useState)(defaultCustomTemplate);
    const [identifiedFeatures, setIdentifiedFeatures] = (0, import_react5.useState)([]);
    const [selectedFeature, setSelectedFeature] = (0, import_react5.useState)(null);
    const [tags, setTags] = (0, import_react5.useState)("");
    const [permalink, setPermalink] = (0, import_react5.useState)("");
    const [metaDescription, setMetaDescription] = (0, import_react5.useState)("");
    const [videoFrames, setVideoFrames] = (0, import_react5.useState)([]);
    const [scriptSegments, setScriptSegments] = (0, import_react5.useState)([]);
    const [processedClipToken, setProcessedClipToken] = (0, import_react5.useState)(0);
    (0, import_react5.useEffect)(() => {
      const savedKey = localStorage.getItem("gemini-api-key");
      if (savedKey) {
        setApiKey(savedKey);
      }
    }, []);
    const resetState = (keepInputs = false) => {
      setIsLoading(false);
      setError(null);
      setGeneratedContent("");
      setIdentifiedFeatures([]);
      setSelectedFeature(null);
      setAppStage("idle");
      setTags("");
      setPermalink("");
      setMetaDescription("");
      setScriptSegments([]);
      if (!keepInputs) {
        setCode("");
        setVideoFrames([]);
        setProcessedClipToken((t) => t + 1);
      }
    };
    const handleAnalyzeFeatures = (0, import_react5.useCallback)(async () => {
      if (!apiKey) {
        setError("Gemini API \uD0A4\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uACE0 \uC800\uC7A5\uD574\uC8FC\uC138\uC694.");
        return;
      }
      if (mode !== "code" || !code.trim()) {
        setError("\uBD84\uC11D\uD560 \uCF54\uB4DC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
        return;
      }
      resetState(true);
      setIsLoading(true);
      setAppStage("analyzing_features");
      try {
        const features = await identifyFeaturesInCode(code, apiKey, textModel);
        if (features.length > 0) {
          setIdentifiedFeatures(features);
          setAppStage("features_identified");
        } else {
          setError("\uCF54\uB4DC\uC5D0\uC11C \uC8FC\uC694 \uAE30\uB2A5\uC744 \uC2DD\uBCC4\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB2E8\uC77C \uAE30\uB2A5 \uD504\uB85C\uADF8\uB7A8\uC73C\uB85C \uAC04\uC8FC\uD558\uACE0 \uC804\uCCB4 \uBD84\uC11D\uC744 \uC9C4\uD589\uD569\uB2C8\uB2E4.");
          await handleGeneratePostForFeature(null);
        }
      } catch (err) {
        setError(err.message || "\uAE30\uB2A5 \uBD84\uC11D \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, [code, mode, apiKey, textModel]);
    const handleGeneratePostForFeature = (0, import_react5.useCallback)(async (feature) => {
      if (!apiKey) {
        setError("Gemini API \uD0A4\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uACE0 \uC800\uC7A5\uD574\uC8FC\uC138\uC694.");
        return;
      }
      setGeneratedContent("");
      setError(null);
      setIsLoading(true);
      setAppStage("generating_post");
      if (feature) {
        setSelectedFeature(feature);
      }
      try {
        const result = await analyzeCode(code, analysisType, audience, tone, customTemplate, feature, apiKey, textModel);
        setGeneratedContent(result.content);
        setTags(result.tags);
        setPermalink(result.permalink);
        setMetaDescription(result.metaDescription);
        setAppStage("post_generated");
      } catch (err) {
        setError(err.message || "\uD3EC\uC2A4\uD305 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, [code, analysisType, audience, tone, customTemplate, apiKey, textModel]);
    const handleGenerateClipScript = (0, import_react5.useCallback)(async () => {
      if (!apiKey) {
        setError("Gemini API \uD0A4\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uACE0 \uC800\uC7A5\uD574\uC8FC\uC138\uC694.");
        return;
      }
      if (videoFrames.length === 0) {
        setError("\uBD84\uC11D\uD560 \uC601\uC0C1\uC744 \uC5C5\uB85C\uB4DC\uD558\uACE0 \uD504\uB808\uC784 \uCD94\uCD9C\uC744 \uC644\uB8CC\uD560 \uB54C\uAE4C\uC9C0 \uAE30\uB2E4\uB824\uC8FC\uC138\uC694.");
        return;
      }
      setIsLoading(true);
      setAppStage("generating_post");
      setError(null);
      try {
        const result = await generateVideoScript(videoFrames, audience, tone, apiKey, textModel);
        setScriptSegments((prev) => [...prev, { id: Date.now(), content: result.content }]);
      } catch (err) {
        setError(err.message || "\uD074\uB9BD \uB300\uBCF8 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");
        console.error(err);
      } finally {
        setIsLoading(false);
        setVideoFrames([]);
        setProcessedClipToken((t) => t + 1);
      }
    }, [videoFrames, audience, tone, apiKey, textModel]);
    const handleFinalizeScript = (0, import_react5.useCallback)(async () => {
      if (!apiKey) {
        setError("Gemini API \uD0A4\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uACE0 \uC800\uC7A5\uD574\uC8FC\uC138\uC694.");
        return;
      }
      if (scriptSegments.length < 1) {
        setError("\uACB0\uD569\uD560 \uB300\uBCF8\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
        return;
      }
      setIsLoading(true);
      setAppStage("generating_post");
      setError(null);
      setGeneratedContent("");
      try {
        const segmentsContent = scriptSegments.map((s) => s.content);
        const result = await combineVideoScripts(segmentsContent, audience, tone, apiKey, textModel);
        setGeneratedContent(result.content);
        setTags(result.tags);
        setPermalink(result.permalink);
        setMetaDescription(result.metaDescription);
        setScriptSegments([]);
        setAppStage("post_generated");
      } catch (err) {
        setError(err.message || "\uCD5C\uC885 \uB300\uBCF8 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, [scriptSegments, audience, tone, apiKey, textModel]);
    const handleModeChange = (newMode) => {
      setMode(newMode);
      resetState(false);
    };
    const handleBackToFeatures = () => {
      setGeneratedContent("");
      setSelectedFeature(null);
      setError(null);
      setAppStage("features_identified");
      setTags("");
      setPermalink("");
      setMetaDescription("");
    };
    const handleContentUpdate = (0, import_react5.useCallback)((newContent) => {
      setGeneratedContent(newContent);
    }, []);
    const getMainButtonText = () => {
      if (isLoading) {
        if (appStage === "analyzing_features")
          return "\uAE30\uB2A5 \uBD84\uC11D \uC911...";
        if (appStage === "generating_post" && mode === "video" && scriptSegments.length === 0)
          return "\uD074\uB9BD \uB300\uBCF8 \uC0DD\uC131 \uC911...";
        if (appStage === "generating_post")
          return "\uC0DD\uC131 \uC911...";
        return "\uCC98\uB9AC \uC911...";
      }
      if (mode === "code")
        return "\uAE30\uB2A5 \uBD84\uC11D \uBC0F \uD3EC\uC2A4\uD305 \uC0DD\uC131";
      return "\uD604\uC7AC \uD074\uB9BD \uB300\uBCF8 \uC0DD\uC131";
    };
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "max-w-screen-2xl mx-auto", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("header", { className: "text-center mb-8", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h1", { className: "text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500", children: "AI \uCF58\uD150\uCE20 \uC0DD\uC131\uAE30" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "mt-2 text-lg text-slate-400", children: "\uCF54\uB4DC \uB610\uB294 \uC601\uC0C1\uC744 \uBD84\uC11D\uD558\uC5EC Gemini AI\uAC00 \uBA4B\uC9C4 \uC18C\uAC1C \uCF58\uD150\uCE20\uB97C \uC791\uC131\uD574\uC90D\uB2C8\uB2E4." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(ApiKeyInput_default, { onApiKeyUpdate: setApiKey }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { htmlFor: "model-select", className: "block text-sm font-medium text-slate-300 mb-2", children: "\uD14D\uC2A4\uD2B8 \uC0DD\uC131 \uBAA8\uB378" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
          "select",
          {
            id: "model-select",
            value: textModel,
            onChange: (e) => setTextModel(e.target.value),
            className: "w-full p-2 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: "gemini-2.0-flash", children: "Gemini 2.0 Flash" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: "gemini-2.5-flash", children: "Gemini 2.5 Flash" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("main", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "lg:col-span-1 flex flex-col gap-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex border-b border-slate-700", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { onClick: () => handleModeChange("code"), className: `flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${mode === "code" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-400 hover:text-slate-200"}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CodeIcon, {}),
              " \uCF54\uB4DC \uBD84\uC11D"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { onClick: () => handleModeChange("video"), className: `flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${mode === "video" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-400 hover:text-slate-200"}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(VideoIcon, {}),
              " \uC601\uC0C1 \uB300\uBCF8 \uC0DD\uC131"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("h2", { className: "text-2xl font-bold text-slate-100 flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(WandIcon, {}),
            "\uC0DD\uC131 \uC635\uC158"
          ] }),
          mode === "code" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_jsx_runtime7.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            OptionSelector_default,
            {
              label: "\uBD84\uC11D \uC720\uD615",
              options: Object.values(AnalysisType),
              optionLabels: {
                ["blog post" /* BlogPost */]: "\uBE14\uB85C\uADF8 \uD3EC\uC2A4\uD2B8",
                ["technical guide" /* TechnicalGuide */]: "\uAE30\uC220 \uAC00\uC774\uB4DC",
                ["code summary" /* CodeSummary */]: "\uCF54\uB4DC \uC694\uC57D"
              },
              selectedValue: analysisType,
              onChange: (val) => setAnalysisType(val)
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            OptionSelector_default,
            {
              label: mode === "code" ? "\uB300\uC0C1 \uB3C5\uC790" : "\uB300\uC0C1 \uC2DC\uCCAD\uC790",
              options: Object.values(Audience),
              optionLabels: {
                ["beginner" /* Beginner */]: "\uCEF4\uD4E8\uD130 \uCD08\uBCF4\uC790",
                ["intermediate developer" /* Intermediate */]: "\uC911\uAE09 \uAC1C\uBC1C\uC790",
                ["expert developer" /* Expert */]: "\uC804\uBB38\uAC00"
              },
              selectedValue: audience,
              onChange: (val) => setAudience(val)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            OptionSelector_default,
            {
              label: mode === "code" ? "\uAE00\uC758 \uD1A4" : "\uB300\uBCF8 \uD1A4\uC564\uB9E4\uB108",
              options: Object.values(Tone),
              optionLabels: {
                ["formal" /* Formal */]: "\uACA9\uC2DD\uCCB4",
                ["casual" /* Casual */]: "\uCE90\uC8FC\uC5BC",
                ["humorous" /* Humorous */]: "\uC720\uBA38\uB7EC\uC2A4"
              },
              selectedValue: tone,
              onChange: (val) => setTone(val)
            }
          ),
          mode === "code" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "text-lg font-semibold text-slate-300 mb-2", children: "\uCEE4\uC2A4\uD140 \uD0DC\uADF8 \uD15C\uD50C\uB9BF (\uC120\uD0DD \uC0AC\uD56D)" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-xs text-slate-400 mb-2 p-2 bg-slate-700/50 rounded-lg border border-slate-600", children: "\uBE14\uB85C\uADF8\uC5D0\uC11C \uC0AC\uC6A9\uD558\uB294 \uACE0\uC720 HTML \uD15C\uD50C\uB9BF\uC744 \uC785\uB825\uD558\uBA74, AI\uAC00 \uD574\uB2F9 \uAD6C\uC870\uB97C \uD65C\uC6A9\uD558\uC5EC \uAE00\uC744 \uC791\uC131\uD569\uB2C8\uB2E4." }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "textarea",
              {
                value: customTemplate,
                onChange: (e) => setCustomTemplate(e.target.value),
                placeholder: "\uC5EC\uAE30\uC5D0 HTML \uD615\uC2DD\uC758 \uD15C\uD50C\uB9BF\uC744 \uBD99\uC5EC\uB123\uC73C\uC138\uC694...",
                className: "w-full p-2 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors custom-scrollbar",
                rows: 8
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex-grow flex flex-col", children: mode === "code" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("h3", { className: "text-lg font-semibold text-slate-300 mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CodeIcon, {}),
              " \uCF54\uB4DC \uC785\uB825"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "text-sm text-slate-400 mb-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("strong", { className: "text-slate-200", children: "\uD301:" }),
              " '\uD3F4\uB354 \uC5C5\uB85C\uB4DC' \uC2DC, \uBD84\uC11D\uC5D0 \uBD88\uD544\uC694\uD55C \uD3F4\uB354(node_modules, venv \uB4F1)\uC640 \uD30C\uC77C\uC740 \uC790\uB3D9\uC73C\uB85C \uC81C\uC678\uB418\uC5B4 \uB354 \uBE60\uB974\uACE0 \uC815\uD655\uD55C \uBD84\uC11D\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4. \uC6A9\uB7C9\uC774 \uD070 \uD3F4\uB354\uB294 \uB2E4\uC18C \uC2DC\uAC04\uC774 \uAC78\uB9B4 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CodeInput_default, { code, setCode })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("h3", { className: "text-lg font-semibold text-slate-300 mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(VideoIcon, {}),
              " \uC601\uC0C1 \uC785\uB825"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(VideoInput_default, { onFramesExtracted: setVideoFrames, setIsLoading, setParentError: setError, processedClipToken })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex flex-col gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "button",
              {
                onClick: mode === "code" ? handleAnalyzeFeatures : handleGenerateClipScript,
                disabled: isLoading || mode === "video" && videoFrames.length === 0,
                className: "w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-300/50",
                children: isLoading && appStage === "generating_post" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                  ] }),
                  getMainButtonText()
                ] }) : getMainButtonText()
              }
            ),
            mode === "video" && scriptSegments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "button",
              {
                onClick: handleFinalizeScript,
                disabled: isLoading,
                className: "w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-500/50",
                children: isLoading ? "\uCD5C\uC885 \uB300\uBCF8 \uC0DD\uC131 \uC911..." : `\uC804\uCCB4 \uB300\uBCF8 \uC644\uC131\uD558\uAE30 (${scriptSegments.length}\uAC1C \uD074\uB9BD)`
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-lg min-h-[600px] flex flex-col", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          GeneratedContentDisplay_default,
          {
            content: generatedContent,
            isLoading,
            error,
            isCustomTemplate: mode === "code" && customTemplate.trim() !== "",
            features: identifiedFeatures,
            selectedFeature,
            onFeatureSelect: handleGeneratePostForFeature,
            onBackToFeatures: handleBackToFeatures,
            onContentUpdate: handleContentUpdate,
            tags,
            permalink,
            metaDescription,
            scriptSegments,
            mode
          }
        ) })
      ] })
    ] }) });
  };
  var App_default = App;

  // index.tsx
  var import_jsx_runtime8 = __require("react/jsx-runtime");
  var rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }
  var root = import_client.default.createRoot(rootElement);
  root.render(
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_react6.default.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(App_default, {}) })
  );
})();
