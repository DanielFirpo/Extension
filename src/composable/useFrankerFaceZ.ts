import { reactive, toRef } from "vue";
import { definePropertyHook } from "@/common/Reflection";

const data = reactive({
	active: false,
	ffz: null as FFZGlobalScope | null,
});

definePropertyHook(window as Window & { ffz?: FFZGlobalScope }, "ffz", {
	value(v) {
		if (!v) return;

		data.active = true;
		data.ffz = v;
	},
});

/**
 * Get a config value from FFZ
 */
function getConfig<T = unknown>(key: string): T | null {
	if (!data.ffz) return null;

	const settings = data.ffz.resolve<FFZSettingsManager>("settings");
	if (!settings || typeof settings.get !== "function") return null;

	return settings.get<T>(key) ?? null;
}

/**
 * Watch a config value from FFZ
 */
function getConfigChanges<T = unknown>(key: string, cb: (val: T) => void): void {
	if (!data.ffz) return;

	const settings = data.ffz.resolve<FFZSettingsManager>("settings");
	if (!settings || typeof settings.getChanges !== "function") return;

	return settings.getChanges<T>(key, cb);
}

export function useFrankerFaceZ() {
	return {
		active: toRef(data, "active"),
		getConfig,
		getConfigChanges,
	};
}

export interface FFZGlobalScope {
	resolve<T>(key: string): T;
	settings: FFZSettingsManager;
}

export interface FFZSettingsManager {
	get<T = unknown>(key: string): T;
	getChanges<T = unknown>(key: string, cb: (val: T) => void): void;
}
