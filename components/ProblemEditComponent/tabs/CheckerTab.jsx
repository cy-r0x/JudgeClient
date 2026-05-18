"use client";

export default function CheckerTab({ problemData, setProblemData }) {
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setProblemData((prev) => ({
      ...prev,
      checkerType: newType,
      checkerPrecision:
        newType === "float" ? prev.checkerPrecision || "1e-6" : null,
    }));
  };

  const handleStrictSpaceChange = (e) => {
    setProblemData((prev) => ({
      ...prev,
      checkerStrictSpace: e.target.checked,
    }));
  };

  const handlePrecisionChange = (e) => {
    setProblemData((prev) => ({
      ...prev,
      checkerPrecision: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white border-b pb-2 border-zinc-700">
        Checker Configuration
      </h2>

      <div className="grid grid-cols-1 gap-6">
        {/* Checker Type Dropdown */}
        <div>
          <label
            htmlFor="checkerType"
            className="block text-sm font-medium text-zinc-300 mb-1"
          >
            Type
          </label>
          <select
            id="checkerType"
            name="checkerType"
            value={problemData.checkerType || "string"}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="string">String</option>
            <option value="int">Int</option>
            <option value="float">Float</option>
            <option value="unordered">Unordered</option>
          </select>
        </div>

        {/* Strict Space Checkbox - Only for String */}
        {problemData.checkerType === "string" && (
          <div className="flex items-center justify-between p-4 bg-zinc-700/50 rounded-md border border-zinc-700">
            <div className="flex-1">
              <label
                htmlFor="checkerStrictSpace"
                className="font-medium text-zinc-200 cursor-pointer"
              >
                Strict Space
              </label>
              <p className="text-zinc-400 mt-1 text-sm">
                If enabled, output must match exactly byte-for-byte. If tokens match but whitespace differs, a Presentation Error (PE) is returned.
              </p>
            </div>
            <div className="flex items-center ml-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="checkerStrictSpace"
                  name="checkerStrictSpace"
                  type="checkbox"
                  checked={problemData.checkerStrictSpace || false}
                  onChange={handleStrictSpaceChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Precision Dropdown - Only for Float */}
        {problemData.checkerType === "float" && (
          <div>
            <label
              htmlFor="checkerPrecision"
              className="block text-sm font-medium text-zinc-300 mb-1"
            >
              Precision
            </label>
            <select
              id="checkerPrecision"
              name="checkerPrecision"
              value={problemData.checkerPrecision || "1e-6"}
              onChange={handlePrecisionChange}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="1e-4">1e-4</option>
              <option value="1e-6">1e-6</option>
              <option value="1e-8">1e-8</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
