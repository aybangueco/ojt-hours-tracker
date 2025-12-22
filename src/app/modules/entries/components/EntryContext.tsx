"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import type { TimeEntry } from "@/utils/types";

type EntryContextType = {
	timeEntries: TimeEntry[];
	setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
};

const EntryContext = createContext<EntryContextType | null>(null);

export default function EntryContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

	return (
		<EntryContext.Provider value={{ timeEntries, setTimeEntries }}>
			{children}
		</EntryContext.Provider>
	);
}

export function useEntryContext() {
	const ctx = useContext(EntryContext);

	if (!ctx) {
		throw new Error("useEntryContext must be used inside EntryContextProvider");
	}

	return ctx;
}
