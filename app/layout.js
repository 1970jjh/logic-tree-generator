import "./globals.css";

export const metadata = {
  title: "Logic Tree Generator | AI 로직트리 자동 생성기",
  description: "AI가 자동으로 문제정의, 원인분석, 해결방안 Logic Tree를 생성합니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
