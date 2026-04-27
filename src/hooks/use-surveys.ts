import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./use-api";

export interface SurveyListItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  publishedAt: string | null;
  closesAt: string | null;
  matchingStrategy: string | null;
  _count: { questions: number };
  hasResponded: boolean;
}

export function useSurveys() {
  return useQuery<SurveyListItem[]>({
    queryKey: ["surveys"],
    queryFn: () => apiFetch("/api/surveys"),
  });
}

interface SurveyOption {
  id: string;
  position: number;
  optionText: string;
  optionValue: string | null;
}

interface SurveyQuestion {
  id: string;
  position: number;
  questionText: string;
  questionType: string;
  isRequired: boolean;
  options: SurveyOption[];
}

interface SurveyDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  closesAt: string | null;
  matchingStrategy: string | null;
  questions: SurveyQuestion[];
  userResponse: { id: string; submittedAt: string; answers: { questionId: string; optionId: string }[] } | null;
}

export function useSurvey(id: string) {
  return useQuery<SurveyDetail>({
    queryKey: ["survey", id],
    queryFn: () => apiFetch(`/api/surveys/${id}`),
    enabled: !!id,
  });
}

export function useSubmitSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ surveyId, answers }: { surveyId: string; answers: { questionId: string; optionId: string }[] }) =>
      apiFetch(`/api/surveys/${surveyId}/respond`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["surveys"] });
    },
  });
}
