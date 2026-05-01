import { CheckCircle, Clock } from 'lucide-react';

interface TimelineStep {
  id: string;
  label: string;
  date: string;
  time?: string;
  completed: boolean;
  description?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export default function Timeline({ steps }: TimelineProps) {
  return (
    <div className="relative">
      {steps.map((step, index) => {
        const isCompleted = step.completed;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="mb-6 last:mb-0">
            <div className="flex gap-4">
              {/* Timeline Indicator */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-green-100 border-2 border-green-600'
                      : 'bg-gray-100 border-2 border-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Line */}
                {!isLast && (
                  <div
                    className={`w-1 h-12 mt-2 ${
                      isCompleted ? 'bg-green-300' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-2 flex-1 pt-1">
                <h3
                  className={`font-semibold text-sm mb-1 ${
                    isCompleted ? 'text-green-700' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {step.date} {step.time && `• ${step.time}`}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
