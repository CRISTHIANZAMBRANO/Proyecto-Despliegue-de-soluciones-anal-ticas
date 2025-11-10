import { Card } from "@/components/ui/card";

export function LookerStudioEmbed() {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="relative w-full" style={{ paddingBottom: "73.83%" }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://lookerstudio.google.com/embed/reporting/5af3651b-0be5-4010-a776-9b8939d24d89/page/2OJdF"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          data-testid="iframe-looker-studio"
        />
      </div>
    </Card>
  );
}
