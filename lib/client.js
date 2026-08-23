window.__ModuleLoader__.load({
	id: "dsh-mayori",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/character-library.js
		/** Browser proxy for the Host-owned Character Library Service. */
		const EMPTY_SNAPSHOT = Object.freeze({
			status: "loading",
			cards: Object.freeze([]),
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
			importFiles() {
				throw new Error("CharacterLibraryService.importFiles() is not implemented");
			}
			remove() {
				throw new Error("CharacterLibraryService.remove() is not implemented");
			}
		};
		function toBase64(bytes) {
			const chunkSize = 32768;
			let binary = "";
			for (let offset = 0; offset < bytes.length; offset += chunkSize) binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
			return btoa(binary);
		}
		function unwrap(result) {
			if (result.ok) return result.value;
			throw new Error(typeof result.error === "string" ? result.error : "Не удалось выполнить операцию с библиотекой.");
		}
		async function call(endpoint, payload) {
			const response = await fetch(`/mayori/characters/${endpoint}`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload)
			});
			const result = await response.json().catch(() => ({
				ok: false,
				error: `HTTP ${response.status}`
			}));
			if (!response.ok && result.ok !== false) throw new Error(`HTTP ${response.status}`);
			return unwrap(result);
		}
		/** Client Provider that keeps only an observable snapshot; Host owns persistence. */
		var RemoteCharacterLibraryProvider = class extends CharacterLibraryService {
			#snapshot = EMPTY_SNAPSHOT;
			#listeners = /* @__PURE__ */ new Set();
			#loading;
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
				const prepared = await Promise.all([...files].map(async (file) => ({
					name: file.name || "character-card",
					type: file.type || "",
					base64: toBase64(new Uint8Array(await file.arrayBuffer()))
				})));
				const result = {
					imported: 0,
					rejected: []
				};
				for (let offset = 0; offset < prepared.length; offset += 2) {
					const partial = await call("import", { files: prepared.slice(offset, offset + 2) });
					result.imported += partial.imported;
					result.rejected.push(...partial.rejected);
				}
				await this.#reload();
				return result;
			}
			async remove(id) {
				await call("remove", { id });
				await this.#reload();
			}
			async #ensureLoaded() {
				this.#loading ??= this.#reload().catch((error) => {
					this.#publish("error", [], error instanceof Error ? error.message : String(error));
				});
				return this.#loading;
			}
			async #reload() {
				const result = await call("list", {});
				this.#publish("ready", Array.isArray(result.cards) ? result.cards : [], null);
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
		function text(value) {
			return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
		}
		function cardTags(card) {
			return Array.isArray(card.data.tags) ? card.data.tags.filter((value) => typeof value === "string" && value.trim() !== "").map((value) => value.trim()) : EMPTY_ARRAY;
		}
		function safeAssetUri(card) {
			if (typeof card.image === "string" && /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(card.image)) return card.image;
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
		function CardPortrait({ card, className = "" }) {
			const source = useCardImage(card);
			return source === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `mayori-card-fallback ${className}`,
				"aria-hidden": "true",
				children: card.name.slice(0, 1).toUpperCase()
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				className,
				src: source,
				alt: `Портрет: ${card.name}`
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
		function CharacterCard({ card, onPlay, onEdit }) {
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
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: card.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: text(card.data.creator) ?? "Автор не указан" })]
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
								onClick: () => {
									onPlay(card);
								},
								children: [icon("play"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Играть" })]
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
		function CharacterInfoDialog({ card, onClose, onRemove, triggerRef }) {
			const dialogRef = (0, react.useRef)(null);
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
				["Описание", text(card.data.description)],
				["Характер", text(card.data.personality)],
				["Сценарий", text(card.data.scenario)],
				["Первое сообщение", text(card.data.first_mes)],
				["Пример диалога", text(card.data.mes_example)],
				["Заметки автора", text(card.data.creator_notes)]
			].filter(([, value]) => value !== null);
			const tags = cardTags(card);
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
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: text(card.data.creator) ?? "Автор не указан" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardPortrait, { card })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-character-details",
								children: [
									tags.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: "mayori-tags",
										"aria-label": "Теги",
										children: tags.map((tag, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: tag }, `${tag}-${index}`))
									}),
									card.warnings.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-card-warning",
										children: card.warnings.join(" ")
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
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-secondary-button",
								onClick: () => {
									dialogRef.current?.close();
								},
								children: "Закрыть"
							})]
						})
					]
				})
			});
		}
		function Filters({ cards, query, setQuery, sort, setSort, creator, setCreator, portrait, setPortrait, selectedTags, setSelectedTags, onReset }) {
			const creators = (0, react.useMemo)(() => [...new Set(cards.map((card) => text(card.data.creator)).filter(Boolean))].sort((left, right) => left.localeCompare(right, "ru")), [cards]);
			const tags = (0, react.useMemo)(() => {
				const counts = /* @__PURE__ */ new Map();
				for (const card of cards) for (const tag of cardTags(card)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
				return [...counts].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "ru"));
			}, [cards]);
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "mayori-filter-control",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Сортировка" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							value: sort,
							onChange: (event) => {
								setSort(event.currentTarget.value);
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "newest",
									children: "Сначала новые"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "name",
									children: "По имени"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "creator",
									children: "По автору"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "mayori-filter-control",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Автор" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							value: creator,
							onChange: (event) => {
								setCreator(event.currentTarget.value);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Все авторы"
							}), creators.map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value,
								children: value
							}, value))]
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
		function CharacterGalleryDialog({ library, open, onClose, openerRef }) {
			const dialogRef = (0, react.useRef)(null);
			const inputRef = (0, react.useRef)(null);
			const detailTriggerRef = (0, react.useRef)(null);
			const snapshot = (0, react.useSyncExternalStore)(library.subscribe, library.getSnapshot, library.getSnapshot);
			const [query, setQuery] = (0, react.useState)("");
			const [sort, setSort] = (0, react.useState)("newest");
			const [creator, setCreator] = (0, react.useState)("all");
			const [portrait, setPortrait] = (0, react.useState)("all");
			const [selectedTags, setSelectedTags] = (0, react.useState)([]);
			const [filtersOpen, setFiltersOpen] = (0, react.useState)(false);
			const [selectedCard, setSelectedCard] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [notice, setNotice] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				const dialog = dialogRef.current;
				if (dialog === null) return;
				if (open && !dialog.open) dialog.showModal();
				if (!open && dialog.open) dialog.close();
			}, [open]);
			const normalizedQuery = query.trim().toLocaleLowerCase("ru");
			const cards = (0, react.useMemo)(() => {
				return [...snapshot.cards.filter((card) => {
					if (creator !== "all" && text(card.data.creator) !== creator) return false;
					const source = safeAssetUri(card);
					if (portrait === "with" && source === null) return false;
					if (portrait === "without" && source !== null) return false;
					const tags = cardTags(card);
					if (!selectedTags.every((tag) => tags.includes(tag))) return false;
					if (normalizedQuery === "") return true;
					return [
						card.name,
						card.data.creator,
						card.data.description,
						card.data.personality,
						...tags
					].filter((value) => typeof value === "string").join("\n").toLocaleLowerCase("ru").includes(normalizedQuery);
				})].sort((left, right) => {
					if (sort === "name") return left.name.localeCompare(right.name, "ru");
					if (sort === "creator") return (text(left.data.creator) ?? "").localeCompare(text(right.data.creator) ?? "", "ru") || left.name.localeCompare(right.name, "ru");
					return right.importedAt - left.importedAt || left.name.localeCompare(right.name, "ru");
				});
			}, [
				creator,
				normalizedQuery,
				portrait,
				selectedTags,
				snapshot.cards,
				sort
			]);
			const finishClose = () => {
				setSelectedCard(null);
				setFiltersOpen(false);
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
			const resetFilters = () => {
				setQuery("");
				setSort("newest");
				setCreator("all");
				setPortrait("all");
				setSelectedTags([]);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dialog", {
				ref: dialogRef,
				className: "mayori-gallery-dialog",
				"aria-labelledby": "mayori-gallery-title",
				onClose: finishClose,
				onCancel: (event) => {
					event.preventDefault();
					dialogRef.current?.close();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-gallery-shell",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "mayori-gallery-header",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-gallery-title",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								id: "mayori-gallery-title",
								children: "Персонажи"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: snapshot.status === "ready" ? `${snapshot.cards.length} в галерее` : "Загрузка…" })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-gallery-header-actions",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "mayori-filter-toggle",
									"aria-controls": "mayori-filter-panel",
									"aria-expanded": filtersOpen,
									onClick: () => {
										setFiltersOpen((value) => !value);
									},
									children: [icon("filter"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Фильтры" })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImportControl, {
									busy,
									inputRef,
									onFiles: importFiles,
									compact: true
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-icon-action",
									"aria-label": "Закрыть галерею",
									onClick: () => {
										dialogRef.current?.close();
									},
									children: icon("close")
								})
							]
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
										cards: snapshot.cards,
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
								className: "mayori-gallery-main",
								id: "mayori-gallery-content",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "mayori-gallery-results",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											role: "status",
											"aria-live": "polite",
											children: snapshot.status === "ready" ? `Показано ${cards.length} из ${snapshot.cards.length}` : ""
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-gallery-notice",
										role: "status",
										"aria-live": "polite",
										children: [notice !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: notice.kind === "error" ? "mayori-error" : "mayori-success",
											children: notice.text
										}), snapshot.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: "mayori-error",
											children: snapshot.error
										})]
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
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: snapshot.cards.length === 0 ? "Персонажей пока нет" : "Ничего не найдено" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: snapshot.cards.length === 0 ? "Импортируйте PNG или JSON, чтобы добавить первого персонажа." : "Измените запрос или сбросьте фильтры." })
										]
									}),
									cards.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: "mayori-card-grid",
										children: cards.map((card) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterCard, {
											card,
											onPlay: (item) => {
												setNotice({
													kind: "success",
													text: `Игра с «${item.name}» появится позже.`
												});
											},
											onEdit: (item, trigger) => {
												detailTriggerRef.current = trigger;
												setSelectedCard(item);
											}
										}, card.id))
									})
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
				triggerRef: detailTriggerRef
			})] });
		}
		/** Sidebar slot entry and full-screen gallery consumer. */
		function CharacterGalleryAction({ wide, library }) {
			const [open, setOpen] = (0, react.useState)(false);
			const openerRef = (0, react.useRef)(null);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				ref: openerRef,
				type: "button",
				className: "mayori-gallery-trigger",
				"aria-label": wide ? void 0 : "Персонажи",
				onClick: () => {
					setOpen(true);
				},
				children: [icon("gallery"), wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Персонажи" })]
			}), (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterGalleryDialog, {
				library,
				open,
				onClose: () => {
					setOpen(false);
				},
				openerRef
			}), document.body)] });
		}
		//#endregion
		//#region src/sidebar.jsx
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
		function PanelIcon({ className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className,
				width: "18",
				height: "18",
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "3.5",
					y: "4",
					width: "17",
					height: "16",
					rx: "2"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 4v16" })]
			});
		}
		/** Workspace-region occupant. Stock shell geometry and Settings remain mounted. */
		function MayoriSidebar({ wide, toggleSidebar, library }) {
			const shellRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (wide) return void 0;
				const settingsButton = (shellRef.current?.parentElement?.parentElement?.parentElement)?.lastElementChild?.querySelector("button");
				if (settingsButton === void 0 || settingsButton === null) return void 0;
				if (settingsButton.hasAttribute("aria-label") || settingsButton.textContent.trim() !== "") return void 0;
				settingsButton.dataset.mayoriAccessibleLabel = "true";
				settingsButton.setAttribute("aria-label", "Настройки");
				return () => {
					if (settingsButton.dataset.mayoriAccessibleLabel !== "true") return;
					settingsButton.removeAttribute("data-mayori-accessible-label");
					settingsButton.removeAttribute("aria-label");
				};
			}, [wide]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: shellRef,
				className: `mayori-sidebar-shell${wide ? "" : " mayori-sidebar-collapsed"}`,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: "mayori-sidebar-header",
					children: [wide && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-brand",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-brand-mark",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MayoriMark, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-brand-name",
								children: "Mayori"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-brand-engine",
								children: "Engine"
							})
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "mayori-sidebar-toggle",
						"aria-label": wide ? "Свернуть боковую панель" : "Развернуть боковую панель",
						title: wide ? "Свернуть боковую панель" : "Развернуть боковую панель",
						onClick: () => {
							toggleSidebar();
						},
						children: [!wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MayoriMark, { className: "mayori-sidebar-rail-mark" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PanelIcon, { className: "mayori-sidebar-panel-icon" })]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
					className: "mayori-sidebar-navigation",
					"aria-label": "Основная навигация",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterGalleryAction, {
						wide,
						library
					})
				})]
			});
		}
		//#endregion
		//#region src/client.js
		/** Mayori browser plugin: custom RPG sidebar plus the Character Library UI. */
		const inject = ["slots", "layout"];
		/** Plugin-owned style; removed with the client fiber. */
		const BRAND_STYLE = String.raw`
.mayori-sidebar-shell {
  display: flex; flex: 1; min-block-size: 0; flex-direction: column;
  color: var(--dsw-alias-label-primary); font-size: 14px; overflow: hidden;
}
/* ui-sidebar has no brand/new-action seats. Once the public workspace region
   is occupied by Mayori, remove those two stock chrome rows and let this
   region supply the brand and toggle. Settings remains in its native seat. */
div:has(> div > div > .mayori-sidebar-shell) > :nth-child(1),
div:has(> div > div > .mayori-sidebar-shell) > :nth-child(2) { display: none; }
div:has(> div > .mayori-sidebar-shell),
div:has(> .mayori-sidebar-shell) {
  margin-inline: 0; padding-inline: 0; overflow: visible;
}
.mayori-sidebar-header {
  display: flex; flex: none; align-items: center; justify-content: flex-end; gap: 8px;
  block-size: 60px; box-sizing: border-box; margin-block-end: 16px; padding: 8px 0 8px 4px;
  overflow: hidden;
}
.mayori-sidebar-collapsed .mayori-sidebar-header {
  justify-content: flex-start; block-size: 36px; margin-block-end: 20px; padding: 0;
}
.mayori-brand { display: flex; flex: 1; align-items: center; min-inline-size: 0; overflow: hidden; }
.mayori-brand-mark {
  display: inline-grid; place-items: center; flex: none; inline-size: 32px; block-size: 32px;
  margin-inline-end: 10px; border-radius: 10px; background: var(--dsw-alias-label-primary);
  color: var(--dsw-specific-sidebar-fill);
}
.mayori-brand-name {
  overflow: hidden; font-size: 20px; font-weight: 650; line-height: 1;
  letter-spacing: -0.035em; text-overflow: ellipsis; white-space: nowrap;
}
.mayori-brand-engine {
  flex: none; align-self: flex-end; margin-block-end: 5px; margin-inline-start: 6px;
  color: var(--dsw-alias-label-secondary); font-size: 10px; font-weight: 600;
  line-height: 1; letter-spacing: 0.08em; text-transform: uppercase;
}
.mayori-sidebar-toggle {
  position: relative; display: inline-flex; align-items: center; justify-content: center; flex: none;
  inline-size: 36px; block-size: 36px; padding: 0; border: 0; border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.mayori-sidebar-toggle:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.mayori-sidebar-collapsed .mayori-sidebar-toggle { color: var(--dsw-alias-label-primary); }
.mayori-sidebar-collapsed .mayori-sidebar-panel-icon { display: none; }
.mayori-sidebar-collapsed .mayori-sidebar-toggle:hover .mayori-sidebar-panel-icon { display: block; }
.mayori-sidebar-collapsed .mayori-sidebar-toggle:hover .mayori-sidebar-rail-mark { display: none; }
.mayori-sidebar-navigation {
  display: flex; flex: 1; min-block-size: 0; flex-direction: column; gap: 8px;
  margin-inline: -2px; overflow-x: hidden; overflow-y: auto;
}
.mayori-sidebar-collapsed .mayori-sidebar-navigation {
  align-items: center; inline-size: auto; margin-inline: 0;
}
.mayori-sidebar-shell button:focus-visible,
.mayori-gallery-dialog button:focus-visible,
.mayori-gallery-dialog input:focus-visible,
.mayori-gallery-dialog select:focus-visible,
.mayori-character-dialog button:focus-visible,
.mayori-import-button:has(input:focus-visible) {
  outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px;
}
.mayori-gallery-trigger {
  display: flex; align-items: center; justify-content: flex-start; gap: 8px;
  inline-size: 100%; block-size: 42px; box-sizing: border-box;
  margin: 4px 0; padding: 0 10px 0 8px; border: 0; border-radius: 12px;
  background: transparent; color: var(--dsw-alias-label-primary); font: inherit;
  font-size: 14px; line-height: 22px; cursor: pointer; overflow: hidden;
}
.mayori-gallery-trigger:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-gallery-trigger > svg { flex: none; inline-size: 16px; block-size: 16px; }
.mayori-gallery-trigger:has(> svg:only-child) {
  justify-content: center; inline-size: 36px; block-size: 36px; margin: 8px 0 10px;
  padding: 0; border-radius: 50%; color: var(--dsw-alias-label-primary);
}
.mayori-gallery-trigger:has(> svg:only-child) > svg { inline-size: 18px; block-size: 18px; }
.mayori-gallery-dialog {
  inset: 0; inline-size: 100vw; max-inline-size: none; block-size: 100dvh; max-block-size: none;
  margin: 0; padding: 0; border: 0; border-radius: 0;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill));
  color: var(--dsw-alias-label-primary); overflow: hidden;
}
.mayori-gallery-dialog::backdrop { background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); }
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
.mayori-gallery-workspace { position: relative; display: grid; grid-template-columns: 280px minmax(0, 1fr); min-block-size: 0; }
.mayori-filter-panel {
  display: flex; min-block-size: 0; flex-direction: column; gap: 24px; padding: 24px 20px;
  border-inline-end: 1px solid var(--dsw-alias-border-l2); overflow-y: auto; overscroll-behavior: contain;
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
.mayori-search input, .mayori-filter-control select {
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
.mayori-gallery-main { min-inline-size: 0; min-block-size: 0; padding: 20px 24px 32px; overflow-y: auto; overscroll-behavior: contain; }
.mayori-gallery-results { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-block-size: 30px; }
.mayori-gallery-results p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-gallery-notice { min-block-size: 28px; padding-block: 2px 10px; font-size: 13px; }
.mayori-gallery-notice p { margin: 0; }
.mayori-error, .mayori-card-warning { color: var(--dsw-alias-label-error, #b42318); }
.mayori-success { color: var(--dsw-alias-label-success, #16794b); }
.mayori-card-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
  align-items: stretch; gap: 18px; margin: 0; padding: 0; list-style: none;
}
.mayori-card article {
  display: grid; grid-template-rows: auto minmax(0, 1fr); block-size: 100%; overflow: hidden;
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
.mayori-card-body { display: grid; grid-template-rows: auto auto 1fr; gap: 12px; padding: 14px; }
.mayori-card-heading { min-inline-size: 0; }
.mayori-card-heading h3 { overflow-wrap: anywhere; font-size: 17px; line-height: 1.3; }
.mayori-card-heading p { margin-block-start: 4px; overflow: hidden; color: var(--dsw-alias-label-secondary); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.mayori-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.mayori-tags li {
  max-inline-size: 100%; overflow: hidden; padding: 4px 8px; border-radius: 999px;
  background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary);
  font-size: 11px; text-overflow: ellipsis; white-space: nowrap;
}
.mayori-card-actions { display: grid; grid-template-columns: 1fr 1fr; align-self: end; gap: 8px; }
.mayori-card-actions button, .mayori-secondary-button, .mayori-danger-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-block-size: 40px;
  padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
}
.mayori-card-actions button > svg, .mayori-danger-button > svg { inline-size: 17px; block-size: 17px; }
.mayori-card-play { background: var(--dsw-alias-label-primary) !important; color: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)) !important; border-color: transparent !important; }
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
    position: absolute; z-index: 6; inset-block: 0; inset-inline-start: 0; inline-size: min(320px, calc(100vw - 48px));
    box-sizing: border-box; border-inline-end: 1px solid var(--dsw-alias-border-l2);
    box-shadow: 16px 0 40px oklch(0 0 0 / 0.2); transform: translateX(-105%); visibility: hidden;
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
  .mayori-card-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr)); gap: 12px; }
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
`;
		/** Register reversible browser contributions through Cordis. */
		function apply(ctx) {
			const library = new RemoteCharacterLibraryProvider();
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
			ctx.slots.inject("sidebar.workspaces", () => ctx.slots.register({
				name: "sidebar.workspaces",
				priority: -100,
				inject: () => ({
					library,
					toggleSidebar: () => {
						ctx.layout.toggleSidebar();
					}
				})
			}, MayoriSidebar));
		}
		//#endregion
		exports.BRAND_STYLE = BRAND_STYLE;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map