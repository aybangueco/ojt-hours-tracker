"use client";

import type { User } from "@supabase/supabase-js";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { createClient } from "@/utils/supabase/client";

type AuthContextType = {
	authUser: User | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
	const supabase = createClient();
	const [authUser, setAuthUser] = useState<User | null>(null);

	const getAuthUser = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		setAuthUser(user);
	};

	// biome-ignore lint: Use only once
	useEffect(() => {
		getAuthUser();
	}, []);

	return (
		<AuthContext.Provider value={{ authUser }}>{children}</AuthContext.Provider>
	);
}

export function useAuthContext() {
	const ctx = useContext(AuthContext);

	if (!ctx) {
		throw new Error("useAuthContext must be used inside AuthProvider");
	}

	return ctx;
}
