import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Increase body size for file uploads
export const maxDuration = 60;

// Dynamic import mammoth only when needed (for .docx)
async function extractDocxText(base64Data) {
  try {
    const mammoth = await import("mammoth");
    const buffer = Buffer.from(base64Data, "base64");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (err) {
    console.error("DOCX extraction error:", err);
    return "[Word 문서 텍스트 추출 실패]";
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      situation,
      type,
      l1Count,
      l2Count = 3,
      l3Count = 2,
      files = [],
    } = body;

    if (!situation && files.length === 0) {
      return NextResponse.json(
        { error: "상황 텍스트 또는 참고 파일을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!type || !l1Count) {
      return NextResponse.json(
        { error: "필수 입력값이 누락되었습니다." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const typeLabels = {
      "problem-definition": "문제정의 (What Tree)",
      "root-cause": "원인분석 (Why Tree)",
      solution: "해결방안 (How Tree)",
    };

    const typeInstructions = {
      "problem-definition": `문제정의(What Tree)를 작성합니다.
- 핵심 문제를 구성 요소별로 MECE하게 분해합니다.
- "무엇이 문제인가?"를 구조적으로 분해하는 관점입니다.
- root의 tag에는 문제를 분해하는 공식이나 프레임워크를 넣으세요. (예: 매출 = 객단가 × 고객수 × 영업일수)
- L1은 문제의 대분류 구성요소, L2는 중분류 세부요인, L3는 구체적 확인항목입니다.
- 각 노드의 description과 practiceQuestion/dataSource는 실습에서 실제로 활용할 수 있는 구체적 내용으로 작성하세요.`,

      "root-cause": `원인분석(Why Tree)를 작성합니다.
- 문제의 근본원인을 찾기 위해 "왜?"를 반복하여 원인-결과 관계를 분해합니다.
- root의 tag에는 원인 분석 관점이나 프레임워크를 넣으세요. (예: 4M - Man, Machine, Method, Material)
- L1은 원인의 대분류, L2는 세부 원인, L3는 근본 원인(Root Cause)입니다.
- L3 수준에서는 "진짜 원인"에 해당하는 구체적이고 검증 가능한 항목을 제시하세요.`,

      solution: `해결방안(How Tree)를 작성합니다.
- 문제 해결을 위한 실행방안을 구조적으로 도출합니다.
- "어떻게 해결할 것인가?"를 체계적으로 분해하는 관점입니다.
- root의 tag에는 해결 방향의 프레임워크를 넣으세요. (예: 단기 Quick-Win + 중장기 구조개선)
- L1은 해결의 대방향, L2는 구체적 실행전략, L3는 세부 실행과제(Action Item)입니다.
- 각 L3에는 실행 가능한 구체적 과제와 기대효과를 포함하세요.`,
    };

    // ── Process attached files ──
    const mediaParts = []; // For images & PDFs → Gemini inline_data
    const docTexts = []; // For Word docs → extracted text

    for (const file of files) {
      const { name, mimeType, data } = file;

      if (
        mimeType.includes("word") ||
        mimeType.includes("officedocument.wordprocessingml") ||
        mimeType === "application/msword"
      ) {
        // Word document → extract text
        const text = await extractDocxText(data);
        if (text.trim()) {
          docTexts.push(`[📝 ${name}]\n${text}`);
        }
      } else if (
        mimeType.startsWith("image/") ||
        mimeType === "application/pdf"
      ) {
        // Image or PDF → send to Gemini as multimodal
        mediaParts.push({
          inlineData: {
            data: data,
            mimeType: mimeType,
          },
        });
      }
    }

    // ── Build prompt ──
    let fileContext = "";
    if (docTexts.length > 0) {
      fileContext = `\n\n[첨부 문서 내용 - 아래 내용을 반드시 분석에 반영하세요]\n${docTexts.join("\n\n")}`;
    }
    if (mediaParts.length > 0) {
      fileContext += `\n\n[첨부 이미지/PDF 파일 ${mediaParts.length}개가 함께 제공됩니다. 이 자료들의 내용을 반드시 분석에 반영하세요.]`;
    }

    const promptText = `당신은 기업교육 문제해결 워크숍의 Logic Tree 전문 퍼실리테이터입니다.
아래 상황에 대해 ${typeLabels[type]}를 작성해주세요.

${typeInstructions[type]}

[상황/이슈]
${situation || "(첨부 파일의 내용을 기반으로 분석하세요)"}${fileContext}

[요구사항]
- L1(1차 분해) 노드의 수: 정확히 ${l1Count}개
- 각 L1 노드 아래에 L2(2차 분해) 노드: 정확히 ${l2Count}개씩
- 각 L2 노드 아래에 L3(3차 분해) 노드: 정확히 ${l3Count}개씩
- 모든 내용은 한국어로 작성
- MECE(Mutually Exclusive, Collectively Exhaustive) 원칙 준수
- label은 간결하게 (한국어 기준 2~8자)
- subLabel은 질문형 또는 보조설명 (10자 이내)
- description은 2~3문장의 상세 설명
- 아이콘은 각 L1 카테고리에 적합한 이모지 1개
- L3 노드의 description은 3~4문장으로 구체적이고 설명적으로 작성하세요. 실무에서 바로 활용할 수 있는 구체적 내용, 확인 방법, 기대효과 등을 포함하세요.
- 첨부된 자료가 있는 경우, 그 내용에서 나온 구체적 데이터, 수치, 사실관계를 로직트리에 적극 반영하세요.

다음 JSON 구조로만 응답하세요. JSON 외의 텍스트는 절대 포함하지 마세요:
{
  "root": {
    "label": "핵심 문제/원인/해결방안 요약 (20자 이내)",
    "tag": "분석 공식 또는 프레임워크"
  },
  "branches": [
    {
      "icon": "이모지",
      "label": "1차 분류명",
      "subLabel": "보조 설명",
      "description": "상세 설명 2-3문장",
      "dataPoints": "확인 데이터/핵심 포인트",
      "children": [
        {
          "label": "2차 분류명",
          "subLabel": "보조 설명",
          "description": "상세 설명 2-3문장",
          "practiceQuestion": "실습에서 확인할 질문",
          "children": [
            {
              "label": "3차 분류명",
              "description": "상세 설명",
              "dataSource": "데이터 출처 또는 확인 방법"
            }
          ]
        }
      ]
    }
  ]
}`;

    // ── Build Gemini content parts ──
    const contentParts = [{ text: promptText }, ...mediaParts];

    const result = await model.generateContent(contentParts);
    const responseText = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      const startIdx = responseText.indexOf("{");
      const endIdx = responseText.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        jsonStr = responseText.substring(startIdx, endIdx + 1);
      }
    }

    const treeData = JSON.parse(jsonStr);

    // Validate structure
    if (
      !treeData.root ||
      !treeData.branches ||
      !Array.isArray(treeData.branches)
    ) {
      throw new Error("유효하지 않은 응답 구조입니다.");
    }

    return NextResponse.json({ success: true, data: treeData });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error.message || "로직트리 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
