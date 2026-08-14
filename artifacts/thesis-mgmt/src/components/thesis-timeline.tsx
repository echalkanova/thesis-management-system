import { CheckCircle, Circle, Clock } from "lucide-react";

const WORKFLOW_STEPS = [
  { status: "draft", label: "Чернова", description: "Дипломната работа е създадена" },
  { status: "submitted", label: "Подадена", description: "Изпратена за преглед" },
  { status: "pending_supervisor_approval", label: "Очаква одобрение", description: "При научния ръководител" },
  { status: "approved_by_supervisor", label: "Одобрена от ръководител", description: "Научният ръководител одобри" },
  { status: "under_review", label: "В рецензия", description: "При рецензента" },
  { status: "reviewed", label: "Рецензирана", description: "Рецензията е готова" },
  { status: "approved_for_defense", label: "Допусната до защита", description: "Одобрена за защита" },
  { status: "scheduled_for_defense", label: "Насрочена защита", description: "Датата е определена" },
  { status: "defended", label: "Защитена", description: "Успешно защитена" },
  { status: "graded", label: "Оценена", description: "Оценката е нанесена" },
];

const STATUS_ORDER = [
  "draft", "submitted", "pending_supervisor_approval",
  "approved_by_supervisor", "under_review", "reviewed",
  "approved_for_defense", "scheduled_for_defense", "defended", "graded",
];

function getStepState(stepStatus: string, currentStatus: string): "completed" | "current" | "pending" {
  const stepIndex = STATUS_ORDER.indexOf(stepStatus);
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "pending";
}

interface ThesisTimelineProps {
  currentStatus: string;
  finalGrade?: number | null;
}

export function ThesisTimeline({ currentStatus, finalGrade }: ThesisTimelineProps) {
  const progressIndex = STATUS_ORDER.indexOf(currentStatus);
  const progressPct = Math.min(100, (progressIndex / (STATUS_ORDER.length - 1)) * 100);

  return (
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <h3 className="font-semibold text-lg text-[#0a192f]">Прогрес на дипломната работа</h3>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-[#0a192f] h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="space-y-1 mt-2">
        {WORKFLOW_STEPS.map((step, index) => {
          const state = getStepState(step.status, currentStatus);
          return (
            <div key={step.status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`rounded-full p-0.5 ${
                  state === "completed" ? "text-green-500" :
                  state === "current" ? "text-[#0a192f]" :
                  "text-muted-foreground"
                }`}>
                  {state === "completed" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : state === "current" ? (
                    <Clock className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className={`w-0.5 h-5 mt-0.5 ${state === "completed" ? "bg-green-500" : "bg-muted"}`} />
                )}
              </div>
              <div className="pb-1">
                <p className={`text-sm font-medium leading-5 ${
                  state === "current" ? "text-[#0a192f]" :
                  state === "completed" ? "text-foreground" :
                  "text-muted-foreground"
                }`}>
                  {step.label}
                </p>
                {state === "current" && (
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentStatus === "returned_for_revision" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          ⚠️ Работата е върната за корекции. Направете необходимите промени и я подайте отново.
        </div>
      )}

      {finalGrade != null && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-green-800">Крайна оценка</span>
          <span className="text-2xl font-bold text-green-700">{finalGrade.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
