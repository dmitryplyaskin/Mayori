window.__ModuleLoader__.load({
	id: "dsh-mayori",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/character-card.js
		/** Character Card v2/v3 decoding shared by the browser provider and tests. */
		const PNG_SIGNATURE = Uint8Array.from([
			137,
			80,
			78,
			71,
			13,
			10,
			26,
			10
		]);
		const UTF8 = new TextDecoder("utf-8", { fatal: true });
		const MAX_CARD_BYTES = 16777216;
		var CharacterCardImportError = class extends Error {
			constructor(message, code = "INVALID_CARD") {
				super(message);
				this.name = "CharacterCardImportError";
				this.code = code;
			}
		};
		function isObject(value) {
			return value !== null && typeof value === "object" && !Array.isArray(value);
		}
		function readAscii(bytes, start, end) {
			let value = "";
			for (let index = start; index < end; index += 1) value += String.fromCharCode(bytes[index]);
			return value;
		}
		function decodeBase64(value) {
			const compact = value.replace(/\s/g, "");
			if (compact.length === 0 || compact.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) throw new CharacterCardImportError("Метаданные карточки содержат некорректный Base64.", "INVALID_BASE64");
			try {
				const binary = atob(compact);
				const bytes = new Uint8Array(binary.length);
				for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
				return UTF8.decode(bytes);
			} catch (error) {
				if (error instanceof CharacterCardImportError) throw error;
				throw new CharacterCardImportError("Не удалось декодировать метаданные карточки.", "INVALID_BASE64");
			}
		}
		function parseJson(text) {
			try {
				return JSON.parse(text);
			} catch {
				throw new CharacterCardImportError("Файл содержит некорректный JSON.", "INVALID_JSON");
			}
		}
		/** Validate the envelope while preserving every source field for lossless storage. */
		function validateCharacterCard(value) {
			if (!isObject(value)) throw new CharacterCardImportError("Карточка должна быть JSON-объектом.");
			if (!(value.spec === "chara_card_v2" || value.spec === "chara_card_v3")) throw new CharacterCardImportError("Поддерживаются только Character Card v2 и v3.", "UNSUPPORTED_SPEC");
			if (!isObject(value.data) || typeof value.data.name !== "string" || value.data.name.trim() === "") throw new CharacterCardImportError("В карточке отсутствует непустое поле data.name.");
			if (typeof value.spec_version !== "string") throw new CharacterCardImportError("В карточке отсутствует строковое поле spec_version.");
			const major = value.spec === "chara_card_v3" ? 3 : 2;
			const parsedVersion = Number.parseFloat(value.spec_version);
			const warnings = [];
			if (Number.isFinite(parsedVersion) && parsedVersion > major) warnings.push(`Карточка создана для более новой версии ${value.spec_version}; неизвестные поля сохранены.`);
			return {
				card: value,
				major,
				warnings
			};
		}
		function pngTextChunks(bytes) {
			if (bytes.length < PNG_SIGNATURE.length || PNG_SIGNATURE.some((value, index) => bytes[index] !== value)) throw new CharacterCardImportError("PNG-файл имеет некорректную сигнатуру.", "INVALID_PNG");
			const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
			const chunks = /* @__PURE__ */ new Map();
			let offset = 8;
			while (offset + 12 <= bytes.length) {
				const length = view.getUint32(offset);
				const dataStart = offset + 8;
				const dataEnd = dataStart + length;
				const next = dataEnd + 4;
				if (next > bytes.length) throw new CharacterCardImportError("PNG-файл обрывается внутри блока метаданных.", "INVALID_PNG");
				const type = readAscii(bytes, offset + 4, offset + 8);
				if (type === "tEXt") {
					let separator = dataStart;
					while (separator < dataEnd && bytes[separator] !== 0) separator += 1;
					if (separator < dataEnd) {
						const keyword = readAscii(bytes, dataStart, separator);
						if (keyword === "ccv3" || keyword === "chara") chunks.set(keyword, readAscii(bytes, separator + 1, dataEnd));
					}
				}
				offset = next;
				if (type === "IEND") break;
			}
			return chunks;
		}
		/** Decode a JSON card or the standard `chara` / `ccv3` PNG tEXt payload. */
		function parseCharacterCardBytes(input, mediaType = "", fileName = "") {
			const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
			if (bytes.byteLength > MAX_CARD_BYTES) throw new CharacterCardImportError("Файл карточки превышает лимит 16 МБ.", "FILE_TOO_LARGE");
			if (!(mediaType === "image/png" || fileName.toLowerCase().endsWith(".png") || PNG_SIGNATURE.every((value, index) => bytes[index] === value))) return {
				...validateCharacterCard(parseJson(UTF8.decode(bytes))),
				imageBytes: null
			};
			const chunks = pngTextChunks(bytes);
			const keyword = chunks.has("ccv3") ? "ccv3" : chunks.has("chara") ? "chara" : null;
			if (keyword === null) throw new CharacterCardImportError("В PNG не найдены метаданные Character Card (`chara` или `ccv3`).", "MISSING_METADATA");
			const parsed = validateCharacterCard(parseJson(decodeBase64(chunks.get(keyword))));
			if (keyword === "ccv3" && parsed.major !== 3) throw new CharacterCardImportError("Блок `ccv3` не содержит Character Card v3.");
			if (keyword === "chara" && parsed.major !== 2) throw new CharacterCardImportError("Блок `chara` не содержит Character Card v2.");
			return {
				...parsed,
				imageBytes: bytes.slice()
			};
		}
		function hex(bytes) {
			return [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
		}
		/** Create a content identity from the preserved card JSON, independent of its container. */
		async function characterCardId(card) {
			const bytes = new TextEncoder().encode(JSON.stringify(card));
			const digest = await crypto.subtle.digest("SHA-256", bytes);
			return hex(new Uint8Array(digest));
		}
		/** Convert a File-like object into the durable library record. */
		async function importCharacterCardFile(file, now = Date.now()) {
			const parsed = parseCharacterCardBytes(new Uint8Array(await file.arrayBuffer()), file.type ?? "", file.name ?? "");
			return {
				id: await characterCardId(parsed.card),
				spec: parsed.card.spec,
				specVersion: parsed.card.spec_version,
				name: parsed.card.data.name.trim(),
				data: parsed.card.data,
				card: parsed.card,
				warnings: parsed.warnings,
				importedAt: now,
				sourceName: file.name || "character-card",
				image: parsed.imageBytes === null ? null : new Blob([parsed.imageBytes], { type: "image/png" })
			};
		}
		//#endregion
		//#region src/character-library.js
		/** Character-library capability: Service Definition plus IndexedDB Provider. */
		const EMPTY_SNAPSHOT = Object.freeze({
			status: "loading",
			cards: Object.freeze([]),
			error: null,
			revision: 0
		});
		/**
		* Service Definition for the browser-local imported Character Card library.
		* Providers publish immutable snapshots and own persistence; UI consumers do
		* not reach IndexedDB directly.
		*/
		var CharacterLibraryService = class {
			getSnapshot() {
				throw new Error("CharacterLibraryService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("CharacterLibraryService.subscribe() is not implemented");
			}
			importFiles() {
				throw new Error("CharacterLibraryService.importFiles() is not implemented");
			}
			remove() {
				throw new Error("CharacterLibraryService.remove() is not implemented");
			}
		};
		function requestResult(request) {
			return new Promise((resolve, reject) => {
				request.addEventListener("success", () => {
					resolve(request.result);
				}, { once: true });
				request.addEventListener("error", () => {
					reject(request.error ?? /* @__PURE__ */ new Error("IndexedDB request failed"));
				}, { once: true });
			});
		}
		function transactionDone(transaction) {
			return new Promise((resolve, reject) => {
				transaction.addEventListener("complete", resolve, { once: true });
				transaction.addEventListener("abort", () => {
					reject(transaction.error ?? /* @__PURE__ */ new Error("IndexedDB transaction aborted"));
				}, { once: true });
				transaction.addEventListener("error", () => {
					reject(transaction.error ?? /* @__PURE__ */ new Error("IndexedDB transaction failed"));
				}, { once: true });
			});
		}
		function openDatabase(indexedDb) {
			return new Promise((resolve, reject) => {
				const request = indexedDb.open("mayori-character-library", 1);
				request.addEventListener("upgradeneeded", () => {
					const database = request.result;
					if (!database.objectStoreNames.contains("characters")) database.createObjectStore("characters", { keyPath: "id" }).createIndex("importedAt", "importedAt");
				});
				request.addEventListener("success", () => {
					resolve(request.result);
				}, { once: true });
				request.addEventListener("error", () => {
					reject(request.error ?? /* @__PURE__ */ new Error("IndexedDB open failed"));
				}, { once: true });
			});
		}
		/** IndexedDB Provider. Imported cards survive browser reloads on this origin. */
		var IndexedDbCharacterLibraryProvider = class extends CharacterLibraryService {
			#indexedDb;
			#database;
			#snapshot = EMPTY_SNAPSHOT;
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			constructor(indexedDb = globalThis.indexedDB) {
				super();
				this.#indexedDb = indexedDb;
			}
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				this.#ensureLoaded();
				return () => {
					this.#listeners.delete(listener);
				};
			};
			async importFiles(files) {
				await this.#ensureLoaded();
				if (this.#snapshot.status === "error") throw new Error(this.#snapshot.error);
				const settled = await Promise.allSettled([...files].map((file) => importCharacterCardFile(file)));
				const records = settled.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
				const rejected = settled.flatMap((result, index) => result.status === "rejected" ? [{
					name: files[index]?.name ?? "character-card",
					error: result.reason instanceof Error ? result.reason.message : String(result.reason)
				}] : []);
				if (records.length > 0) {
					const transaction = (await this.#db()).transaction("characters", "readwrite");
					const store = transaction.objectStore("characters");
					for (const record of records) store.put(record);
					await transactionDone(transaction);
					await this.#reload();
				}
				return {
					imported: records.length,
					rejected
				};
			}
			async remove(id) {
				await this.#ensureLoaded();
				const transaction = (await this.#db()).transaction("characters", "readwrite");
				transaction.objectStore("characters").delete(id);
				await transactionDone(transaction);
				await this.#reload();
			}
			async #db() {
				if (this.#indexedDb === void 0) throw new Error("IndexedDB недоступен в этом браузере.");
				this.#database ??= openDatabase(this.#indexedDb);
				return this.#database;
			}
			async #ensureLoaded() {
				this.#loading ??= this.#reload().catch((error) => {
					this.#publish("error", [], error instanceof Error ? error.message : String(error));
				});
				return this.#loading;
			}
			async #reload() {
				const transaction = (await this.#db()).transaction("characters", "readonly");
				const cards = await requestResult(transaction.objectStore("characters").getAll());
				await transactionDone(transaction);
				cards.sort((left, right) => right.importedAt - left.importedAt || left.name.localeCompare(right.name));
				this.#publish("ready", cards, null);
			}
			#publish(status, cards, error) {
				this.#snapshot = Object.freeze({
					status,
					cards: Object.freeze(cards),
					error,
					revision: this.#snapshot.revision + 1
				});
				for (const listener of [...this.#listeners]) listener();
			}
		};
		//#endregion
		//#region src/gallery.jsx
		/** Gallery Consumer for the browser-local Character Library Service. */
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
			return null;
		}
		function safeAssetUri(card) {
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
		function text(value) {
			return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
		}
		function CharacterCard({ card, onRemove }) {
			const source = useCardImage(card);
			const description = text(card.data.description) ?? text(card.data.personality);
			const tags = Array.isArray(card.data.tags) ? card.data.tags.filter((value) => typeof value === "string" && value.trim() !== "").slice(0, 5) : EMPTY_ARRAY;
			const details = [
				["Описание", text(card.data.description)],
				["Характер", text(card.data.personality)],
				["Сценарий", text(card.data.scenario)],
				["Первое сообщение", text(card.data.first_mes)]
			].filter(([, value]) => value !== null);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
				className: "mayori-card",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-card-media",
					children: [source === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "mayori-card-fallback",
						"aria-hidden": "true",
						children: card.name.slice(0, 1).toUpperCase()
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						src: source,
						alt: `Портрет: ${card.name}`
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "mayori-card-version",
						children: ["v", card.specVersion]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-card-body",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-card-heading",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: card.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "mayori-card-byline",
								children: text(card.data.creator) ?? "Автор не указан"
							})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-icon-action",
								"aria-label": `Удалить карточку ${card.name}`,
								onClick: () => {
									onRemove(card);
								},
								children: icon("trash")
							})]
						}),
						description !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "mayori-card-summary",
							children: description
						}),
						tags.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: "mayori-tags",
							"aria-label": "Теги",
							children: tags.map((tag, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: tag }, `${tag}-${index}`))
						}),
						card.warnings.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "mayori-card-warning",
							children: card.warnings.join(" ")
						}),
						details.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
							className: "mayori-card-details",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "Подробнее" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dl", { children: details.map(([label, value]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: value })] }, label)) })]
						})
					]
				})] })
			});
		}
		function CharacterGalleryDialog({ library, open, onClose, openerRef }) {
			const dialogRef = (0, react.useRef)(null);
			const inputRef = (0, react.useRef)(null);
			const snapshot = (0, react.useSyncExternalStore)(library.subscribe, library.getSnapshot, library.getSnapshot);
			const [query, setQuery] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [notice, setNotice] = (0, react.useState)(null);
			const normalizedQuery = query.trim().toLocaleLowerCase();
			const cards = (0, react.useMemo)(() => snapshot.cards.filter((card) => {
				if (normalizedQuery === "") return true;
				return [
					card.name,
					card.data.creator,
					...Array.isArray(card.data.tags) ? card.data.tags : []
				].filter((value) => typeof value === "string").join("\n").toLocaleLowerCase().includes(normalizedQuery);
			}), [normalizedQuery, snapshot.cards]);
			(0, react.useEffect)(() => {
				const dialog = dialogRef.current;
				if (dialog === null) return;
				if (open && !dialog.open) dialog.showModal();
				if (!open && dialog.open) dialog.close();
			}, [open]);
			const finishClose = () => {
				onClose();
				requestAnimationFrame(() => {
					openerRef.current?.focus();
				});
			};
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
			const remove = async (card) => {
				if (!window.confirm(`Удалить карточку «${card.name}» из галереи?`)) return;
				try {
					await library.remove(card.id);
					setNotice({
						kind: "success",
						text: `Карточка «${card.name}» удалена.`
					});
				} catch (error) {
					setNotice({
						kind: "error",
						text: error instanceof Error ? error.message : String(error)
					});
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dialog", {
				ref: dialogRef,
				className: "mayori-gallery-dialog",
				"aria-labelledby": "mayori-gallery-title",
				onClose: finishClose,
				onCancel: () => {
					onClose();
				},
				onKeyDown: (event) => {
					if (event.key !== "Escape") return;
					event.preventDefault();
					dialogRef.current?.close();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-gallery-shell",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "mayori-gallery-header",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "mayori-gallery-kicker",
								children: "Character Card v2–v3"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								id: "mayori-gallery-title",
								children: "Галерея персонажей"
							})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-icon-action mayori-close",
								"aria-label": "Закрыть галерею",
								onClick: () => {
									dialogRef.current?.close();
								},
								children: icon("close")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-gallery-toolbar",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "mayori-import-button",
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
											importFiles(event.currentTarget.files ?? []);
										}
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "mayori-search",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Поиск" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "search",
									value: query,
									placeholder: "Имя, автор или тег",
									onChange: (event) => {
										setQuery(event.currentTarget.value);
									}
								})]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-gallery-status",
							role: "status",
							"aria-live": "polite",
							children: [
								notice !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: notice.kind === "error" ? "mayori-error" : "mayori-success",
									children: notice.text
								}),
								snapshot.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-error",
									children: snapshot.error
								}),
								snapshot.status === "ready" && snapshot.cards.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: normalizedQuery === "" ? `Карточек: ${snapshot.cards.length}` : `Найдено: ${cards.length}` })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "mayori-gallery-content",
							"aria-label": "Импортированные персонажи",
							children: [
								snapshot.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-empty",
									children: "Загружаем библиотеку…"
								}),
								snapshot.status === "ready" && cards.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-empty",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-empty-icon",
											children: icon("gallery")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: snapshot.cards.length === 0 ? "Здесь пока пусто" : "Ничего не найдено" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: snapshot.cards.length === 0 ? "Импортируйте PNG или JSON с Character Card v2/v3." : "Попробуйте изменить поисковый запрос." })
									]
								}),
								cards.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: "mayori-card-grid",
									children: cards.map((card) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterCard, {
										card,
										onRemove: remove
									}, card.id))
								})
							]
						})
					]
				})
			});
		}
		/** Sidebar slot entry and modal gallery consumer. */
		function CharacterGalleryAction({ wide, library }) {
			const [open, setOpen] = (0, react.useState)(false);
			const openerRef = (0, react.useRef)(null);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				ref: openerRef,
				type: "button",
				className: "mayori-gallery-trigger",
				"aria-label": wide ? void 0 : "Галерея персонажей",
				onClick: () => {
					setOpen(true);
				},
				children: [icon("gallery"), wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Персонажи" })]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterGalleryDialog, {
				library,
				open,
				onClose: () => {
					setOpen(false);
				},
				openerRef
			})] });
		}
		//#endregion
		//#region src/client.js
		/** Mayori browser plugin: branding plus the Character Library UI consumer. */
		const inject = ["slots"];
		/** Plugin-owned style; removed with the client fiber. */
		const BRAND_STYLE = String.raw`
button:has(> svg[viewBox="0 0 182 24"][aria-hidden="true"]) > svg[viewBox="0 0 182 24"] { display: none; }
button:has(> svg[viewBox="0 0 182 24"][aria-hidden="true"])::before {
  content: "Mayori"; color: inherit; font: inherit; font-size: 24px; font-weight: 600;
  line-height: 1; letter-spacing: -0.04em; white-space: nowrap;
}
.mayori-gallery-trigger {
  display: inline-flex; align-items: center; justify-content: flex-start; gap: 10px;
  inline-size: 100%; min-block-size: 40px; padding: 8px 10px; border: 0; border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; cursor: pointer;
}
.mayori-gallery-trigger:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-gallery-trigger:active { transform: scale(0.96); }
.mayori-gallery-trigger:has(> svg:only-child) {
  justify-content: center; inline-size: 36px; min-block-size: 36px; padding: 0;
  color: var(--dsw-alias-label-primary);
}
.mayori-gallery-trigger:focus-visible,
.mayori-gallery-dialog button:focus-visible,
.mayori-gallery-dialog input:focus-visible,
.mayori-gallery-dialog summary:focus-visible,
.mayori-import-button:has(input:focus-visible) {
  outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px;
}
.mayori-gallery-dialog {
  inline-size: min(1120px, calc(100vw - 32px)); max-inline-size: none;
  block-size: min(780px, calc(100dvh - 32px)); max-block-size: none;
  margin: auto; padding: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 20px;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill));
  color: var(--dsw-alias-label-primary); overflow: hidden;
  box-shadow: 0 24px 64px oklch(0 0 0 / 0.24), 0 2px 8px oklch(0 0 0 / 0.12);
}
.mayori-gallery-dialog::backdrop { background: oklch(0 0 0 / 0.48); backdrop-filter: blur(2px); }
.mayori-gallery-shell { display: grid; grid-template-rows: auto auto auto minmax(0, 1fr); block-size: 100%; }
.mayori-gallery-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 24px;
  padding: 24px 24px 12px;
}
.mayori-gallery-header h2, .mayori-gallery-header p, .mayori-card h3, .mayori-card p,
.mayori-empty h3, .mayori-empty p { margin: 0; }
.mayori-gallery-header h2 { font-size: clamp(22px, 3vw, 30px); line-height: 1.2; }
.mayori-gallery-kicker {
  margin-block-end: 4px !important; color: var(--dsw-alias-label-secondary); font-size: 12px;
  font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
}
.mayori-icon-action {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  inline-size: 40px; block-size: 40px; padding: 0; border: 0; border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.mayori-icon-action:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.mayori-icon-action:active, .mayori-import-button:active { transform: scale(0.96); }
.mayori-gallery-toolbar { display: flex; align-items: end; gap: 16px; padding: 12px 24px; }
.mayori-import-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-block-size: 42px;
  padding: 9px 16px; border-radius: 12px; background: var(--dsw-alias-label-primary);
  color: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); font-size: 14px;
  font-weight: 600; cursor: pointer;
}
.mayori-import-button[aria-disabled="true"] { opacity: 0.58; cursor: progress; }
.mayori-import-button input {
  position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap;
}
.mayori-search {
  display: grid; flex: 1; gap: 6px; max-inline-size: 420px;
  color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 500;
}
.mayori-search input {
  inline-size: 100%; min-block-size: 42px; box-sizing: border-box; padding: 9px 12px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: transparent;
  color: var(--dsw-alias-label-primary); font: inherit; font-size: 16px;
}
.mayori-gallery-status {
  min-block-size: 32px; padding: 0 24px 8px; color: var(--dsw-alias-label-secondary); font-size: 13px;
}
.mayori-gallery-status p { margin: 0; }
.mayori-error, .mayori-card-warning { color: var(--dsw-alias-label-error, #b42318); }
.mayori-success { color: var(--dsw-alias-label-success, #16794b); }
.mayori-gallery-content {
  min-block-size: 0; padding: 8px 24px 24px; overflow: auto; overscroll-behavior: contain;
}
.mayori-card-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr));
  gap: 20px; margin: 0; padding: 0; list-style: none;
}
.mayori-card article {
  block-size: 100%; overflow: hidden; border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 16px; background: var(--dsw-alias-bg-l2, var(--dsw-specific-sidebar-fill));
}
.mayori-card-media {
  position: relative; display: grid; place-items: center; aspect-ratio: 4 / 3;
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
.mayori-card-version {
  position: absolute; inset-block-start: 10px; inset-inline-end: 10px; padding: 3px 7px;
  border-radius: 999px; background: oklch(0 0 0 / 0.64); color: white; font-size: 11px; font-weight: 600;
}
.mayori-card-body { padding: 16px; }
.mayori-card-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.mayori-card-heading > div { min-inline-size: 0; }
.mayori-card-heading h3 { overflow-wrap: anywhere; font-size: 17px; line-height: 1.3; }
.mayori-card-heading .mayori-icon-action { inline-size: 36px; block-size: 36px; }
.mayori-card-byline { margin-block-start: 3px !important; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.mayori-card-summary {
  display: -webkit-box; margin-block-start: 12px !important; overflow: hidden;
  color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.5;
  -webkit-box-orient: vertical; -webkit-line-clamp: 3;
}
.mayori-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 0; padding: 0; list-style: none; }
.mayori-tags li {
  max-inline-size: 100%; overflow: hidden; padding: 4px 8px; border-radius: 999px;
  background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary);
  font-size: 11px; text-overflow: ellipsis; white-space: nowrap;
}
.mayori-card-warning { margin-block-start: 10px !important; font-size: 12px; line-height: 1.4; }
.mayori-card-details { margin-block-start: 14px; font-size: 13px; }
.mayori-card-details summary {
  inline-size: max-content; max-inline-size: 100%; cursor: pointer; color: var(--dsw-alias-label-secondary);
}
.mayori-card-details dl { display: grid; gap: 12px; margin: 14px 0 0; }
.mayori-card-details dl > div { display: grid; gap: 4px; }
.mayori-card-details dt {
  font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--dsw-alias-label-secondary);
}
.mayori-card-details dd { margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; line-height: 1.5; }
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
@media (max-width: 560px) {
  .mayori-gallery-dialog { inline-size: calc(100vw - 16px); block-size: calc(100dvh - 16px); border-radius: 16px; }
  .mayori-gallery-header { padding: 18px 16px 8px; }
  .mayori-gallery-toolbar { align-items: stretch; flex-direction: column; padding: 8px 16px; }
  .mayori-search { max-inline-size: none; }
  .mayori-gallery-status { padding-inline: 16px; }
  .mayori-gallery-content { padding: 8px 16px 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .mayori-gallery-trigger:active, .mayori-icon-action:active, .mayori-import-button:active { transform: none; }
  .mayori-gallery-dialog::backdrop { backdrop-filter: none; }
}
`;
		/** Register reversible browser contributions through Cordis. */
		function apply(ctx) {
			const library = new IndexedDbCharacterLibraryProvider();
			ctx.provide("mayoriCharacters", library);
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.plugin = "dsh-mayori";
				style.dataset.mayori = "client";
				style.textContent = BRAND_STYLE;
				document.head.appendChild(style);
				return () => {
					style.remove();
				};
			}, "mayori: client styles");
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "mayori-character-gallery",
				order: 0,
				inject: () => ({ library })
			}, CharacterGalleryAction));
		}
		//#endregion
		exports.BRAND_STYLE = BRAND_STYLE;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map