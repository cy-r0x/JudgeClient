"use client";
import { useState, useEffect } from "react";
import { MdCheck } from "react-icons/md";
import CodeEditor from "@/components/EditorComponent/EditorComponent";
import Button from "@/components/ButtonComponent/Button";
import submissionModule from "@/api/submission/submission";
import { useRouter } from "next/navigation";
import NotificationComponent from "@/components/NotificationComponent/NotificationComponent";
import { compileAndRun } from "@/api/compile_run/compileRun";
import { getVerdictName } from "@/utils/verdictFormatter";

// Client-side component for copying text to clipboard
export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`absolute top-2 right-2 p-2 rounded transition-colors ${
        copied ? "bg-orange-500" : " bg-zinc-800 hover:bg-zinc-700"
      }`}
      title="Copy to clipboard"
      disabled={copied}
    >
      {copied ? (
        <div className="flex items-center gap-1">
          <MdCheck className="text-white text-lg" />
          <MdCheck className="text-white text-lg -ml-3.5" />
        </div>
      ) : (
        <p className="text-white text-sm">Copy</p>
      )}
    </button>
  );
}

// Client-side component for the editor section
export function EditorSection({ problemData, contestId }) {
  const [code, setCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const router = useRouter();

  // Initialize code and language from last_submission
  useEffect(() => {
    if (problemData?.last_submission) {
      const { source_code, language } = problemData.last_submission;
      if (source_code) {
        setCode(source_code);
      }
      if (language) {
        setSelectedLanguage(language);
      }
    }
  }, [problemData]);

  const handleCompileRun = async () => {
    if (!code.trim()) {
      setNotification({
        visible: true,
        message: "Source code cannot be empty",
        type: "error",
      });
      return;
    }

    if (selectedLanguage === "") {
      setNotification({
        visible: true,
        message: "Select programming language",

        type: "error",
      });
      return;
    }

    setIsCompiling(true);
    setNotification({ visible: false, message: "", type: "info" });

    const { data: responseData, error } = await compileAndRun({
      contest_id: contestId,
      problem_id: problemData.id,
      language: selectedLanguage,
      source_code: code,
    });

    setIsCompiling(false);

    if (error) {
      setNotification({
        visible: true,
        message: error,
        type: "error",
      });
      return;
    }

    if (responseData && responseData.result) {
      const verdictName = getVerdictName(responseData.result);
      const notificationType =
        responseData.result.toLowerCase() === "ac" ? "success" : "error";

      setNotification({
        visible: true,
        message: `Sample: ${verdictName}`,
        type: notificationType,
      });
    } else {
      setNotification({
        visible: true,
        message: "Unexpected response from server",
        type: "error",
      });
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setNotification({
        visible: true,
        message: "Source code cannot be empty",
        type: "error",
      });
      return;
    }

    if (selectedLanguage === "") {
      setNotification({
        visible: true,
        message: "Select programming language",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setNotification({ visible: false, message: "", type: "info" });

    const { data, error } = await submissionModule.submitSubmission({
      problem_id: problemData.id,
      contest_id: contestId,
      source_code: code,
      language: selectedLanguage,
    });

    if (error) {
      ``;
      setNotification({
        visible: true,
        message: error,
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    const submissionId =
      data?.submission_id || data?.id || data?.submission?.id;

    if (!submissionId) {
      setNotification({
        visible: true,
        message: "Submission succeeded but no submission ID returned",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    router.push(`/contests/${contestId}/submissions/${submissionId}`);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  return (
    <div className="flex flex-col h-full px-4 py-2 ">
      <div className="mb-3 flex justify-between items-center">
        <div>
          <select
            name="language"
            id="language-select"
            className="p-2 border rounded w-full bg-zinc-800"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            <option value="" disabled>
              Select Language
            </option>
            <option value="c">GNU GCC11</option>
            <option value="cpp">GNU G++23</option>
            <option value="py">Python 3.10</option>
            <option value="js">Node.js 24</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 mt-3">
          <Button
            name={isCompiling ? "Compiling..." : "Compile and Run"}
            onClick={handleCompileRun}
            disabled={isCompiling}
          />
          <Button
            name={isSubmitting ? "Submitting..." : "Submit"}
            onClick={handleSubmit}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex-1 border bg-[#262922] border-zinc-600 rounded-md overflow-auto shadow-lg min-h-0">
        <CodeEditor
          handleChange={setCode}
          selectedLanguage={selectedLanguage}
          value={code}
        />
      </div>
      {/* Notification */}
      <NotificationComponent
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
        duration={2000}
      />
    </div>
  );
}
