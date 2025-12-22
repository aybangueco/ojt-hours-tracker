// import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		domains: ["lh3.googleusercontent.com"],
	},
	devIndicators: false,
	experimental: {
		authInterrupts: true,
	},
	// webpack: (config, { isServer }) => {
	// 	if (isServer) {
	// 		config.plugins = [...config.plugins, new PrismaPlugin()];
	// 	}
	// 	return config;
	// },
};

export default nextConfig;
