"use client";

import {
	BarChart3,
	CheckCircle2,
	Clock,
	Loader2,
	ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

export default function AuthPage() {
	const [isLoading, setIsLoading] = useState(false);
	const supabase = createClient();

	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_, session) => {
				if (session) {
					location.reload();
				}
			},
		);

		return () => {
			authListener?.subscription.unsubscribe();
		};
	}, [supabase]);

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		try {
			await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
				},
			});
		} catch (error) {
			console.error("Authentication error:", error);
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
			{/* Background Glow Effect */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
				<div className="absolute top-[20%] -right-[10%] h-[30%] w-[30%] rounded-full bg-primary/10 blur-[100px]" />
			</div>

			<main className="container mx-auto px-6 py-20 lg:py-32">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
					{/* Left Side: Value Proposition */}
					<div className="space-y-8">
						<Badge
							variant="secondary"
							className="px-3 py-1 text-sm font-medium"
						>
							Track your hours easily!
						</Badge>

						<div className="space-y-4">
							<h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight">
								Master your <span className="text-primary">OJT Hours</span> with
								ease.
							</h1>
							<p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed">
								The modern way for interns to track, verify, and avoid human
								errors. No more spreadsheets, no more lost logs.
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
							{[
								{ icon: Clock, text: "Real-time Tracking" },
								{ icon: BarChart3, text: "Visual Analytics" },
								{ icon: CheckCircle2, text: "Easy Supervisor Approval" },
								{
									icon: ShieldCheck,
									text: "Secure Data Exports & Multi Device Logging",
								},
							].map((feature, i) => (
								<div
									// biome-ignore lint: Ignore it
									key={i}
									className="flex items-center gap-2 text-sm font-medium"
								>
									<feature.icon className="h-5 w-5 text-primary" />
									{feature.text}
								</div>
							))}
						</div>
					</div>

					{/* Right Side: Action Card */}
					<div className="flex justify-center lg:justify-end">
						<Card className="w-full max-w-[400px] border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
							<div className="p-8 space-y-6">
								<div className="space-y-2 text-center">
									<h2 className="text-2xl font-semibold tracking-tight">
										Get Started
									</h2>
									<p className="text-sm text-muted-foreground">
										Join 500+ interns tracking their progress.
									</p>
								</div>

								<Button
									variant="default"
									size="lg"
									className="w-full h-12 text-md font-semibold shadow-lg hover:shadow-primary/20 transition-all"
									onClick={handleGoogleLogin}
									disabled={isLoading}
								>
									{isLoading ? (
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									) : (
										<FaGoogle className="mr-2 h-5 w-5" />
									)}
									Continue with Google
								</Button>

								<p className="text-[12px] text-center text-muted-foreground px-8 leading-tight">
									By clicking continue, you agree to our
									<span className="underline underline-offset-4 cursor-pointer hover:text-primary">
										{" "}
										Terms of Service
									</span>
									.
								</p>
							</div>
						</Card>
					</div>
				</div>
			</main>

			{/* Social Proof / Footer Minimal */}
			<footer className="container mx-auto px-6 py-10 border-t border-border/40 text-center">
				<p className="text-sm text-muted-foreground">
					Built for students, by a former student. © 2025 OJT Hours Tracker.
				</p>
			</footer>
		</div>
	);
}
