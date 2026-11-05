import { useState } from 'react';
import { recognizeDishUseCase } from '../../di/container';
import { RecognitionResult } from '../../domain/entities/RecognitionResult';

export function useRecognize() {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [candidates, setCandidates] = useState<RecognitionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recognize = async (imageUri: string): Promise<RecognitionResult[]> => {
    setIsRecognizing(true);
    setError(null);
    try {
      const result = await recognizeDishUseCase.execute(imageUri);
      if (result.success) {
        setCandidates(result.data);
        return result.data;
      } else {
        setError(result.error.message);
        return [];
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Nhận diện thất bại';
      setError(msg);
      return [];
    } finally {
      setIsRecognizing(false);
    }
  };

  const reset = () => {
    setCandidates([]);
    setError(null);
    setIsRecognizing(false);
  };

  return {
    isRecognizing,
    candidates,
    error,
    recognize,
    reset,
  };
}

