import { useEffect, useRef, useState } from 'react';

type CompleteHandler = (transcript: string, confidence: number) => void | Promise<void>;

export function useContinuousKoreanSpeechRecognition(onComplete: CompleteHandler) {
  const [listening, setListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);
  const keepListeningRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const liveTranscriptRef = useRef('');
  const confidenceRef = useRef<number[]>([]);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => () => {
    keepListeningRef.current = false;
    try { recognitionRef.current?.abort(); } catch {}
  }, []);

  const start = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      setError('Thiết bị chưa hỗ trợ nhận giọng nói. Hãy dùng Chrome hoặc Safari mới nhất và cho phép micro.');
      return;
    }

    setError('');
    setLiveTranscript('');
    finalTranscriptRef.current = '';
    liveTranscriptRef.current = '';
    confidenceRef.current = [];
    keepListeningRef.current = true;
    setListening(true);

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let index = event.resultIndex || 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternative = result?.[0];
        const text = String(alternative?.transcript || '').trim();
        if (!text) continue;
        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${text}`.trim();
          const confidence = Number(alternative?.confidence);
          if (Number.isFinite(confidence) && confidence > 0) confidenceRef.current.push(confidence);
        } else {
          interim = `${interim} ${text}`.trim();
        }
      }
      liveTranscriptRef.current = `${finalTranscriptRef.current} ${interim}`.trim();
      setLiveTranscript(liveTranscriptRef.current);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        keepListeningRef.current = false;
        setListening(false);
        setError('Bạn cần cho phép trình duyệt sử dụng micro.');
        return;
      }
      setError('Micro gặp gián đoạn. Hệ thống đang tiếp tục nghe, bạn có thể bấm Dừng khi hoàn tất.');
    };

    recognition.onend = () => {
      if (keepListeningRef.current) {
        window.setTimeout(() => {
          if (!keepListeningRef.current) return;
          try { recognition.start(); } catch {}
        }, 120);
        return;
      }

      setListening(false);
      const transcript = finalTranscriptRef.current.trim() || liveTranscriptRef.current.trim();
      const samples = confidenceRef.current;
      const confidence = samples.length ? samples.reduce((sum, value) => sum + value, 0) / samples.length : 0.8;
      if (transcript) void onCompleteRef.current(transcript, confidence);
      else setError('Thiết bị chưa nhận được nội dung. Bạn hãy bấm ghi âm và đọc lại ở nơi yên tĩnh.');
    };

    try { recognition.start(); }
    catch { setListening(false); setError('Không thể mở micro. Hãy tải lại trang và cho phép quyền micro.'); }
  };

  const stop = () => {
    keepListeningRef.current = false;
    setListening(false);
    try { recognitionRef.current?.stop(); }
    catch {
      const transcript = finalTranscriptRef.current.trim();
      if (transcript) void onCompleteRef.current(transcript, 0.8);
    }
  };

  const reset = () => {
    keepListeningRef.current = false;
    try { recognitionRef.current?.abort(); } catch {}
    setListening(false);
    setLiveTranscript('');
    setError('');
    finalTranscriptRef.current = '';
    liveTranscriptRef.current = '';
    confidenceRef.current = [];
  };

  return { listening, liveTranscript, error, setError, start, stop, reset };
}
