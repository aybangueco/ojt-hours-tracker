"use client";

import { AlertCircle, History, Loader2 } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import useEntryForm from "@/hooks/useEntryForm";
import {
	actionCreateEntry,
	actionGetEntries,
	calculateEntryHours,
	EntriesCard,
	EntryForm,
	useEntryContext,
} from "@/modules/entries";
import { createClient } from "@/utils/supabase/client";
import { useAuthContext } from "./modules/entries/components/AuthContext";

export default function Home() {
	const {
		entryValue,
		setEntryValue,
		handleInputChange,
		isSubmitting,
		setIsSubmitting,
	} = useEntryForm();

	const { timeEntries, setTimeEntries } = useEntryContext();
	const [requiredHours, setRequiredHours] = useState<number>(500);
	const [completedHours, setCompletedHours] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);

	const { authUser } = useAuthContext();

	const completionPercentage =
		Math.min(100, Math.round((completedHours / requiredHours) * 100)) || 0;
	const remainingHours = (requiredHours - completedHours).toFixed(1);

	const fetchEntries = useCallback(async () => {
		if (!authUser?.id) {
			return;
		}

		const { ok, data } = await actionGetEntries(authUser.id);

		if (!ok) {
			toast.error("Error fetching entries");
			return;
		}

		if (!data) {
			toast.error("Error fetching entries");
			return;
		}

		setLoading(false);
		setTimeEntries(
			data.map((entry) => ({
				...entry,
				evening_time_in: entry.evening_time_in ?? "",
				evening_time_out: entry.evening_time_out ?? "",
			})),
		);
	}, [authUser, setTimeEntries]);

	// biome-ignore lint: Run only once btw
	useEffect(() => {
		const stored = localStorage.getItem("hours");
		if (!stored) {
			localStorage.setItem("hours", requiredHours.toString());
		} else {
			setRequiredHours(Number(stored));
		}
	}, []);

	useEffect(() => {
		fetchEntries();
	}, [fetchEntries]);

	useEffect(() => {
		let totalHours = 0;

		timeEntries.forEach((entryValue) => {
			const morningHours = calculateEntryHours(
				entryValue.morning_time_in,
				entryValue.morning_time_out,
			);
			const afternoonHours = calculateEntryHours(
				entryValue.afternoon_time_in,
				entryValue.afternoon_time_out,
			);
			const eveningHours = calculateEntryHours(
				entryValue.evening_time_in,
				entryValue.evening_time_out,
			);

			totalHours += morningHours + afternoonHours + eveningHours;
		});

		localStorage.setItem("entries", JSON.stringify(timeEntries));

		setCompletedHours(parseFloat(totalHours.toFixed(2)));
	}, [timeEntries]);

	const handleRequiredHoursChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	): void => {
		const value = parseInt(e.target.value) || 0;
		localStorage.setItem("hours", value.toString());
		setRequiredHours(value);
	};

	const handleAddEntry = async () => {
		if (!entryValue.date) {
			alert("Please select a date");
			return;
		}

		setIsSubmitting(true);

		const { ok, data } = await actionCreateEntry(authUser!.id, entryValue);

		if (!ok) {
			toast.error("Error creating entry");
			return;
		}

		if (!data) {
			toast.error("Error creating entry");
			return;
		}

		setTimeEntries((prev) => [...prev, { ...entryValue, id: data.id }]);

		toast.success("Added entry successfully");

		setIsSubmitting(false);

		setEntryValue({
			date: "",
			morning_time_in: "",
			morning_time_out: "",
			afternoon_time_in: "",
			afternoon_time_out: "",
			evening_time_in: "",
			evening_time_out: "",
		});
	};

	const onClickLogout = async () => {
		const supabase = createClient();
		const { error } = await supabase.auth.signOut();

		if (error) {
			toast.error(error.message);
			return;
		}

		location.reload();
	};

	return (
		<div className="container mx-auto p-4 max-w-4xl">
			<div className="flex justify-between">
				<h1 className="text-3xl font-bold mb-6 text-center">
					OJT Hours Tracker
				</h1>
				<div className="flex gap-3 items-center justify-center">
					<ThemeSwitcher />
					{loading ? (
						<div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
					) : (
						<DropdownMenu>
							<DropdownMenuTrigger>
								<Image
									width={100}
									height={100}
									src={authUser?.user_metadata.avatar_url}
									alt="user pic"
									className="h-8 w-8 rounded-full"
								/>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuLabel className="text-center">
									<Button onClick={onClickLogout}>Logout</Button>
								</DropdownMenuLabel>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
				{/* Left Column: Progress Visualization */}
				<Card className="lg:col-span-5 flex flex-col justify-between border-border/60 shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="text-xl font-semibold tracking-tight">
							OJT Progress
						</CardTitle>
						<CardDescription>Overall completion status</CardDescription>
					</CardHeader>

					<CardContent className="flex flex-col items-center pt-4">
						{/* Minimalist Circular Gauge */}
						<div className="relative flex items-center justify-center mb-6">
							<svg className="w-40 h-40 overflow-visible">
								{/* Background Circle */}
								<title>Circle progress</title>
								<circle
									cx="80"
									cy="80"
									r="70"
									stroke="currentColor"
									strokeWidth="10"
									fill="transparent"
									className="text-muted/20"
								/>
								{/* Progress Circle - Rotation applied ONLY to the stroke */}
								<circle
									cx="80"
									cy="80"
									r="70"
									stroke="currentColor"
									strokeWidth="10"
									fill="transparent"
									strokeDasharray={440}
									strokeDashoffset={440 - (440 * completionPercentage) / 100}
									strokeLinecap="round"
									className="text-primary transition-all duration-500 ease-in-out origin-center -rotate-90"
								/>
							</svg>

							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<span className="text-4xl font-extrabold tracking-tighter">
									{completionPercentage}%
								</span>
								<Badge variant="secondary" className="mt-1 font-medium">
									{completedHours.toFixed(1)} / {requiredHours}h
								</Badge>
							</div>
						</div>

						<div className="w-full space-y-3">
							<div className="flex justify-between text-sm font-medium">
								<span className="text-muted-foreground">Linear Progress</span>
								<span className="text-primary">
									{remainingHours}h remaining
								</span>
							</div>
							<Progress value={completionPercentage} className="h-3" />
						</div>
					</CardContent>

					<CardFooter className="border-t bg-muted/20 pt-6 mt-4">
						<div className="w-full space-y-2">
							<Label
								htmlFor="requiredHours"
								className="text-xs uppercase tracking-wider text-muted-foreground font-semibold"
							>
								Target Requirement
							</Label>
							<div className="flex items-center gap-2">
								<Input
									id="requiredHours"
									type="number"
									value={requiredHours}
									onChange={handleRequiredHoursChange}
									className="bg-background"
									placeholder="Set target hours..."
								/>
							</div>
						</div>
					</CardFooter>
				</Card>

				{/* Right Column: Form Entry */}
				<Card className="lg:col-span-7 border-border/60 shadow-sm">
					<CardHeader>
						<CardTitle className="text-xl font-semibold tracking-tight">
							Record Time Entry
						</CardTitle>
						<CardDescription>
							Log your daily hours and activities here.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="rounded-lg border border-dashed p-4 bg-muted/10">
							<EntryForm
								data={entryValue}
								handleInputChange={handleInputChange}
								isSubmitting={isSubmitting}
								isUpdate={false}
								handleAddEntry={handleAddEntry}
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="border-border/60 shadow-sm overflow-hidden">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<div className="space-y-1">
						<CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
							<History className="h-5 w-5 text-muted-foreground" />
							Time Entry History
						</CardTitle>
					</div>
					{loading && (
						<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground animate-pulse">
							<Loader2 className="h-3 w-3 animate-spin" />
							SYNCING
						</div>
					)}
				</CardHeader>
				<CardContent>
					{timeEntries.length === 0 && !loading ? (
						<Alert
							variant="default"
							className="border-dashed bg-muted/20 py-8 flex flex-col items-center justify-center text-center"
						>
							<AlertCircle className="h-5 w-5 mb-2 text-muted-foreground" />
							<AlertDescription className="text-muted-foreground">
								No time entries yet. Add your first entry using the form above.
							</AlertDescription>
						</Alert>
					) : (
						/* ScrollArea keeps your layout from stretching to infinity */
						<ScrollArea className="h-[450px] pr-4 -mr-4">
							<div className="space-y-4">
								{timeEntries.map((entryValue, index) => {
									const morningHours = calculateEntryHours(
										entryValue.morning_time_in,
										entryValue.morning_time_out,
									);
									const afternoonHours = calculateEntryHours(
										entryValue.afternoon_time_in,
										entryValue.afternoon_time_out,
									);
									const eveningHours = calculateEntryHours(
										entryValue.evening_time_in,
										entryValue.evening_time_out,
									);

									// Fix decimals right at the source
									const totalHours = (
										morningHours +
										afternoonHours +
										eveningHours
									).toFixed(1);

									return (
										<div
											key={entryValue.id}
											className="transition-all hover:translate-x-1"
										>
											<EntriesCard
												index={index}
												entry={entryValue}
												morningHours={Number(morningHours.toFixed(1))}
												afternoonHours={Number(afternoonHours.toFixed(1))}
												eveningHours={Number(eveningHours.toFixed(1))}
												totalHours={Number(totalHours)}
											/>
										</div>
									);
								})}
							</div>
						</ScrollArea>
					)}
				</CardContent>
			</Card>

			<footer className="p-3 mt-10 text-center">
				<p className="text-sm">
					Built with NextJS + TailwindCSS by{" "}
					<span>
						<a
							className="underline hover:text-primary"
							href="https://aybangueco.github.io"
						>
							aybangueco
						</a>
					</span>
				</p>
			</footer>
		</div>
	);
}
