"use client";

export default function Switch({
  enabled,
  setEnabled,
}: {
  enabled: boolean;
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div
      className={
        "transition-colors duration-300 flex h-8 w-16 rounded-full items-center px-1 " +
        (enabled ? "bg-orange-400" : "bg-gray-400")
      }
      onClick={() => {
        setEnabled(!enabled);
      }}
    >
      <div
        className={
          "transition-all duration-300 size-6 bg-white rounded-full shadow-xl " +
          (enabled ? "ml-[29px]" : "")
        }
      />
    </div>
  );
}
