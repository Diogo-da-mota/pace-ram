import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { BackgroundUploadForm } from "@/components/admin/BackgroundUploadForm";

const Background = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5" />
          <h1 className="text-xl font-semibold">Upload de Background</h1>
        </div>
        <BackgroundUploadForm />
      </div>
    </div>
  );
};

export default Background;