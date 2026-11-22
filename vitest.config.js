import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import { configDefaults } from "vitest/config";

export default defineWorkersConfig({
	test: {
		exclude: [...configDefaults.exclude, "test/chat.spec.js"],
		poolOptions: {
			workers: {
				wrangler: { configPath: "./wrangler.jsonc" },
			},
		},
	},
});
