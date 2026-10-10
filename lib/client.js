window.__ModuleLoader__.load({
	id: "dsh-mayori",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react_dom = require("react-dom");
		//#region src/client/infrastructure/rpc.js
		/** Same-origin transport for Host capability consumers. */
		function unwrap(result) {
			if (result.ok) return result.value;
			throw new Error(typeof result.error === "string" ? result.error : "Не удалось выполнить операцию с библиотекой.");
		}
		async function call(endpoint, payload, options = {}) {
			const response = await fetch(`/mayori/characters/${endpoint}`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload),
				signal: options.signal
			});
			const result = await response.json().catch(() => ({
				ok: false,
				error: `HTTP ${response.status}`
			}));
			if (!response.ok && result.ok !== false) throw new Error(`HTTP ${response.status}`);
			return unwrap(result);
		}
		//#endregion
		//#region src/features/characters/client/library.js
		/** Browser proxy for the Host-owned Character Library Service. */
		const EMPTY_SNAPSHOT = Object.freeze({
			status: "loading",
			cards: Object.freeze([]),
			total: 0,
			filteredTotal: 0,
			page: 1,
			pageSize: 5,
			facets: {
				creators: [],
				tags: []
			},
			error: null,
			revision: 0
		});
		/** Service Definition consumed by gallery UI. */
		var CharacterLibraryService = class {
			getSnapshot() {
				throw new Error("CharacterLibraryService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("CharacterLibraryService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("CharacterLibraryService.refresh() is not implemented");
			}
			importFiles() {
				throw new Error("CharacterLibraryService.importFiles() is not implemented");
			}
			remove() {
				throw new Error("CharacterLibraryService.remove() is not implemented");
			}
			prepareCampaign() {
				throw new Error("CharacterLibraryService.prepareCampaign() is not implemented");
			}
			play() {
				throw new Error("CharacterLibraryService.play() is not implemented");
			}
			start() {
				throw new Error("CharacterLibraryService.start() is not implemented");
			}
			get() {
				throw new Error("CharacterLibraryService.get() is not implemented");
			}
		};
		function toBase64(bytes) {
			const chunkSize = 32768;
			let binary = "";
			for (let offset = 0; offset < bytes.length; offset += chunkSize) binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
			return btoa(binary);
		}
		/** Client Provider that keeps only an observable snapshot; Host owns persistence. */
		var RemoteCharacterLibraryProvider = class RemoteCharacterLibraryProvider extends CharacterLibraryService {
			#snapshot = EMPTY_SNAPSHOT;
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			#revision = 0;
			#controller;
			#poll;
			#gallery;
			constructor(options = {}, owner) {
				super();
				this.options = {
					page: 1,
					pageSize: 5,
					...options
				};
				this.owner = owner ?? this;
			}
			gallery() {
				return this.#gallery ??= new RemoteCharacterLibraryProvider({ pageSize: 20 }, this);
			}
			get(id) {
				return call("get", { id });
			}
			setQuery(options) {
				const next = {
					...this.options,
					...options
				};
				if (JSON.stringify(next) === JSON.stringify(this.options)) return;
				this.options = next;
				this.refresh().catch(() => {});
			}
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				this.#ensureLoaded();
				if (this.#snapshot.indexing && !this.#poll) this.#poll = setTimeout(() => {
					this.refresh().catch(() => {});
				}, 400);
				return () => {
					this.#listeners.delete(listener);
					if (!this.#listeners.size) {
						clearTimeout(this.#poll);
						this.#poll = void 0;
					}
				};
			};
			async importFiles(files) {
				await this.#ensureLoaded();
				const result = {
					imported: 0,
					rejected: []
				};
				const inputs = [...files];
				for (let offset = 0; offset < inputs.length; offset += 2) {
					const prepared = [];
					for (const file of inputs.slice(offset, offset + 2)) {
						if (file.size > 16777216) {
							result.rejected.push({
								name: file.name,
								error: "Файл превышает 16 МБ."
							});
							continue;
						}
						prepared.push({
							name: file.name || "character-card",
							type: file.type || "",
							base64: toBase64(new Uint8Array(await file.arrayBuffer()))
						});
					}
					if (!prepared.length) continue;
					const partial = await call("import", { files: prepared });
					result.imported += partial.imported;
					result.rejected.push(...partial.rejected);
				}
				await this.owner.refreshAll();
				return result;
			}
			async remove(id) {
				await call("remove", { id });
				await this.owner.refreshAll();
			}
			async refreshAll() {
				await Promise.all([this.refresh(), this.#gallery?.refresh()]);
			}
			async start(characterId, workspaceId, greetingIndex = 0) {
				return call("start", {
					characterId,
					workspaceId,
					greetingIndex
				});
			}
			async play(characterId, sessionId) {
				return call("play", {
					characterId,
					sessionId
				});
			}
			async prepareCampaign() {
				return call("prepare-campaign", {});
			}
			async #ensureLoaded() {
				this.#loading ??= this.refresh().catch(() => {});
				return this.#loading;
			}
			async refresh() {
				const revision = ++this.#revision;
				this.#controller?.abort();
				const controller = this.#controller = new AbortController();
				this.#publish("loading", this.#snapshot.cards, null);
				try {
					const result = await call("list", this.options, { signal: controller.signal });
					if (revision === this.#revision) {
						this.#publish("ready", Array.isArray(result.cards) ? result.cards : [], null, result);
						clearTimeout(this.#poll);
						if (result.indexing && this.#listeners.size) this.#poll = setTimeout(() => {
							this.refresh().catch(() => {});
						}, 400);
					}
				} catch (error) {
					if (revision === this.#revision && !controller.signal.aborted) {
						this.#loading = void 0;
						this.#publish("error", this.#snapshot.cards, error instanceof Error ? error.message : String(error));
					}
					throw error;
				}
			}
			dispose() {
				++this.#revision;
				this.#controller?.abort();
				clearTimeout(this.#poll);
				this.#listeners.clear();
				this.#gallery?.dispose();
				this.#snapshot = EMPTY_SNAPSHOT;
			}
			#publish(status, cards, error, result = {}) {
				this.#snapshot = Object.freeze({
					...this.#snapshot,
					...result,
					status,
					cards: Object.freeze(cards),
					error,
					revision: this.#snapshot.revision + 1
				});
				for (const listener of [...this.#listeners]) listener();
			}
		};
		//#endregion
		//#region src/shared/resources.js
		/** Bounded caches contain derived data only; active callers own their results. */
		var ByteCache = class {
			constructor(maxEntries = 128, maxBytes = 2097152) {
				this.maxEntries = maxEntries;
				this.maxBytes = maxBytes;
				this.bytes = 0;
				this.entries = /* @__PURE__ */ new Map();
			}
			get(key) {
				const entry = this.entries.get(key);
				if (!entry) return void 0;
				this.entries.delete(key);
				this.entries.set(key, entry);
				return entry.value;
			}
			set(key, value, bytes = JSON.stringify(value).length * 2) {
				this.delete(key);
				if (bytes > this.maxBytes) return;
				this.entries.set(key, {
					value,
					bytes
				});
				this.bytes += bytes;
				while (this.entries.size > this.maxEntries || this.bytes > this.maxBytes) this.delete(this.entries.keys().next().value);
			}
			delete(key) {
				const entry = this.entries.get(key);
				if (entry) this.bytes -= entry.bytes;
				this.entries.delete(key);
			}
			clear() {
				this.entries.clear();
				this.bytes = 0;
			}
		};
		//#endregion
		//#region src/features/history/client/history.js
		/** History capability backed by the durable DSH session catalog and archive. */
		var ChatHistoryService = class {
			getSnapshot() {
				throw new Error("ChatHistoryService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("ChatHistoryService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("ChatHistoryService.refresh() is not implemented");
			}
			ensureLoaded() {
				throw new Error("ChatHistoryService.ensureLoaded() is not implemented");
			}
			open() {
				throw new Error("ChatHistoryService.open() is not implemented");
			}
			getArchiveSnapshot() {
				throw new Error("ChatHistoryService.getArchiveSnapshot() is not implemented");
			}
			subscribeArchive() {
				throw new Error("ChatHistoryService.subscribeArchive() is not implemented");
			}
			archive() {
				throw new Error("ChatHistoryService.archive() is not implemented");
			}
			restore() {
				throw new Error("ChatHistoryService.restore() is not implemented");
			}
			details() {
				throw new Error("ChatHistoryService.details() is not implemented");
			}
		};
		/** No second persistence store: DSH owns catalog refresh and chat restoration. */
		var SessionChatHistoryProvider = class extends ChatHistoryService {
			constructor(sessions, uiWorkspace, workspaces) {
				super();
				this.sessions = sessions;
				this.uiWorkspace = uiWorkspace;
				this.workspaces = workspaces;
				this.cache = new ByteCache();
				this.pending = /* @__PURE__ */ new Map();
				this.revision = 0;
			}
			getSnapshot = () => this.sessions.list.getSnapshot();
			subscribe = (listener) => this.sessions.list.subscribe(listener);
			refresh = () => {
				this.revision++;
				this.cache.clear();
				return this.sessions.refresh();
			};
			ensureLoaded = () => this.getSnapshot().phase === "ready" && this.getSnapshot().state !== "error" ? Promise.resolve() : this.sessions.refresh();
			open = (id) => this.uiWorkspace.openSession(id);
			getArchiveSnapshot = () => this.workspaces.list.getSnapshot();
			subscribeArchive = (listener) => this.workspaces.list.subscribe(listener);
			archive = (id) => this.uiWorkspace.archiveSession(id);
			restore = (id) => this.uiWorkspace.unarchiveSession(id);
			details = async (ids, options = {}) => {
				const snapshot = this.getSnapshot();
				const revision = this.revision;
				const result = {}, missing = [];
				for (const id of ids) {
					const key = `${revision}:${id}:${snapshot.byId[id]?.updatedAt}`;
					const cached = options.force ? void 0 : this.cache.get(key);
					if (cached) result[id] = cached;
					else missing.push([id, key]);
				}
				if (!missing.length) return result;
				const requestKey = JSON.stringify(missing);
				if (!this.pending.has(requestKey)) {
					const request = call("history-details", { ids: missing.map((row) => row[0]) }).then((values) => {
						if (revision === this.revision) {
							for (const [id, key] of missing) if (values[id] && !values[id].error) this.cache.set(key, values[id]);
						}
						return values;
					}).finally(() => this.pending.delete(requestKey));
					this.pending.set(requestKey, request);
				}
				return {
					...result,
					...await this.pending.get(requestKey)
				};
			};
			dispose() {
				this.revision++;
				this.cache.clear();
			}
		};
		/** Flatten all campaigns, retain ordinary forks, omit agent children and blanks. */
		function historyRows(snapshot, query = "", archivedSessionIds = [], archivedOnly = false, limit = Infinity) {
			const needle = query.trim().toLocaleLowerCase("ru");
			const archived = new Set(archivedSessionIds);
			const rows = [];
			const order = (a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id);
			for (const id of snapshot.ids) {
				const row = snapshot.byId[id];
				if (!row || row.origin === "subagent" || row.blank && !row.title?.trim()) continue;
				if (archived.has(id) !== archivedOnly) continue;
				const title = row.title?.trim() || "Чат без названия";
				if (needle && !`${title}\n${id}`.toLocaleLowerCase("ru").includes(needle)) continue;
				rows.push({
					id,
					title,
					updatedAt: row.updatedAt,
					current: row.retainedBy?.mainView > 0
				});
				if (Number.isFinite(limit)) {
					rows.sort(order);
					if (rows.length > limit) rows.pop();
				}
			}
			return Number.isFinite(limit) ? rows : rows.sort(order);
		}
		//#endregion
		//#region src/client/components/pagination-model.js
		const PAGE_SIZE_OPTIONS = [
			20,
			40,
			60
		];
		function paginate(items, requestedPage, pageSize) {
			const size = PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : 20;
			const pages = Math.max(1, Math.ceil(items.length / size));
			const page = Math.max(1, Math.min(pages, Number.isSafeInteger(requestedPage) ? requestedPage : 1));
			const start = (page - 1) * size;
			return {
				page,
				pages,
				start,
				end: Math.min(start + size, items.length),
				items: items.slice(start, start + size)
			};
		}
		//#endregion
		//#region src/client/components/select.jsx
		/** DSH's shared menu owns placement, keyboard navigation, dismissal and focus return. */
		function Select({ value, options, onChange, disabled = false, portal = true, id, "aria-label": label, "aria-describedby": description }) {
			const [open, setOpen] = (0, react.useState)(false);
			const selectedLabelId = (0, react.useId)();
			const selectedId = String(value);
			const items = options.map((option) => ({
				id: String(option.value),
				label: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					"data-mayori-option": String(option.value),
					children: option.label
				}),
				disabled: option.disabled
			}));
			const selected = items.find((option) => option.id === selectedId);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				className: "mayori-select",
				open: open && !disabled,
				portal,
				autoFocus: true,
				items,
				selectedId,
				onClose: () => setOpen(false),
				onSelect: (next) => {
					setOpen(false);
					if (next !== selectedId) onChange(next);
				},
				anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					id,
					type: "button",
					className: "mayori-select-trigger",
					disabled,
					"data-value": selectedId,
					"aria-label": label,
					"aria-describedby": `${selectedLabelId}${description ? ` ${description}` : ""}`,
					"aria-haspopup": "menu",
					"aria-expanded": open && !disabled,
					onClick: () => setOpen((previous) => !previous),
					onKeyDown: (event) => {
						if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
							event.preventDefault();
							setOpen(true);
						}
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						id: selectedLabelId,
						children: selected?.label ?? ""
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
				})
			});
		}
		//#endregion
		//#region src/client/components/pagination.jsx
		function Pagination({ pagination, total, pageSize, onPage, onPageSize }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
				className: "mayori-pagination",
				"aria-label": "Страницы списка",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-filter-control",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "На странице" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
							"aria-label": "На странице",
							value: pageSize,
							onChange: (value) => onPageSize(Number(value)),
							options: PAGE_SIZE_OPTIONS.map((size) => ({
								value: size,
								label: size
							}))
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						role: "status",
						children: [
							total === 0 ? "0" : `${pagination.start + 1}–${pagination.end}`,
							" из ",
							total
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-page-actions",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-secondary-button",
								disabled: pagination.page <= 1,
								onClick: () => {
									onPage(pagination.page - 1);
								},
								"aria-label": "Предыдущая страница",
								children: "‹"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "mayori-filter-control",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Страница" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "number",
									min: "1",
									max: pagination.pages,
									value: pagination.page,
									onChange: (event) => {
										const value = Number(event.target.value);
										if (Number.isSafeInteger(value) && value >= 1 && value <= pagination.pages) onPage(value);
									}
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["из ", pagination.pages] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-secondary-button",
								disabled: pagination.page >= pagination.pages,
								onClick: () => {
									onPage(pagination.page + 1);
								},
								"aria-label": "Следующая страница",
								children: "›"
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/features/media/shared/image.js
		const HASH = "[a-f0-9]{64}";
		const REFERENCE = new RegExp(`^mayori-media:(${HASH})$`);
		const URL$1 = new RegExp(`^/mayori/characters/(?:media/${HASH}/(?:avatar|gallery|preview|original)|card-image/${HASH}/(?:avatar|gallery|preview|original))$`);
		function mediaId(value) {
			return typeof value === "string" ? REFERENCE.exec(value)?.[1] ?? null : null;
		}
		function imageSource(value, variant = "avatar") {
			const id = mediaId(value);
			if (id) return `/mayori/characters/media/${id}/${variant}`;
			return typeof value === "string" && (URL$1.test(value) || /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) ? value : null;
		}
		function originalImage(value) {
			return imageSource(value, "original")?.replace(/\/(avatar|gallery|preview)$/, "/original") ?? null;
		}
		//#endregion
		//#region src/features/history/client/panel.jsx
		function ChatHistoryIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 11a9 9 0 1 1 2.6 7M3 4v7h7M12 7v5l3 2" })
			});
		}
		/** Load only the rows being displayed; late results never overwrite a new list. */
		function useHistoryDetails(history, rows, refreshKey = 0) {
			const [result, setResult] = (0, react.useState)({
				key: "",
				value: {},
				loading: false
			});
			const key = JSON.stringify(rows.map((row) => [row.id, row.updatedAt]));
			const requestKey = `${refreshKey}:${key}`;
			(0, react.useEffect)(() => {
				let active = true;
				const ids = JSON.parse(key).map((row) => row[0]);
				setResult({
					key: requestKey,
					value: {},
					loading: ids.length > 0
				});
				if (ids.length) Promise.resolve().then(() => history.details(ids)).then((value) => {
					if (active) setResult({
						key: requestKey,
						value,
						loading: false
					});
				}).catch(() => {
					if (active) setResult({
						key: requestKey,
						loading: false,
						value: Object.fromEntries(ids.map((id) => [id, { error: "Не удалось загрузить данные чата." }]))
					});
				});
				return () => {
					active = false;
				};
			}, [
				history,
				key,
				requestKey
			]);
			return result.key === requestKey ? result : {
				value: {},
				loading: rows.length > 0
			};
		}
		function HistoryRow({ row, detail, loading, disabled, onOpen }) {
			const avatar = imageSource(detail?.avatar);
			const [failedImage, setFailedImage] = (0, react.useState)(null);
			const name = detail?.characterName || row.title;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mayori-history-row",
				disabled,
				onClick: () => {
					onOpen(row.id);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "mayori-history-avatar",
						"aria-hidden": "true",
						children: avatar && failedImage !== avatar ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							src: avatar,
							alt: "",
							loading: "lazy",
							onError: () => {
								setFailedImage(avatar);
							}
						}) : Array.from(name)[0]?.toUpperCase()
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "mayori-history-text",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: name }),
							detail?.characterName && row.title !== name && row.title !== "Чат без названия" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: row.title }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-history-preview",
								children: loading ? "Загружаем сообщение…" : detail?.error || detail?.preview || "Сообщений пока нет"
							}),
							row.current && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "Открыт сейчас" })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", {
						dateTime: new Date(row.updatedAt).toISOString(),
						children: new Date(row.updatedAt).toLocaleString("ru-RU", {
							dateStyle: "medium",
							timeStyle: "short"
						})
					})
				]
			});
		}
		/** A flat catalog consumer; opening a row restores the existing conversation. */
		function ChatHistoryPanel({ history }) {
			const snapshot = (0, react.useSyncExternalStore)(history.subscribe, history.getSnapshot, history.getSnapshot);
			const archiveSnapshot = (0, react.useSyncExternalStore)(history.subscribeArchive, history.getArchiveSnapshot, history.getArchiveSnapshot);
			const [archivedOnly, setArchivedOnly] = (0, react.useState)(false);
			const [changingId, setChangingId] = (0, react.useState)(null);
			const changingRef = (0, react.useRef)(false);
			const archiveToggleRef = (0, react.useRef)(null);
			const [notice, setNotice] = (0, react.useState)("");
			const [query, setQuery] = (0, react.useState)("");
			const [page, setPage] = (0, react.useState)(1);
			const [pageSize, setPageSize] = (0, react.useState)(20);
			(0, react.useEffect)(() => {
				setPage(1);
			}, [
				query,
				archivedOnly,
				pageSize
			]);
			const [error, setError] = (0, react.useState)(null);
			const [refreshing, setRefreshing] = (0, react.useState)(false);
			const [detailsRevision, setDetailsRevision] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				if (notice && changingId === null) archiveToggleRef.current?.focus();
			}, [notice, changingId]);
			(0, react.useEffect)(() => {
				let active = true;
				setRefreshing(true);
				Promise.resolve().then(() => history.ensureLoaded()).catch(() => {
					if (active) setError("Не удалось загрузить историю. Попробуйте обновить список.");
				}).finally(() => {
					if (active) setRefreshing(false);
				});
				return () => {
					active = false;
				};
			}, [history]);
			const refresh = async () => {
				setError(null);
				setRefreshing(true);
				try {
					await history.refresh();
				} catch {
					setError("Не удалось загрузить историю. Попробуйте обновить список.");
				} finally {
					setRefreshing(false);
					setDetailsRevision((value) => value + 1);
				}
			};
			const open = async (id) => {
				setError(null);
				try {
					await history.open(id);
				} catch {
					setError("Не удалось открыть чат. Обновите список и попробуйте снова.");
				}
			};
			const changeArchive = async (row) => {
				if (changingRef.current) return;
				if (!archivedOnly && !window.confirm(`Убрать чат «${row.title}» в архив? Переписка сохранится, и чат можно будет восстановить.`)) return;
				changingRef.current = true;
				setChangingId(row.id);
				setError(null);
				setNotice("");
				try {
					if (archivedOnly) await history.restore(row.id);
					else await history.archive(row.id);
					setNotice(archivedOnly ? `Чат «${row.title}» восстановлен.` : `Чат «${row.title}» перемещён в архив.`);
				} catch (failure) {
					setError(failure?.rpcError?.code === "workspace/session-active" ? "Чат ещё выполняет работу. Дождитесь завершения или остановите её в чате, затем повторите." : archivedOnly ? "Не удалось восстановить чат. Попробуйте ещё раз." : "Не удалось переместить чат в архив. Попробуйте ещё раз.");
				} finally {
					changingRef.current = false;
					setChangingId(null);
				}
			};
			const loading = refreshing || snapshot.phase === "pending" || archiveSnapshot.phase === "pending";
			const rows = (0, react.useMemo)(() => archiveSnapshot.phase === "ready" ? historyRows(snapshot, query, archiveSnapshot.archivedSessionIds, archivedOnly) : [], [
				snapshot,
				query,
				archiveSnapshot,
				archivedOnly
			]);
			const pagination = paginate(rows, page, pageSize);
			const details = useHistoryDetails(history, pagination.items, detailsRevision);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-history-panel",
				"aria-labelledby": "mayori-history-title",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "mayori-history-header",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							id: "mayori-history-title",
							children: "История чатов"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-history-controls",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								ref: archiveToggleRef,
								type: "checkbox",
								checked: archivedOnly,
								disabled: changingId !== null,
								onChange: (event) => {
									setArchivedOnly(event.target.checked);
									setError(null);
									setNotice("");
								}
							}), "Архив"] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-secondary-button",
								disabled: refreshing,
								onClick: () => {
									refresh();
								},
								children: "Обновить"
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "mayori-search",
						children: ["Поиск по названию или ID чата", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "search",
							value: query,
							onChange: (event) => {
								setQuery(event.target.value);
							},
							placeholder: "Например, имя персонажа"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: loading ? "Загружаем историю…" : notice || `Найдено чатов: ${rows.length}`
					}),
					archiveSnapshot.state === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mayori-error",
						children: "Не удалось загрузить состояние архива. Проверьте соединение и перезагрузите страницу."
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mayori-error",
						children: error
					}),
					!loading && !error && archiveSnapshot.state !== "error" && rows.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: query.trim() ? "Ничего не найдено. Измените запрос или очистите поиск." : archivedOnly ? "В архиве пока нет чатов." : "Чатов пока нет. Выберите персонажа и нажмите «Играть» или восстановите чат из архива." }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: "mayori-history-list",
						children: pagination.items.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
							className: "mayori-history-item",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryRow, {
								row,
								detail: details.value[row.id],
								loading: details.loading,
								disabled: changingId === row.id,
								onOpen: open
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-secondary-button",
								disabled: changingId !== null || archiveSnapshot.state === "error",
								"aria-label": `${archivedOnly ? "Восстановить чат" : "В архив — чат"} «${row.title}»`,
								onClick: () => {
									changeArchive(row);
								},
								children: changingId === row.id ? "Сохраняем…" : archivedOnly ? "Восстановить" : "В архив"
							})]
						}, row.id))
					}),
					rows.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pagination, {
						pagination,
						total: rows.length,
						pageSize,
						onPage: setPage,
						onPageSize: setPageSize
					})
				]
			});
		}
		//#endregion
		//#region src/features/characters/client/catalog-view.js
		/** Browser presentation preferences; no campaign data is persisted here. */
		const COLUMN_OPTIONS = [
			3,
			5,
			7
		];
		const CATALOG_PREFERENCE_KEY = "mayori.characters.view";
		function catalogPreferences(value) {
			return {
				columns: COLUMN_OPTIONS.includes(value?.columns) ? value.columns : 5,
				pageSize: PAGE_SIZE_OPTIONS.includes(value?.pageSize) ? value.pageSize : 20
			};
		}
		function readCatalogPreferences() {
			try {
				return catalogPreferences(JSON.parse(globalThis.localStorage.getItem(CATALOG_PREFERENCE_KEY)));
			} catch {
				return catalogPreferences(null);
			}
		}
		function saveCatalogPreferences(value) {
			try {
				globalThis.localStorage.setItem(CATALOG_PREFERENCE_KEY, JSON.stringify(catalogPreferences(value)));
			} catch {}
		}
		function recentCharacters(cards) {
			return [...cards].sort((a, b) => b.importedAt - a.importedAt || a.id.localeCompare(b.id)).slice(0, 5);
		}
		//#endregion
		//#region src/shared/templates.js
		/** Deterministic subset of SillyTavern macros, shared by Host and previews. */
		const DEFAULT_PERSONA = Object.freeze({
			id: null,
			name: "Игрок",
			description: "",
			avatar: "",
			title: ""
		});
		function renderTemplate(text, character, persona = DEFAULT_PERSONA, timestamp = 0) {
			const data = character.data ?? {};
			const date = new Date(timestamp);
			const names = {
				user: persona.name,
				char: character.name,
				charifnotgroup: character.name,
				group: character.name,
				groupnotmuted: character.name,
				notchar: persona.name
			};
			const fields = {
				persona: persona.description,
				description: data.description,
				chardesc: data.description,
				personality: data.personality,
				charpersonality: data.personality,
				scenario: data.scenario,
				charexamples: data.mes_example,
				mesexamples: data.mes_example,
				charexamplesraw: data.mes_example,
				charprompt: data.system_prompt,
				charjailbreak: data.post_history_instructions,
				charversion: data.character_version,
				charcreator: data.creator
			};
			const constants = {
				newline: "\n",
				space: " ",
				noop: "",
				original: "",
				input: "",
				isodate: date.toISOString().slice(0, 10),
				isotime: date.toISOString().slice(11, 19),
				date: date.toISOString().slice(0, 10),
				time: date.toISOString().slice(11, 16),
				weekday: [
					"Sunday",
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
					"Saturday"
				][date.getUTCDay()]
			};
			const expand = (value, path = []) => String(value ?? "").replace(/\{\{\/\/[^{}]*\}\}/g, "").replace(/[\t \r\n]*\{\{\s*trim\s*\}\}[\t \r\n]*/gi, "").replace(/\{\{\s*([a-z][a-z0-9]*)\s*\}\}|<USER>|<BOT>/gi, (raw, token) => {
				const key = token?.toLowerCase() ?? (raw.toUpperCase() === "<USER>" ? "user" : "char");
				if (Object.hasOwn(names, key)) return names[key];
				if (Object.hasOwn(constants, key)) return constants[key];
				if (!Object.hasOwn(fields, key)) return raw;
				if (path.includes(key) || path.length >= 12) return "";
				return expand(fields[key], [...path, key]);
			});
			return expand(text);
		}
		//#endregion
		//#region src/features/characters/client/gallery.jsx
		/** Full-screen Gallery Consumer for the Host-owned Character Library. */
		const EMPTY_ARRAY = Object.freeze([]);
		function icon(name) {
			const common = {
				width: 20,
				height: 20,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.5,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": true
			};
			if (name === "gallery") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...common,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "9",
						cy: "9",
						r: "1.5"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m5 17 4.5-4.5 3 3 2-2L19 18" })
				]
			});
			if (name === "upload") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...common,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" })]
			});
			if (name === "close") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...common,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m6 6 12 12M18 6 6 18" })
			});
			if (name === "trash") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...common,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" })
			});
			if (name === "search") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...common,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "11",
					cy: "11",
					r: "6.5"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m16 16 4 4" })]
			});
			if (name === "filter") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...common,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 6h16M7 12h10M10 18h4" })
			});
			if (name === "play") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...common,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m9 7 8 5-8 5z" })
			});
			if (name === "edit") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...common,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m14.8 6.8 2.8 2.8" })]
			});
			return null;
		}
		function text$1(value) {
			return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
		}
		function cardTags(card) {
			return Array.isArray(card.data.tags) ? card.data.tags.filter((value) => typeof value === "string" && value.trim() !== "").map((value) => value.trim()) : EMPTY_ARRAY;
		}
		function safeAssetUri(card) {
			const image = imageSource(card.image, "gallery");
			if (image) return image;
			const assets = Array.isArray(card.data.assets) ? card.data.assets : EMPTY_ARRAY;
			const main = assets.find((asset) => asset?.type === "icon" && asset?.name === "main") ?? assets.find((asset) => asset?.type === "icon");
			const uri = typeof main?.uri === "string" ? main.uri : "";
			return /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(uri) ? uri : null;
		}
		function useCardImage(card) {
			const [source, setSource] = (0, react.useState)(() => safeAssetUri(card));
			(0, react.useEffect)(() => {
				if (!(card.image instanceof Blob)) {
					setSource(safeAssetUri(card));
					return;
				}
				const url = URL.createObjectURL(card.image);
				setSource(url);
				return () => {
					URL.revokeObjectURL(url);
				};
			}, [card]);
			return source;
		}
		function CardPortrait({ card, className = "", large = false }) {
			const source = useCardImage(card);
			return source === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `mayori-card-fallback ${className}`,
				"aria-hidden": "true",
				children: card.name.slice(0, 1).toUpperCase()
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				className,
				src: large ? originalImage(source) ?? source : source,
				alt: `Портрет: ${card.name}`,
				loading: "lazy",
				decoding: "async"
			});
		}
		function ImportControl({ busy, inputRef, onFiles, compact = false }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: `mayori-import-button${compact ? " mayori-import-compact" : ""}`,
				"aria-disabled": busy || void 0,
				children: [
					icon("upload"),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: busy ? "Импорт…" : "Импортировать" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						ref: inputRef,
						type: "file",
						accept: ".png,.json,image/png,application/json",
						multiple: true,
						disabled: busy,
						onChange: (event) => {
							onFiles(event.currentTarget.files ?? []);
						}
					})
				]
			});
		}
		function CharacterCard({ card, onPlay, onEdit, playBusy, playDisabled }) {
			const tags = cardTags(card).slice(0, 3);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
				className: "mayori-card",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "mayori-card-media",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardPortrait, { card })
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-card-body",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-card-heading",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: card.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: text$1(card.data.creator) ?? "Автор не указан" })]
						}),
						tags.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: "mayori-tags",
							"aria-label": "Теги",
							children: tags.map((tag, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: tag }, `${tag}-${index}`))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-card-actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-card-play",
								disabled: playDisabled,
								"aria-busy": playBusy || void 0,
								onClick: () => {
									onPlay(card, 0);
								},
								children: [icon("play"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: playBusy ? "Открываем…" : "Играть" })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-card-edit",
								onClick: (event) => {
									onEdit(card, event.currentTarget);
								},
								children: [icon("edit"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Изменить" })]
							})]
						})
					]
				})] })
			});
		}
		function CharacterInfoDialog({ card, onClose, onRemove, triggerRef, onPlay, playDisabled, persona = DEFAULT_PERSONA }) {
			const dialogRef = (0, react.useRef)(null);
			const [greetingIndex, setGreetingIndex] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				setGreetingIndex(0);
			}, [card?.id]);
			(0, react.useEffect)(() => {
				const dialog = dialogRef.current;
				if (dialog === null) return;
				if (card !== null && !dialog.open) dialog.showModal();
				if (card === null && dialog.open) dialog.close();
			}, [card]);
			const finishClose = () => {
				onClose();
				requestAnimationFrame(() => {
					triggerRef.current?.focus();
				});
			};
			if (card === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dialog", {
				ref: dialogRef,
				className: "mayori-character-dialog",
				onClose: finishClose
			});
			const sections = [
				["Описание", text$1(card.data.description)],
				["Характер", text$1(card.data.personality)],
				["Сценарий", text$1(card.data.scenario)],
				["Первое сообщение", text$1(card.data.first_mes)],
				["Пример диалога", text$1(card.data.mes_example)],
				["Заметки автора", text$1(card.data.creator_notes)]
			].filter(([, value]) => value !== null);
			const tags = cardTags(card);
			const greetings = [card.data.first_mes ?? "", ...card.data.alternate_greetings ?? []];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dialog", {
				ref: dialogRef,
				className: "mayori-character-dialog",
				"aria-labelledby": "mayori-character-title",
				onClose: finishClose,
				onCancel: (event) => {
					event.preventDefault();
					dialogRef.current?.close();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-character-shell",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "mayori-character-header",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								id: "mayori-character-title",
								children: card.name
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: text$1(card.data.creator) ?? "Автор не указан" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-icon-action",
								"aria-label": "Закрыть информацию",
								onClick: () => {
									dialogRef.current?.close();
								},
								children: icon("close")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-character-content",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "mayori-character-portrait",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardPortrait, {
									card,
									large: true
								})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-character-details",
								children: [
									tags.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: "mayori-tags",
										"aria-label": "Теги",
										children: tags.map((tag, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: tag }, `${tag}-${index}`))
									}),
									card.warnings?.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-card-warning",
										children: card.warnings.join(" ")
									}),
									onPlay && greetings.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-character-opening",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mayori-filter-control",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Начало истории" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
												"aria-label": "Начало истории",
												value: greetingIndex,
												disabled: playDisabled,
												portal: false,
												onChange: (value) => setGreetingIndex(Number(value)),
												options: greetings.map((greeting, index) => ({
													value: index,
													label: index === 0 ? greeting.trim() ? "Основное приветствие" : "Без приветствия" : `Альтернатива ${index}`
												}))
											})]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
											className: "mayori-greeting-preview",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "Приветствие" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: renderTemplate(greetings[greetingIndex] ?? "", card, persona, Date.now()) || "История начнётся с вашего сообщения." })]
										})]
									}),
									sections.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dl", { children: sections.map(([label, value]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: value })] }, label)) }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-character-empty",
										children: "У этой карточки нет дополнительного описания."
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
										className: "mayori-character-meta",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Файл" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: card.sourceName })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Добавлен" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: new Intl.DateTimeFormat("ru", {
											dateStyle: "medium",
											timeStyle: "short"
										}).format(card.importedAt) })] })]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
							className: "mayori-character-footer",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-danger-button",
								onClick: () => {
									onRemove(card, dialogRef.current);
								},
								children: [icon("trash"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Удалить персонажа" })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-character-footer-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-secondary-button",
									onClick: () => {
										dialogRef.current?.close();
									},
									children: "Закрыть"
								}), onPlay && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-secondary-button mayori-card-play",
									disabled: playDisabled,
									onClick: () => {
										dialogRef.current?.close();
										onPlay(card, greetingIndex);
									},
									children: "Играть"
								})]
							})]
						})
					]
				})
			});
		}
		function Filters({ facets, query, setQuery, sort, setSort, creator, setCreator, portrait, setPortrait, selectedTags, setSelectedTags, onReset }) {
			const creators = facets?.creators ?? EMPTY_ARRAY;
			const tags = facets?.tags ?? EMPTY_ARRAY;
			const toggleTag = (tag) => {
				setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter((value) => value !== tag) : [...selectedTags, tag]);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-filter-fields",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "mayori-search",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Поиск" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "mayori-search-control",
							children: [icon("search"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "search",
								value: query,
								placeholder: "Имя, автор, описание",
								onChange: (event) => {
									setQuery(event.currentTarget.value);
								}
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-filter-control",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Сортировка" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
							"aria-label": "Сортировка",
							value: sort,
							onChange: setSort,
							options: [
								{
									value: "newest",
									label: "Сначала новые"
								},
								{
									value: "name",
									label: "По имени"
								},
								{
									value: "creator",
									label: "По автору"
								}
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-filter-control",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Автор" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
							"aria-label": "Автор",
							value: creator,
							onChange: setCreator,
							options: [{
								value: "all",
								label: "Все авторы"
							}, ...creators.map((value) => ({
								value,
								label: value
							}))]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
						className: "mayori-filter-group",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: "Портрет" }), [
							["all", "Все"],
							["with", "С портретом"],
							["without", "Без портрета"]
						].map(([value, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "radio",
							name: "mayori-portrait",
							value,
							checked: portrait === value,
							onChange: () => {
								setPortrait(value);
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label })] }, value))]
					}),
					tags.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
						className: "mayori-filter-group mayori-tag-filter",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: "Теги" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: tags.map(([tag, count]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: selectedTags.includes(tag),
								onChange: () => {
									toggleTag(tag);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tag }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: count })
						] }, tag)) })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mayori-reset-button",
						onClick: onReset,
						children: "Сбросить фильтры"
					})
				]
			});
		}
		function CharacterGalleryPanel({ library, personas, startCharacter }) {
			const personaSnapshot = (0, react.useSyncExternalStore)(personas.subscribe, personas.getSnapshot, personas.getSnapshot);
			const persona = personaSnapshot.personas.find((item) => item.id === personaSnapshot.defaultId) ?? DEFAULT_PERSONA;
			const inputRef = (0, react.useRef)(null);
			const detailTriggerRef = (0, react.useRef)(null);
			const catalog = (0, react.useMemo)(() => library.gallery(), [library]);
			const snapshot = (0, react.useSyncExternalStore)(catalog.subscribe, catalog.getSnapshot, catalog.getSnapshot);
			const [query, setQuery] = (0, react.useState)("");
			const [sort, setSort] = (0, react.useState)("newest");
			const [creator, setCreator] = (0, react.useState)("all");
			const [portrait, setPortrait] = (0, react.useState)("all");
			const [selectedTags, setSelectedTags] = (0, react.useState)([]);
			const [filtersOpen, setFiltersOpen] = (0, react.useState)(false);
			const [selectedCard, setSelectedCard] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [playingId, setPlayingId] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			const [preferences, setPreferences] = (0, react.useState)(readCatalogPreferences);
			const [page, setPage] = (0, react.useState)(1);
			const mainRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				saveCatalogPreferences(preferences);
			}, [preferences]);
			(0, react.useEffect)(() => {
				setPage(1);
			}, [
				query,
				sort,
				creator,
				portrait,
				selectedTags,
				preferences.pageSize
			]);
			(0, react.useEffect)(() => {
				const timeout = setTimeout(() => catalog.setQuery({
					query,
					sort,
					creator,
					portrait,
					tags: selectedTags,
					page,
					pageSize: preferences.pageSize
				}), query ? 150 : 0);
				return () => clearTimeout(timeout);
			}, [
				catalog,
				query,
				sort,
				creator,
				portrait,
				selectedTags,
				page,
				preferences.pageSize
			]);
			const cards = snapshot.cards;
			const pagination = {
				...paginate([], snapshot.page, preferences.pageSize),
				items: cards,
				page: snapshot.page,
				pages: Math.max(1, Math.ceil(snapshot.filteredTotal / preferences.pageSize)),
				start: cards.length ? (snapshot.page - 1) * preferences.pageSize : 0,
				end: Math.min(snapshot.filteredTotal, snapshot.page * preferences.pageSize)
			};
			(0, react.useEffect)(() => {
				mainRef.current?.scrollTo({ top: 0 });
			}, [pagination.page]);
			const importFiles = async (fileList) => {
				if (fileList.length === 0) return;
				setBusy(true);
				setNotice(null);
				try {
					const result = await library.importFiles(fileList);
					const rejected = result.rejected.map((item) => `${item.name}: ${item.error}`);
					setNotice({
						kind: rejected.length > 0 ? "error" : "success",
						text: [result.imported > 0 ? `Импортировано: ${result.imported}.` : "", ...rejected].filter(Boolean).join(" ")
					});
				} catch (error) {
					setNotice({
						kind: "error",
						text: error instanceof Error ? error.message : String(error)
					});
				} finally {
					setBusy(false);
					if (inputRef.current !== null) inputRef.current.value = "";
				}
			};
			const remove = async (card, infoDialog) => {
				if (!window.confirm(`Удалить персонажа «${card.name}» из галереи?`)) return;
				try {
					await library.remove(card.id);
					infoDialog?.close();
					setNotice({
						kind: "success",
						text: `Персонаж «${card.name}» удалён.`
					});
				} catch (error) {
					setNotice({
						kind: "error",
						text: error instanceof Error ? error.message : String(error)
					});
				}
			};
			const play = async (card, greetingIndex) => {
				setPlayingId(card.id);
				setNotice(null);
				try {
					await startCharacter(card, greetingIndex);
				} catch (error) {
					setNotice({
						kind: "error",
						text: error instanceof Error ? error.message : String(error)
					});
				} finally {
					setPlayingId(null);
				}
			};
			const resetFilters = () => {
				setQuery("");
				setSort("newest");
				setCreator("all");
				setPortrait("all");
				setSelectedTags([]);
			};
			const detailRevision = (0, react.useRef)(0);
			(0, react.useEffect)(() => () => {
				++detailRevision.current;
			}, []);
			const showDetails = async (item, trigger) => {
				detailTriggerRef.current = trigger;
				const revision = ++detailRevision.current;
				try {
					const card = await library.get(item.id);
					if (revision === detailRevision.current) setSelectedCard(card);
				} catch (error) {
					if (revision === detailRevision.current) setNotice({
						kind: "error",
						text: error.message
					});
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
				className: "mayori-gallery-panel",
				"aria-labelledby": "mayori-gallery-title",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-gallery-shell",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "mayori-gallery-header",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-gallery-title",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								id: "mayori-gallery-title",
								children: "Персонажи"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: snapshot.status === "ready" ? `${snapshot.total} в галерее${snapshot.indexing ? " · Обновляем каталог…" : ""}` : snapshot.status === "error" ? "Не удалось загрузить галерею" : "Загрузка…" })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-gallery-header-actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-filter-toggle",
								"aria-controls": "mayori-filter-panel",
								"aria-expanded": filtersOpen,
								onClick: () => {
									setFiltersOpen((value) => !value);
								},
								children: [icon("filter"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Фильтры" })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImportControl, {
								busy,
								inputRef,
								onFiles: importFiles,
								compact: true
							})]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-gallery-workspace",
						children: [
							filtersOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-filter-scrim",
								"aria-label": "Закрыть фильтры",
								onClick: () => {
									setFiltersOpen(false);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
								id: "mayori-filter-panel",
								className: `mayori-filter-panel${filtersOpen ? " is-open" : ""}`,
								"aria-label": "Фильтры персонажей",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-filter-panel-header",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "Фильтры" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "mayori-icon-action",
											"aria-label": "Закрыть фильтры",
											onClick: () => {
												setFiltersOpen(false);
											},
											children: icon("close")
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImportControl, {
										busy,
										inputRef,
										onFiles: importFiles
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Filters, {
										facets: snapshot.facets,
										query,
										setQuery,
										sort,
										setSort,
										creator,
										setCreator,
										portrait,
										setPortrait,
										selectedTags,
										setSelectedTags,
										onReset: resetFilters
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
								ref: mainRef,
								className: "mayori-gallery-main",
								id: "mayori-gallery-content",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-gallery-results",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											role: "status",
											"aria-live": "polite",
											children: snapshot.status === "ready" ? `Найдено ${snapshot.filteredTotal} из ${snapshot.total}` : ""
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mayori-column-control mayori-filter-control",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Карточек в ряд" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
												"aria-label": "Карточек в ряд",
												value: preferences.columns,
												onChange: (columns) => setPreferences((previous) => ({
													...previous,
													columns: Number(columns)
												})),
												options: COLUMN_OPTIONS.map((columns) => ({
													value: columns,
													label: columns
												}))
											})]
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "mayori-gallery-notice",
										role: "status",
										"aria-live": "polite",
										children: notice !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: notice.kind === "error" ? "mayori-error" : "mayori-success",
											children: notice.text
										})
									}),
									snapshot.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										role: "alert",
										className: "mayori-error",
										children: [
											snapshot.error,
											" ",
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "mayori-secondary-button",
												disabled: busy,
												onClick: () => {
													catalog.refresh().catch(() => {});
												},
												children: "Повторить загрузку"
											})
										]
									}),
									snapshot.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-empty",
										children: "Загружаем галерею…"
									}),
									snapshot.status === "ready" && cards.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-empty",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "mayori-empty-icon",
												children: icon("gallery")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: snapshot.total === 0 ? "Персонажей пока нет" : "Ничего не найдено" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: snapshot.total === 0 ? "Импортируйте PNG или JSON, чтобы добавить первого персонажа." : "Измените запрос или сбросьте фильтры." })
										]
									}),
									cards.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: "mayori-card-grid",
										style: { "--mayori-columns": preferences.columns },
										children: pagination.items.map((card) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterCard, {
											card,
											onPlay: play,
											playBusy: playingId === card.id,
											playDisabled: playingId !== null,
											onEdit: showDetails
										}, card.id))
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pagination, {
										pagination,
										total: snapshot.filteredTotal,
										pageSize: preferences.pageSize,
										onPage: setPage,
										onPageSize: (pageSize) => {
											setPreferences((value) => ({
												...value,
												pageSize
											}));
										}
									})] })
								]
							})
						]
					})]
				})
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterInfoDialog, {
				card: selectedCard,
				onClose: () => {
					setSelectedCard(null);
				},
				onRemove: remove,
				triggerRef: detailTriggerRef,
				persona,
				onPlay: play,
				playDisabled: playingId !== null
			})] });
		}
		/** The sidebar shell owns the actual button, label, tooltip and selected state. */
		function CharacterGalleryIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "4",
						y: "4",
						width: "16",
						height: "16",
						rx: "2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "9",
						cy: "9",
						r: "1.5"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m5 17 4.5-4.5 3 3 2-2L19 18" })
				]
			});
		}
		//#endregion
		//#region src/features/character-session/client/start.js
		/** Browser orchestration from a gallery card to a selected chat session. */
		function targetWorkspace(sessions, workspaces) {
			const current = Object.values(sessions.list.getSnapshot().byId).find((item) => item.retainedBy?.mainView > 0)?.id;
			const snapshot = workspaces.list.getSnapshot();
			return (current === void 0 ? void 0 : snapshot.items.find((item) => item.sessionIds.includes(current))?.workspaceId) ?? snapshot.items[0]?.workspaceId;
		}
		/** Create a fresh workspace session, bind the card, name it, and navigate. */
		async function startCharacterSession({ sessions, workspaces, uiWorkspace, library }, card, greetingIndex = 0) {
			let workspaceId = targetWorkspace(sessions, workspaces);
			if (workspaceId === void 0) {
				const campaign = await library.prepareCampaign();
				workspaceId = (await workspaces.create({ path: campaign.path })).workspaceId;
			}
			const prepared = await library.start(card.id, workspaceId, greetingIndex);
			const sessionId = await sessions.create({
				workspaceId,
				sessionId: prepared.sessionId
			});
			await sessions.using(sessionId, { source: "mayoriGallery" }, async (reference) => {
				const renamed = await (await reference.ready).session.rename(card.name);
				if (!renamed.ok) throw new Error(renamed.error.message);
				uiWorkspace.openSession(sessionId);
			});
			return sessionId;
		}
		//#endregion
		//#region src/client/infrastructure/slot-mirror.js
		/** Reuse child contributions without claiming their original declarations. */
		function mirroredChildren(children, prefix) {
			return Object.fromEntries(Object.entries(children ?? {}).map(([name, spec]) => [`${prefix}.${name}`, spec]));
		}
		function remapChildProps(props, children, prefix) {
			const key = (name) => Object.hasOwn(children ?? {}, name) ? `${prefix}.${name}` : name;
			return {
				...props,
				...props.renderSlot ? { renderSlot: (name, owner, options) => props.renderSlot(key(name), owner, options) } : {},
				...props.renderSlotChain ? { renderSlotChain: (name, owner, options) => props.renderSlotChain(key(name), owner, options) } : {}
			};
		}
		/** Mirror public entries, injections and nested children into an owned child seat. */
		function mirrorSlot(ctx, original, alias) {
			const records = /* @__PURE__ */ new Map();
			const remove = (record) => {
				for (const dispose of record.children) dispose();
				record.dispose();
			};
			const sync = () => {
				const entries = ctx.slots.entries(original);
				for (const [entry, record] of records) if (!entries.includes(entry)) {
					records.delete(entry);
					remove(record);
				}
				for (const entry of entries) {
					if (records.has(entry)) continue;
					const Component = entry.component;
					const children = mirroredChildren(entry.children, alias);
					const record = {
						children: [],
						dispose: () => {}
					};
					records.set(entry, record);
					record.dispose = ctx.slots.register({
						name: alias,
						...entry.options,
						inject: entry.inject,
						locale: entry.locale,
						store: entry.store,
						select: entry.select,
						...Object.keys(children).length ? { children } : {}
					}, (props) => (0, react.createElement)(Component, remapChildProps(props, entry.children, alias)));
					record.children = Object.keys(entry.children ?? {}).map((name) => mirrorSlot(ctx, name, `${alias}.${name}`));
				}
			};
			const unsubscribe = ctx.slots.subscribe(original, sync);
			sync();
			return () => {
				unsubscribe();
				for (const record of records.values()) remove(record);
				records.clear();
			};
		}
		//#endregion
		//#region src/client/shell/sidebar.jsx
		/** Mayori-owned replacement for the stock workspace/coding sidebar region. */
		function MayoriMark({ className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className,
				width: "24",
				height: "24",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M17.75 4.9a7.85 7.85 0 1 0 1.35 12.55A8.8 8.8 0 0 1 9.4 5.7a7.8 7.8 0 0 1 8.35-.8Z",
					fill: "currentColor"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "m16.5 7.25.55 1.55 1.55.55-1.55.55-.55 1.55-.55-1.55-1.55-.55 1.55-.55.55-1.55Z",
					fill: "currentColor"
				})]
			});
		}
		function MayoriBrandName() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Mayori Engine" });
		}
		/** Workspace-region occupant. Settings retains its own public slot. */
		function MayoriSidebar() {
			return null;
		}
		/** The fully hidden desktop sidebar only needs its expand control. */
		function MayoriLeadingControls({ toggleSidebar, useShortcuts, t }) {
			const shortcut = useShortcuts((rows) => rows.find((row) => row.id === "sidebar.left.toggle"));
			const label = t("toggle.open");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mayori-navigation-toggle",
				"aria-label": label,
				title: label,
				"aria-keyshortcuts": shortcut?.aria,
				onClick: () => toggleSidebar(),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					width: "18",
					height: "18",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.5",
					"aria-hidden": "true",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "3",
						y: "4",
						width: "18",
						height: "16",
						rx: "3"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 4v16" })]
				})
			});
		}
		/** Each panel subscribes to selection through the sidebar's public runtime. */
		function NavigationRow({ id, label, wide, usePanelInfo, selectPanel, renderSlot }) {
			const active = usePanelInfo((info) => info.activePanelId === id);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mayori-navigation-row",
				"aria-label": label,
				"aria-current": active ? "page" : void 0,
				title: wide ? void 0 : label,
				onClick: () => selectPanel(id),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "mayori-navigation-glyph",
					"aria-hidden": "true",
					children: renderSlot("sidebar.panellist", {
						size: wide ? 16 : 18,
						active
					}, { only: id })
				}), wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "mayori-navigation-label",
					children: label
				})]
			});
		}
		/** Public sidebar consumer: home navigation without a generic New Session action. */
		function MayoriNavigationSidebar(props) {
			const { stockChildren, childPrefix } = props;
			const { collapsed, width, openHome, toggleSidebar, selectPanel, usePanels, usePanelInfo, useShortcuts, t, renderSlot } = remapChildProps(props, stockChildren, childPrefix);
			const panels = usePanels((snapshot) => snapshot);
			const shortcut = useShortcuts((rows) => rows.find((row) => row.id === "sidebar.left.toggle"));
			const wide = !collapsed;
			const toggleLabel = t(collapsed ? "toggle.open" : "toggle.collapse");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-navigation",
				"data-collapsed": collapsed,
				style: wide ? { width } : void 0,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-navigation-header",
						"data-window-drag": true,
						children: [wide && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mayori-navigation-brand",
							onClick: openHome,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								children: renderSlot("sidebar.brand.mark", { size: 24 })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-navigation-name",
								children: renderSlot("sidebar.brand.name", {})
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mayori-navigation-toggle",
							"aria-label": toggleLabel,
							title: toggleLabel,
							"aria-keyshortcuts": shortcut?.aria,
							onClick: () => toggleSidebar(),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
								width: "18",
								height: "18",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "1.5",
								"aria-hidden": "true",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
									x: "3",
									y: "4",
									width: "18",
									height: "16",
									rx: "3"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 4v16" })]
							}), !wide && renderSlot("sidebar.toggle.badge", {})]
						})]
					}),
					panels.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
						className: "mayori-navigation-panels",
						"aria-label": t("panels.label"),
						children: panels.map(({ id, label }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NavigationRow, {
							id,
							label,
							wide,
							usePanelInfo,
							selectPanel,
							renderSlot
						}, id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mayori-navigation-region",
						children: renderSlot("sidebar.workspaces", {
							wide,
							expandSidebar: () => {
								if (collapsed) toggleSidebar();
							}
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-navigation-footer",
						children: [renderSlot("sidebar.footer.action", { wide }), renderSlot("sidebar.settings", { wide })]
					})
				]
			});
		}
		//#endregion
		//#region src/features/personas/client/personas.js
		var PersonaService = class {
			getSnapshot() {
				throw new Error("PersonaService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("PersonaService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("PersonaService.refresh() is not implemented");
			}
			save() {
				throw new Error("PersonaService.save() is not implemented");
			}
			remove() {
				throw new Error("PersonaService.remove() is not implemented");
			}
			setDefault() {
				throw new Error("PersonaService.setDefault() is not implemented");
			}
		};
		var RemotePersonaProvider = class extends PersonaService {
			#snapshot = {
				status: "loading",
				personas: [],
				defaultId: null,
				error: null
			};
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				this.#loading ??= this.refresh().catch(() => {});
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(value) {
				this.#snapshot = value;
				for (const listener of this.#listeners) listener();
			}
			async refresh() {
				try {
					this.#publish({
						...await call("persona-list", {}),
						status: "ready",
						error: null
					});
				} catch (error) {
					this.#publish({
						...this.#snapshot,
						status: "error",
						error: error.message
					});
					throw error;
				}
			}
			async save(persona) {
				const result = await call("persona-save", persona);
				await this.refresh();
				return result;
			}
			async remove(id) {
				await call("persona-remove", { id });
				await this.refresh();
			}
			async setDefault(id) {
				await call("persona-default", { id });
				await this.refresh();
			}
		};
		//#endregion
		//#region src/features/character-session/client/chat.js
		/** Observable per-chat consumer of the Host Character Session capability. */
		var CharacterChatService = class {
			getSnapshot() {
				throw new Error("CharacterChatService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("CharacterChatService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("CharacterChatService.refresh() is not implemented");
			}
			swipe() {
				throw new Error("CharacterChatService.swipe() is not implemented");
			}
			setPersona() {
				throw new Error("CharacterChatService.setPersona() is not implemented");
			}
		};
		var RemoteCharacterChatProvider = class extends CharacterChatService {
			#snapshot = {
				status: "loading",
				value: null,
				error: null
			};
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			#revision = 0;
			#changing = false;
			#controller;
			constructor(sessionId) {
				super();
				this.sessionId = sessionId;
			}
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				this.#loading ??= this.refresh();
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(value) {
				this.#snapshot = value;
				for (const listener of this.#listeners) listener();
			}
			async refresh() {
				if (this.#changing) return;
				const revision = ++this.#revision;
				this.#controller?.abort();
				const controller = this.#controller = new AbortController();
				try {
					const value = await call("session-state", { sessionId: this.sessionId }, { signal: controller.signal });
					if (revision === this.#revision) this.#publish({
						status: "ready",
						value,
						error: null
					});
				} catch (error) {
					if (revision === this.#revision) this.#publish({
						...this.#snapshot,
						status: "error",
						error: error.message
					});
				}
			}
			async #change(endpoint, input) {
				if (this.#changing) throw new Error("Дождитесь сохранения текущего выбора.");
				this.#changing = true;
				++this.#revision;
				this.#publish({
					...this.#snapshot,
					status: "saving",
					error: null
				});
				try {
					const value = await call(endpoint, {
						sessionId: this.sessionId,
						...input
					});
					++this.#revision;
					this.#publish({
						status: "ready",
						value,
						error: null
					});
					return value;
				} catch (error) {
					this.#changing = false;
					await this.refresh();
					this.#publish({
						...this.#snapshot,
						error: error.message
					});
					throw error;
				} finally {
					this.#changing = false;
				}
			}
			swipe(index) {
				return this.#change("swipe", { index });
			}
			setPersona(personaId) {
				return this.#change("session-persona", { personaId });
			}
			dispose() {
				++this.#revision;
				this.#controller?.abort();
				this.#snapshot = {
					status: "loading",
					value: null,
					error: null
				};
				this.#loading = void 0;
			}
		};
		//#endregion
		//#region src/features/personas/client/panel.jsx
		const blank$2 = () => ({
			name: "",
			title: "",
			description: "",
			avatar: ""
		});
		function PersonaIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "12",
					cy: "7",
					r: "4"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 21v-2a8 8 0 0 1 16 0v2" })]
			});
		}
		function PersonaPanel({ personas, sessions, chatFor }) {
			const snapshot = (0, react.useSyncExternalStore)(personas.subscribe, personas.getSnapshot, personas.getSnapshot);
			const catalog = (0, react.useSyncExternalStore)(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot);
			const currentId = catalog.ids.find((id) => catalog.byId[id]?.retainedBy?.mainView > 0);
			const [draft, setDraft] = (0, react.useState)(blank$2);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)("");
			const [notice, setNotice] = (0, react.useState)("");
			const nameRef = (0, react.useRef)(null);
			const pending = (0, react.useRef)(false);
			const [currentPersona, setCurrentPersona] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				let active = true;
				setCurrentPersona(null);
				if (!currentId) return;
				const chat = chatFor(currentId);
				const update = () => {
					if (active) setCurrentPersona(chat.getSnapshot().value?.persona ?? null);
				};
				const unsubscribe = chat.subscribe(update);
				chat.refresh();
				update();
				return () => {
					active = false;
					unsubscribe();
				};
			}, [currentId, chatFor]);
			const run = async (operation, success) => {
				if (pending.current) return;
				pending.current = true;
				setBusy(true);
				setError("");
				setNotice("");
				try {
					await operation();
					setNotice(success);
				} catch (failure) {
					setError(failure.message || "Не удалось сохранить. Попробуйте ещё раз.");
				} finally {
					pending.current = false;
					setBusy(false);
				}
			};
			const choose = (persona) => {
				setDraft({ ...persona });
				setError("");
				setNotice("");
				nameRef.current?.focus();
			};
			const field = (key, value) => {
				setDraft((previous) => ({
					...previous,
					[key]: value
				}));
			};
			const image = async (event) => {
				const file = event.target.files?.[0];
				event.target.value = "";
				if (!file) return;
				if (![
					"image/png",
					"image/jpeg",
					"image/webp"
				].includes(file.type) || file.size > 2097152) {
					setError("Выберите PNG, JPEG или WebP размером до 2 МБ.");
					return;
				}
				await run(async () => {
					const data = await new Promise((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => resolve(reader.result);
						reader.onerror = () => reject(/* @__PURE__ */ new Error("Не удалось прочитать изображение."));
						reader.readAsDataURL(file);
					});
					field("avatar", data);
				}, "Аватар добавлен. Сохраните персону.");
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-personas-panel",
				"aria-labelledby": "mayori-personas-title",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "mayori-history-header",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							id: "mayori-personas-title",
							children: "Персоны"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Создайте персонажа, за которого будете играть." })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mayori-secondary-button",
							disabled: busy,
							onClick: () => choose(blank$2()),
							children: "Создать персону"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "mayori-persona-hint",
						children: "Персона по умолчанию используется в новых чатах. Для уже открытого чата выберите «Играть в этом чате»."
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: snapshot.status === "loading" ? "Загружаем персоны…" : notice
					}),
					snapshot.error && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						role: "alert",
						className: "mayori-error",
						children: [
							snapshot.error,
							" ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									run(() => personas.refresh(), "Список обновлён.");
								},
								children: "Обновить список"
							})
						]
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mayori-error",
						children: error
					}),
					currentPersona && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: ["В текущем чате: ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: currentPersona.name })] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-personas-layout",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: "mayori-persona-list",
							children: snapshot.personas.map((persona) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-persona-row",
								"aria-pressed": draft.id === persona.id,
								disabled: busy,
								onClick: () => choose(persona),
								children: [persona.avatar ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
									src: persona.avatar,
									alt: ""
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "mayori-persona-avatar",
									"aria-hidden": "true",
									children: persona.name.slice(0, 1)
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: persona.name }),
									persona.title && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: persona.title }),
									snapshot.defaultId === persona.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "По умолчанию" })
								] })]
							}) }, persona.id))
						}), snapshot.status === "ready" && snapshot.personas.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Персон пока нет. Укажите имя в форме и сохраните первую." })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: "mayori-persona-form",
							onSubmit: (event) => {
								event.preventDefault();
								run(async () => {
									setDraft(await personas.save(draft));
								}, "Персона сохранена.");
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: draft.id ? "Изменить персону" : "Новая персона" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["Имя в чате", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									ref: nameRef,
									name: "personaName",
									autoComplete: "off",
									required: true,
									maxLength: 120,
									value: draft.name,
									disabled: busy,
									onChange: (event) => field("name", event.target.value)
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["Подпись", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									name: "personaTitle",
									maxLength: 200,
									value: draft.title,
									disabled: busy,
									onChange: (event) => field("title", event.target.value)
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-persona-hint",
									children: "Подпись помогает различать персоны и не передаётся модели."
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["Описание", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									name: "personaDescription",
									rows: 8,
									maxLength: 32e3,
									value: draft.description,
									disabled: busy,
									onChange: (event) => field("description", event.target.value)
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: "mayori-persona-hint",
									children: [
										"Внешность, характер, биография. Имя подставляется вместо ",
										"{{user}}",
										", описание — вместо ",
										"{{persona}}",
										"."
									]
								}),
								draft.avatar && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
									className: "mayori-persona-image",
									src: draft.avatar,
									alt: `Аватар персоны ${draft.name || ""}`
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["Аватар", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "image/png,image/jpeg,image/webp",
									disabled: busy,
									onChange: (event) => {
										image(event);
									}
								})] }),
								draft.avatar && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-secondary-button",
									disabled: busy,
									onClick: () => field("avatar", ""),
									children: "Убрать аватар"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-persona-actions",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: "mayori-card-play",
										type: "submit",
										disabled: busy,
										"aria-busy": busy,
										children: "Сохранить персону"
									}), draft.id && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "mayori-secondary-button",
											disabled: busy,
											onClick: () => {
												run(() => personas.setDefault(snapshot.defaultId === draft.id ? null : draft.id), "Выбор для новых чатов сохранён.");
											},
											children: snapshot.defaultId === draft.id ? "Снять выбор по умолчанию" : "Использовать по умолчанию"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "mayori-secondary-button",
											disabled: busy || !currentId,
											onClick: () => {
												run(async () => {
													const saved = await personas.save(draft);
													setDraft(saved);
													await chatFor(currentId).setPersona(saved.id);
												}, "Персона закреплена за текущим чатом.");
											},
											children: "Играть в этом чате"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "mayori-danger-button",
											disabled: busy,
											onClick: () => {
												if (window.confirm(`Удалить персону «${draft.name}» из списка? В созданных чатах её копия сохранится.`)) run(async () => {
													await personas.remove(draft.id);
													setDraft(blank$2());
												}, "Персона удалена из списка.");
											},
											children: "Удалить персону"
										})
									] })]
								})
							]
						})]
					})
				]
			});
		}
		const MAX_PRESET_TEXT = 64e3;
		/** A legacy preset opens as one literal block without rewriting its text. */
		function presetNodes(preset) {
			return preset.nodes ?? [{
				id: "main-instructions",
				kind: "block",
				title: "Основные инструкции",
				enabled: true,
				text: preset.instructions ?? ""
			}];
		}
		function presetNodeEntries(nodes, ancestors = [], result = []) {
			for (const node of nodes) {
				result.push({
					node,
					ancestors,
					siblings: nodes
				});
				if (node.kind === "group") presetNodeEntries(node.children, [...ancestors, node], result);
			}
			return result;
		}
		/** Version 1: literal block bodies, in depth-first order; titles are UI metadata. */
		function compilePresetNodes(nodes) {
			return activePresetBlocks(nodes).map(({ node }) => node.text).join("\n\n");
		}
		function activePresetBlocks(nodes) {
			return presetNodeEntries(nodes).filter(({ node, ancestors }) => node.kind === "block" && node.enabled && ancestors.every((parent) => parent.enabled) && node.text.trim());
		}
		function canMovePresetNode(nodes, sourceId, targetId, position) {
			if (![
				"before",
				"after",
				"inside"
			].includes(position)) return false;
			const entries = presetNodeEntries(nodes);
			if (!entries.find((entry) => entry.node.id === sourceId)) return false;
			if (targetId === null) return position === "inside";
			const target = entries.find((entry) => entry.node.id === targetId);
			return !!target && targetId !== sourceId && !target.ancestors.some((node) => node.id === sourceId) && (position !== "inside" || target.node.kind === "group");
		}
		/** Move the whole subtree; never mutate the source tree or its saved baseline. */
		function movePresetNode(nodes, sourceId, targetId, position) {
			if (!canMovePresetNode(nodes, sourceId, targetId, position)) throw new TypeError("Выберите другое место: группу нельзя вложить в себя или её содержимое.");
			const result = structuredClone(nodes);
			const entries = presetNodeEntries(result);
			const source = entries.find((entry) => entry.node.id === sourceId);
			const target = targetId === null ? null : entries.find((entry) => entry.node.id === targetId);
			const destination = position === "inside" ? target?.node.children ?? result : target.siblings;
			source.siblings.splice(source.siblings.indexOf(source.node), 1);
			const index = position === "inside" ? destination.length : destination.indexOf(target.node) + (position === "after" ? 1 : 0);
			destination.splice(index, 0, source.node);
			if (presetNodeEntries(result).some((entry) => entry.ancestors.length >= 12)) throw new TypeError(`Используйте не больше 12 уровней вложенности.`);
			return result;
		}
		//#endregion
		//#region src/features/presets/client/editor.js
		const blankPreset = () => ({
			name: "",
			instructions: ""
		});
		const blank$1 = blankPreset;
		/** Presentation draft owned by the catalog provider, surviving panel unmounts. */
		var PresetEditor = class {
			#snapshot = {
				initialized: false,
				draft: blank$1(),
				saved: blank$1(),
				busy: false,
				error: "",
				notice: "",
				selectedNodeId: "main-instructions",
				collapsed: [],
				preview: false,
				undo: null
			};
			#listeners = /* @__PURE__ */ new Set();
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => this.#listeners.delete(listener);
			};
			update(value) {
				this.#snapshot = {
					...this.#snapshot,
					...value
				};
				for (const listener of this.#listeners) listener();
			}
			initialize(catalog) {
				if (this.#snapshot.initialized || catalog.status !== "ready") return;
				this.choose(catalog.presets.find((preset) => preset.id === catalog.defaultId) ?? catalog.presets[0] ?? blank$1());
			}
			choose(preset) {
				this.update({
					initialized: true,
					draft: structuredClone(preset),
					saved: preset.id ? structuredClone(preset) : blank$1(),
					error: "",
					notice: "",
					selectedNodeId: presetNodes(preset)[0]?.id ?? null,
					collapsed: [],
					preview: false,
					undo: null
				});
			}
			change(key, value) {
				this.update({
					draft: {
						...this.#snapshot.draft,
						[key]: value
					},
					notice: "",
					undo: null
				});
			}
			accept(preset) {
				this.update({
					draft: structuredClone(preset),
					saved: structuredClone(preset),
					undo: null
				});
			}
			reset() {
				this.update({
					draft: structuredClone(this.#snapshot.saved),
					selectedNodeId: presetNodes(this.#snapshot.saved)[0]?.id ?? null,
					collapsed: [],
					preview: false,
					undo: null,
					error: "",
					notice: ""
				});
			}
			selectNode(id) {
				this.update({
					selectedNodeId: id,
					preview: false
				});
			}
			toggleGroup(id) {
				const collapsed = new Set(this.#snapshot.collapsed);
				collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id);
				this.update({ collapsed: [...collapsed] });
			}
			#edit(operation, notice = "") {
				if (this.#snapshot.busy) return;
				try {
					const nodes = structuredClone(presetNodes(this.#snapshot.draft));
					const result = operation(nodes) ?? nodes;
					const entries = presetNodeEntries(result);
					if (entries.length > 256) throw new TypeError(`В пресете может быть не больше 256 блоков и групп.`);
					if (entries.some((entry) => entry.ancestors.length >= 12)) throw new TypeError(`Используйте не больше 12 уровней вложенности.`);
					this.update({
						draft: {
							...this.#snapshot.draft,
							nodes: result,
							instructions: compilePresetNodes(result),
							compilerVersion: 1
						},
						error: "",
						notice
					});
					return true;
				} catch (error) {
					this.update({ error: error.message });
					return false;
				}
			}
			changeNode(id, key, value) {
				if (this.#snapshot.busy || ![
					"title",
					"text",
					"enabled"
				].includes(key)) return;
				this.#edit((nodes) => {
					const node = presetNodeEntries(nodes).find((entry) => entry.node.id === id)?.node;
					if (!node || key === "text" && node.kind !== "block") return;
					node[key] = value;
				});
				this.update({ undo: null });
			}
			addNode(kind) {
				if (!["block", "group"].includes(kind)) return;
				const id = crypto.randomUUID();
				const previous = {
					draft: structuredClone(this.#snapshot.draft),
					selectedNodeId: this.#snapshot.selectedNodeId
				};
				const selection = presetNodeEntries(presetNodes(this.#snapshot.draft)).find((entry) => entry.node.id === this.#snapshot.selectedNodeId);
				if (this.#edit((nodes) => {
					const entry = presetNodeEntries(nodes).find((entry) => entry.node.id === this.#snapshot.selectedNodeId);
					(entry?.node.kind === "group" ? entry.node.children : entry?.siblings ?? nodes).push({
						id,
						kind,
						title: kind === "group" ? "Новая группа" : "Новый блок",
						enabled: true,
						...kind === "group" ? { children: [] } : { text: "" }
					});
				})) this.update({
					selectedNodeId: id,
					preview: false,
					undo: previous,
					collapsed: this.#snapshot.collapsed.filter((id) => id !== selection?.node.id)
				});
			}
			removeNode(id) {
				const previous = {
					draft: structuredClone(this.#snapshot.draft),
					selectedNodeId: this.#snapshot.selectedNodeId
				};
				if (this.#edit((nodes) => {
					const entry = presetNodeEntries(nodes).find((entry) => entry.node.id === id);
					if (entry) entry.siblings.splice(entry.siblings.indexOf(entry.node), 1);
				}, "Элемент удалён. Можно отменить действие.")) {
					const entries = presetNodeEntries(presetNodes(this.#snapshot.draft));
					this.update({
						undo: previous,
						selectedNodeId: entries.some((entry) => entry.node.id === this.#snapshot.selectedNodeId) ? this.#snapshot.selectedNodeId : entries[0]?.node.id ?? null
					});
				}
			}
			duplicateNode(id) {
				const previous = {
					draft: structuredClone(this.#snapshot.draft),
					selectedNodeId: this.#snapshot.selectedNodeId
				};
				let copyId;
				if (this.#edit((nodes) => {
					const entry = presetNodeEntries(nodes).find((entry) => entry.node.id === id);
					if (!entry) return;
					const copy = structuredClone(entry.node);
					for (const { node } of presetNodeEntries([copy])) node.id = crypto.randomUUID();
					copy.title = `${copy.title} — копия`.slice(0, 120);
					copyId = copy.id;
					entry.siblings.splice(entry.siblings.indexOf(entry.node) + 1, 0, copy);
				})) this.update({
					undo: previous,
					selectedNodeId: copyId ?? id
				});
			}
			moveNode(sourceId, targetId, position) {
				const previous = {
					draft: structuredClone(this.#snapshot.draft),
					selectedNodeId: this.#snapshot.selectedNodeId
				};
				const nodes = presetNodes(this.#snapshot.draft);
				const title = presetNodeEntries(nodes).find((entry) => entry.node.id === sourceId)?.node.title;
				if (!this.#edit(() => movePresetNode(nodes, sourceId, targetId, position), `«${title}» перемещён. Можно отменить действие.`)) return false;
				this.update({
					undo: previous,
					selectedNodeId: sourceId,
					collapsed: position === "inside" ? this.#snapshot.collapsed.filter((id) => id !== targetId) : this.#snapshot.collapsed
				});
				return true;
			}
			undo() {
				if (this.#snapshot.busy || !this.#snapshot.undo) return;
				this.update({
					...this.#snapshot.undo,
					undo: null,
					error: "",
					notice: "Действие отменено."
				});
			}
		};
		//#endregion
		//#region src/features/presets/client/presets.js
		var RoleplayPresetService = class {
			getSnapshot() {
				throw new Error("RoleplayPresetService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("RoleplayPresetService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("RoleplayPresetService.refresh() is not implemented");
			}
			save() {
				throw new Error("RoleplayPresetService.save() is not implemented");
			}
			remove() {
				throw new Error("RoleplayPresetService.remove() is not implemented");
			}
			setDefault() {
				throw new Error("RoleplayPresetService.setDefault() is not implemented");
			}
		};
		var RemoteRoleplayPresetProvider = class extends RoleplayPresetService {
			editor = new PresetEditor();
			#snapshot = {
				status: "loading",
				presets: [],
				defaultId: null,
				error: null
			};
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			#revision = 0;
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				this.#loading ??= this.refresh().catch(() => {});
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(value) {
				this.#snapshot = value;
				for (const listener of this.#listeners) listener();
			}
			async refresh() {
				const revision = ++this.#revision;
				try {
					const value = await call("preset-list", {});
					if (revision === this.#revision) this.#publish({
						...value,
						status: "ready",
						error: null
					});
				} catch (error) {
					if (revision === this.#revision) this.#publish({
						...this.#snapshot,
						status: "error",
						error: error.message
					});
					throw error;
				}
			}
			async save(preset) {
				const value = await call("preset-save", preset);
				await this.refresh();
				return value;
			}
			async remove(id) {
				await call("preset-remove", { id });
				await this.refresh();
			}
			async setDefault(id) {
				await call("preset-default", { id });
				await this.refresh();
			}
		};
		var SessionPresetService = class {
			getSnapshot() {
				throw new Error("SessionPresetService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("SessionPresetService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("SessionPresetService.refresh() is not implemented");
			}
			select() {
				throw new Error("SessionPresetService.select() is not implemented");
			}
		};
		var RemoteSessionPresetProvider = class extends SessionPresetService {
			#snapshot = {
				status: "loading",
				preset: null,
				error: null
			};
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			#revision = 0;
			#changing = false;
			constructor(sessionId) {
				super();
				this.sessionId = sessionId;
			}
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				this.#loading ??= this.refresh();
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(value) {
				this.#snapshot = value;
				for (const listener of this.#listeners) listener();
			}
			async refresh() {
				if (this.#changing) return;
				const revision = ++this.#revision;
				try {
					const value = await call("session-preset-state", { sessionId: this.sessionId });
					if (revision === this.#revision) this.#publish({
						...value,
						status: "ready",
						error: null
					});
				} catch (error) {
					if (revision === this.#revision) this.#publish({
						...this.#snapshot,
						status: "error",
						error: error.message
					});
				}
			}
			async select(presetId) {
				if (this.#changing) throw new Error("Дождитесь сохранения текущего пресета.");
				this.#changing = true;
				++this.#revision;
				this.#publish({
					...this.#snapshot,
					status: "saving",
					error: null
				});
				try {
					const value = await call("session-preset", {
						sessionId: this.sessionId,
						presetId
					});
					++this.#revision;
					this.#publish({
						...value,
						status: "ready",
						error: null
					});
					return value;
				} catch (error) {
					this.#changing = false;
					await this.refresh();
					this.#publish({
						...this.#snapshot,
						error: error.message
					});
					throw error;
				} finally {
					this.#changing = false;
				}
			}
		};
		//#endregion
		//#region src/features/presets/client/presentation.js
		/** Presentation helpers compare content, never mutable library identity alone. */
		function presetChanged(left, right) {
			return left.name !== right.name || left.instructions !== right.instructions || JSON.stringify(presetNodes(left)) !== JSON.stringify(presetNodes(right));
		}
		function filterPresets(presets, query) {
			const needle = query.trim().toLocaleLowerCase("ru-RU");
			if (!needle) return presets;
			return presets.filter((preset) => `${preset.name}\n${presetNodeEntries(presetNodes(preset)).map(({ node }) => `${node.title}\n${node.text ?? ""}`).join("\n")}`.toLocaleLowerCase("ru-RU").includes(needle));
		}
		//#endregion
		//#region src/features/presets/client/drag.js
		/** The middle half of a group is a nest target; its edges insert siblings. */
		function presetDropPosition(kind, y, bounds) {
			const ratio = (y - bounds.top) / bounds.height;
			if (kind === "group" && ratio > .25 && ratio < .75) return "inside";
			return ratio < .5 ? "before" : "after";
		}
		//#endregion
		//#region src/features/presets/client/structure.jsx
		function DragHandle() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				fill: "currentColor",
				"aria-hidden": "true",
				children: [
					4,
					8,
					12
				].flatMap((y) => [5, 11].map((x) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: x,
					cy: y,
					r: "1"
				}, `${x}-${y}`)))
			});
		}
		function PresetStructureEditor({ editor, disabled }) {
			const id = (0, react.useId)();
			const { draft, selectedNodeId, collapsed, preview, undo } = (0, react.useSyncExternalStore)(editor.subscribe, editor.getSnapshot, editor.getSnapshot);
			const nodes = presetNodes(draft);
			const entries = presetNodeEntries(nodes);
			const selected = entries.find((entry) => entry.node.id === selectedNodeId);
			const active = activePresetBlocks(nodes);
			const total = entries.reduce((sum, { node }) => sum + (node.text?.length ?? 0), 0);
			const rootRef = (0, react.useRef)(null);
			const treeScrollerRef = (0, react.useRef)(null);
			const titleRef = (0, react.useRef)(null);
			const dialogRef = (0, react.useRef)(null);
			const dragRef = (0, react.useRef)(null);
			const suppressClick = (0, react.useRef)(false);
			const [drag, setDrag] = (0, react.useState)(null);
			const [moveId, setMoveId] = (0, react.useState)(null);
			const [targetId, setTargetId] = (0, react.useState)(":root");
			const [position, setPosition] = (0, react.useState)("inside");
			const [moveError, setMoveError] = (0, react.useState)("");
			const [dragNotice, setDragNotice] = (0, react.useState)("");
			const moveTarget = entries.find((entry) => entry.node.id === targetId)?.node;
			const movePositions = targetId === ":root" ? [{
				value: "inside",
				label: "В конец основного списка"
			}] : [
				...moveTarget?.kind === "group" ? [{
					value: "inside",
					label: "Внутрь группы, в конец"
				}] : [],
				{
					value: "before",
					label: "Перед элементом"
				},
				{
					value: "after",
					label: "После элемента"
				}
			];
			const handleFor = (nodeId) => rootRef.current?.querySelector(`[data-preset-handle="${CSS.escape(nodeId)}"]`);
			(0, react.useEffect)(() => {
				if (!moveId) return;
				dialogRef.current.showModal();
				return () => {
					dialogRef.current?.close();
				};
			}, [moveId]);
			(0, react.useEffect)(() => {
				let frame;
				let resetClick;
				if (disabled) {
					setDrag(null);
					setDragNotice("");
				}
				const readEntries = () => presetNodeEntries(presetNodes(editor.getSnapshot().draft));
				const targetAt = (current) => {
					const element = document.elementFromPoint(current.x, current.y);
					const root = rootRef.current;
					if (!element || !root?.contains(element)) return null;
					if (element.closest("[data-preset-root-drop]")) return {
						targetId: null,
						position: "inside"
					};
					const row = element.closest("[data-preset-node]");
					const target = readEntries().find((entry) => entry.node.id === row?.dataset.presetNode);
					if (!target) return null;
					const position = presetDropPosition(target.node.kind, current.y, row.getBoundingClientRect());
					return canMovePresetNode(presetNodes(editor.getSnapshot().draft), current.sourceId, target.node.id, position) ? {
						targetId: target.node.id,
						position
					} : null;
				};
				const refresh = () => {
					const current = dragRef.current;
					if (!current?.active) return;
					const rootBounds = rootRef.current.getBoundingClientRect();
					current.drop = targetAt(current);
					setDrag({
						sourceId: current.sourceId,
						title: current.title,
						drop: current.drop,
						x: Math.max(0, Math.min(rootBounds.width - 180, current.x - rootBounds.left + 12)),
						y: current.y - rootBounds.top + 12
					});
					const target = readEntries().find((entry) => entry.node.id === current.drop?.targetId)?.node;
					setDragNotice(current.drop ? current.drop.position === "inside" ? `Перенести в ${target ? `«${target.title}»` : "основной список"}.` : `${current.drop.position === "before" ? "Вставить перед" : "Вставить после"} «${target.title}».` : "Выберите место вставки. Группу нельзя вложить в себя или её содержимое.");
				};
				const autoScroll = () => {
					if (!dragRef.current?.active) return;
					const current = dragRef.current;
					let scrolled = false;
					for (const scroller of [treeScrollerRef.current, rootRef.current.closest(".mayori-presets-panel")]) {
						if (!scroller) continue;
						const rect = scroller.getBoundingClientRect();
						if (current.x < rect.left || current.x > rect.right) continue;
						const delta = current.y < rect.top + 36 ? -10 : current.y > rect.bottom - 36 ? 10 : 0;
						if (delta) {
							const before = scroller.scrollTop;
							scroller.scrollBy(0, delta);
							scrolled ||= before !== scroller.scrollTop;
						}
					}
					if (scrolled) refresh();
					frame = requestAnimationFrame(autoScroll);
				};
				const move = (event) => {
					const current = dragRef.current;
					if (!current || event.pointerId !== current.pointerId || disabled) return;
					current.x = event.clientX;
					current.y = event.clientY;
					if (!current.active && Math.hypot(current.x - current.startX, current.y - current.startY) < 6) return;
					event.preventDefault();
					if (!current.active) {
						current.active = true;
						frame = requestAnimationFrame(autoScroll);
					}
					refresh();
				};
				const finish = (event, cancel = false) => {
					const current = dragRef.current;
					if (!current || event && event.pointerId !== current.pointerId) return;
					dragRef.current = null;
					cancelAnimationFrame(frame);
					if (current.handle.hasPointerCapture(current.pointerId)) current.handle.releasePointerCapture(current.pointerId);
					setDrag(null);
					if (!current.active) return;
					suppressClick.current = true;
					resetClick = setTimeout(() => {
						suppressClick.current = false;
					}, 0);
					if (!cancel && !disabled && current.drop) editor.moveNode(current.sourceId, current.drop.targetId, current.drop.position);
					else setDragNotice("Перенос отменён.");
					if (!cancel && current.drop) setDragNotice("");
					requestAnimationFrame(() => handleFor(current.sourceId)?.focus());
				};
				const up = (event) => finish(event);
				const cancel = (event) => finish(event, true);
				const key = (event) => {
					if (event.key === "Escape" && dragRef.current) {
						finish(null, true);
						event.preventDefault();
					}
				};
				window.addEventListener("pointermove", move, { passive: false });
				window.addEventListener("pointerup", up);
				window.addEventListener("pointercancel", cancel);
				window.addEventListener("keydown", key);
				return () => {
					cancelAnimationFrame(frame);
					clearTimeout(resetClick);
					const current = dragRef.current;
					if (current?.handle.hasPointerCapture(current.pointerId)) current.handle.releasePointerCapture(current.pointerId);
					dragRef.current = null;
					window.removeEventListener("pointermove", move);
					window.removeEventListener("pointerup", up);
					window.removeEventListener("pointercancel", cancel);
					window.removeEventListener("keydown", key);
				};
			}, [editor, disabled]);
			const startDrag = (event, node) => {
				if (disabled || event.button !== 0) return;
				const handle = event.currentTarget;
				handle.setPointerCapture(event.pointerId);
				dragRef.current = {
					sourceId: node.id,
					title: node.title,
					pointerId: event.pointerId,
					handle,
					startX: event.clientX,
					startY: event.clientY,
					x: event.clientX,
					y: event.clientY,
					active: false,
					drop: null
				};
			};
			const openMove = (nodeId) => {
				if (suppressClick.current) {
					suppressClick.current = false;
					return;
				}
				setTargetId(":root");
				setPosition("inside");
				setMoveError("");
				setMoveId(nodeId);
			};
			const closeMove = () => {
				const previous = moveId;
				setMoveId(null);
				requestAnimationFrame(() => handleFor(previous)?.focus());
			};
			const add = (kind) => {
				editor.addNode(kind);
				requestAnimationFrame(() => {
					titleRef.current?.focus();
					titleRef.current?.select();
				});
			};
			const renderNodes = (items, ancestors = []) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				"data-deep": ancestors.length >= 4 || void 0,
				className: `mayori-preset-tree-list${ancestors.length ? " mayori-preset-tree-children" : ""}`,
				children: items.map((node) => {
					const hiddenBy = ancestors.find((parent) => !parent.enabled);
					const drop = drag?.drop?.targetId === node.id ? drag.drop.position : "";
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-preset-node": node.id,
						className: `mayori-preset-tree-row${selectedNodeId === node.id ? " is-selected" : ""}${drag?.sourceId === node.id ? " is-dragging" : ""}${drop ? ` drop-${drop}` : ""}`,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-preset-drag-handle",
								disabled,
								"data-preset-handle": node.id,
								"aria-label": `Переместить ${node.title}`,
								onPointerDown: (event) => startDrag(event, node),
								onClick: () => openMove(node.id),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DragHandle, {})
							}),
							node.kind === "group" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-preset-tree-fold",
								disabled,
								"aria-label": `${collapsed.includes(node.id) ? "Раскрыть" : "Свернуть"} ${node.title}`,
								"aria-expanded": !collapsed.includes(node.id),
								"aria-controls": `${id}-${node.id}`,
								onClick: () => editor.toggleGroup(node.id),
								children: collapsed.includes(node.id) ? "▸" : "▾"
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "mayori-preset-tree-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								className: "mayori-preset-node-toggle",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									disabled,
									"aria-label": `Включить ${node.title}`,
									checked: node.enabled,
									onChange: (event) => editor.changeNode(node.id, "enabled", event.target.checked)
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-preset-tree-pick",
								disabled,
								"aria-pressed": selectedNodeId === node.id,
								onClick: () => editor.selectNode(node.id),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: node.kind === "group" ? "mayori-preset-group-title" : "",
										children: node.title || "Без названия"
									}),
									ancestors.length >= 4 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: ["Уровень ", ancestors.length + 1] }),
									hiddenBy && node.enabled && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
										"Выключено в «",
										hiddenBy.title,
										"»"
									] })
								]
							})
						]
					}), node.kind === "group" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						id: `${id}-${node.id}`,
						hidden: collapsed.includes(node.id),
						children: node.children.length ? renderNodes(node.children, [...ancestors, node]) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "mayori-preset-tree-empty",
							children: "Пустая группа"
						})
					})] }, node.id);
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: "mayori-preset-structure",
				onKeyDown: (event) => {
					if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !["INPUT", "TEXTAREA"].includes(event.target.tagName) && undo) {
						event.preventDefault();
						editor.undo();
					}
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-preset-structure-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "Инструкции" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
							"В итог входят ",
							active.length,
							" из ",
							entries.filter((entry) => entry.node.kind === "block").length,
							" блоков · ",
							draft.instructions.length.toLocaleString("ru-RU"),
							" символов в итоге"
						] })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mayori-preset-button",
							"aria-pressed": preview,
							onClick: () => editor.update({ preview: !preview }),
							children: preview ? "Вернуться к редактору" : "Посмотреть итог"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-preset-structure-layout",
						hidden: preview,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
							className: "mayori-preset-structure-tree",
							"aria-label": "Структура пресета",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-tree-toolbar",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "Структура" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mayori-preset-button",
										disabled,
										onClick: () => add("block"),
										children: "+ Блок"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mayori-preset-button",
										disabled,
										onClick: () => add("group"),
										children: "+ Группа"
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								ref: treeScrollerRef,
								className: "mayori-preset-tree-scroll",
								children: [
									renderNodes(nodes),
									!nodes.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-preset-tree-empty",
										children: "Нет блоков."
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										"data-preset-root-drop": true,
										className: `mayori-preset-root-drop${drag?.drop?.targetId === null ? " drop-inside" : ""}`,
										children: "Конец основного списка"
									})
								]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
							className: "mayori-preset-node-editor",
							"aria-label": "Редактирование выбранного элемента",
							children: selected ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								!!selected.ancestors.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-preset-node-path",
									children: selected.ancestors.map((parent) => parent.title).join(" / ")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "mayori-preset-node-field",
									children: [selected.node.kind === "group" ? "Название группы" : "Название блока", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										ref: titleRef,
										name: "presetNodeTitle",
										autoComplete: "off",
										required: true,
										maxLength: 120,
										value: selected.node.title,
										disabled,
										onChange: (event) => editor.changeNode(selected.node.id, "title", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "mayori-preset-node-toggle",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										disabled,
										checked: selected.node.enabled,
										onChange: (event) => editor.changeNode(selected.node.id, "enabled", event.target.checked)
									}), selected.node.kind === "group" ? "Включить группу" : "Включить блок"]
								}),
								selected.node.enabled && selected.ancestors.some((parent) => !parent.enabled) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: "mayori-preset-node-state",
									children: [
										"Выключена группа «",
										selected.ancestors.find((parent) => !parent.enabled).title,
										"»."
									]
								}),
								selected.node.kind === "block" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-preset-node-field",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										htmlFor: `${id}-text`,
										children: "Текст инструкции"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										id: `${id}-text`,
										name: "presetInstructions",
										maxLength: MAX_PRESET_TEXT,
										value: selected.node.text,
										disabled,
										onChange: (event) => editor.changeNode(selected.node.id, "text", event.target.value)
									})]
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-preset-group-content",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "Содержимое группы" }), selected.node.children.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", { children: selected.node.children.map((node) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "mayori-preset-text-button",
										onClick: () => editor.selectNode(node.id),
										children: [node.title, node.kind === "group" ? " · группа" : ""]
									}) }, node.id)) }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Пустая группа." })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-preset-node-actions",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mayori-preset-button",
										disabled,
										onClick: () => editor.duplicateNode(selected.node.id),
										children: "Дублировать"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "mayori-preset-text-button mayori-preset-delete",
										disabled,
										onClick: () => editor.removeNode(selected.node.id),
										children: ["Удалить ", selected.node.kind === "group" ? "группу" : "блок"]
									})]
								})
							] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Элемент не выбран." })
						})]
					}),
					preview && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "mayori-preset-compiled",
						"aria-label": "Итоговые инструкции",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "Инструкции для модели" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: draft.instructions || "Нет включённых инструкций." }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "Из каких блоков собран текст" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", { children: active.map(({ node, ancestors }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: [...ancestors, node].map((node) => node.title).join(" / ") }, node.id)) })] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "mayori-dice-sr",
						role: "status",
						children: dragNotice
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-preset-structure-footer",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: total > 64e3 ? "mayori-preset-error" : "",
							children: [total.toLocaleString("ru-RU"), " / 64 000 символов во всех блоках"]
						}), undo && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mayori-preset-text-button",
							disabled,
							onClick: () => editor.undo(),
							children: "Отменить действие"
						})]
					}),
					drag && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mayori-preset-drag-ghost",
						"aria-hidden": "true",
						style: {
							left: drag.x,
							top: drag.y
						},
						children: drag.title
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dialog", {
						ref: dialogRef,
						className: "mayori-preset-move-dialog",
						"aria-labelledby": `${id}-move-title`,
						onCancel: (event) => {
							event.preventDefault();
							closeMove();
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: `${id}-move-title`,
								children: "Переместить элемент"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-node-field",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									htmlFor: `${id}-target`,
									children: "Место назначения"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
									id: `${id}-target`,
									"aria-label": "Место назначения",
									portal: false,
									value: targetId,
									onChange: (value) => {
										setTargetId(value);
										setMoveError("");
										if (value === ":root") setPosition("inside");
										else if (position === "inside" && entries.find((entry) => entry.node.id === value)?.node.kind !== "group") setPosition("before");
									},
									options: [{
										value: ":root",
										label: "Основной список"
									}, ...entries.filter((entry) => canMovePresetNode(nodes, moveId, entry.node.id, entry.node.kind === "group" ? "inside" : "before")).map((entry) => ({
										value: entry.node.id,
										label: [...entry.ancestors, entry.node].map((node) => node.title).join(" / ")
									}))]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-node-field",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									htmlFor: `${id}-position`,
									children: "Положение"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
									id: `${id}-position`,
									"aria-label": "Положение",
									portal: false,
									value: position,
									onChange: setPosition,
									options: movePositions
								})]
							}),
							moveError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "mayori-preset-error",
								children: moveError
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-node-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-preset-button",
									onClick: closeMove,
									children: "Отмена"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-preset-button mayori-preset-primary",
									disabled,
									onClick: () => {
										const target = targetId === ":root" ? null : targetId;
										if (!canMovePresetNode(nodes, moveId, target, position)) {
											setMoveError("Выберите группу для вложения или положение перед / после элемента.");
											return;
										}
										if (editor.moveNode(moveId, target, position)) closeMove();
									},
									children: "Переместить"
								})]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/features/presets/client/panel.jsx
		const blank = () => ({
			name: "",
			instructions: ""
		});
		function PresetIcon({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 7h8M8 12h8M8 17h5" })]
			});
		}
		function Glyph({ kind }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "18",
				height: "18",
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: kind === "plus" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 5v14M5 12h14" }) : kind === "search" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "10.5",
					cy: "10.5",
					r: "6.5"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m16 16 4 4" })] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "5",
						cy: "12",
						r: "1"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "12",
						cy: "12",
						r: "1"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "19",
						cy: "12",
						r: "1"
					})
				] })
			});
		}
		function PresetPanel({ presets, sessions, presetFor }) {
			const id = (0, react.useId)();
			const snapshot = (0, react.useSyncExternalStore)(presets.subscribe, presets.getSnapshot, presets.getSnapshot);
			const catalog = (0, react.useSyncExternalStore)(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot);
			const currentId = catalog.ids.find((id) => catalog.byId[id]?.retainedBy?.mainView > 0);
			const editor = presets.editor;
			const { draft, saved, busy, error, notice } = (0, react.useSyncExternalStore)(editor.subscribe, editor.getSnapshot, editor.getSnapshot);
			const [query, setQuery] = (0, react.useState)("");
			const [current, setCurrent] = (0, react.useState)(null);
			const nameRef = (0, react.useRef)(null);
			const formRef = (0, react.useRef)(null);
			const menuRef = (0, react.useRef)(null);
			const libraryRef = (0, react.useRef)(null);
			const dirty = presetChanged(draft, saved);
			const disabled = busy || snapshot.status === "loading";
			const currentReady = currentId && current?.status === "ready";
			const currentLibrary = snapshot.presets.find((preset) => preset.id === current?.preset?.id);
			const currentOutdated = currentLibrary && presetChanged(currentLibrary, current.preset);
			const matches = filterPresets(snapshot.presets, query);
			(0, react.useEffect)(() => {
				editor.initialize(snapshot);
			}, [editor, snapshot]);
			(0, react.useEffect)(() => {
				let active = true;
				setCurrent(null);
				if (!currentId) return;
				const provider = presetFor(currentId);
				const update = () => {
					if (active) setCurrent(provider.getSnapshot());
				};
				const unsubscribe = provider.subscribe(update);
				provider.refresh();
				update();
				return () => {
					active = false;
					unsubscribe();
				};
			}, [currentId, presetFor]);
			(0, react.useEffect)(() => {
				if (!dirty) return;
				const warn = (event) => {
					event.preventDefault();
					event.returnValue = "";
				};
				window.addEventListener("beforeunload", warn);
				return () => {
					window.removeEventListener("beforeunload", warn);
				};
			}, [dirty]);
			(0, react.useEffect)(() => {
				const close = (event) => {
					if (menuRef.current && !menuRef.current.contains(event.target)) menuRef.current.open = false;
				};
				window.addEventListener("pointerdown", close);
				return () => {
					window.removeEventListener("pointerdown", close);
				};
			}, []);
			const run = async (operation, success) => {
				if (editor.getSnapshot().busy) return;
				editor.update({
					busy: true,
					error: "",
					notice: ""
				});
				try {
					await operation();
					editor.update({ notice: success });
				} catch (failure) {
					editor.update({ error: failure.message || "Не удалось выполнить действие. Попробуйте ещё раз." });
				} finally {
					editor.update({ busy: false });
				}
			};
			const choose = (preset) => {
				if (dirty && !window.confirm("Перейти к другому пресету? Несохранённые изменения будут потеряны.")) return;
				editor.choose(preset);
				if (menuRef.current) menuRef.current.open = false;
				if (libraryRef.current) libraryRef.current.open = false;
				nameRef.current?.focus();
			};
			const field = (key, value) => {
				editor.change(key, value);
			};
			const save = async () => {
				const value = await presets.save(draft);
				editor.accept(value);
				return value;
			};
			const apply = () => {
				if (!formRef.current.reportValidity()) return;
				run(async () => {
					const value = dirty || !draft.id ? await save() : draft;
					await presetFor(currentId).select(value.id);
				}, "Инструкции применены к текущему чату.");
			};
			const remove = () => {
				menuRef.current.open = false;
				if (!window.confirm(`Удалить пресет «${saved.name}»? В созданных чатах его инструкции сохранятся.`)) return;
				run(async () => {
					await presets.remove(draft.id);
					const next = presets.getSnapshot().presets[0] ?? blank();
					editor.choose(next);
				}, "Пресет удалён из библиотеки.");
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
				className: "mayori-presets-panel",
				"aria-labelledby": `${id}-title`,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-presets-content",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "mayori-presets-header",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
								id: `${id}-title`,
								children: "Пресеты"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-preset-button",
								disabled,
								onClick: () => choose(blank()),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, { kind: "plus" }), "Создать пресет"]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-presets-usage",
							"aria-label": "Выбор пресетов для чатов",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-usage",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									htmlFor: `${id}-default`,
									children: "Для новых чатов"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
									id: `${id}-default`,
									"aria-label": "Для новых чатов",
									value: snapshot.defaultId ?? "",
									disabled,
									onChange: (value) => {
										run(() => presets.setDefault(value || null), "Выбор для новых чатов сохранён.");
									},
									options: [{
										value: "",
										label: "Без пресета"
									}, ...snapshot.presets.map((preset) => ({
										value: preset.id,
										label: preset.name
									}))]
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-usage",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										htmlFor: `${id}-current`,
										children: "Текущий чат"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-preset-current-control",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
											id: `${id}-current`,
											"aria-label": "Текущий чат",
											value: current?.preset?.id ?? "",
											disabled: disabled || !currentReady,
											"aria-describedby": currentId ? `${id}-current-help` : void 0,
											onChange: (value) => {
												run(() => presetFor(currentId).select(value || null), "Инструкции применены к текущему чату.");
											},
											options: [
												{
													value: "",
													label: !currentId ? "Нет открытого чата" : !current || current.status === "loading" ? "Загружаем…" : "Без пресета"
												},
												...current?.preset && !currentLibrary ? [{
													value: current.preset.id,
													label: `${current.preset.name} · копия из чата`
												}] : [],
												...snapshot.presets.map((preset) => ({
													value: preset.id,
													label: preset.name
												}))
											]
										}), currentOutdated && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "mayori-preset-button",
											disabled: disabled || !currentReady,
											onClick: () => {
												run(() => presetFor(currentId).select(currentLibrary.id), "Инструкции в чате обновлены.");
											},
											children: "Обновить инструкции"
										})]
									}),
									currentId && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										id: `${id}-current-help`,
										children: currentOutdated ? "В чате действует прежняя версия." : "Применяется со следующего хода."
									}),
									current?.error && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
										role: "alert",
										children: [
											current.error,
											" ",
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "mayori-preset-text-button",
												onClick: () => {
													presetFor(currentId).refresh();
												},
												children: "Повторить загрузку"
											})
										]
									})
								]
							})]
						}),
						snapshot.error && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							role: "alert",
							className: "mayori-preset-error",
							children: [
								snapshot.error,
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-preset-button",
									disabled: busy,
									onClick: () => {
										run(() => presets.refresh(), "Список обновлён.");
									},
									children: "Обновить список"
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
							ref: libraryRef,
							className: "mayori-preset-library-disclosure",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", { children: [
								"Библиотека пресетов · ",
								snapshot.presets.length,
								draft.id ? ` · ${saved.name}` : " · Новый пресет"
							] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-library",
								"aria-label": "Библиотека пресетов",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: "mayori-preset-search",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "mayori-dice-sr",
												children: "Поиск пресетов"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, { kind: "search" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												type: "search",
												placeholder: "Найти пресет…",
												value: query,
												onChange: (event) => setQuery(event.target.value)
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: "mayori-preset-list",
										children: matches.map((preset) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "mayori-preset-row",
											"aria-pressed": draft.id === preset.id,
											disabled: busy,
											onClick: () => choose(preset),
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: "mayori-preset-row-title",
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PresetIcon, { size: 18 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: preset.name })]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: "mayori-preset-preview",
													children: preset.instructions
												}),
												(snapshot.defaultId === preset.id || current?.preset?.id === preset.id) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: "mayori-preset-tags",
													children: [snapshot.defaultId === preset.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Новые чаты" }), current?.preset?.id === preset.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Текущий чат" })]
												})
											]
										}) }, preset.id))
									}),
									snapshot.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-preset-empty",
										children: "Загружаем пресеты…"
									}),
									snapshot.status === "ready" && !snapshot.presets.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-preset-empty",
										children: "Нет пресетов."
									}),
									query && !matches.length && !!snapshot.presets.length && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-preset-empty",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
											"По запросу «",
											query,
											"» ничего не найдено."
										] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "mayori-preset-text-button",
											onClick: () => setQuery(""),
											children: "Сбросить поиск"
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "mayori-presets-workspace",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
								ref: formRef,
								className: "mayori-preset-editor",
								onSubmit: (event) => {
									event.preventDefault();
									run(save, "Пресет сохранён.");
								},
								onKeyDown: (event) => {
									if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
										event.preventDefault();
										if (!disabled) formRef.current.requestSubmit();
									}
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-preset-editor-heading",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: draft.id ? saved.name : "Новый пресет" }), (dirty || draft.id) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-preset-save-state",
											children: dirty ? "Есть несохранённые изменения" : "Сохранён в библиотеке"
										})] }), draft.id && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
											ref: menuRef,
											className: "mayori-preset-menu",
											onBlur: (event) => {
												if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
											},
											onKeyDown: (event) => {
												if (event.key === "Escape") {
													event.currentTarget.open = false;
													event.currentTarget.querySelector("summary").focus();
													event.stopPropagation();
												}
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", {
												"aria-label": "Действия с пресетом",
												title: "Действия с пресетом",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, { kind: "more" })
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												disabled: busy,
												onClick: () => choose({
													...draft,
													id: void 0,
													name: `${draft.name} — копия`.slice(0, 120)
												}),
												children: "Дублировать пресет"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "mayori-preset-delete",
												disabled: busy,
												onClick: remove,
												children: "Удалить пресет"
											})] })]
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-preset-name-field",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
											htmlFor: `${id}-name`,
											children: "Название"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											id: `${id}-name`,
											ref: nameRef,
											name: "presetName",
											autoComplete: "off",
											placeholder: "Например, камерное фэнтези",
											required: true,
											maxLength: 120,
											value: draft.name,
											disabled,
											onChange: (event) => field("name", event.target.value)
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PresetStructureEditor, {
										editor,
										disabled
									}),
									error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										role: "alert",
										className: "mayori-preset-error",
										children: error
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
										className: "mayori-preset-editor-footer",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "mayori-preset-feedback",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												role: "status",
												children: busy ? "Подождите…" : notice
											})
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mayori-preset-editor-actions",
											children: [
												dirty && draft.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: "mayori-preset-text-button",
													disabled,
													onClick: () => {
														editor.reset();
													},
													children: "Отменить изменения"
												}),
												currentId && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: "mayori-preset-button",
													disabled: disabled || !currentReady,
													onClick: apply,
													children: dirty || !draft.id ? "Сохранить и применить" : "Применить к чату"
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													className: "mayori-preset-button mayori-preset-primary",
													type: "submit",
													disabled,
													"aria-busy": busy,
													children: "Сохранить пресет"
												})
											]
										})]
									})
								]
							})
						})
					]
				})
			});
		}
		//#endregion
		//#region src/features/message-revisions/domain/revisions.js
		/** Native parent links own branch navigation; no second version store is needed. */
		function branchRows(snapshot, sessionId) {
			const rows = snapshot.byId;
			const rootOf = (id) => {
				const seen = /* @__PURE__ */ new Set();
				while (rows[id]?.parentId && rows[rows[id].parentId] && !seen.has(id)) {
					seen.add(id);
					id = rows[id].parentId;
				}
				return id;
			};
			const root = rootOf(sessionId);
			return snapshot.ids.filter((id) => rows[id]?.origin !== "subagent" && rootOf(id) === root).sort((a, b) => a === root ? -1 : b === root ? 1 : (rows[a].updatedAt ?? 0) - (rows[b].updatedAt ?? 0) || a.localeCompare(b)).map((id, index) => ({
				id,
				label: index === 0 ? "Исходный чат" : `Ветка ${index} · ${rows[id].title?.trim() || "Чат без названия"}`
			}));
		}
		//#endregion
		//#region src/features/message-revisions/client/controls.jsx
		function RevisionIcon({ repeat }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: repeat ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M20 7v5h-5" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M20 12a8 8 0 1 0-2.3 5.7M20 12l-3-4" })] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z" }) })
			});
		}
		/** Use the stock user message's existing clock/copy row inside our owned wrapper. */
		function UserRevisionToolbar({ container, children }) {
			const [toolbar, setToolbar] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				const root = container.current;
				const sync = () => {
					setToolbar(root.querySelector("[data-clock=\"start\"]"));
				};
				sync();
				const observer = new MutationObserver(sync);
				observer.observe(root, {
					childList: true,
					subtree: true
				});
				return () => {
					observer.disconnect();
				};
			}, [container]);
			return toolbar ? (0, react_dom.createPortal)(children, toolbar) : null;
		}
		/** Character state gates actions contributed to the native assistant-actions slot. */
		function AssistantRevisionActions({ chatFor, revisionFor, sessionId, closing, useSession, turn }) {
			const chat = chatFor(sessionId);
			const snapshot = (0, react.useSyncExternalStore)(chat.subscribe, chat.getSnapshot, chat.getSnapshot);
			const seq = closing?.finalNode?.seq;
			const greeting = snapshot.value?.greeting;
			const blocks = greeting && greeting.messageId === closing?.finalNode?.messageId ? [{
				kind: "text",
				text: greeting.text
			}] : closing?.blocks ?? [];
			if (!snapshot.value?.character || !revisionFor || !useSession || !Number.isSafeInteger(seq) || seq < 1 || blocks.some((block) => block.kind === "tool-call") || !blocks.some((block) => block.kind === "text" && block.text.trim())) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MessageRevisionControls, {
				revisions: revisionFor(sessionId),
				seq,
				useSession,
				canRepeat: turn > 1
			});
		}
		/** Native dialog keeps an unsaved draft local until the Host creates its durable branch. */
		function MessageRevisionControls({ revisions, seq, canRepeat, useSession }) {
			const snapshot = (0, react.useSyncExternalStore)(revisions.subscribe, revisions.getSnapshot, revisions.getSnapshot);
			const activity = useSession((state) => state.running || state.awaitingFirstTurn || state.pendingSubmissions.length > 0);
			const dialog = (0, react.useRef)(null);
			const trigger = (0, react.useRef)(null);
			const field = (0, react.useRef)(null);
			const epoch = (0, react.useRef)(0);
			const pending = (0, react.useRef)(false);
			const titleId = (0, react.useId)();
			const textId = (0, react.useId)();
			const errorId = (0, react.useId)();
			const [editor, setEditor] = (0, react.useState)(null);
			const [text, setText] = (0, react.useState)("");
			const [error, setError] = (0, react.useState)("");
			const [loading, setLoading] = (0, react.useState)(false);
			(0, react.useEffect)(() => () => {
				++epoch.current;
			}, []);
			(0, react.useEffect)(() => {
				if (editor) dialog.current?.showModal();
				else trigger.current?.focus();
			}, [editor]);
			const busy = activity || snapshot.busy || loading;
			const open = async (mode, button) => {
				if (busy || pending.current) return;
				pending.current = true;
				const revision = ++epoch.current;
				trigger.current = button;
				setError("");
				setLoading(true);
				try {
					const value = await revisions.inspect(seq);
					if (revision !== epoch.current) return;
					if (mode === "regenerate" && !value.canRegenerate) throw new Error("У этой реплики нет хода игрока для повторной генерации.");
					setText(value.text);
					setEditor({
						mode,
						...value
					});
				} catch (failure) {
					if (revision === epoch.current) setError(failure.message);
				} finally {
					pending.current = false;
					if (revision === epoch.current) setLoading(false);
				}
			};
			const close = () => {
				if (!snapshot.busy) dialog.current?.close();
			};
			const submit = async (event) => {
				event.preventDefault();
				if (busy || pending.current) return;
				if (editor.mode === "edit" && !text.trim()) {
					setError("Введите текст сообщения.");
					field.current?.focus();
					return;
				}
				pending.current = true;
				setError("");
				const revision = epoch.current;
				try {
					if (editor.mode === "edit") await revisions.edit(seq, text);
					else await revisions.regenerate(seq);
					if (revision === epoch.current) dialog.current?.close();
				} catch (failure) {
					if (revision === epoch.current) setError(failure.message);
				} finally {
					pending.current = false;
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "mayori-message-actions",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Редактировать",
							title: "Редактировать",
							"aria-haspopup": "dialog",
							disabled: busy,
							onClick: (event) => {
								open("edit", event.currentTarget);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RevisionIcon, {})
						}),
						canRepeat && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Повторить ответ",
							title: "Повторить ответ",
							"aria-haspopup": "dialog",
							disabled: busy,
							onClick: (event) => {
								open("regenerate", event.currentTarget);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RevisionIcon, { repeat: true })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "mayori-revision-status",
							role: "status",
							children: loading ? "Загружаем реплику…" : snapshot.busy ? "Создаём ветку…" : ""
						})
					]
				}),
				error && !editor && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mayori-error",
					children: error
				}),
				editor && (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dialog", {
					ref: dialog,
					className: "mayori-message-editor",
					"aria-labelledby": titleId,
					onCancel: (event) => {
						if (snapshot.busy) event.preventDefault();
					},
					onClose: () => {
						setEditor(null);
						setError("");
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								id: titleId,
								children: editor.mode === "edit" ? "Редактировать сообщение" : "Повторить ответ"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Продолжение откроется в новой ветке от этой реплики. Исходный чат сохранится." }),
							editor.mode === "edit" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								htmlFor: textId,
								children: editor.role === "user" ? "Реплика игрока" : "Реплика персонажа"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								ref: field,
								id: textId,
								autoFocus: true,
								value: text,
								disabled: snapshot.busy,
								"aria-invalid": error && !text.trim() ? true : void 0,
								"aria-describedby": error ? errorId : void 0,
								onChange: (event) => {
									setText(event.target.value);
									setError("");
								},
								onKeyDown: (event) => {
									if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
										event.preventDefault();
										event.currentTarget.form.requestSubmit();
									}
								}
							})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Модель заново ответит на реплику игрока. Инструменты выполнятся снова, и результаты игровых бросков могут измениться." }),
							error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								id: errorId,
								role: "alert",
								className: "mayori-error",
								children: error
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								role: "status",
								children: snapshot.busy ? "Сохраняем ветку…" : ""
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-message-editor-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: snapshot.busy,
									onClick: close,
									children: "Отмена"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									autoFocus: editor.mode === "regenerate",
									disabled: busy,
									children: editor.mode === "regenerate" ? "Повторить ответ" : editor.role === "user" ? "Сохранить и отправить" : "Сохранить"
								})]
							})
						]
					})
				}), document.body)
			] });
		}
		/** The DSH catalog retains original and regenerated branches across reload and restart. */
		function RevisionBranchNavigation({ sessionId, sessions, open }) {
			const rows = branchRows((0, react.useSyncExternalStore)(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot), sessionId);
			if (rows.length < 2) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-revision-branches",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Ветка чата" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
					"aria-label": "Ветка чата",
					value: sessionId,
					onChange: open,
					options: rows.map((row) => ({
						value: row.id,
						label: row.label
					}))
				})]
			});
		}
		//#endregion
		//#region src/features/character-session/client/greeting.jsx
		/** Keep the shipped Markdown renderer; only authored greetings use the Host view. */
		function GreetingMessage({ stock: Stock, chatFor, ...props }) {
			return props.node.data.turn === 1 && props.node.data.step === 1 && props.node.data.finalNode ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AuthoredGreeting, {
				stock: Stock,
				chatFor,
				...props
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, { ...props });
		}
		function AuthoredGreeting({ stock: Stock, chatFor, ...props }) {
			const chat = chatFor(props.sessionId);
			const snapshot = (0, react.useSyncExternalStore)(chat.subscribe, chat.getSnapshot, chat.getSnapshot);
			const activity = props.useSession((state) => state.running || state.pendingSubmissions.length > 0 || state.awaitingFirstTurn);
			const attempted = props.useSession((state) => state.promptAttempted);
			const started = props.useChat((state) => state.timeline.turnOrder.some((turn) => turn > 1));
			const pending = (0, react.useRef)(false);
			const [error, setError] = (0, react.useState)("");
			(0, react.useEffect)(() => {
				chat.refresh();
			}, [
				chat,
				activity,
				attempted,
				started
			]);
			const candidate = snapshot.value?.greeting;
			const greeting = candidate?.messageId === props.node.data.finalNode?.messageId ? candidate : null;
			const node = greeting ? {
				...props.node,
				data: {
					...props.node.data,
					blocks: greeting.text.trim() ? [{
						kind: "text",
						text: greeting.text
					}] : []
				}
			} : props.node;
			const swipe = async (direction) => {
				if (pending.current || activity || !greeting) return;
				pending.current = true;
				setError("");
				try {
					await chat.swipe((greeting.index + direction + greeting.count) % greeting.count);
				} catch (failure) {
					setError(failure.message);
				} finally {
					pending.current = false;
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-greeting-message",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, {
						...props,
						node
					}),
					greeting?.canSwipe && greeting.count > 1 && !activity && !started && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-greeting-swipes",
						"aria-label": "Варианты приветствия",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Предыдущее приветствие",
								disabled: snapshot.status === "saving",
								onClick: () => {
									swipe(-1);
								},
								children: "‹"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								role: "status",
								"aria-live": "polite",
								children: [
									greeting.index + 1,
									" / ",
									greeting.count
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Следующее приветствие",
								disabled: snapshot.status === "saving",
								onClick: () => {
									swipe(1);
								},
								children: "›"
							})
						]
					}),
					(error || snapshot.error) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mayori-error",
						children: error || snapshot.error
					})
				]
			});
		}
		/** Copy and fork actions refer to the selected greeting, including logged swipes. */
		function GreetingTurnTail({ stock: Stock, stockChildren, childPrefix, chatFor, revisionFor, ...props }) {
			const mapped = remapChildProps(props, stockChildren, childPrefix);
			const render = mapped.renderSlot;
			mapped.renderSlot = (name, owner, options) => name === "conversation.chat.assistant-actions" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [render(name, owner, options), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssistantRevisionActions, {
				chatFor,
				revisionFor,
				sessionId: props.sessionId,
				closing: props.node.data.closing,
				useSession: props.useSession,
				turn: props.node.data.turn
			})] }) : render(name, owner, options);
			return props.node.data.turn === 1 && props.node.data.closing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AuthoredGreetingTail, {
				stock: Stock,
				chatFor,
				...mapped
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, { ...mapped });
		}
		function AuthoredGreetingTail({ stock: Stock, chatFor, ...props }) {
			const chat = chatFor(props.sessionId);
			const greeting = (0, react.useSyncExternalStore)(chat.subscribe, chat.getSnapshot, chat.getSnapshot).value?.greeting;
			if (greeting?.messageId !== props.node.data.closing.finalNode.messageId) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, { ...props });
			const blocks = greeting.text.trim() ? [{
				kind: "text",
				text: greeting.text
			}] : [];
			const node = {
				...props.node,
				data: {
					...props.node.data,
					seq: Math.max(props.node.data.seq, greeting.eventSeq ?? 0),
					closing: {
						...props.node.data.closing,
						blocks,
						finalNode: {
							...props.node.data.closing.finalNode,
							blocks
						}
					}
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, {
				...props,
				node
			});
		}
		//#endregion
		//#region src/features/character-session/client/messages.jsx
		function Avatar({ name, image }) {
			const dialog = (0, react.useRef)(null);
			const trigger = (0, react.useRef)(null);
			const titleId = (0, react.useId)();
			const [failed, setFailed] = (0, react.useState)(false);
			const [opened, setOpened] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				setFailed(false);
			}, [image]);
			(0, react.useEffect)(() => {
				if (opened) dialog.current?.showModal();
			}, [opened]);
			const portrait = image && !failed;
			const close = () => {
				dialog.current?.close();
				setOpened(false);
				trigger.current?.focus();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				ref: trigger,
				type: "button",
				className: "mayori-message-avatar",
				"aria-label": `Открыть аватар: ${name}`,
				"aria-haspopup": "dialog",
				onClick: () => {
					setOpened(true);
				},
				onKeyDown: (event) => {
					if (event.key === "Enter" || event.key === " ") event.stopPropagation();
				},
				children: portrait ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
					src: image,
					alt: "",
					loading: "lazy",
					decoding: "async",
					onError: () => {
						setFailed(true);
					}
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					children: Array.from(name.trim())[0]?.toLocaleUpperCase() || "?"
				})
			}), opened && (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dialog", {
				ref: dialog,
				className: "mayori-avatar-dialog",
				"aria-labelledby": titleId,
				onClose: () => {
					setOpened(false);
					trigger.current?.focus();
				},
				onCancel: (event) => {
					event.preventDefault();
					close();
				},
				onKeyDown: (event) => {
					event.stopPropagation();
				},
				onClick: (event) => {
					if (event.target !== event.currentTarget) return;
					const bounds = event.currentTarget.getBoundingClientRect();
					if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-avatar-dialog-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						id: titleId,
						children: name
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						autoFocus: true,
						onClick: close,
						"aria-label": "Закрыть аватар",
						children: "×"
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "mayori-avatar-dialog-media",
					children: portrait ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						src: originalImage(image),
						alt: `Аватар: ${name}`,
						decoding: "async",
						onError: () => {
							setFailed(true);
						}
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Аватар пока не добавлен." })
				})]
			}), document.body)] });
		}
		/** Keep the stock text column intact; use a separate row when its gutters cannot fit a portrait. */
		function MessageWithAvatar({ assistant, name, image, children, actions }) {
			const row = (0, react.useRef)(null);
			const [placement, setPlacement] = (0, react.useState)("above");
			(0, react.useEffect)(() => {
				const element = row.current;
				const viewport = element.ownerDocument.documentElement;
				const view = element.ownerDocument.defaultView;
				const clips = [];
				for (let parent = element.parentElement; parent; parent = parent.parentElement) {
					const style = view.getComputedStyle(parent);
					if ([style.overflowX, style.overflowY].some((value) => value !== "visible")) clips.push(parent);
				}
				const measure = () => {
					let left = 0;
					let right = viewport.clientWidth;
					for (const clip of clips) {
						const bounds = clip.getBoundingClientRect();
						left = Math.max(left, bounds.left + clip.clientLeft);
						right = Math.min(right, bounds.left + clip.clientLeft + clip.clientWidth);
					}
					const bounds = element.getBoundingClientRect();
					setPlacement(bounds.left - left >= 60 && right - bounds.right >= 60 ? "side" : "above");
				};
				const observer = new view.ResizeObserver(measure);
				for (const target of [
					element,
					viewport,
					...clips
				]) observer.observe(target);
				measure();
				return () => {
					observer.disconnect();
				};
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: row,
				className: `mayori-message mayori-message-${assistant ? "character" : "user"}`,
				"data-avatar-placement": placement,
				children: [
					assistant && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Avatar, {
						name,
						image
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mayori-message-content",
						children
					}),
					actions && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UserRevisionToolbar, {
						container: row,
						children: actions
					}),
					!assistant && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Avatar, {
						name,
						image
					})
				]
			});
		}
		/** Session snapshots own portraits; the stock renderer still owns message content. */
		function CharacterMessage({ stock, stockChildren, childPrefix, chatFor, revisionFor, ...props }) {
			const chat = chatFor(props.sessionId);
			const snapshot = (0, react.useSyncExternalStore)(chat.subscribe, chat.getSnapshot, chat.getSnapshot);
			const mapped = remapChildProps(props, stockChildren, childPrefix);
			const assistant = props.node.kind === "assistant-step";
			const Stock = stock;
			const content = assistant ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GreetingMessage, {
				stock: Stock,
				chatFor,
				...mapped
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, { ...mapped });
			if (!snapshot.value?.character) return content;
			if (assistant) {
				if (props.groupPart === "reasoning") return content;
				const greeting = props.node.data.turn === 1 && props.node.data.step === 1 && snapshot.value.greeting?.messageId === props.node.data.finalNode?.messageId ? snapshot.value.greeting : null;
				if (!(greeting ? [{
					kind: "text",
					text: greeting.text
				}] : props.node.data.blocks)?.some((block) => block.kind !== "reasoning" && block.kind !== "tool-call" && (block.kind !== "text" || block.text.trim()))) return content;
			}
			const person = assistant ? snapshot.value.character : snapshot.value.persona;
			const name = person?.name || (assistant ? "Персонаж" : "Игрок");
			const seq = assistant ? props.node.data.finalNode?.seq : props.node.data.seq;
			const editable = !assistant && revisionFor && props.useSession && Number.isSafeInteger(seq) && seq > 0 && props.node.data.content?.some((block) => block.type === "text" && block.text.trim());
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MessageWithAvatar, {
				assistant,
				name,
				image: assistant ? person?.image : person?.avatar,
				actions: editable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MessageRevisionControls, {
					revisions: revisionFor(props.sessionId),
					seq,
					useSession: props.useSession,
					canRepeat: false
				}),
				children: content
			});
		}
		//#endregion
		//#region src/features/message-revisions/client/revisions.js
		var MessageRevisionClient = class {
			getSnapshot() {
				throw new Error("MessageRevisionClient.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("MessageRevisionClient.subscribe() is not implemented");
			}
			inspect() {
				throw new Error("MessageRevisionClient.inspect() is not implemented");
			}
			edit() {
				throw new Error("MessageRevisionClient.edit() is not implemented");
			}
			regenerate() {
				throw new Error("MessageRevisionClient.regenerate() is not implemented");
			}
		};
		var RemoteMessageRevisionProvider = class extends MessageRevisionClient {
			#snapshot = { busy: false };
			#listeners = /* @__PURE__ */ new Set();
			constructor(sessionId, open) {
				super();
				this.sessionId = sessionId;
				this.open = open;
			}
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(busy) {
				this.#snapshot = { busy };
				for (const listener of this.#listeners) listener();
			}
			inspect(seq) {
				return call("message-inspect", {
					sessionId: this.sessionId,
					seq
				});
			}
			async #change(endpoint, input) {
				if (this.#snapshot.busy) throw new Error("Дождитесь сохранения текущей реплики.");
				this.#publish(true);
				try {
					const value = await call(endpoint, {
						sessionId: this.sessionId,
						...input
					});
					if (value.changed) await this.open(value.sessionId);
					return value;
				} finally {
					this.#publish(false);
				}
			}
			edit(seq, text) {
				return this.#change("message-edit", {
					seq,
					text
				});
			}
			regenerate(seq) {
				return this.#change("message-regenerate", { seq });
			}
		};
		//#endregion
		//#region src/features/trajectory/client/context.js
		const uniqueViews = /* @__PURE__ */ new WeakMap();
		/** DSH 0.2.1's tab consumer reads raw registrations, including shadowed entries. */
		function deduplicateViews(views) {
			if (!uniqueViews.has(views)) {
				const seen = /* @__PURE__ */ new Set();
				const filtered = views.filter((view) => {
					if (seen.has(view.id)) return false;
					seen.add(view.id);
					return true;
				});
				const chatIndex = filtered.findIndex((view) => view.id === "chat");
				if (chatIndex > 0) filtered.unshift(...filtered.splice(chatIndex, 1));
				uniqueViews.set(views, filtered.length === views.length && chatIndex <= 0 ? views : filtered);
			}
			return uniqueViews.get(views);
		}
		var TrajectoryContextService = class {
			getSnapshot() {
				throw new Error("TrajectoryContextService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("TrajectoryContextService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("TrajectoryContextService.refresh() is not implemented");
			}
		};
		/** Session-bound browser provider; an old response cannot overwrite a new selection. */
		var RemoteTrajectoryContextProvider = class extends TrajectoryContextService {
			#snapshot = {
				status: "loading",
				value: null,
				error: null
			};
			#listeners = /* @__PURE__ */ new Set();
			#revision = 0;
			#controller;
			constructor(sessionId) {
				super();
				this.sessionId = sessionId;
			}
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(value) {
				this.#snapshot = value;
				for (const listener of this.#listeners) listener();
			}
			async refresh(selection) {
				const revision = ++this.#revision;
				this.#controller?.abort();
				const controller = this.#controller = new AbortController();
				this.#publish({
					status: "loading",
					value: this.#snapshot.value,
					error: null
				});
				try {
					const value = await call("trajectory-context", {
						sessionId: this.sessionId,
						selection
					}, { signal: controller.signal });
					if (revision === this.#revision) this.#publish({
						status: "ready",
						value,
						error: null
					});
				} catch (error) {
					if (revision === this.#revision) this.#publish({
						status: "error",
						value: null,
						error: error.message
					});
				}
			}
			release() {
				if (!this.#listeners.size) this.dispose();
			}
			dispose() {
				++this.#revision;
				this.#controller?.abort();
				this.#snapshot = {
					status: "loading",
					value: null,
					error: null
				};
			}
		};
		//#endregion
		//#region src/features/trajectory/client/snapshot.js
		/** Adapt a reconstructed request to the public stock Trajectory snapshot contract. */
		function assistantBlocks(content) {
			return content.map((block) => {
				if (block.type === "text" || block.type === "reasoning") return {
					kind: block.type,
					text: block.text
				};
				if (block.type === "image") return block.offloaded ? {
					kind: "other",
					block
				} : {
					kind: "image",
					attachment: block.attachment
				};
				if (block.type === "tool-call") return {
					kind: "tool-call",
					callId: String(block.id),
					name: block.name,
					argsRaw: block.arguments
				};
				return {
					kind: "other",
					block
				};
			});
		}
		function contextTrajectorySnapshot(stock, value) {
			const originals = new Map(stock.eventNodes.map((node) => [node.seq, node]));
			const systemPrompts = [];
			const eventNodes = [];
			for (const item of value.messages) {
				const { seq, message, time, turn, step } = item;
				const original = originals.get(seq);
				if (message.role === "system") systemPrompts.push({
					seq,
					time,
					turn,
					step,
					text: message.content.filter((block) => block.type === "text").map((block) => block.text).join(""),
					update: systemPrompts.length > 0
				});
				else if (message.role === "assistant") eventNodes.push({
					...original,
					kind: "assistant",
					seq,
					time,
					turn,
					step,
					messageId: message.id,
					blocks: assistantBlocks(message.content),
					providerMetadata: {
						provider: message.source.provider,
						model: message.source.model
					}
				});
				else if (message.role === "tool") eventNodes.push({
					...original,
					kind: "tool-result",
					seq,
					time,
					callId: String(message.source.callId),
					name: original?.name ?? "",
					args: original?.args ?? {},
					call: original?.call ?? null,
					callTime: original?.callTime ?? null,
					subCalls: original?.subCalls ?? [],
					content: message.content,
					isError: message.isError === true
				});
				else {
					const kind = message.role === "user" && message.source.kind === "user" ? original?.kind === "steering" ? "steering" : "user" : "context";
					eventNodes.push({
						...original,
						kind,
						seq,
						time,
						content: message.content,
						source: message.source,
						...kind === "steering" ? { messageId: message.id } : {},
						...kind === "context" ? {
							producer: original?.producer ?? {
								role: "inject",
								label: message.source.kind ?? null
							},
							form: original?.form ?? ([
								"instructions",
								"catalog",
								"snapshot",
								"notice",
								"relay",
								"recall"
							].includes(message.source.form) ? message.source.form : null)
						} : {}
					});
				}
			}
			const assistantSeqs = new Set(eventNodes.filter((node) => node.kind === "assistant").map((node) => node.seq));
			const target = value.selectedSeq === "current" ? value.requests.at(-1) : value.requests.find((request) => request.seq === value.selectedSeq);
			const requests = stock.requests.filter((request) => request.purpose === "assistant" && assistantSeqs.has(request.resultSeq) && request.resultSeq !== target?.seq).map(({ promptChange, ...request }) => request);
			if (target) {
				const original = stock.requests.find((request) => request.purpose === "assistant" && request.resultSeq === target.seq);
				const initial = systemPrompts.shift();
				requests.push({
					...original,
					purpose: "assistant",
					turn: target.turn,
					step: target.step,
					startSeq: original?.startSeq ?? target.startSeq,
					startedAt: original?.startedAt ?? target.startedAt ?? target.time,
					completedAt: target.time,
					status: target.failed ? "error" : "complete",
					resultSeq: target.seq,
					...value.header ? { prompt: {
						config: value.header.config,
						tools: value.header.tools ?? [],
						system: initial?.text ?? ""
					} } : {},
					promptChange: initial && value.header ? {
						seq: initial.seq,
						time: initial.time,
						kind: "initial"
					} : void 0
				});
				if (initial && !value.header) systemPrompts.unshift(initial);
			}
			const partial = target && value.selectedSeq !== "current" ? {
				turn: target.turn,
				step: target.step,
				blocks: []
			} : null;
			return {
				...stock,
				eventNodes,
				systemPrompts,
				requests,
				partial,
				runningCalls: [],
				eventLocations: new Map(eventNodes.flatMap((node) => stock.eventLocations.has(node.seq) ? [[node.seq, stock.eventLocations.get(node.seq)]] : [])),
				callSchemas: new Map([...stock.callSchemas, ...(value.header?.tools ?? []).map((tool) => [tool.name, tool])])
			};
		}
		//#endregion
		//#region src/features/trajectory/client/view.jsx
		/** Preserve the native header while removing duplicate tabs from raw slot entries. */
		function TrajectorySessionHeader({ stock: Stock, stockChildren, childPrefix, revisionNavigation: Navigation, revisionNavigationProps, ...props }) {
			const useConversationViews = (selector) => props.useConversationViews((views) => selector(deduplicateViews(views)));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, {
				...remapChildProps(props, stockChildren, childPrefix),
				useConversationViews
			}), Navigation && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Navigation, {
				sessionId: props.sessionId,
				...revisionNavigationProps
			})] });
		}
		function RequestTrajectory({ stock: Stock, value, ...props }) {
			const stock = props.useTrajectory((state) => state);
			const session = props.useSession((state) => state);
			const filtered = (0, react.useMemo)(() => contextTrajectorySnapshot(stock, value), [stock, value]);
			const scopedSession = (0, react.useMemo)(() => ({
				...session,
				hasMore: false,
				loadingOlder: false
			}), [session]);
			const useTrajectory = (selector) => selector(filtered);
			const useSession = (selector) => selector(scopedSession);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, {
				...props,
				useTrajectory,
				useSession,
				loadOlder: async () => false
			});
		}
		/** Default request-input view; retain the shipped ledger as an explicit alternative. */
		function ContextTrajectory({ stock: Stock, stockChildren, childPrefix, contextFor, ...props }) {
			const [mode, setMode] = (0, react.useState)("context");
			const [selection, setSelection] = (0, react.useState)("latest");
			const context = contextFor(props.sessionId);
			const snapshot = (0, react.useSyncExternalStore)(context.subscribe, context.getSnapshot, context.getSnapshot);
			const latestSeq = props.useTrajectory((state) => state.eventNodes.at(-1)?.seq);
			const running = props.useSession((state) => state.running);
			const refresh = () => {
				context.refresh(selection === "latest" ? void 0 : selection === "current" ? selection : Number(selection));
			};
			(0, react.useEffect)(() => {
				if (mode === "context") refresh();
			}, [
				context,
				mode,
				selection,
				latestSeq,
				running
			]);
			const value = snapshot.status === "ready" ? snapshot.value : null;
			const mapped = remapChildProps(props, stockChildren, childPrefix);
			const journal = mode === "journal" || props.viewRequest?.focus != null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-trajectory",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-trajectory-controls",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-trajectory-field",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Показывать" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
							"aria-label": "Показывать",
							value: journal ? "journal" : "context",
							onChange: (value) => {
								props.completeViewRequest?.();
								setMode(value);
							},
							options: [{
								value: "context",
								label: "Контекст запроса"
							}, {
								value: "journal",
								label: "Полный журнал"
							}]
						})]
					}), !journal && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-trajectory-field",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Запрос" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
							"aria-label": "Запрос",
							value: selection,
							onChange: setSelection,
							options: [
								{
									value: "latest",
									label: "Последний запрос"
								},
								{
									value: "current",
									label: "Текущий сохранённый контекст"
								},
								...(snapshot.value?.requests ?? []).map((request) => ({
									value: request.seq,
									label: `№${request.number} · Ход ${request.turn}, шаг ${request.step}${request.failed ? " · Неудачная попытка" : ""}`
								}))
							]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: refresh,
						disabled: snapshot.status === "loading",
						children: "Обновить"
					})] })]
				}), journal ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "mayori-trajectory-journal",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, { ...mapped })
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-trajectory-context",
					"aria-busy": snapshot.status === "loading",
					children: [
						snapshot.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "status",
							children: "Загрузка контекста…"
						}),
						snapshot.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							children: snapshot.error
						}),
						value && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "mayori-persona-hint",
								children: value.selectedSeq === "current" ? "Сохранённые сообщения для следующего запроса. Системный контекст обновится при отправке." : "Вход модели на момент этого запроса. Заменённые сообщения и ответ на запрос исключены."
							}),
							!value.messages.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "В чате пока нет сохранённых сообщений." }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "mayori-trajectory-table",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RequestTrajectory, {
									stock: Stock,
									...mapped,
									value
								}, value.selectedSeq)
							})
						] })
					]
				})]
			});
		}
		//#endregion
		//#region src/client/shell/home.jsx
		function HomeIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" })
			});
		}
		/** Also occupies the empty Conversation through its public session-maybe seat. */
		function HomeConversation(props) {
			const { sessionId, useSessions, stock: Stock, stockChildren, childPrefix, renderSlot, selectPanel } = props;
			const blank = useSessions((snapshot) => {
				const row = sessionId === void 0 ? void 0 : snapshot.byId[sessionId];
				return sessionId === void 0 || row?.blank === true && !row.title?.trim();
			});
			(0, react.useEffect)(() => {
				if (blank) selectPanel("mayori-home");
			}, [blank, selectPanel]);
			if (blank) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HomePanel, { ...props });
			const delegate = (name, ...args) => renderSlot(Object.hasOwn(stockChildren ?? {}, name) ? `${childPrefix}.${name}` : name, ...args);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, {
				...props,
				renderSlot: delegate
			});
		}
		function HomePanel({ history, library, personas, startCharacter, selectPanel }) {
			const personaSnapshot = (0, react.useSyncExternalStore)(personas.subscribe, personas.getSnapshot, personas.getSnapshot);
			const persona = personaSnapshot.personas.find((item) => item.id === personaSnapshot.defaultId) ?? DEFAULT_PERSONA;
			const snapshot = (0, react.useSyncExternalStore)(history.subscribe, history.getSnapshot, history.getSnapshot);
			const archive = (0, react.useSyncExternalStore)(history.subscribeArchive, history.getArchiveSnapshot, history.getArchiveSnapshot);
			const catalog = (0, react.useSyncExternalStore)(library.subscribe, library.getSnapshot, library.getSnapshot);
			const rows = (0, react.useMemo)(() => archive.phase === "ready" && archive.state !== "error" ? historyRows(snapshot, "", archive.archivedSessionIds, false, 5) : [], [snapshot, archive]);
			const cards = recentCharacters(catalog.cards);
			const details = useHistoryDetails(history, rows);
			const [error, setError] = (0, react.useState)("");
			const [refreshing, setRefreshing] = (0, react.useState)(false);
			const [playingId, setPlayingId] = (0, react.useState)(null);
			const [selectedCard, setSelectedCard] = (0, react.useState)(null);
			const triggerRef = (0, react.useRef)(null);
			const detailRevision = (0, react.useRef)(0);
			(0, react.useEffect)(() => () => {
				++detailRevision.current;
			}, []);
			const showDetails = async (item, trigger) => {
				triggerRef.current = trigger;
				const revision = ++detailRevision.current;
				try {
					const card = await library.get(item.id);
					if (revision === detailRevision.current) setSelectedCard(card);
				} catch (failure) {
					if (revision === detailRevision.current) setError(failure.message);
				}
			};
			const playingRef = (0, react.useRef)(false);
			(0, react.useEffect)(() => {
				let active = true;
				setRefreshing(true);
				Promise.resolve().then(() => history.ensureLoaded()).catch(() => {
					if (active) setError("Не удалось загрузить последние чаты. Попробуйте открыть историю и обновить список.");
				}).finally(() => {
					if (active) setRefreshing(false);
				});
				return () => {
					active = false;
				};
			}, [history]);
			const open = async (id) => {
				setError("");
				try {
					await history.open(id);
				} catch {
					setError("Не удалось открыть чат. Попробуйте ещё раз.");
				}
			};
			const play = async (card, greetingIndex) => {
				if (playingRef.current) return;
				playingRef.current = true;
				setPlayingId(card.id);
				setError("");
				try {
					await startCharacter(card, greetingIndex);
				} catch (failure) {
					setError(failure instanceof Error ? failure.message : String(failure));
				} finally {
					playingRef.current = false;
					setPlayingId(null);
				}
			};
			const remove = async (card, dialog) => {
				if (!window.confirm(`Удалить персонажа «${card.name}» из галереи?`)) return;
				try {
					await library.remove(card.id);
					dialog?.close();
				} catch (failure) {
					setError(failure instanceof Error ? failure.message : String(failure));
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-home-panel",
				"aria-labelledby": "mayori-home-title",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-home-content",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "mayori-home-welcome",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "mayori-home-mark",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MayoriMark, {})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
									id: "mayori-home-title",
									children: "Добро пожаловать в Mayori"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Продолжите свою историю или выберите персонажа для нового приключения." })
							]
						}),
						error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "mayori-error",
							children: error
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "mayori-home-section",
							"aria-labelledby": "mayori-home-chats",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									id: "mayori-home-chats",
									children: "Последние чаты"
								}),
								(refreshing || snapshot.phase === "pending" || archive.phase === "pending") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "status",
									children: "Загружаем чаты…"
								}),
								archive.state === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "mayori-error",
									children: "Не удалось загрузить состояние архива."
								}),
								!refreshing && snapshot.phase === "ready" && archive.phase === "ready" && archive.state !== "error" && rows.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-home-empty",
									children: "Чатов пока нет. Выберите персонажа ниже, чтобы начать историю."
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: "mayori-history-list",
									children: rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryRow, {
										row,
										detail: details.value[row.id],
										loading: details.loading,
										onOpen: open
									}) }, row.id))
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "mayori-secondary-button",
									onClick: () => {
										selectPanel("mayori-history");
									},
									children: ["Перейти в историю чатов ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "→"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "mayori-home-section",
							"aria-labelledby": "mayori-home-characters",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									id: "mayori-home-characters",
									children: "Недавно загруженные персонажи"
								}),
								catalog.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "status",
									children: "Загружаем персонажей…"
								}),
								catalog.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "mayori-error",
									children: catalog.error
								}),
								catalog.status === "ready" && cards.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-home-empty",
									children: "В галерее пока нет персонажей. Перейдите в персонажи и импортируйте карточку PNG или JSON."
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: "mayori-card-grid",
									children: cards.map((card) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterCard, {
										card,
										onPlay: play,
										playBusy: playingId === card.id,
										playDisabled: playingId !== null,
										onEdit: showDetails
									}, card.id))
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "mayori-secondary-button",
									onClick: () => {
										selectPanel("mayori-characters");
									},
									children: ["Перейти к персонажам ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "→"
									})]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterInfoDialog, {
					card: selectedCard,
					onClose: () => {
						setSelectedCard(null);
					},
					onRemove: remove,
					triggerRef,
					persona,
					onPlay: play,
					playDisabled: playingId !== null
				})]
			});
		}
		//#endregion
		//#region src/features/dice/shared/pool.js
		/** Project recorded groups; never generate randomness or reinterpret expressions. */
		function projectDiceGroup(group) {
			const indices = group.keptIndices ?? group.results.map((_, index) => index);
			const kept = new Set(indices);
			const faces = indices.map((index) => group.results[index]);
			const totals = group.chains ? group.chains.filter((chain) => chain.indices.some((index) => kept.has(index))).map((chain) => chain.value) : faces;
			return {
				sides: group.sides,
				faces,
				totals
			};
		}
		function diceObservations(details) {
			return details.filter((detail) => !detail.error && detail.dice.length).map((detail) => ({
				path: detail.path,
				groups: detail.dice.map(projectDiceGroup)
			}));
		}
		//#endregion
		//#region src/features/dice/shared/result.js
		/** Browser-safe durable dice result contract; versions 1 and unversioned logs remain readable. */
		const record$1 = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
		const numeric$1 = (value) => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
		const scalar = (value) => numeric$1(value) || typeof value === "boolean";
		const pathValid = (path) => Array.isArray(path) && path.length <= 64 && path.every((key) => typeof key === "string" || Number.isSafeInteger(key) && key >= 0);
		const indices = (list, maximum) => Array.isArray(list) && list.every((index, at) => Number.isSafeInteger(index) && index >= 0 && index < maximum && (at === 0 || index > list[at - 1]));
		const comparators = [
			">",
			">=",
			"<",
			"<=",
			"==",
			"!="
		];
		/** Model projection: the complete trace stays in the recorded metadata. */
		function compactDiceResult(result) {
			return {
				rollId: result.rollId,
				values: result.values,
				...result.errors.length ? { errors: result.errors } : {}
			};
		}
		function readDiceResult(content, meta) {
			if (!Array.isArray(content) || content.length !== 1 || content[0]?.type !== "text" || typeof content[0].text !== "string" || content[0].text.length > 8e6) return null;
			let value;
			try {
				value = JSON.parse(content[0].text);
			} catch {
				return null;
			}
			if (record$1(value) && !Object.hasOwn(value, "details")) {
				if (Object.hasOwn(value, "rollId")) {
					const full = meta?.kind === "mayori-dice" ? validateDiceResult(meta.result) : null;
					return full?.schemaVersion === 3 && full.rollId === value.rollId && JSON.stringify(compactDiceResult(full)) === JSON.stringify(value) ? full : null;
				}
				if (![
					1,
					2,
					3
				].includes(value.schemaVersion) || !record$1(meta) || meta.kind !== "mayori-dice") return null;
				const full = validateDiceResult(meta.result);
				const fields = value.schemaVersion >= 2 ? [
					"schemaVersion",
					"purpose",
					"values",
					"errors",
					...value.schemaVersion === 3 ? ["observations"] : []
				] : [
					"schemaVersion",
					"purpose",
					"values",
					"error"
				];
				if (!full || full.schemaVersion !== value.schemaVersion || Object.keys(value).some((key) => !fields.includes(key)) || fields.some((key) => JSON.stringify(value[key]) !== JSON.stringify(full[key]))) return null;
				return full;
			}
			return validateDiceResult(value);
		}
		function validateDiceResult(value) {
			if (!record$1(value) || Object.hasOwn(value, "schemaVersion") && ![
				1,
				2,
				3
			].includes(value.schemaVersion) || Object.hasOwn(value, "rollId") && (typeof value.rollId !== "string" || !value.rollId.trim()) || value.purpose !== void 0 && (typeof value.purpose !== "string" || !value.purpose.trim() || value.purpose.length > 2e3) || !Array.isArray(value.details) || !value.details.length || value.details.length > 1e3) return null;
			const v2 = value.schemaVersion >= 2, paths = /* @__PURE__ */ new Map(), drawIndices = /* @__PURE__ */ new Set();
			let faces = 0;
			for (const detail of value.details) {
				if (!record$1(detail) || !pathValid(detail.path) || typeof detail.expression !== "string" || detail.expression.length > 1e5 || !detail.expression.trim() && !(v2 && detail.error) || !Array.isArray(detail.dice) || (detail.error === void 0 ? !(v2 ? scalar : numeric$1)(detail.value) : typeof detail.error !== "string" || !detail.error) || v2 && detail.error !== void 0 && (detail.value !== null || typeof detail.code !== "string" || !detail.code)) return null;
				const key = JSON.stringify(detail.path);
				if (paths.has(key)) return null;
				paths.set(key, detail);
				if (v2 && (!Array.isArray(detail.references) || detail.references.length > 8192 || !detail.references.every((ref) => record$1(ref) && pathValid(ref.path) && scalar(ref.value)) || !Array.isArray(detail.decisions) || detail.decisions.length > 8192 || !detail.decisions.every((decision) => record$1(decision) && typeof decision.condition === "boolean" && (decision.operator === "if" ? decision.branch === (decision.condition ? "then" : "else") : ["and", "or"].includes(decision.operator) && decision.branch === ((decision.operator === "and" ? !decision.condition : decision.condition) ? "short-circuit" : "right"))))) return null;
				for (const dice of detail.dice) {
					if (!record$1(dice) || !Number.isSafeInteger(dice.sides) || dice.sides < 1 || dice.sides > 1e9 || !Array.isArray(dice.results) || !dice.results.length && !(v2 && detail.error)) return null;
					faces += dice.results.length;
					if (faces > 1e5 || !dice.results.every((face) => Number.isSafeInteger(face) && face >= 1 && face <= dice.sides)) return null;
					if (dice.keep !== void 0 && (!record$1(dice.keep) || !["highest", "lowest"].includes(dice.keep.mode) || !Number.isSafeInteger(dice.keep.count) || dice.keep.count < 1 || dice.keep.count > (v2 ? dice.count : dice.results.length))) return null;
					if (dice.keptIndices !== void 0 && !indices(dice.keptIndices, dice.results.length)) return null;
					if (!v2) {
						if (dice.keep ? dice.keptIndices?.length !== dice.keep.count : dice.keptIndices !== void 0) return null;
						continue;
					}
					if (!Number.isSafeInteger(dice.count) || dice.count < 1 || dice.count > 1e5 || !Array.isArray(dice.draws) || dice.draws.length !== dice.results.length) return null;
					for (const [index, draw] of dice.draws.entries()) {
						if (!record$1(draw) || !Number.isSafeInteger(draw.drawIndex) || draw.drawIndex < 0 || draw.drawIndex >= 1e5 || drawIndices.has(draw.drawIndex) || index > 0 && draw.drawIndex <= dice.draws[index - 1].drawIndex || !Number.isSafeInteger(draw.die) || draw.die < 0 || draw.die >= dice.count || ![
							"initial",
							"explode",
							"reroll"
						].includes(draw.reason) || (draw.reason === "reroll" ? !Number.isSafeInteger(draw.replaces) || draw.replaces < 0 || draw.replaces >= index || dice.draws[draw.replaces].die !== draw.die : draw.replaces !== void 0)) return null;
						drawIndices.add(draw.drawIndex);
					}
					if (dice.explode !== void 0 && dice.explode !== true) return null;
					if (dice.reroll !== void 0 && (!record$1(dice.reroll) || typeof dice.reroll.once !== "boolean" || !comparators.includes(dice.reroll.operator) || !numeric$1(dice.reroll.threshold))) return null;
					if (dice.explode || dice.reroll) {
						if (!Array.isArray(dice.chains) || dice.chains.length > dice.count || !detail.error && dice.chains.length !== dice.count) return null;
						for (const [die, chain] of dice.chains.entries()) if (!record$1(chain) || !indices(chain.indices, dice.results.length) || !chain.indices.every((index) => dice.draws[index].die === die) || (chain.value === void 0 ? !detail.error : !numeric$1(chain.value) || chain.value !== chain.indices.reduce((sum, index) => sum + dice.results[index], 0))) return null;
						if (!detail.error && dice.keptIndices === void 0) return null;
						if (dice.keptIndices !== void 0) {
							const kept = new Set(dice.keptIndices);
							const selected = dice.chains.filter((chain) => chain.indices.some((index) => kept.has(index)));
							if (selected.some((chain) => !chain.indices.every((index) => kept.has(index))) || selected.flatMap((chain) => chain.indices).length !== kept.size || selected.length !== (dice.keep?.count ?? dice.count)) return null;
						}
					} else if (dice.chains !== void 0 || !detail.error && dice.results.length !== dice.count || (dice.keep ? !detail.error && dice.keptIndices?.length !== dice.keep.count : dice.keptIndices !== void 0)) return null;
				}
			}
			if (v2) {
				if (value.error !== void 0 || !Array.isArray(value.errors) || value.errors.length > 1e3) return null;
				const errors = /* @__PURE__ */ new Map();
				for (const error of value.errors) {
					if (!record$1(error) || !pathValid(error.path) || typeof error.code !== "string" || typeof error.message !== "string") return null;
					const key = JSON.stringify(error.path), detail = paths.get(key);
					if (errors.has(key) || !detail?.error || detail.error !== error.message || detail.code !== error.code) return null;
					errors.set(key, error);
				}
				if (value.details.filter((detail) => detail.error).length !== errors.size || !validTree(value.values, paths, true)) return null;
				for (const index of drawIndices) if (index >= drawIndices.size) return null;
				for (const detail of value.details) for (const ref of detail.references) if (paths.get(JSON.stringify(ref.path))?.value !== ref.value) return null;
			} else if (value.error !== void 0) {
				const last = value.details.at(-1);
				if (value.values !== null || !record$1(value.error) || !pathValid(value.error.path) || typeof value.error.message !== "string" || !value.error.message || JSON.stringify(value.error.path) !== JSON.stringify(last.path) || value.error.message !== last.error || value.details.slice(0, -1).some((detail) => detail.error !== void 0)) return null;
			} else if (value.details.some((detail) => detail.error !== void 0) || !validTree(value.values, paths, false)) return null;
			if (value.schemaVersion === 3 && JSON.stringify(value.observations) !== JSON.stringify(diceObservations(value.details))) return null;
			return value;
		}
		function validTree(values, paths, v2) {
			if (values === null || typeof values !== "object") return false;
			const pending = [[values, []]];
			let nodes = 0, leaves = 0;
			while (pending.length) {
				const [node, path] = pending.pop();
				if (++nodes > 1e4 || path.length > 64) return false;
				if (numeric$1(node) || v2 && (typeof node === "boolean" || node === null)) {
					const detail = paths.get(JSON.stringify(path));
					if (!detail || detail.value !== node || node === null && !detail.error) return false;
					leaves++;
				} else if (Array.isArray(node)) node.forEach((child, index) => pending.push([child, [...path, index]]));
				else if (record$1(node)) Object.entries(node).forEach(([key, child]) => pending.push([child, [...path, key]]));
				else return false;
			}
			return leaves === paths.size;
		}
		function dicePurpose(block) {
			const observed = block?.args?.textPrefix?.("purpose", 2e3) ?? block?.args?.text?.("purpose");
			if (typeof observed === "string") return observed;
			try {
				const args = JSON.parse(block?.call?.argsRaw ?? block?.argsRaw ?? "{}");
				return typeof args.purpose === "string" ? args.purpose : "";
			} catch {
				return "";
			}
		}
		//#endregion
		//#region src/features/dice/client/card.jsx
		/** A keyed atomic tool view. DSH owns call pairing, lifecycle and transcript topology. */
		const pathLabel = (path) => path.map((key) => typeof key === "number" ? `[${key}]` : key).join(" › ");
		const errorCopy = (message) => message === "Division by zero" ? "Деление на ноль. Проверьте знаменатель." : message === "Arithmetic result must be finite and within the safe numeric range" ? "Результат слишком большой. Проверьте формулу." : message;
		function DiceFaces({ dice }) {
			const kept = dice.keptIndices === void 0 ? null : new Set(dice.keptIndices);
			const fullText = dice.results.map((face, index) => `${face}${kept && !kept.has(index) ? " (отброшен)" : ""}`).join(", ");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-dice-group",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "mayori-dice-group-label",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", {
								dir: "ltr",
								children: [
									dice.count ?? dice.results.length,
									"d",
									dice.sides,
									dice.explode ? "!" : ""
								]
							}),
							dice.reroll && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["Переброс: ", dice.reroll.once ? "один раз" : "пока выполняется правило"] }),
							dice.keep && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								dice.keep.mode === "highest" ? "Лучшие" : "Худшие",
								": ",
								dice.keep.count
							] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mayori-dice-faces",
						"aria-label": "Выпавшие грани",
						children: dice.results.slice(0, 24).map((face, index) => {
							const dropped = kept && !kept.has(index);
							const Element = dropped ? "s" : "span";
							const reason = dice.draws?.[index]?.reason;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Element, {
								title: reason === "explode" ? "Взрыв" : reason === "reroll" ? "Переброс" : void 0,
								className: `mayori-dice-face${dropped ? " mayori-dice-dropped" : ""}`,
								children: [
									reason && reason !== "initial" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "mayori-dice-sr",
										children: reason === "explode" ? "Взрыв. " : "Переброс. "
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "mayori-dice-sr",
										children: dropped ? "Отброшен: " : "Учтён: "
									}),
									face
								]
							}, index);
						})
					}),
					dice.results.length > 24 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
						className: "mayori-dice-all-faces",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", { children: [
							"Показать все грани (",
							dice.results.length,
							")"
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: fullText })]
					})
				]
			});
		}
		/** Raw content stays accessible when the logged format is unsupported or the tool failed. */
		function DiceToolCard({ phase, block, useDisclosure, inspect }) {
			const id = (0, react.useId)();
			const { expanded, toggle } = useDisclosure();
			const settled = phase === "result";
			const result = settled && !block.isError ? readDiceResult(block.content, block.meta) : null;
			const purpose = result?.purpose ?? dicePurpose(block);
			const interrupted = block.error?.code === "interrupted" || block.error?.code === "ABORTED" || block.error?.code === "ABORTED_BEFORE_DISPATCH";
			const state = !settled ? phase : interrupted ? "stopped" : block.isError || result?.error || result?.errors?.length ? "error" : result ? "ok" : "raw";
			const status = state === "preparing" ? "Готовится бросок" : state === "start" ? "Бросаем кубики" : state === "stopped" ? "Бросок прерван" : state === "error" ? result?.errors?.length ? "Есть ошибки" : "Не удалось вычислить" : state === "raw" ? "Исходный результат" : "Готово";
			const title = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
					"aria-hidden": "true",
					width: "18",
					height: "18",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.5",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m12 3 9 5v8l-9 5-9-5V8l9-5Zm0 9 9-4M12 12 3 8m9 4v9" })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Броски кубиков" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "mayori-dice-status",
					children: status
				})
			] });
			const raw = settled ? (block.content ?? []).map((item) => item.type === "text" ? item.text : JSON.stringify(item, null, 2)).join("\n") : "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-dice-card",
				"data-state": state,
				"aria-label": "Броски кубиков",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-dice-header",
						children: [settled ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mayori-dice-toggle",
							"aria-expanded": expanded,
							"aria-controls": id,
							onClick: toggle,
							children: [title, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								className: "mayori-dice-chevron",
								children: expanded ? "⌃" : "⌄"
							})]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "mayori-dice-toggle",
							children: title
						}), inspect && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mayori-dice-inspect",
							onClick: inspect,
							children: "В журнал"
						})]
					}),
					purpose && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "mayori-dice-purpose",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: purpose })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						id,
						children: [
							result && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: "mayori-dice-results",
								children: (expanded ? result.details : result.details.slice(0, 6)).map((detail) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-dice-result-row",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mayori-dice-formula",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "mayori-dice-path",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: pathLabel(detail.path) })
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
												dir: "ltr",
												children: detail.expression
											})]
										}), detail.error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-dice-result-error",
											children: "Ошибка"
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", {
											className: "mayori-dice-total",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "mayori-dice-sr",
												children: "Итог: "
											}), typeof detail.value === "boolean" ? detail.value ? "Да" : "Нет" : detail.value]
										})]
									}),
									!detail.error && !!detail.dice.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-dice-observation",
										children: detail.dice.map((dice, index) => {
											const { faces } = projectDiceGroup(dice);
											return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
												"На d",
												dice.sides,
												": ",
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("bdi", { children: [faces.slice(0, 12).join(", "), faces.length > 12 ? `… (${faces.length})` : ""] })
											] }, index);
										})
									}),
									expanded && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-dice-breakdown",
										children: [
											detail.dice.map((dice, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiceFaces, { dice }, index)),
											detail.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												className: "mayori-dice-error",
												children: errorCopy(detail.error)
											}),
											detail.references?.map((ref, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
												className: "mayori-dice-path",
												children: [
													"Использовано: ",
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: pathLabel(ref.path) }),
													" = ",
													String(ref.value)
												]
											}, `ref-${index}`)),
											detail.decisions?.filter((decision) => decision.operator === "if").map((decision, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
												className: "mayori-dice-path",
												children: [
													"Условие: ",
													decision.condition ? "да" : "нет",
													". Выполнена ветка ",
													decision.branch === "then" ? "«тогда»" : "«иначе»",
													"."
												]
											}, `if-${index}`)),
											!detail.dice.length && !detail.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												className: "mayori-dice-path",
												children: "Без броска кубиков"
											})
										]
									})
								] }, JSON.stringify(detail.path)))
							}),
							result && !expanded && result.details.length > 6 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "mayori-dice-hint",
								children: "Остальные результаты доступны в подробностях."
							}),
							result?.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "mayori-dice-error",
								children: "Вычисление остановлено. Выпавшие грани сохранены в подробностях."
							}),
							!!result?.errors?.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "mayori-dice-error",
								children: "Ошибки отмечены у отдельных полей. Остальные результаты сохранены."
							}),
							settled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								hidden: !expanded,
								className: "mayori-dice-record",
								children: result ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "Показать исходный результат" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: raw })] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: interrupted ? "Сохранённые сведения о прерывании:" : block.isError ? "Сообщение инструмента:" : "Результат сохранён в исходном формате." }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: raw || block.error?.reason || "Инструмент не вернул содержимое." })] })
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/features/rules/domain/check.js
		/** Explicit, versioned numeric-check policies. No platform SDK or hidden campaign state. */
		const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
		const text = (value, limit) => typeof value === "string" && value.length <= limit;
		const numeric = (value) => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
		const fields = [
			"id",
			"version",
			"sides",
			"criticalSuccessMin",
			"criticalFailureMax",
			"naturalFailureMax",
			"failureEffect",
			"criticalFailureEffects"
		];
		function validateProfile(profile) {
			if (!record(profile) || Object.keys(profile).some((key) => !fields.includes(key))) throw new TypeError("Invalid rules profile fields");
			const value = {
				criticalSuccessMin: 0,
				criticalFailureMax: 0,
				naturalFailureMax: 0,
				failureEffect: "",
				criticalFailureEffects: [],
				...profile
			};
			if (!text(value.id, 64) || !/^[a-z][a-z0-9-]*$/.test(value.id) || !text(value.version, 64) || !value.version.trim()) throw new TypeError("Rules profiles need an id and a non-empty version");
			if (!Number.isSafeInteger(value.sides) || value.sides < 2 || value.sides > 1e9) throw new TypeError("Rules sides must be an integer from 2 to 1000000000");
			for (const key of [
				"criticalSuccessMin",
				"criticalFailureMax",
				"naturalFailureMax"
			]) if (!Number.isSafeInteger(value[key]) || value[key] < 0 || value[key] > value.sides) throw new TypeError(`${key} must be 0 (disabled) or a face within the die`);
			if (value.criticalSuccessMin && value.criticalSuccessMin <= Math.max(value.criticalFailureMax, value.naturalFailureMax)) throw new TypeError("Critical success and failure ranges must not overlap");
			if (!text(value.failureEffect, 1e3) || !Array.isArray(value.criticalFailureEffects) || value.criticalFailureEffects.length > 100 || !value.criticalFailureEffects.every((effect) => text(effect, 1e3) && effect.trim())) throw new TypeError("Effects must be bounded text; critical failure tables allow at most 100 entries");
			if (value.criticalFailureEffects.length && !value.criticalFailureMax) throw new TypeError("A critical failure table needs an enabled critical failure rule");
			return structuredClone(value);
		}
		function normalizeCheck(input) {
			if (!record(input) || Object.keys(input).some((key) => ![
				"profile",
				"modifier",
				"target",
				"mode",
				"damage",
				"purpose",
				"details"
			].includes(key))) throw new TypeError("Invalid check fields");
			if (!text(input.profile, 64) || !input.profile) throw new TypeError("Select a configured rules profile");
			if (!numeric(input.modifier ?? 0) || !numeric(input.target)) throw new TypeError("modifier and target must be finite safe-range numbers");
			const mode = input.mode ?? "normal";
			if (![
				"normal",
				"advantage",
				"disadvantage"
			].includes(mode)) throw new TypeError("Invalid check mode");
			if (input.details !== void 0 && typeof input.details !== "boolean") throw new TypeError("details must be boolean");
			if (input.purpose !== void 0 && (!text(input.purpose, 2e3) || !input.purpose.trim())) throw new TypeError("purpose must be non-empty text");
			if (input.damage !== void 0 && (!record(input.damage) || Object.keys(input.damage).some((key) => !["normal", "critical"].includes(key)) || !text(input.damage.normal, 8192) || !input.damage.normal.trim() || input.damage.critical !== void 0 && (!text(input.damage.critical, 8192) || !input.damage.critical.trim()))) throw new TypeError("damage needs normal and optional critical expressions");
			return {
				profile: input.profile,
				modifier: input.modifier ?? 0,
				target: input.target,
				mode,
				...input.damage ? { damage: structuredClone(input.damage) } : {},
				...input.purpose === void 0 ? {} : { purpose: input.purpose.trim() }
			};
		}
		function checkRolls(request, rules) {
			const pool = request.mode === "normal" ? `d${rules.sides}` : `2d${rules.sides}${request.mode === "advantage" ? "kh" : "kl"}1`;
			const critical = rules.criticalSuccessMin ? `$natural >= ${rules.criticalSuccessMin}` : "false";
			const fumble = rules.criticalFailureMax ? `$natural <= ${rules.criticalFailureMax}` : "false";
			const miss = rules.naturalFailureMax ? `$natural <= ${rules.naturalFailureMax}` : "false";
			const rolls = {
				pool,
				natural: "face($pool)",
				total: `$pool + (${numberLiteral(request.modifier)})`,
				critical,
				fumble,
				naturalFailure: miss,
				hit: `if($critical, true, if($fumble or $naturalFailure, false, $total >= (${numberLiteral(request.target)})))`
			};
			if (request.damage) rolls.damage = `if($hit, if($critical, (${request.damage.critical ?? request.damage.normal}) + 0, (${request.damage.normal}) + 0), 0)`;
			if (rules.criticalFailureEffects.length) rolls.effect = `if($fumble, d${rules.criticalFailureEffects.length}, 0)`;
			return rolls;
		}
		function numberLiteral(value) {
			const source = String(value);
			if (!source.includes("e")) return source;
			const [mantissa, power] = source.split("e"), negative = mantissa.startsWith("-");
			const [integer, fraction = ""] = mantissa.replace("-", "").split(".");
			const digits = integer + fraction, point = integer.length + Number(power);
			const expanded = point <= 0 ? `0.${"0".repeat(-point)}${digits}` : point >= digits.length ? digits + "0".repeat(point - digits.length) : `${digits.slice(0, point)}.${digits.slice(point)}`;
			return negative ? "-" + expanded : expanded;
		}
		/** Derive meaning from recorded numbers and the recorded policy, never from current Config. */
		function checkMeaning(request, rules, values) {
			if (!numeric(values.natural) || !numeric(values.total) || typeof values.hit !== "boolean") return null;
			const critical = !!rules.criticalSuccessMin && values.natural >= rules.criticalSuccessMin;
			const fumble = !!rules.criticalFailureMax && values.natural <= rules.criticalFailureMax;
			const naturalFailure = !!rules.naturalFailureMax && values.natural <= rules.naturalFailureMax;
			const hit = critical || !fumble && !naturalFailure && values.total >= request.target;
			const margin = values.total - request.target;
			if (!numeric(margin) || values.total !== values.natural + request.modifier || values.critical !== critical || values.fumble !== fumble || values.naturalFailure !== naturalFailure || values.hit !== hit) throw new TypeError("Inconsistent recorded check");
			return {
				natural: values.natural,
				modifier: request.modifier,
				total: values.total,
				target: request.target,
				margin,
				outcome: critical ? "critical_success" : fumble ? "critical_failure" : hit ? "success" : "failure",
				reason: critical ? "natural-critical-success" : fumble ? "natural-critical-failure" : naturalFailure ? "natural-failure" : hit ? "target-met" : "target-missed"
			};
		}
		//#endregion
		//#region src/features/rules/shared/result.js
		function buildCheckResult(request, rules, dice) {
			const check = checkMeaning(request, rules, dice.values);
			const damage = request.damage && check && ["success", "critical_success"].includes(check.outcome) && typeof dice.values.damage === "number" ? {
				value: dice.values.damage,
				expression: check.outcome === "critical_success" ? request.damage.critical ?? request.damage.normal : request.damage.normal
			} : null;
			let consequence = null;
			if (check?.outcome === "critical_failure" && rules.criticalFailureEffects.length) {
				const index = dice.values.effect;
				if (Number.isSafeInteger(index) && index >= 1 && index <= rules.criticalFailureEffects.length) consequence = {
					text: rules.criticalFailureEffects[index - 1],
					index
				};
			} else if (check && ["failure", "critical_failure"].includes(check.outcome) && rules.failureEffect) consequence = { text: rules.failureEffect };
			return {
				schemaVersion: 1,
				...request.purpose ? { purpose: request.purpose } : {},
				request,
				rules,
				check,
				damage,
				consequence,
				errors: dice.errors,
				dice
			};
		}
		function compactCheckResult(result) {
			if (result.rollId) {
				const { margin, ...check } = result.check ?? {};
				return {
					rollId: result.rollId,
					check: result.check ? check : null,
					...result.damage ? { damage: result.damage.value } : {},
					...result.consequence ? { consequence: result.consequence.text } : {},
					...result.errors.length ? { errors: result.errors } : {}
				};
			}
			const { dice, ...summary } = result;
			return {
				...summary,
				observations: dice.observations
			};
		}
		function readCheckResult(content, meta) {
			try {
				if (!Array.isArray(content) || content.length !== 1 || content[0]?.type !== "text" || content[0].text.length > 8e6) return null;
				const value = JSON.parse(content[0].text);
				const full = Object.hasOwn(value, "dice") ? value : meta?.kind === "mayori-check" ? meta.result : null;
				if (!full || full.schemaVersion !== 1 || !validateDiceResult(full.dice) || full.dice.schemaVersion !== 3) return null;
				if (Object.hasOwn(full, "rollId") && (typeof full.rollId !== "string" || !full.rollId.trim())) return null;
				const request = normalizeCheck(full.request), rules = validateProfile(full.rules);
				if (request.profile !== rules.id || full.dice.purpose !== request.purpose) return null;
				const expected = checkRolls(request, rules);
				if (Object.keys(expected).length !== full.dice.details.length || full.dice.details.some((detail) => detail.path.length !== 1 || expected[detail.path[0]] !== detail.expression)) return null;
				const group = full.dice.details.find((detail) => detail.path[0] === "pool");
				if (!group?.error) {
					if (group?.dice.length !== 1) return null;
					const pool = projectDiceGroup(group.dice[0]);
					if (pool.sides !== rules.sides || pool.faces.length !== 1 || pool.faces[0] !== full.dice.values.natural) return null;
				}
				const rebuilt = buildCheckResult(request, rules, full.dice);
				const { rollId, ...payload } = full;
				if (JSON.stringify(rebuilt) !== JSON.stringify(payload)) return null;
				if (!Object.hasOwn(value, "dice") && JSON.stringify(compactCheckResult(full)) !== JSON.stringify(value)) return null;
				return full;
			} catch {
				return null;
			}
		}
		//#endregion
		//#region src/features/rules/client/card.jsx
		const outcomes = {
			success: "Успех",
			failure: "Провал",
			critical_success: "Критический успех",
			critical_failure: "Критический провал"
		};
		const reasons = {
			"natural-critical-success": "Выбранная грань попала в диапазон критического успеха.",
			"natural-critical-failure": "Выбранная грань попала в диапазон критического провала.",
			"natural-failure": "Выбранная грань означает автоматический провал.",
			"target-met": "Итог достиг сложности.",
			"target-missed": "Итог ниже сложности."
		};
		/** Show recorded resolution without running rules or rolling again. */
		function CheckToolCard({ phase, block, useDisclosure, inspect }) {
			const id = (0, react.useId)(), { expanded, toggle } = useDisclosure();
			const settled = phase === "result";
			const result = settled && !block.isError ? readCheckResult(block.content, block.meta) : null;
			const stopped = [
				"interrupted",
				"ABORTED",
				"ABORTED_BEFORE_DISPATCH"
			].includes(block.error?.code);
			const state = !settled ? phase : stopped ? "stopped" : block.isError || result?.errors.length ? "error" : result ? "ok" : "raw";
			const status = state === "preparing" ? "Готовится проверка" : state === "start" ? "Бросаем кубики" : state === "stopped" ? "Проверка прервана" : state === "error" ? "Есть ошибки" : state === "raw" ? "Исходный результат" : "Готово";
			const purpose = result?.purpose ?? dicePurpose(block);
			const raw = (block.content ?? []).map((item) => item.type === "text" ? item.text : JSON.stringify(item)).join("\n");
			const check = result?.check;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-dice-card",
				"data-state": state,
				"aria-label": "Игровая проверка",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-dice-header",
						children: [settled ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mayori-dice-toggle",
							"aria-expanded": expanded,
							"aria-controls": id,
							onClick: toggle,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Игровая проверка" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "mayori-dice-status",
									children: status
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: expanded ? "⌃" : "⌄"
								})
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-dice-toggle",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Игровая проверка" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-dice-status",
								children: status
							})]
						}), inspect && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mayori-dice-inspect",
							onClick: inspect,
							children: "В журнал"
						})]
					}),
					purpose && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "mayori-dice-purpose",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: purpose })
					}),
					check && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-check-summary",
						"data-outcome": check.outcome,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
								className: "mayori-check-outcome",
								children: outcomes[check.outcome]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
								"На d",
								result.rules.sides,
								": ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: check.natural }),
								" · модификатор: ",
								check.modifier >= 0 ? "+" : "−",
								Math.abs(check.modifier),
								" · итог: ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: check.total }),
								" · сложность: ",
								check.target
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: reasons[check.reason] }),
							result.damage && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
								"Урон: ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: result.damage.value }),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", {
									dir: "ltr",
									children: [
										"(",
										result.damage.expression,
										")"
									]
								})
							] }),
							result.consequence && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: ["Последствие: ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: result.consequence.text })] })
						]
					}),
					!!result?.errors.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "mayori-dice-error",
						children: "Часть проверки не вычислена. Выпавшие грани сохранены; повторного броска не было."
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						id,
						hidden: !expanded,
						className: "mayori-dice-record",
						children: result ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
							"Правила: ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: result.rules.id }),
							", версия ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: result.rules.version }),
							". Разница со сложностью: ",
							check?.margin ?? "не вычислена",
							"."
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "Показать полный результат и грани" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: JSON.stringify(result, null, 2) })] })] }) : settled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: raw || block.error?.reason || "Инструмент не вернул результат." })
					})
				]
			});
		}
		//#endregion
		//#region src/client/styles.js
		/** Plugin-owned style; removed with the client fiber. */
		const BRAND_STYLE = String.raw`
.mayori-select { display: inline-flex; inline-size: 100%; min-inline-size: 0; vertical-align: middle; }
.mayori-select-trigger { display: inline-flex; align-items: center; justify-content: space-between; gap: 12px; box-sizing: border-box; inline-size: 100%; min-inline-size: 0; min-block-size: 40px; padding: 9px 12px; border: 0; border-radius: var(--dsw-radius-md, 8px); background: var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-2)); color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; font-weight: 400; line-height: 22px; text-align: start; cursor: pointer; }
.mayori-select-trigger > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mayori-select-trigger > svg { flex: none; inline-size: 16px; block-size: 16px; }
.mayori-select-trigger:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-select-trigger:focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 3px; }
.mayori-select-trigger:disabled { opacity: 0.5; cursor: default; }
.mayori-dice-card { min-inline-size: 0; margin-block: 8px; padding: 12px 16px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; }
.mayori-dice-header { display: flex; align-items: flex-start; gap: 8px; }
.mayori-dice-toggle { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; flex: 1; min-inline-size: 0; min-block-size: 36px; padding: 4px 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; }
button.mayori-dice-toggle { cursor: pointer; }
.mayori-dice-toggle > svg { flex: none; }
.mayori-dice-toggle > span:first-of-type { font-weight: 600; }
.mayori-dice-chevron { margin-inline-start: auto; }
.mayori-dice-status, .mayori-dice-path, .mayori-dice-hint, .mayori-dice-group-label { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.mayori-dice-status { margin-inline-start: auto; }
.mayori-dice-inspect { min-block-size: 36px; padding: 4px 8px; flex: none; border: 0; border-radius: 6px; background: transparent; color: inherit; font: inherit; font-size: 12px; cursor: pointer; }
.mayori-dice-inspect:hover, button.mayori-dice-toggle:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-dice-card :is(button, summary):focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 3px; }
.mayori-dice-purpose { margin: 4px 0 12px; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-dice-results { list-style: none; margin: 0; padding: 0; }
.mayori-dice-results > li { padding-block: 10px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-dice-result-row { display: flex; align-items: baseline; gap: 16px; }
.mayori-dice-formula { display: grid; flex: 1; min-inline-size: 0; gap: 3px; }
.mayori-dice-card code { color: inherit; font-size: 13px; white-space: pre-wrap; overflow-wrap: anywhere; }
.mayori-dice-path { overflow-wrap: anywhere; }
.mayori-dice-total { font-size: 20px; font-weight: 600; font-variant-numeric: tabular-nums; }
.mayori-dice-result-error { font-weight: 600; }
.mayori-dice-breakdown { display: grid; gap: 8px; margin-block-start: 10px; }
.mayori-dice-group-label { display: flex; flex-wrap: wrap; gap: 8px; margin-block-end: 6px; }
.mayori-dice-faces { display: flex; flex-wrap: wrap; gap: 6px; }
.mayori-dice-face { display: inline-flex; align-items: center; justify-content: center; min-inline-size: 28px; min-block-size: 28px; padding-inline: 4px; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; font-variant-numeric: tabular-nums; }
.mayori-dice-dropped { color: var(--dsw-alias-label-secondary); text-decoration-thickness: 2px; }
.mayori-dice-error { margin-block: 8px; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-dice-card summary { min-block-size: 32px; padding-block: 4px; box-sizing: border-box; cursor: pointer; }
.mayori-dice-record pre, .mayori-dice-all-faces p { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 12px; line-height: 1.5; }
.mayori-dice-hint { margin: 8px 0 0; line-height: 1.5; }
.mayori-dice-observation { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 6px 0 0; line-height: 1.5; }
.mayori-check-summary p { margin: 6px 0; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-check-outcome { font-size: 18px; }
.mayori-dice-sr { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.mayori-navigation { --dsh-sidebar-inline-padding: 12px; display: flex; flex-direction: column; box-sizing: border-box; block-size: 100%; min-block-size: 0; padding: 6px 12px; background: var(--dsw-specific-sidebar-fill); color: var(--dsw-alias-label-primary); font-size: 14px; }
.mayori-navigation-header { display: flex; align-items: center; gap: 8px; flex: none; block-size: 48px; padding-inline: 4px; }
:is(.mayori-navigation-brand, .mayori-navigation-toggle, .mayori-navigation-row) { display: flex; align-items: center; border: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; }
:is(.mayori-navigation-brand, .mayori-navigation-toggle, .mayori-navigation-row):focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, currentColor); outline-offset: -2px; }
.mayori-navigation-brand { flex: 1; min-inline-size: 0; gap: 8px; padding: 0; block-size: 36px; text-align: start; }
.mayori-navigation-brand > span:first-child { display: flex; flex: none; }
.mayori-navigation-name { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 18px; font-weight: 600; line-height: 24px; }
.mayori-navigation-toggle { position: relative; justify-content: center; flex: none; inline-size: 28px; block-size: 28px; padding: 0; border-radius: 8px; }
.mayori-navigation-toggle:hover, .mayori-navigation-row:hover, .mayori-navigation-row[aria-current=page] { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-navigation-panels { display: grid; gap: 4px; flex: none; }
.mayori-navigation-row { gap: 10px; min-inline-size: 0; inline-size: 100%; min-block-size: 36px; padding: 8px 12px; border-radius: 12px; text-align: start; }
.mayori-navigation-glyph { display: flex; align-items: center; justify-content: center; flex: none; inline-size: 18px; }
.mayori-navigation-label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.mayori-navigation-region { flex: 1; min-block-size: 0; overflow: auto; }
.mayori-navigation-footer { display: flex; flex-direction: column; flex: none; gap: 4px; }
.mayori-navigation[data-collapsed=true] { --dsh-sidebar-inline-padding: 10px; padding: 18px 10px 6px; }
.mayori-navigation[data-collapsed=true] .mayori-navigation-header { block-size: 36px; padding: 0; margin-block-end: 12px; }
.mayori-navigation[data-collapsed=true] .mayori-navigation-toggle { inline-size: 36px; block-size: 36px; border-radius: 12px; }
.mayori-navigation[data-collapsed=true] .mayori-navigation-row { justify-content: center; inline-size: 36px; padding: 8px; }
html[data-windows-titlebar] .mayori-navigation-toggle { position: fixed; inset-block-start: calc((var(--dsh-windows-titlebar-height) - 28px) / 2); inset-inline-start: 12px; z-index: 30; -webkit-app-region: no-drag; inline-size: 28px; block-size: 28px; }
html[data-windows-titlebar] .mayori-navigation-header { block-size: 40px; }
html[data-windows-titlebar] .mayori-navigation[data-collapsed=true] { padding: 0; }
html[data-windows-titlebar] .mayori-navigation[data-collapsed=true] :is(.mayori-navigation-panels, .mayori-navigation-region, .mayori-navigation-footer) { display: none; }
html[data-platform=darwin] .mayori-navigation { background: transparent; padding-block-start: 52px; }
.mayori-message { position: relative; display: grid; grid-template-areas: 'avatar' 'content'; gap: 8px; min-inline-size: 0; }
.mayori-message-content { grid-area: content; min-inline-size: 0; }
.mayori-message-actions { display: inline-flex; flex: none; align-items: center; gap: 8px; color: var(--dsw-alias-label-tertiary); }
[data-clock]:has(> .mayori-message-actions) { flex-wrap: wrap; height: auto; min-block-size: calc(28px + var(--dsh-content-font-delta, 0px)); }
.mayori-message-actions button { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; inline-size: calc(28px + var(--dsh-content-font-delta, 0px)); block-size: calc(28px + var(--dsh-content-font-delta, 0px)); padding: 6px; border: 0; border-radius: var(--dsw-radius-sm, 6px); background: transparent; color: inherit; cursor: pointer; }
.mayori-message-actions svg { inline-size: calc(15px + var(--dsh-content-font-delta, 0px)); block-size: calc(15px + var(--dsh-content-font-delta, 0px)); }
[data-clock=end] .mayori-message-actions svg { inline-size: calc(17px + var(--dsh-content-font-delta, 0px)); block-size: calc(17px + var(--dsh-content-font-delta, 0px)); }
.mayori-message-actions button:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary); }
.mayori-revision-status { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.mayori-message-actions button:disabled { cursor: default; opacity: 0.5; }
.mayori-message-actions button:focus-visible, .mayori-message-editor :is(button, textarea):focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px; }
.mayori-message-editor { box-sizing: border-box; inline-size: min(720px, calc(100vw - 32px)); max-block-size: calc(100dvh - 32px); margin: auto; padding: 24px; overflow: auto; border: 1px solid var(--dsw-alias-border-l2); border-radius: 16px; background: var(--dsw-alias-bg-layer-1, Canvas); color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-message-editor::backdrop { background: oklch(0 0 0 / 0.56); }
.mayori-message-editor form { display: grid; gap: 12px; }
.mayori-message-editor h2, .mayori-message-editor p { margin: 0; }
.mayori-message-editor h2 { font-size: 20px; }
.mayori-message-editor p { line-height: 1.5; }
.mayori-message-editor textarea { box-sizing: border-box; inline-size: 100%; min-block-size: 180px; max-block-size: 45dvh; resize: vertical; padding: 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; background: var(--dsw-alias-bg-layer-2); color: inherit; font: inherit; font-size: 16px; line-height: 1.5; }
.mayori-message-editor-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px; }
.mayori-message-editor-actions button { min-block-size: 44px; padding: 8px 16px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; background: var(--dsw-alias-bg-layer-2); color: inherit; font: inherit; cursor: pointer; }
.mayori-message-editor-actions button:disabled { cursor: default; opacity: 0.5; }
.mayori-revision-branches { grid-column: 1 / -1; min-inline-size: 0; padding-block: 8px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.mayori-revision-branches { display: flex; align-items: center; gap: 8px; }
.mayori-revision-branches > span:first-child { flex: none; }
.mayori-revision-branches .mayori-select { inline-size: auto; max-inline-size: min(480px, 70%); }
.mayori-message > .mayori-message-avatar { grid-area: avatar; justify-self: start; }
.mayori-message-user > .mayori-message-avatar { justify-self: end; }
.mayori-message[data-avatar-placement=side] { display: block; min-block-size: 44px; }
.mayori-message[data-avatar-placement=side] > .mayori-message-avatar { position: absolute; inset-block-start: 0; z-index: 1; }
.mayori-message-character[data-avatar-placement=side] > .mayori-message-avatar { inset-inline-end: calc(100% + 12px); }
.mayori-message-user[data-avatar-placement=side] > .mayori-message-avatar { inset-inline-start: calc(100% + 12px); }
.mayori-message .mayori-message-avatar { display: grid; place-items: center; flex: none; box-sizing: border-box; inline-size: 44px; block-size: 44px; padding: 0; overflow: hidden; border: 1px solid var(--dsw-alias-border-l2); border-radius: 50%; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font: inherit; font-size: 20px; cursor: pointer; }
.mayori-message-avatar img { inline-size: 100%; block-size: 100%; object-fit: cover; }
.mayori-message-avatar:hover { border-color: var(--dsw-alias-label-secondary); }
.mayori-message-avatar:focus-visible, .mayori-avatar-dialog button:focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 3px; }
.mayori-avatar-dialog { box-sizing: border-box; inline-size: min(720px, calc(100vw - 32px)); block-size: min(900px, calc(100dvh - 32px)); max-inline-size: calc(100vw - 32px); max-block-size: calc(100dvh - 32px); margin: auto; padding: 0; overflow: hidden; border: 1px solid var(--dsw-alias-border-l2); border-radius: 16px; background: var(--dsw-alias-bg-layer-1, Canvas); color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-avatar-dialog[open] { display: grid; grid-template-rows: auto minmax(0, 1fr); }
.mayori-avatar-dialog::backdrop { background: oklch(0 0 0 / 0.56); }
.mayori-avatar-dialog-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-avatar-dialog h2 { margin: 0; min-inline-size: 0; overflow-wrap: anywhere; font-size: 20px; }
.mayori-avatar-dialog button { flex: none; inline-size: 44px; block-size: 44px; border: 0; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); color: inherit; font: inherit; font-size: 26px; cursor: pointer; }
.mayori-avatar-dialog button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-avatar-dialog-media { display: grid; place-items: center; min-inline-size: 0; min-block-size: 0; overflow: hidden; padding: 16px; }
.mayori-avatar-dialog-media img { display: block; inline-size: 100%; block-size: 100%; min-inline-size: 0; min-block-size: 0; object-fit: contain; }
.mayori-trajectory { display: flex; flex-direction: column; block-size: 100%; min-block-size: 0; color: var(--dsw-alias-label-primary); }
.mayori-trajectory-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 16px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-trajectory-field { display: flex; align-items: center; gap: 8px; min-inline-size: 0; max-inline-size: 100%; }
.mayori-trajectory-field > span:first-child { flex: none; }
.mayori-trajectory-controls > button { max-inline-size: 100%; min-block-size: 40px; padding: 6px 10px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; color: inherit; background: var(--dsw-alias-bg-l1); font: inherit; }
.mayori-trajectory-controls > button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.mayori-trajectory-context { display: flex; flex: 1; flex-direction: column; min-block-size: 0; }
.mayori-trajectory-context > p { padding-inline: 16px; }
.mayori-trajectory-table { flex: 1; min-block-size: 0; }
.mayori-trajectory-journal { flex: 1; min-block-size: 0; }
.mayori-personas-panel { box-sizing: border-box; block-size: 100%; overflow-y: auto; padding: 24px; color: var(--dsw-alias-label-primary); }
.mayori-personas-layout { display: grid; grid-template-columns: minmax(200px, 280px) minmax(0, 640px); gap: 32px; }
.mayori-presets-panel { block-size: 100%; overflow-y: auto; container-type: inline-size; color: var(--dsw-alias-label-primary, CanvasText); background: var(--dsw-alias-bg-l1, Canvas); font-size: 14px; }
.mayori-presets-content { box-sizing: border-box; display: flex; flex-direction: column; gap: 24px; min-block-size: 100%; max-inline-size: 1360px; margin-inline: auto; padding: 28px 32px; }
.mayori-presets-panel :is(h1, h2, p) { margin: 0; }
.mayori-presets-panel :is(button, input, textarea, summary):focus-visible { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: 3px; }
.mayori-presets-panel :is(input, textarea) { box-sizing: border-box; min-inline-size: 0; inline-size: 100%; min-block-size: 42px; border: 1px solid var(--dsw-alias-border-l2, GrayText); border-radius: 9px; padding: 10px 12px; color: inherit; background: var(--dsw-alias-bg-l1, Canvas); font: inherit; }
.mayori-presets-panel :is(input, textarea)::placeholder { color: var(--dsw-alias-label-secondary, GrayText); opacity: 1; }
.mayori-presets-panel :is(button, summary) { cursor: pointer; }
.mayori-presets-panel :disabled { opacity: 0.5; cursor: default; }
.mayori-presets-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.mayori-presets-header h1 { font-size: 26px; line-height: 1.3; font-weight: 650; }
.mayori-preset-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-block-size: 42px; flex: none; padding: 10px 14px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; background: var(--dsw-alias-bg-l1, Canvas); color: inherit; font: inherit; font-weight: 500; }
.mayori-preset-button:hover, .mayori-preset-menu :is(summary, button):hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-preset-button.mayori-preset-primary { background: var(--dsw-alias-label-primary, CanvasText); border-color: var(--dsw-alias-label-primary, CanvasText); color: var(--dsw-alias-bg-l1, Canvas); }
.mayori-preset-primary:hover { opacity: 0.86; }
.mayori-presets-usage { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 18px 20px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-l2, var(--dsw-alias-bg-layer-2, Canvas)); }
.mayori-preset-usage { display: grid; align-content: start; gap: 8px; min-inline-size: 0; }
.mayori-presets-panel label { font-weight: 500; font-size: 13px; }
.mayori-preset-usage p { font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-current-control { display: flex; gap: 8px; min-inline-size: 0; }
.mayori-presets-workspace { min-inline-size: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 14px; }
.mayori-preset-library-disclosure { border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; }
.mayori-preset-library-disclosure > summary { padding: 14px 18px; overflow-wrap: anywhere; }
.mayori-preset-library { display: flex; flex-direction: column; gap: 16px; padding: 16px; background: var(--dsw-alias-bg-l2, Canvas); border-end-start-radius: 10px; border-end-end-radius: 10px; }
.mayori-preset-search { position: relative; display: flex; align-items: center; }
.mayori-preset-search > svg { position: absolute; inset-inline-start: 12px; pointer-events: none; color: var(--dsw-alias-label-secondary); }
.mayori-preset-search input { padding-inline-start: 38px; font-weight: 400; }
.mayori-preset-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; max-block-size: 320px; overflow-y: auto; overscroll-behavior: contain; list-style: none; padding: 5px; margin: -5px; }
.mayori-preset-row { display: flex; flex-direction: column; align-items: stretch; gap: 10px; inline-size: 100%; padding: 14px 12px; border: 1px solid transparent; border-radius: 10px; color: inherit; background: transparent; font: inherit; text-align: start; }
.mayori-preset-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-preset-row[aria-pressed=true] { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-l1, Canvas); box-shadow: 0 2px 5px oklch(0 0 0 / 0.03); }
.mayori-preset-row-title { display: flex; gap: 8px; align-items: flex-start; min-inline-size: 0; }
.mayori-preset-row-title svg { flex: none; margin-block-start: 1px; color: var(--dsw-alias-label-secondary); }
.mayori-preset-row-title strong { font-size: 14px; font-weight: 600; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-preset-preview { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5; }
.mayori-preset-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.mayori-preset-tags > span { padding: 3px 6px; border-radius: 4px; background: var(--dsw-alias-interactive-bg-hover); font-size: 10px; line-height: 1.5; }
.mayori-preset-empty { padding: 8px 6px; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.mayori-preset-editor { min-inline-size: 0; display: flex; flex-direction: column; gap: 22px; padding: 24px; }
.mayori-preset-editor-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.mayori-preset-editor-heading > div { min-inline-size: 0; }
.mayori-preset-editor h2 { font-size: 19px; font-weight: 600; line-height: 1.4; overflow-wrap: anywhere; }
.mayori-preset-save-state { display: block; margin-block-start: 4px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5; }
.mayori-preset-name-field { display: grid; gap: 8px; }
.mayori-preset-editor-footer { display: grid; gap: 12px; padding-block-start: 16px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-preset-feedback { font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-feedback p:empty { display: block; block-size: 0; }
.mayori-preset-editor-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.mayori-preset-text-button { min-block-size: 40px; padding: 8px 4px; border: 0; border-radius: 6px; background: transparent; color: inherit; font: inherit; font-size: 13px; text-decoration: underline; text-underline-offset: 3px; }
.mayori-preset-menu { position: relative; flex: none; }
.mayori-preset-menu summary { display: grid; place-items: center; inline-size: 40px; block-size: 40px; border-radius: 8px; list-style: none; }
.mayori-preset-menu summary::-webkit-details-marker { display: none; }
.mayori-preset-menu > div { position: absolute; z-index: 4; inset-inline-end: 0; inset-block-start: calc(100% + 6px); inline-size: 210px; padding: 6px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; background: var(--dsw-alias-bg-l1, Canvas); box-shadow: 0 8px 24px oklch(0 0 0 / 0.12); }
.mayori-preset-menu button { display: block; inline-size: 100%; min-block-size: 40px; padding: 10px; border: 0; border-radius: 6px; background: transparent; color: inherit; text-align: start; font: inherit; }
.mayori-preset-menu .mayori-preset-delete { color: var(--dsw-alias-label-error, #b42318); }
.mayori-preset-error { font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; color: var(--dsw-alias-label-error); }
.mayori-preset-structure { position: relative; min-inline-size: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; }
.mayori-preset-structure [hidden] { display: none !important; }
.mayori-preset-structure h3 { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.5; }
.mayori-preset-structure-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 16px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-preset-structure-heading p, .mayori-preset-node-path, .mayori-preset-node-state { font-size: 12px; line-height: 1.6; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.mayori-preset-structure-heading p, .mayori-preset-structure-footer span { font-variant-numeric: tabular-nums; }
.mayori-preset-structure-layout { display: grid; grid-template-columns: minmax(260px, 0.9fr) minmax(0, 1.4fr); }
.mayori-preset-structure-tree { min-inline-size: 0; background: var(--dsw-alias-bg-l2, Canvas); border-inline-end: 1px solid var(--dsw-alias-border-l2); padding: 14px 8px; }
.mayori-preset-tree-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 0 8px 12px; }
.mayori-preset-tree-toolbar h3 { flex-basis: 100%; }
.mayori-preset-tree-scroll { max-block-size: 580px; overflow-y: auto; overscroll-behavior: contain; padding: 4px; }
.mayori-preset-tree-list { list-style: none; padding: 0; margin: 0; }
.mayori-preset-tree-children { margin-inline-start: 14px; padding-inline-start: 5px; border-inline-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-preset-tree-children[data-deep=true] { margin-inline-start: 0; padding-inline-start: 0; border-inline-start: 0; }
.mayori-preset-tree-row { position: relative; display: flex; align-items: center; gap: 2px; margin-block: 4px; border: 1px solid transparent; border-radius: 7px; }
.mayori-preset-tree-row.is-selected { background: var(--dsw-alias-interactive-bg-hover, Canvas); border-color: var(--dsw-alias-border-l2); }
.mayori-preset-tree-row.is-dragging { opacity: 0.5; }
.mayori-preset-tree-row.drop-before::before, .mayori-preset-tree-row.drop-after::after { content: ''; position: absolute; inset-inline: 0; block-size: 3px; background: var(--dsw-alias-label-primary, CanvasText); }
.mayori-preset-tree-row.drop-before::before { inset-block-start: -4px; }
.mayori-preset-tree-row.drop-after::after { inset-block-end: -4px; }
.mayori-preset-tree-row.drop-inside, .mayori-preset-root-drop.drop-inside { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: -2px; background: var(--dsw-alias-interactive-bg-hover, Canvas); }
.mayori-presets-panel .mayori-preset-drag-handle { display: grid; place-items: center; flex: none; inline-size: 28px; min-block-size: 38px; padding: 4px; border: 0; border-radius: 5px; color: var(--dsw-alias-label-secondary); background: transparent; cursor: grab; touch-action: none; }
.mayori-presets-panel .mayori-preset-drag-handle:active:not(:disabled) { cursor: grabbing; }
.mayori-preset-tree-fold { flex: none; inline-size: 22px; min-block-size: 38px; border: 0; border-radius: 5px; padding: 2px; font: inherit; background: transparent; color: inherit; }
.mayori-preset-tree-spacer { flex: none; inline-size: 22px; }
.mayori-presets-panel .mayori-preset-node-toggle { display: inline-flex; align-items: center; gap: 8px; min-block-size: 38px; }
.mayori-presets-panel .mayori-preset-node-toggle input { inline-size: 17px; min-block-size: 17px; block-size: 17px; margin: 0; padding: 0; flex: none; accent-color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-preset-tree-pick { flex: 1; min-inline-size: 0; min-block-size: 44px; padding: 8px 6px; border: 0; border-radius: 5px; text-align: start; font: inherit; color: inherit; background: transparent; overflow-wrap: anywhere; }
.mayori-preset-group-title { font-weight: 600; }
.mayori-preset-tree-pick small { display: block; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-tree-empty { padding: 10px 16px; font-size: 13px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.mayori-preset-root-drop { margin-block-start: 14px; padding: 10px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 6px; font-size: 12px; color: var(--dsw-alias-label-secondary); text-align: center; }
.mayori-preset-node-editor { display: flex; flex-direction: column; align-items: stretch; gap: 16px; min-inline-size: 0; padding: 22px; }
.mayori-preset-node-field { display: flex; flex-direction: column; gap: 8px; min-inline-size: 0; }
.mayori-presets-panel .mayori-preset-node-field textarea { min-block-size: 300px; max-inline-size: 75ch; resize: vertical; font-size: 16px; line-height: 1.6; }
.mayori-preset-group-content { display: grid; gap: 8px; }
.mayori-preset-group-content ul { padding-inline-start: 20px; margin: 0; }
.mayori-preset-node-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mayori-preset-node-actions .mayori-preset-delete { color: var(--dsw-alias-label-error, #b42318); }
.mayori-preset-structure-footer { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 12px 16px; border-block-start: 1px solid var(--dsw-alias-border-l2); font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-compiled { padding: 20px; }
.mayori-preset-compiled pre { margin: 14px 0; max-inline-size: 75ch; white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; font-size: 16px; line-height: 1.6; }
.mayori-preset-compiled summary { min-block-size: 40px; padding-block: 8px; }
.mayori-preset-compiled ol { padding-inline-start: 24px; overflow-wrap: anywhere; }
.mayori-preset-drag-ghost { position: absolute; z-index: 5; inline-size: 180px; padding: 10px 12px; border: 1px solid var(--dsw-alias-label-primary, CanvasText); border-radius: 8px; pointer-events: none; color: var(--dsw-alias-label-primary, CanvasText); background: var(--dsw-alias-bg-l1, Canvas); box-shadow: 0 6px 18px oklch(0 0 0 / 0.2); overflow-wrap: anywhere; }
.mayori-preset-move-dialog { box-sizing: border-box; inline-size: min(460px, calc(100% - 32px)); max-block-size: calc(100dvh - 32px); padding: 24px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-l1, Canvas); color: var(--dsw-alias-label-primary, CanvasText); overflow-y: auto; overscroll-behavior: contain; }
.mayori-preset-move-dialog::backdrop { background: oklch(0 0 0 / 0.4); }
.mayori-preset-move-dialog > * + * { margin-block-start: 16px; }
@media (hover: hover) { .mayori-preset-tree-pick:hover, .mayori-preset-tree-fold:hover, .mayori-presets-panel .mayori-preset-drag-handle:hover { background: var(--dsw-alias-interactive-bg-hover); } }
@media (pointer: coarse) { .mayori-presets-panel :is(.mayori-preset-drag-handle, .mayori-preset-tree-fold) { min-block-size: 44px; } }
@container (max-width: 900px) {
  .mayori-presets-content { padding: 24px; }
  .mayori-preset-structure-layout { grid-template-columns: minmax(240px, 0.9fr) minmax(0, 1.2fr); }
  .mayori-preset-current-control { flex-wrap: wrap; }
}
@container (max-width: 680px) {
  .mayori-presets-content { block-size: auto; min-block-size: 100%; padding: 20px 16px; gap: 20px; }
  .mayori-presets-header { flex-wrap: wrap; gap: 12px; }
  .mayori-presets-header h1 { font-size: 24px; }
  .mayori-presets-usage { grid-template-columns: minmax(0, 1fr); gap: 18px; padding: 16px; }
  .mayori-preset-structure-layout { grid-template-columns: minmax(0, 1fr); }
  .mayori-preset-structure-tree { border-inline-end: 0; border-block-end: 1px solid var(--dsw-alias-border-l2); }
  .mayori-preset-node-editor { padding: 16px 12px; }
  .mayori-preset-tree-scroll { max-block-size: 380px; }
  .mayori-preset-tree-children { margin-inline-start: 5px; padding-inline-start: 2px; }
  .mayori-preset-editor { padding: 20px 16px; gap: 20px; }
  .mayori-preset-editor-footer { position: sticky; inset-block-end: 0; z-index: 2; background: var(--dsw-alias-bg-l1, Canvas); padding-block-end: max(8px, env(safe-area-inset-bottom)); }
  .mayori-presets-panel :is(input, textarea) { font-size: 16px; }
  .mayori-presets-panel .mayori-select-trigger { min-block-size: 44px; }
  .mayori-preset-editor-actions > button { flex: 1 1 auto; min-block-size: 44px; }
}
.mayori-persona-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.mayori-persona-row { display: flex; align-items: center; gap: 12px; inline-size: 100%; padding: 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: transparent; color: inherit; text-align: start; font: inherit; cursor: pointer; }
.mayori-persona-row[aria-pressed=true] { border-color: currentColor; background: var(--dsw-alias-interactive-bg-hover); }
.mayori-persona-row img, .mayori-persona-avatar { inline-size: 48px; block-size: 48px; border-radius: 50%; object-fit: cover; flex: none; }
.mayori-persona-avatar { display: grid; place-items: center; background: var(--dsw-alias-bg-l2); }
.mayori-persona-row span { min-inline-size: 0; overflow-wrap: anywhere; }
.mayori-persona-row small { display: block; margin-block-start: 4px; }
.mayori-persona-form { display: grid; gap: 12px; align-content: start; }
.mayori-persona-form h3, .mayori-persona-form p { margin: 0; }
.mayori-persona-form label { display: grid; gap: 6px; }
.mayori-persona-form input, .mayori-persona-form textarea { box-sizing: border-box; inline-size: 100%; min-inline-size: 0; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; font: inherit; font-size: 16px; background: var(--dsw-alias-bg-l1); color: inherit; }
.mayori-persona-form textarea { resize: vertical; }
.mayori-persona-hint, .mayori-persona-row small { color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.5; }
.mayori-persona-image { inline-size: 96px; block-size: 96px; object-fit: cover; border-radius: 16px; }
.mayori-persona-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block-start: 8px; }
.mayori-personas-panel button { min-block-size: 44px; }
.mayori-personas-panel :is(button, input, textarea):focus-visible, .mayori-greeting-swipes button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.mayori-greeting-swipes { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-block-start: 8px; font-variant-numeric: tabular-nums; }
.mayori-greeting-swipes button { inline-size: 44px; block-size: 44px; border: 0; border-radius: 8px; font-size: 24px; color: inherit; background: transparent; cursor: pointer; }
.mayori-greeting-swipes button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-greeting-swipes button:disabled { opacity: 0.5; cursor: wait; }
@media (max-width: 700px) { .mayori-personas-layout { grid-template-columns: minmax(0, 1fr); gap: 24px; } .mayori-personas-panel { padding: 16px; } }
 .mayori-gallery-panel {
  block-size: 100%; min-block-size: 0; overflow: hidden;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill));
  color: var(--dsw-alias-label-primary);
}
.mayori-gallery-panel button:focus-visible, .mayori-history-panel button:focus-visible,
.mayori-gallery-panel input:focus-visible, .mayori-history-panel input:focus-visible,
.mayori-character-dialog button:focus-visible {
  outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px;
}
.mayori-history-panel { box-sizing: border-box; block-size: 100%; overflow-y: auto; padding: 24px; color: var(--dsw-alias-label-primary); }
.mayori-history-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; }
.mayori-history-panel .mayori-search input { padding-inline-start: 12px; }
.mayori-history-list { padding: 0; margin: 20px 0; list-style: none; }
.mayori-history-item { display: flex; align-items: center; gap: 8px; }
.mayori-history-item > .mayori-history-row { flex: 1; min-inline-size: 0; }
.mayori-history-item > .mayori-secondary-button { flex: none; }
.mayori-history-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.mayori-history-controls label { display: flex; align-items: center; gap: 8px; }
.mayori-history-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; inline-size: 100%; padding: 16px 12px; border: 0; border-block-end: 1px solid var(--dsw-alias-border-l2); background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.mayori-history-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-history-row > span { min-inline-size: 0; overflow-wrap: anywhere; }
.mayori-history-row small { display: block; margin-block-start: 4px; }
.mayori-history-row time, .mayori-history-row small { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.mayori-gallery-shell { display: grid; grid-template-rows: 72px minmax(0, 1fr); block-size: 100%; }
.mayori-gallery-header {
  position: relative; z-index: 4; display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 12px 20px 12px 24px; border-block-end: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill));
}
.mayori-gallery-header h2, .mayori-gallery-header p, .mayori-card h3, .mayori-card p,
.mayori-empty h3, .mayori-empty p, .mayori-character-header h2, .mayori-character-header p { margin: 0; }
.mayori-gallery-title { min-inline-size: 0; }
.mayori-gallery-title h2 { font-size: 24px; line-height: 1.15; letter-spacing: -0.02em; }
.mayori-gallery-title p { margin-block-start: 3px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.mayori-gallery-header-actions { display: flex; align-items: center; gap: 8px; }
.mayori-icon-action {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  inline-size: 40px; block-size: 40px; padding: 0; border: 0; border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.mayori-icon-action:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.mayori-filter-toggle {
  display: none; align-items: center; justify-content: center; gap: 8px; min-block-size: 40px;
  padding: 0 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-primary); font: inherit; cursor: pointer;
}
.mayori-gallery-workspace { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 260px; min-block-size: 0; }
.mayori-filter-panel {
  display: flex; min-block-size: 0; flex-direction: column; gap: 24px; padding: 24px 20px;
  grid-column: 2; grid-row: 1; border-inline-start: 1px solid var(--dsw-alias-border-l2); overflow-y: auto; overscroll-behavior: contain;
  background: var(--dsw-alias-bg-l2, var(--dsw-specific-sidebar-fill));
}
.mayori-filter-panel-header { display: none; align-items: center; justify-content: space-between; gap: 16px; }
.mayori-filter-panel-header h3 { margin: 0; font-size: 18px; }
.mayori-import-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-block-size: 42px;
  padding: 9px 16px; border-radius: 12px; background: var(--dsw-alias-label-primary);
  color: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); font-size: 14px;
  font-weight: 600; cursor: pointer;
}
.mayori-import-button[aria-disabled="true"] { opacity: 0.58; cursor: progress; }
.mayori-import-compact { display: none; min-block-size: 40px; padding: 8px 12px; border-radius: 10px; }
.mayori-import-button input {
  position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap;
}
.mayori-filter-fields { display: grid; gap: 24px; }
.mayori-search, .mayori-filter-control { display: grid; gap: 7px; color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 600; }
.mayori-search-control { position: relative; display: flex; align-items: center; }
.mayori-search-control > svg { position: absolute; inset-inline-start: 12px; inline-size: 18px; block-size: 18px; pointer-events: none; }
.mayori-search input {
  inline-size: 100%; min-block-size: 42px; box-sizing: border-box; padding: 9px 12px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 16px;
}
.mayori-search input { padding-inline-start: 38px; }
.mayori-filter-group { display: grid; gap: 10px; margin: 0; padding: 0; border: 0; }
.mayori-filter-group legend { margin-block-end: 8px; color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 600; }
.mayori-filter-group label {
  display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; align-items: center; gap: 8px;
  min-block-size: 32px; color: var(--dsw-alias-label-primary); cursor: pointer;
}
.mayori-filter-group input { inline-size: 16px; block-size: 16px; margin: 0; accent-color: currentColor; }
.mayori-tag-filter > div { display: grid; max-block-size: 220px; overflow-y: auto; overscroll-behavior: contain; }
.mayori-tag-filter small { color: var(--dsw-alias-label-secondary); font-size: 11px; font-variant-numeric: tabular-nums; }
.mayori-reset-button {
  min-block-size: 40px; padding: 8px 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; cursor: pointer;
}
.mayori-reset-button:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.mayori-gallery-main { grid-column: 1; grid-row: 1; min-inline-size: 0; min-block-size: 0; padding: 20px 24px 32px; overflow-y: auto; overscroll-behavior: contain; container-type: inline-size; }
.mayori-gallery-results { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-block-size: 30px; }
.mayori-gallery-results p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-gallery-notice { min-block-size: 28px; padding-block: 2px 10px; font-size: 13px; }
.mayori-gallery-notice p { margin: 0; }
.mayori-error, .mayori-card-warning { color: var(--dsw-alias-label-error, #b42318); }
.mayori-success { color: var(--dsw-alias-label-success, #16794b); }
.mayori-card-grid {
  display: grid; grid-template-columns: repeat(var(--mayori-columns, 5), minmax(0, 1fr));
  align-items: stretch; gap: 18px; margin: 0; padding: 0; list-style: none;
}
.mayori-card article {
  display: grid; grid-template-rows: auto minmax(0, 1fr); block-size: 100%; overflow: hidden; container-type: inline-size;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 16px;
  background: var(--dsw-alias-bg-l2, var(--dsw-specific-sidebar-fill));
}
.mayori-card-media {
  position: relative; display: grid; place-items: center; aspect-ratio: 4 / 5;
  overflow: hidden; background: var(--dsw-alias-interactive-bg-hover);
}
.mayori-card-media img {
  inline-size: 100%; block-size: 100%; object-fit: cover;
  outline: 1px solid oklch(0 0 0 / 0.1); outline-offset: -1px;
}
body[data-ds-dark-theme] .mayori-card-media img { outline-color: oklch(1 0 0 / 0.1); }
.mayori-card-fallback {
  display: grid; place-items: center; inline-size: 72px; block-size: 72px; border-radius: 50%;
  background: var(--dsw-alias-button-elevated-fill); font-size: 32px; font-weight: 600;
}
.mayori-card-body { display: flex; flex-direction: column; gap: 12px; padding: 14px; }
.mayori-card-heading { min-inline-size: 0; }
.mayori-card-heading h3 { overflow-wrap: anywhere; font-size: 17px; line-height: 1.3; }
.mayori-card-heading p { margin-block-start: 4px; overflow: hidden; color: var(--dsw-alias-label-secondary); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.mayori-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.mayori-tags li {
  max-inline-size: 100%; overflow: hidden; padding: 4px 8px; border-radius: 999px;
  background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary);
  font-size: 11px; text-overflow: ellipsis; white-space: nowrap;
}
.mayori-card-actions { display: grid; grid-template-columns: 1fr 1fr; margin-block-start: auto; gap: 8px; }
.mayori-greeting-preview { min-inline-size: 0; font-size: 13px; }
.mayori-greeting-preview summary { cursor: pointer; }
.mayori-greeting-preview p { max-block-size: 180px; overflow-y: auto; white-space: pre-wrap; overflow-wrap: anywhere; margin-block-start: 8px; }
.mayori-card-actions button, .mayori-persona-actions button, .mayori-secondary-button, .mayori-danger-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-block-size: 40px;
  padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
}
.mayori-card-actions button > svg, .mayori-danger-button > svg { inline-size: 17px; block-size: 17px; }
.mayori-card-play { background: var(--dsw-alias-label-primary) !important; color: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)) !important; border-color: transparent !important; }
.mayori-card-play:disabled { opacity: 0.62; cursor: progress; }
.mayori-card-edit:hover, .mayori-secondary-button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-empty {
  display: grid; place-items: center; align-content: center; min-block-size: 280px;
  padding: 32px; text-align: center; color: var(--dsw-alias-label-secondary);
}
.mayori-empty h3 { margin-block-start: 14px; color: var(--dsw-alias-label-primary); }
.mayori-empty p { margin-block-start: 6px; max-inline-size: 40ch; line-height: 1.5; }
.mayori-empty-icon {
  display: grid; place-items: center; inline-size: 52px; block-size: 52px;
  border-radius: 16px; background: var(--dsw-alias-interactive-bg-hover);
}
.mayori-character-dialog {
  inline-size: min(920px, calc(100vw - 32px)); max-inline-size: none;
  block-size: min(760px, calc(100dvh - 32px)); max-block-size: none;
  margin: auto; padding: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 18px;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); color: var(--dsw-alias-label-primary);
  overflow: hidden; box-shadow: 0 24px 64px oklch(0 0 0 / 0.28), 0 2px 8px oklch(0 0 0 / 0.14);
}
.mayori-character-dialog::backdrop { background: oklch(0 0 0 / 0.56); }
.mayori-character-shell { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; block-size: 100%; }
.mayori-character-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 20px 20px 16px 24px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-character-header h2 { overflow-wrap: anywhere; font-size: 24px; line-height: 1.2; }
.mayori-character-header p { margin-block-start: 5px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-character-content { display: grid; grid-template-columns: minmax(220px, 34%) minmax(0, 1fr); min-block-size: 0; overflow: hidden; }
.mayori-character-portrait { display: grid; place-items: center; min-block-size: 0; overflow: hidden; background: var(--dsw-alias-interactive-bg-hover); }
.mayori-character-portrait img { inline-size: 100%; block-size: 100%; object-fit: cover; outline: 1px solid oklch(0 0 0 / 0.1); outline-offset: -1px; }
body[data-ds-dark-theme] .mayori-character-portrait img { outline-color: oklch(1 0 0 / 0.1); }
.mayori-character-details { min-inline-size: 0; padding: 24px; overflow-y: auto; overscroll-behavior: contain; }
.mayori-character-details > .mayori-tags { margin-block-end: 24px; }
.mayori-card-warning { margin: 0 0 20px; font-size: 12px; line-height: 1.5; }
.mayori-character-details dl { display: grid; gap: 24px; margin: 0; }
.mayori-character-details dl > div { display: grid; gap: 7px; }
.mayori-character-details dt { color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 600; }
.mayori-character-details dd { margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; line-height: 1.55; }
.mayori-character-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-block-start: 32px !important; padding-block-start: 20px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-character-meta dd { color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-character-empty { color: var(--dsw-alias-label-secondary); }
.mayori-character-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 20px 14px 24px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-danger-button { border-color: color-mix(in oklch, currentColor 28%, transparent); color: var(--dsw-alias-label-error, #b42318); }
.mayori-danger-button:hover { background: color-mix(in oklch, currentColor 10%, transparent); }
.mayori-filter-scrim { display: none; }
@media (max-width: 900px) {
  .mayori-gallery-workspace { grid-template-columns: minmax(0, 1fr); }
  .mayori-filter-toggle { display: inline-flex; }
  .mayori-import-compact { display: inline-flex; }
  .mayori-filter-panel {
    position: absolute; z-index: 6; inset-block: 0; inset-inline-end: 0; inline-size: min(320px, calc(100vw - 48px));
    box-sizing: border-box; border-inline-start: 1px solid var(--dsw-alias-border-l2);
    box-shadow: -16px 0 40px oklch(0 0 0 / 0.2); transform: translateX(105%); visibility: hidden;
  }
  .mayori-filter-panel.is-open { transform: translateX(0); visibility: visible; }
  .mayori-filter-panel-header { display: flex; }
  .mayori-filter-scrim { position: absolute; z-index: 5; inset: 0; display: block; border: 0; background: oklch(0 0 0 / 0.42); }
  .mayori-character-content { grid-template-columns: minmax(180px, 32%) minmax(0, 1fr); }
}
@media (max-width: 620px) {
  .mayori-gallery-shell { grid-template-rows: 64px minmax(0, 1fr); }
  .mayori-gallery-header { padding-inline: 16px 12px; }
  .mayori-gallery-title h2 { font-size: 20px; }
  .mayori-gallery-title p { display: none; }
  .mayori-filter-toggle span, .mayori-import-compact span { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }
  .mayori-filter-toggle, .mayori-import-compact { inline-size: 40px; padding: 0; }
  .mayori-gallery-main { padding: 16px 16px 28px; }
  .mayori-card-grid { gap: 12px; }
  .mayori-character-dialog { inset: 0; inline-size: 100vw; block-size: 100dvh; margin: 0; border: 0; border-radius: 0; }
  .mayori-character-content { display: block; overflow-y: auto; }
  .mayori-character-portrait { aspect-ratio: 16 / 10; }
  .mayori-character-details { overflow: visible; }
  .mayori-character-meta { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: no-preference) {
  .mayori-icon-action:active, .mayori-import-button:active, .mayori-card-actions button:active,
  .mayori-secondary-button:active, .mayori-danger-button:active { transform: scale(0.96); }
  .mayori-filter-panel { transition-property: transform, visibility; transition-duration: 160ms; transition-timing-function: ease-out; }
}
.mayori-home-panel { box-sizing: border-box; block-size: 100%; min-block-size: 0; overflow-y: auto; padding: 40px 32px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-1, Canvas); }
.mayori-home-content { max-inline-size: 1480px; margin-inline: auto; container-type: inline-size; }
.mayori-home-welcome { margin-block-end: 40px; }
.mayori-home-mark { display: grid; place-items: center; inline-size: 48px; block-size: 48px; margin-block-end: 16px; border-radius: 16px; background: var(--dsw-alias-interactive-bg-hover); }
.mayori-home-welcome h1 { margin: 0; font-size: clamp(26px, 3vw, 36px); line-height: 1.2; text-wrap: balance; }
.mayori-home-welcome p, .mayori-home-empty { color: var(--dsw-alias-label-secondary); line-height: 1.6; }
.mayori-home-section + .mayori-home-section { margin-block-start: 40px; }
.mayori-home-section h2 { margin: 0 0 16px; font-size: 20px; }
.mayori-home-section > .mayori-secondary-button { margin-block-start: 16px; }
.mayori-home-section .mayori-history-list { margin-block: 0; }
.mayori-home-panel :is(button, input):focus-visible, .mayori-history-panel input:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.mayori-history-row { display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; }
.mayori-history-row .mayori-history-avatar { display: grid; place-items: center; inline-size: 52px; block-size: 52px; overflow: hidden; border-radius: 14px; background: var(--dsw-alias-interactive-bg-hover); font-size: 22px; }
.mayori-history-avatar img { inline-size: 100%; block-size: 100%; object-fit: cover; }
.mayori-history-text { display: grid; gap: 4px; }
.mayori-history-text strong { font-weight: 600; }
.mayori-history-preview { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-history-row time { white-space: nowrap; }
.mayori-history-row:disabled, .mayori-secondary-button:disabled { opacity: 0.55; cursor: default; }
.mayori-column-control { display: flex; align-items: center; gap: 8px; }
.mayori-column-control .mayori-select { inline-size: 68px; }
.mayori-pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-block-start: 24px; font-size: 13px; font-variant-numeric: tabular-nums; }
.mayori-pagination .mayori-filter-control { display: flex; align-items: center; gap: 8px; }
.mayori-pagination .mayori-select { inline-size: auto; min-inline-size: 68px; }
.mayori-page-actions { display: flex; align-items: center; gap: 8px; }
.mayori-page-actions input { box-sizing: border-box; inline-size: 64px; min-block-size: 42px; padding: 8px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; font: inherit; font-size: 16px; background: var(--dsw-alias-bg-layer-1, Canvas); color: inherit; }
.mayori-page-actions button { min-inline-size: 40px; font-size: 20px; }
.mayori-character-opening { display: grid; gap: 12px; margin-block-end: 24px; }
.mayori-character-footer, .mayori-character-footer-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.mayori-character-footer-actions { margin-inline-start: auto; }
@container (max-width: 1000px) { .mayori-card-grid { grid-template-columns: repeat(min(var(--mayori-columns, 5), 5), minmax(0, 1fr)); } }
@container (max-width: 650px) { .mayori-card-grid { grid-template-columns: repeat(min(var(--mayori-columns, 5), 3), minmax(0, 1fr)); } }
@container (max-width: 540px) { .mayori-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .mayori-card-actions { grid-template-columns: 1fr; } }
@container (max-width: 340px) { .mayori-card-grid { grid-template-columns: minmax(0, 1fr); } }
@container (max-width: 240px) { .mayori-card-actions { grid-template-columns: 1fr; } }
@media (max-width: 700px) {
  .mayori-home-panel { padding: 24px 16px; }
  .mayori-history-panel { padding: 16px; }
  .mayori-history-item { flex-wrap: wrap; gap: 4px; margin-block-end: 12px; }
  .mayori-history-item > .mayori-history-row { flex-basis: 100%; }
  .mayori-history-item > .mayori-secondary-button { margin-inline-start: 64px; }
  .mayori-history-row { grid-template-columns: 44px minmax(0, 1fr); gap: 12px; padding-inline: 0; }
  .mayori-history-row .mayori-history-avatar { inline-size: 44px; block-size: 44px; }
  .mayori-history-row time { grid-column: 2; white-space: normal; }
  .mayori-column-control { flex-wrap: wrap; }
}
`;
		//#endregion
		//#region src/features/plugins/client/settings.js
		var PluginSettingsClient = class {
			async read() {
				return this.#call("POST");
			}
			async update(plugins, revision, compaction) {
				return this.#call("PUT", {
					plugins,
					revision,
					compaction
				});
			}
			async #call(method, body = {}) {
				const response = await fetch("/mayori/plugins", {
					method,
					headers: { "content-type": "application/json" },
					body: JSON.stringify(body)
				});
				const result = await response.json();
				if (!response.ok || !result.ok) throw new Error(result.error ?? `HTTP ${response.status}`);
				return result.value;
			}
		};
		//#endregion
		//#region src/features/compaction/shared/settings.js
		const DEFAULT_COMPACTION_INSTRUCTIONS = `Составь краткое изложение предыдущей части ролевой игры, чтобы ведущий мог продолжить её без потери важных фактов.

Сохрани язык игры. Используй следующие разделы:
- Текущая сцена: место, время, участники и последнее незавершённое действие.
- Персонажи и отношения: установленные сведения, намерения, обещания и изменения отношений.
- События и решения игрока: важные поступки, их подтверждённые последствия и точные условия договорённостей.
- Открытые сюжетные линии: квесты, загадки, обязательства и нерешённые вопросы.
- Точные данные: известные характеристики, предметы, ресурсы и уже выполненные броски с их результатами и идентификаторами.
- Предпочтения игрока: ограничения, стиль и явные указания.

Отделяй установленные факты от предположений. Не придумывай события, решения игрока, случайные исходы или неизвестные значения. Не продолжай сцену и не вызывай инструменты: верни только текст изложения.
Если в истории уже есть <compacted-summary>, объедини его с новыми событиями, сохраняя актуальные факты и явно произошедшие изменения. Не копируй старое изложение целиком.`;
		const DEFAULT_COMPACTION = Object.freeze({
			thresholdPercent: 80,
			retainPercent: 16,
			maxSummaryTokens: 4096,
			headroomTokens: 8192,
			instructions: DEFAULT_COMPACTION_INSTRUCTIONS
		});
		/** Validate persisted and submitted settings before they reach the native engine. */
		function validateCompaction(value) {
			if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some((key) => !Object.hasOwn(DEFAULT_COMPACTION, key))) throw new TypeError("Неизвестная настройка сжатия истории.");
			const settings = {
				...DEFAULT_COMPACTION,
				...value
			};
			for (const [key, title, min, max] of [
				[
					"thresholdPercent",
					"Порог заполнения контекста",
					1,
					99
				],
				[
					"retainPercent",
					"Доля последних сообщений",
					0,
					98
				],
				[
					"maxSummaryTokens",
					"Лимит ответа для изложения",
					1,
					65536
				],
				[
					"headroomTokens",
					"Дополнительный запас контекста",
					0,
					65536
				]
			]) if (!Number.isSafeInteger(settings[key]) || settings[key] < min || settings[key] > max) throw Object.assign(/* @__PURE__ */ new TypeError(`${title}: укажите целое число от ${min} до ${max}.`), { field: key });
			if (settings.retainPercent >= settings.thresholdPercent) throw Object.assign(/* @__PURE__ */ new TypeError("Доля последних сообщений должна быть меньше порога сжатия."), { field: "retainPercent" });
			if (typeof settings.instructions !== "string" || !settings.instructions.trim() || settings.instructions.length > 32768) throw Object.assign(/* @__PURE__ */ new TypeError("Инструкция сжатия должна содержать от 1 до 32768 символов."), { field: "instructions" });
			return Object.freeze(settings);
		}
		//#endregion
		//#region src/features/compaction/client/panel.jsx
		function CompactionSettings({ settings, busy, onSave }) {
			const [draft, setDraft] = (0, react.useState)(settings);
			const [error, setError] = (0, react.useState)("");
			const [invalid, setInvalid] = (0, react.useState)("");
			const form = (0, react.useRef)(null);
			const confirmed = (0, react.useRef)(JSON.stringify(settings));
			(0, react.useEffect)(() => {
				const next = JSON.stringify(settings);
				if (next !== confirmed.current) {
					confirmed.current = next;
					setDraft(settings);
					setError("");
					setInvalid("");
				}
			}, [settings]);
			const change = (key, value) => {
				setDraft((current) => ({
					...current,
					[key]: value
				}));
				setError("");
				setInvalid("");
			};
			const submit = (event) => {
				event.preventDefault();
				try {
					onSave(validateCompaction(Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, key === "instructions" ? value : Number(value)]))));
				} catch (failure) {
					const field = failure.field ?? "instructions";
					setError(failure.message);
					setInvalid(field);
					form.current?.querySelector(`#mayori-compaction-${field}`)?.focus();
				}
			};
			const normalized = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, key === "instructions" ? value : Number(value)]));
			const dirty = JSON.stringify(normalized) !== JSON.stringify(settings);
			const number = (key, label, min, max, help) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-compaction-field",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						htmlFor: `mayori-compaction-${key}`,
						children: label
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						id: `mayori-compaction-${key}`,
						type: "number",
						min,
						max,
						step: "1",
						required: true,
						value: draft[key],
						"aria-invalid": invalid === key || void 0,
						"aria-describedby": `mayori-compaction-${key}-help${invalid === key ? " mayori-compaction-error" : ""}`,
						onChange: (event) => change(key, event.target.value)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						id: `mayori-compaction-${key}-help`,
						children: help
					})
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("form", {
				ref: form,
				className: "mayori-compaction-form",
				onSubmit: submit,
				"aria-labelledby": "mayori-compaction-title",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
					disabled: busy,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", {
							id: "mayori-compaction-title",
							children: "Настройки сжатия"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-compaction-numbers",
							children: [number("thresholdPercent", "Порог заполнения контекста, %", 1, 99, "Сжатие начинается у этого порога или раньше, если нужен запас для ответа."), number("retainPercent", "Оставлять последние сообщения, %", 0, 98, "Доля доступного контекста, которую сохраняем дословно. Должна быть меньше порога сжатия.")]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-compaction-field",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									htmlFor: "mayori-compaction-instructions",
									children: "Инструкция сжатия"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									id: "mayori-compaction-instructions-help",
									children: "Укажите, что сохранять в изложении: обещания, отношения, незавершённые задачи, предметы и ограничения персонажей."
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									id: "mayori-compaction-instructions",
									rows: "12",
									maxLength: 32768,
									required: true,
									value: draft.instructions,
									"aria-invalid": invalid === "instructions" || void 0,
									"aria-describedby": `mayori-compaction-instructions-help${invalid === "instructions" ? " mayori-compaction-error" : ""}`,
									onChange: (event) => change("instructions", event.target.value)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => change("instructions", DEFAULT_COMPACTION_INSTRUCTIONS),
									children: "Вернуть игровую инструкцию"
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "Лимиты в токенах" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-compaction-numbers",
							children: [number("maxSummaryTokens", "Лимит ответа для изложения", 1, 65536, "Включает размышления, если модель учитывает их в лимите ответа. Незавершённое изложение не заменяет историю."), number("headroomTokens", "Дополнительный запас контекста", 0, 65536, "Резерв сверх места для обычного ответа. Для моделей с небольшим окном уменьшите это значение.")]
						})] }),
						error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							id: "mayori-compaction-error",
							role: "alert",
							children: error
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-compaction-actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: !dirty,
								children: "Сохранить настройки сжатия"
							}), dirty && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Есть несохранённые изменения." })]
						})
					]
				})
			});
		}
		//#endregion
		//#region src/features/plugins/client/panel.jsx
		const entries = [{
			id: "dice",
			title: "Кости и проверки",
			description: "Даёт ведущему реальные случайные броски для исходов, где есть риск: попадание в цель, проверка навыка, урон. В чате видны выпавшие грани и итог расчёта.",
			settings: [
				[
					"dice",
					"Свободные броски",
					"Броски по формулам вроде 2d6+3, с поддержкой пулов, перебросов и взрывающихся костей."
				],
				[
					"rules",
					"Проверки по правилам",
					"Определяет успех или провал, критический исход, урон и последствия по настроенному профилю правил."
				],
				[
					"rollHistory",
					"Разбор прошлых бросков",
					"Ведущий может объяснить, какие грани, перебросы и модификаторы дали итог сохранённого броска."
				]
			]
		}, {
			id: "compaction",
			title: "Сжатие истории",
			description: "Освобождает место в контексте модели, чтобы продолжать длинный чат. Старые сцены заменяются кратким изложением, последние реплики остаются целиком. Мелкие детали старых сцен могут не попасть в изложение.",
			settings: [[
				"compaction",
				"Сжимать историю",
				""
			]]
		}];
		function MayoriSettings({ preferences }) {
			const [value, setValue] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)("");
			const [notice, setNotice] = (0, react.useState)("");
			const [query, setQuery] = (0, react.useState)("");
			const search = query.trim().toLocaleLowerCase("ru");
			const matches = ({ id, title, description, settings }) => [
				id,
				title,
				description,
				...settings.flat()
			].join(" ").toLocaleLowerCase("ru").includes(search);
			const count = entries.filter(matches).length;
			const mounted = (0, react.useRef)(false);
			const saving = (0, react.useRef)(false);
			const read = async () => {
				try {
					const next = await preferences.read();
					if (mounted.current && !saving.current) {
						setValue(next);
						setError(next.error ?? "");
					}
				} catch (failure) {
					if (mounted.current) setError(failure.message);
				}
			};
			(0, react.useEffect)(() => {
				mounted.current = true;
				read();
				return () => {
					mounted.current = false;
				};
			}, [preferences]);
			(0, react.useEffect)(() => {
				if (!value?.pending) return;
				const timer = setInterval(() => {
					read();
				}, 1e3);
				return () => clearInterval(timer);
			}, [value?.pending, preferences]);
			const save = async (plugins, compaction = value?.compaction) => {
				if (saving.current || !value) return;
				saving.current = true;
				setBusy(true);
				setError("");
				setNotice("");
				try {
					const next = await preferences.update(plugins, value.revision, compaction);
					if (mounted.current) {
						setValue(next);
						setNotice("Настройки сохранены.");
					}
				} catch (failure) {
					if (mounted.current) setError(failure.message || "Не удалось сохранить настройки. Попробуйте ещё раз.");
				} finally {
					saving.current = false;
					if (mounted.current) setBusy(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-settings",
				"aria-labelledby": "mayori-settings-title",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						id: "mayori-settings-title",
						children: "Плагины"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "mayori-plugin-search",
						children: ["Поиск по плагинам", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "search",
							value: query,
							placeholder: "Название или описание",
							onChange: (event) => setQuery(event.target.value)
						})]
					}),
					!value && !error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: "Загрузка настроек…"
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						role: "alert",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: error }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							onClick: () => {
								setError("");
								read();
							},
							children: "Обновить настройки"
						})]
					}),
					value && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-plugin-list",
						"aria-busy": busy,
						children: [entries.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
							className: "mayori-plugin",
							hidden: !matches(entry),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-plugin-title",
								children: entry.title
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-plugin-state",
								children: entry.settings.some(([key]) => value.plugins[key]) ? "Включён" : "Выключен"
							})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-plugin-body",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-plugin-description",
										id: `mayori-plugin-${entry.id}-help`,
										children: entry.description
									}),
									entry.settings.map(([key, title, description]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: "mayori-plugin-row",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-plugin-setting-title",
											children: title
										}), description && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-plugin-setting-description",
											id: `mayori-setting-${key}-help`,
											children: description
										})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "checkbox",
											role: "switch",
											"aria-label": title,
											"aria-describedby": description ? `mayori-setting-${key}-help` : `mayori-plugin-${entry.id}-help`,
											checked: value.plugins[key],
											disabled: busy,
											onChange: (event) => {
												save({
													...value.plugins,
													[key]: event.target.checked
												});
											}
										})]
									}, key)),
									entry.id === "compaction" && value.compaction && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CompactionSettings, {
										settings: value.compaction,
										busy,
										onSave: (options) => save(value.plugins, options)
									})
								]
							})]
						}, entry.id)), count === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "status",
							children: "Плагины не найдены. Попробуйте другое название или описание."
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						"aria-live": "polite",
						children: value?.pending ? "Настройки сохранены. Они применятся после завершения текущего ответа." : notice
					})
				]
			});
		}
		const PLUGIN_SETTINGS_STYLE = `
.mayori-settings { color: inherit; }
.mayori-settings h2 { margin: 0 0 12px; font-size: 1.25rem; }
.mayori-settings p { line-height: 1.5; overflow-wrap: anywhere; }
.mayori-plugin-search { display: block; margin-block: 24px; font-size: 14px; }
.mayori-plugin-search input { display: block; box-sizing: border-box; inline-size: 100%; min-inline-size: 0; min-block-size: 42px; margin-block-start: 8px; padding: 10px 12px; font: inherit; font-size: 16px; color: inherit; background: var(--dsw-alias-bg-layer-1, Canvas); border: 1px solid var(--dsw-alias-border-l2, GrayText); border-radius: 8px; }
.mayori-plugin-list { margin: 24px 0; }
.mayori-plugin { border-block-end: 1px solid var(--dsw-alias-border-l2, color-mix(in srgb, currentColor 15%, transparent)); }
.mayori-plugin > summary { padding-block: 16px; cursor: pointer; overflow-wrap: anywhere; }
.mayori-plugin-title { font-weight: 600; margin-inline-start: 6px; }
.mayori-plugin-state { display: block; margin-block-start: 4px; margin-inline-start: 22px; font-size: .85rem; color: var(--dsw-alias-label-secondary, GrayText); }
.mayori-plugin-body { padding-block-end: 16px; }
.mayori-plugin-description { margin-block-start: 0; }
.mayori-plugin-row { display: flex; align-items: center; gap: 20px; padding: 12px 0; cursor: pointer; }
.mayori-plugin-row > span { flex: 1; min-width: 0; }
.mayori-plugin-setting-title { display: block; font-weight: 500; }
.mayori-plugin-setting-description { display: block; margin-block-start: 4px; }
.mayori-plugin-description, .mayori-plugin-setting-description { max-inline-size: 75ch; color: var(--dsw-alias-label-secondary, GrayText); line-height: 1.5; font-size: .9rem; }
.mayori-plugin-row input { appearance: none; color: inherit; width: 44px; height: 26px; flex: 0 0 44px; border: 1px solid color-mix(in srgb, currentColor 45%, transparent); border-radius: 999px; background: color-mix(in srgb, currentColor 12%, transparent); position: relative; cursor: pointer; margin: 0; }
.mayori-plugin-row input::before { content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; top: 3px; left: 3px; background: currentColor; }
.mayori-plugin-row input:checked { background: var(--mayori-accent, #497568); border-color: var(--mayori-accent, #497568); color: white; }
.mayori-plugin-row input:checked::before { left: 21px; }
.mayori-plugin-row input:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }
.mayori-plugin-row input:disabled { opacity: .5; cursor: wait; }
.mayori-compaction-form { margin-block: 24px; }
.mayori-compaction-form fieldset { margin: 0; padding: 0; border: 0; min-inline-size: 0; }
.mayori-compaction-form legend { font-weight: 600; font-size: 1.05rem; }
.mayori-compaction-numbers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.mayori-compaction-field { margin-block: 16px; min-inline-size: 0; }
.mayori-compaction-field label { display: block; margin-block-end: 8px; font-weight: 600; }
.mayori-compaction-field p { font-size: .9rem; color: var(--dsw-alias-label-secondary, GrayText); margin-block: 8px; }
.mayori-compaction-field :is(input, textarea) { box-sizing: border-box; inline-size: 100%; min-inline-size: 0; min-block-size: 42px; padding: 10px 12px; font: inherit; font-size: 16px; line-height: 1.5; color: inherit; background: var(--dsw-alias-bg-layer-1, Canvas); border: 1px solid var(--dsw-alias-border-l2, GrayText); border-radius: 8px; }
.mayori-compaction-field textarea { resize: vertical; }
.mayori-compaction-form :is(input, textarea, button, summary):focus-visible { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: 3px; }
.mayori-compaction-form button { padding: 10px 14px; min-block-size: 42px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2, GrayText); background: var(--dsw-alias-bg-layer-2, Canvas); color: inherit; font: inherit; cursor: pointer; }
.mayori-compaction-form button:disabled { opacity: .5; cursor: default; }
.mayori-compaction-form summary { cursor: pointer; padding-block: 12px; }
.mayori-compaction-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-block-start: 20px; }
.mayori-compaction-actions span { font-size: .9rem; }
@media (forced-colors: active) { .mayori-plugin-row input { appearance: auto; } }
@media (max-width: 600px) {
  .mayori-compaction-numbers { grid-template-columns: minmax(0, 1fr); gap: 0; }
}
`;
		//#endregion
		//#region src/features/settings/client/modal.jsx
		const tabs = [[
			"general",
			"Основные",
			_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutlineMedium
		], [
			"plugins",
			"Плагины",
			_deepseek_ai_dsh_client_ui_primitives.IconPersonalizationOutlineMedium
		]];
		/** Independent settings entry; the native DSH settings consumer keeps its own state. */
		function MayoriSettingsLauncher({ wide, preferences }) {
			const [open, setOpen] = (0, react.useState)(false);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mayori-navigation-row mayori-settings-trigger",
				"aria-label": "Настройки Mayori",
				title: wide ? void 0 : "Настройки Mayori",
				"aria-haspopup": "dialog",
				"aria-expanded": open,
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "mayori-navigation-glyph",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPersonalizationOutlineMedium, { size: wide ? 16 : 18 })
				}), wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "mayori-navigation-label",
					children: "Настройки Mayori"
				})]
			}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MayoriSettingsModal, {
				preferences,
				onClose: () => setOpen(false)
			})] });
		}
		function MayoriSettingsModal({ preferences, onClose }) {
			const [active, setActive] = (0, react.useState)("general");
			const [horizontal, setHorizontal] = (0, react.useState)(false);
			const tablist = (0, react.useRef)(null);
			const id = (0, react.useId)();
			(0, react.useEffect)(() => {
				const query = window.matchMedia("(max-width: 600px)");
				const update = () => setHorizontal(query.matches);
				update();
				query.addEventListener("change", update);
				return () => query.removeEventListener("change", update);
			}, []);
			const navigate = (event) => {
				const previous = horizontal ? "ArrowLeft" : "ArrowUp";
				const next = horizontal ? "ArrowRight" : "ArrowDown";
				if (![
					previous,
					next,
					"Home",
					"End"
				].includes(event.key)) return;
				event.preventDefault();
				const index = tabs.findIndex(([key]) => key === active);
				const target = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === next ? 1 : -1) + tabs.length) % tabs.length;
				setActive(tabs[target][0]);
				tablist.current?.querySelectorAll("[role=\"tab\"]")[target]?.focus();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				headless: true,
				title: "Настройки Mayori",
				onClose,
				className: "mayori-settings-modal",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-settings-nav",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: "Настройки Mayori" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						ref: tablist,
						className: "mayori-settings-tabs",
						role: "tablist",
						"aria-label": "Разделы настроек Mayori",
						"aria-orientation": horizontal ? "horizontal" : "vertical",
						onKeyDown: navigate,
						children: tabs.map(([key, label, Icon]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "tab",
							id: `${id}-${key}-tab`,
							"aria-selected": active === key,
							"aria-controls": `${id}-${key}-panel`,
							tabIndex: active === key ? 0 : -1,
							"data-modal-autofocus": active === key ? "" : void 0,
							onClick: () => setActive(key),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Icon, { size: 16 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label })]
						}, key))
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-settings-content",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mayori-settings-header",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Закрыть настройки Mayori",
							onClick: onClose,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-settings-options",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							role: "tabpanel",
							id: `${id}-general-panel`,
							"aria-labelledby": `${id}-general-tab`,
							hidden: active !== "general",
							tabIndex: 0
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							role: "tabpanel",
							id: `${id}-plugins-panel`,
							"aria-labelledby": `${id}-plugins-tab`,
							hidden: active !== "plugins",
							tabIndex: 0,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MayoriSettings, { preferences })
						})]
					})]
				})]
			});
		}
		const SETTINGS_MODAL_STYLE = `
.mayori-settings-modal { inline-size: min(1200px, 100%); block-size: 800px; max-block-size: 100%; flex-direction: row; gap: 0; padding: 0; color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-settings-nav { flex: 0 0 188px; padding: 22px 12px 0; box-sizing: border-box; }
.mayori-settings-nav h1 { margin: 0 0 18px; padding-inline: 12px; font-size: 16px; line-height: 24px; font-weight: 500; }
.mayori-settings-tabs { display: flex; flex-direction: column; gap: 4px; }
.mayori-settings-tabs button { display: flex; align-items: center; gap: 8px; min-block-size: 40px; padding: 9px 12px; border: 0; border-radius: var(--dsw-radius-md, 12px); background: transparent; color: inherit; font: inherit; font-size: 14px; text-align: start; cursor: pointer; }
.mayori-settings-tabs button:hover { background: var(--dsw-specific-sidebar-nav-item-hover, color-mix(in srgb, currentColor 6%, transparent)); }
.mayori-settings-tabs button[aria-selected="true"] { background: var(--dsw-specific-sidebar-nav-item-active, color-mix(in srgb, currentColor 10%, transparent)); }
.mayori-settings-tabs svg { flex: none; }
.mayori-settings-content { flex: 1; min-inline-size: 0; min-block-size: 0; display: flex; flex-direction: column; }
.mayori-settings-header { flex: none; display: flex; justify-content: flex-end; padding: 16px 14px 8px; }
.mayori-settings-header button { display: inline-flex; align-items: center; justify-content: center; inline-size: 32px; block-size: 32px; padding: 0; border: 0; border-radius: var(--dsw-radius-sm, 8px); background: transparent; color: inherit; cursor: pointer; }
.mayori-settings-header button:hover { background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 6%, transparent)); }
.mayori-settings-options { flex: 1; min-block-size: 0; padding: 0 24px 24px; overflow-y: auto; overscroll-behavior: contain; }
.mayori-settings-modal :is(button, input, summary, [role="tabpanel"]):focus-visible { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: 3px; }
.mayori-settings-trigger { inline-size: 100%; }
@media (max-width: 600px) {
  .mayori-settings-modal { flex-direction: column; }
  .mayori-settings-nav { flex: none; padding: 16px 12px 0; }
  .mayori-settings-nav h1 { padding-inline-end: 36px; margin-block-end: 12px; }
  .mayori-settings-tabs { flex-direction: row; }
  .mayori-settings-tabs button { flex: 1; }
  .mayori-settings-header { padding-block-start: 4px; }
  .mayori-settings-options { padding-inline: 16px; }
}
`;
		//#endregion
		//#region src/client/infrastructure/session-providers.js
		/** Keep subscribed providers stable while evicting inactive session state. */
		var SessionProviders = class {
			constructor(factory, limit = 16) {
				this.factory = factory;
				this.limit = limit;
				this.entries = /* @__PURE__ */ new Map();
			}
			get(id) {
				let entry = this.entries.get(id);
				if (!entry) {
					const provider = this.factory(id);
					entry = {
						provider,
						users: 0
					};
					const subscribe = provider.subscribe;
					provider.subscribe = (listener) => {
						entry.users++;
						const release = subscribe(listener);
						let live = true;
						return () => {
							if (!live) return;
							live = false;
							release();
							entry.users--;
							provider.release?.();
							this.trim();
						};
					};
				}
				this.entries.delete(id);
				this.entries.set(id, entry);
				this.trim(id);
				return entry.provider;
			}
			trim(protectedId) {
				for (const [id, entry] of this.entries) {
					if (this.entries.size <= this.limit) break;
					if (entry.users || id === protectedId) continue;
					entry.provider.dispose?.();
					this.entries.delete(id);
				}
			}
			dispose() {
				for (const entry of this.entries.values()) entry.provider.dispose?.();
				this.entries.clear();
			}
		};
		//#endregion
		//#region src/client/plugin.js
		/** Mayori browser plugin: custom RPG sidebar plus the Character Library UI. */
		const inject = [
			"slots",
			"sessions",
			"workspaces",
			"uiWorkspace",
			"layout"
		];
		/** Register reversible browser contributions through Cordis. */
		function apply(ctx) {
			const preferences = new PluginSettingsClient();
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "mayori-settings",
				order: 35,
				inject: () => ({ preferences })
			}, MayoriSettingsLauncher));
			const library = new RemoteCharacterLibraryProvider();
			ctx.effect(() => () => library.dispose(), "mayori: catalog requests");
			ctx.provide("mayoriCharacters", library);
			const personas = new RemotePersonaProvider();
			ctx.provide("mayoriPersonas", personas);
			const presets = new RemoteRoleplayPresetProvider();
			ctx.provide("mayoriPresets", presets);
			const sessionPresets = new SessionProviders((id) => new RemoteSessionPresetProvider(id));
			const presetFor = (sessionId) => sessionPresets.get(sessionId);
			ctx.provide("mayoriSessionPresets", { forSession: presetFor });
			const chats = new SessionProviders((id) => new RemoteCharacterChatProvider(id));
			const chatFor = (sessionId) => chats.get(sessionId);
			const contexts = new SessionProviders((id) => new RemoteTrajectoryContextProvider(id), 4);
			const contextFor = (sessionId) => contexts.get(sessionId);
			ctx.provide("mayoriTrajectoryContext", { forSession: contextFor });
			const revisions = new SessionProviders((sessionId) => new RemoteMessageRevisionProvider(sessionId, async (id) => {
				try {
					await ctx.sessions.refresh();
				} finally {
					ctx.uiWorkspace.openSession(id);
				}
			}));
			const revisionFor = (sessionId) => revisions.get(sessionId);
			ctx.effect(() => () => {
				sessionPresets.dispose();
				chats.dispose();
				contexts.dispose();
				revisions.dispose();
			}, "mayori: session provider caches");
			ctx.provide("mayoriMessageRevisions", { forSession: revisionFor });
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.plugin = "dsh-mayori";
				style.dataset.mayori = "client";
				style.textContent = BRAND_STYLE + SETTINGS_MODAL_STYLE + PLUGIN_SETTINGS_STYLE;
				document.head.appendChild(style);
				return () => {
					style.remove();
				};
			}, "mayori: client styles");
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: "rollDice"
			}, DiceToolCard));
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: "resolveCheck"
			}, CheckToolCard));
			ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.register({
				name: "sidebar.brand.mark",
				priority: -100
			}, MayoriMark));
			ctx.slots.inject("sidebar.brand.name", () => ctx.slots.register({
				name: "sidebar.brand.name",
				priority: -100
			}, MayoriBrandName));
			ctx.slots.inject("conversation.hero.brand.mark", () => ctx.slots.register({
				name: "conversation.hero.brand.mark",
				priority: -100
			}, MayoriMark));
			ctx.slots.inject("sidebar.workspaces", () => ctx.slots.register({
				name: "sidebar.workspaces",
				priority: -100
			}, MayoriSidebar));
			for (const [slotName, Component] of [["sidebar", MayoriNavigationSidebar], ["shell.leading", MayoriLeadingControls]]) ctx.slots.inject(slotName, () => ctx.effect(() => {
				let installed = false;
				const disposers = [];
				const register = () => {
					if (installed) return;
					const stock = ctx.slots.entries(slotName)[0];
					if (!stock) return;
					installed = true;
					const prefix = `mayori.navigation.${slotName}`;
					disposers.push(ctx.slots.register({
						name: slotName,
						priority: -100,
						store: stock.store,
						locale: stock.locale,
						children: mirroredChildren(stock.children, prefix),
						inject: (...args) => ({
							...stock.inject?.(...args),
							stockChildren: stock.children,
							childPrefix: prefix,
							openHome: () => ctx.layout.selectPanel("mayori-home")
						})
					}, Component));
					for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
				};
				const unsubscribe = ctx.slots.subscribe(slotName, register);
				register();
				return () => {
					unsubscribe();
					for (const dispose of disposers) dispose();
				};
			}, "mayori: home navigation"));
			const history = new SessionChatHistoryProvider(ctx.sessions, ctx.uiWorkspace, ctx.workspaces);
			ctx.effect(() => () => history.dispose(), "mayori: history cache");
			ctx.provide("mayoriHistory", history);
			const homeProps = () => ({
				history,
				library,
				personas,
				selectPanel: (id) => ctx.layout.selectPanel(id),
				startCharacter: (card, greetingIndex) => startCharacterSession({
					sessions: ctx.sessions,
					workspaces: ctx.workspaces,
					uiWorkspace: ctx.uiWorkspace,
					library
				}, card, greetingIndex)
			});
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: "mayori-home",
				inject: homeProps
			}, HomePanel));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: "mayori-home",
				order: -30,
				label: "Главная"
			}, HomeIcon));
			ctx.slots.inject("main.conversation", () => ctx.effect(() => {
				let installed = false;
				const disposers = [];
				const register = () => {
					if (installed) return;
					const stock = ctx.slots.entries("main.conversation")[0];
					if (!stock) return;
					installed = true;
					const prefix = "mayori.home.conversation";
					disposers.push(ctx.slots.register({
						name: "main.conversation",
						priority: -100,
						store: stock.store,
						locale: stock.locale,
						children: mirroredChildren(stock.children, prefix),
						inject: (...args) => ({
							...stock.inject?.(...args),
							...homeProps(),
							stock: stock.component,
							stockChildren: stock.children,
							childPrefix: prefix
						})
					}, HomeConversation));
					for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
				};
				const unsubscribe = ctx.slots.subscribe("main.conversation", register);
				register();
				return () => {
					unsubscribe();
					for (const dispose of disposers) dispose();
				};
			}, "mayori: home conversation"));
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: "mayori-characters",
				inject: () => ({
					library,
					personas,
					startCharacter: (card, greetingIndex) => startCharacterSession({
						sessions: ctx.sessions,
						workspaces: ctx.workspaces,
						uiWorkspace: ctx.uiWorkspace,
						library
					}, card, greetingIndex)
				})
			}, CharacterGalleryPanel));
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: "mayori-history",
				inject: () => ({ history })
			}, ChatHistoryPanel));
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: "mayori-personas",
				inject: () => ({
					personas,
					sessions: ctx.sessions,
					chatFor
				})
			}, PersonaPanel));
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: "mayori-presets",
				inject: () => ({
					presets,
					sessions: ctx.sessions,
					presetFor
				})
			}, PresetPanel));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: "mayori-characters",
				order: -20,
				label: "Персонажи"
			}, CharacterGalleryIcon));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: "mayori-history",
				order: -10,
				label: "История чатов"
			}, ChatHistoryIcon));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: "mayori-personas",
				order: -15,
				label: "Персоны"
			}, PersonaIcon));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: "mayori-presets",
				order: -12,
				label: "Пресеты"
			}, PresetIcon));
			ctx.slots.inject("conversation.chat.node", () => ctx.effect(() => {
				const installed = /* @__PURE__ */ new Set();
				const disposers = [];
				const register = () => {
					for (const [key, component] of [
						["assistant-step", CharacterMessage],
						["user", CharacterMessage],
						["steering", CharacterMessage],
						["turn-tail", GreetingTurnTail]
					]) {
						if (installed.has(key)) continue;
						const stock = ctx.slots.entries("conversation.chat.node").find((entry) => entry.options.key === key);
						if (!stock) continue;
						installed.add(key);
						const prefix = `mayori.greeting.${key}`;
						disposers.push(ctx.slots.register({
							name: "conversation.chat.node",
							key,
							priority: -100,
							locale: stock.locale,
							children: mirroredChildren(stock.children, prefix),
							inject: (...args) => ({
								...stock.inject?.(...args),
								stock: stock.component,
								stockChildren: stock.children,
								childPrefix: prefix,
								chatFor,
								revisionFor
							})
						}, component));
						for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
					}
				};
				const unsubscribe = ctx.slots.subscribe("conversation.chat.node", register);
				register();
				return () => {
					unsubscribe();
					for (const dispose of disposers) dispose();
				};
			}, "mayori: greeting renderer"));
			ctx.slots.inject("conversation.view", () => ctx.effect(() => {
				let installed = false;
				const disposers = [];
				const register = () => {
					if (installed) return;
					const stock = ctx.slots.entries("conversation.view").find((entry) => entry.options.id === "trajectory");
					if (!stock) return;
					installed = true;
					const prefix = "mayori.trajectory";
					disposers.push(ctx.slots.register({
						...stock.options,
						name: "conversation.view",
						id: "trajectory",
						priority: -100,
						locale: stock.locale,
						children: mirroredChildren(stock.children, prefix),
						inject: (...args) => ({
							...stock.inject?.(...args),
							stock: stock.component,
							stockChildren: stock.children,
							childPrefix: prefix,
							contextFor
						})
					}, ContextTrajectory));
					for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
				};
				const unsubscribe = ctx.slots.subscribe("conversation.view", register);
				register();
				return () => {
					unsubscribe();
					for (const dispose of disposers) dispose();
				};
			}, "mayori: trajectory context"));
			ctx.slots.inject("conversation.session.header", () => ctx.effect(() => {
				let installed = false;
				const disposers = [];
				const register = () => {
					if (installed) return;
					const stock = ctx.slots.entries("conversation.session.header")[0];
					if (!stock) return;
					installed = true;
					const prefix = "mayori.trajectory.header";
					disposers.push(ctx.slots.register({
						name: "conversation.session.header",
						priority: -100,
						store: stock.store,
						locale: stock.locale,
						children: mirroredChildren(stock.children, prefix),
						inject: (...args) => ({
							...stock.inject?.(...args),
							stock: stock.component,
							stockChildren: stock.children,
							childPrefix: prefix,
							revisionNavigation: RevisionBranchNavigation,
							revisionNavigationProps: {
								sessions: ctx.sessions,
								open: (id) => ctx.uiWorkspace.openSession(id)
							}
						})
					}, TrajectorySessionHeader));
					for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
				};
				const unsubscribe = ctx.slots.subscribe("conversation.session.header", register);
				register();
				return () => {
					unsubscribe();
					for (const dispose of disposers) dispose();
				};
			}, "mayori: trajectory header"));
		}
		//#endregion
		exports.BRAND_STYLE = BRAND_STYLE;
		exports.CheckToolCard = CheckToolCard;
		exports.DiceToolCard = DiceToolCard;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map