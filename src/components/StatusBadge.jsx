import React from "react";

export function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-900 border-amber-300",
    preparing: "bg-blue-100 text-blue-900 border-blue-300",
    ready: "bg-emerald-100 text-emerald-900 border-emerald-300",
    completed: "bg-[#f5efe6] text-[#786c65] border-[#ebdccd]",
    cancelled: "bg-rose-100 text-rose-900 border-rose-300",
    available: "bg-emerald-100 text-emerald-900 border-emerald-300",
    occupied: "bg-amber-100 text-amber-900 border-amber-300",
    reserved: "bg-purple-100 text-purple-900 border-purple-300",
    new: "bg-amber-100 text-amber-900 border-amber-300",
    unread: "bg-rose-100 text-rose-900 border-rose-300",
    read: "bg-[#f5efe6] text-[#786c65] border-[#ebdccd]",
    replied: "bg-emerald-100 text-emerald-900 border-emerald-300",
    archived: "bg-stone-100 text-stone-700 border-stone-300",
    confirmed: "bg-emerald-100 text-emerald-900 border-emerald-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-xs ${
        styles[status] || "bg-[#f5efe6] text-[#2e241f] border-[#ebdccd]"
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
