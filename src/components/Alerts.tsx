import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertsProps {
  errors: string[];
  warnings: string[];
}

export function Alerts({ errors, warnings }: AlertsProps) {
  return (
    <div className="space-y-3">
      {errors.length > 0 ? (
        <Alert variant="destructive">
          <AlertTitle>入力エラー</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}
      {warnings.length > 0 ? (
        <Alert variant="warning">
          <AlertTitle>注意</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
