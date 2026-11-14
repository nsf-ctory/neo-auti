# ═══════════════════════════════════════════
#   Chat-as-a-Protocol — neo-auti
#   Makefile local · Auti.
# ═══════════════════════════════════════════

SHELL := /bin/sh

CYAN    := \033[0;36m
GREEN   := \033[0;32m
YELLOW  := \033[0;33m
RED     := \033[0;31m
MAGENTA := \033[0;35m
DIM     := \033[0;90m
WHITE   := \033[1;37m
RESET   := \033[0m

.DEFAULT_GOAL := help
.PHONY: help check-node install repair clean dev build start preview lint doctor verify

# ─── HELP ────────────────────────────────────────────────────────────────────

help: ## Exibe os comandos disponíveis
	@printf "$(CYAN)╔══════════════════════════════════════════╗$(RESET)\n"
	@printf "$(CYAN)║$(MAGENTA)▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓$(CYAN)║$(RESET)\n"
	@printf "$(CYAN)║                                          ║$(RESET)\n"
	@printf "$(CYAN)║$(RESET)             $(WHITE)AUTI.$(RESET)                        $(CYAN)║$(RESET)\n"
	@printf "$(CYAN)║$(RESET)       $(MAGENTA)── apoio e autonomia ──$(RESET)             $(CYAN)║$(RESET)\n"
	@printf "$(CYAN)║                                          ║$(RESET)\n"
	@printf "$(CYAN)║$(MAGENTA)▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓$(CYAN)║$(RESET)\n"
	@printf "$(CYAN)╚══════════════════════════════════════════╝$(RESET)\n"
	@printf "$(DIM) ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░$(RESET)\n"
	@printf "\n"
	@printf "  Uso: $(CYAN)make$(RESET) $(WHITE)[comando]$(RESET)\n"
	@printf "\n"
	@printf "$(DIM)  ·─── AMBIENTE ──────────────────────────────$(RESET)\n"
	@grep -E '^(check-node|install|repair|clean):.*## ' Makefile \
	  | sort | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[0;36m◆ %-16s\033[0m \033[0;90m%s\033[0m\n", $$1, $$2}'
	@printf "\n"
	@printf "$(DIM)  ·─── DESENVOLVIMENTO ───────────────────────$(RESET)\n"
	@grep -E '^(dev|build|start|preview):.*## ' Makefile \
	  | sort | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[0;36m◆ %-16s\033[0m \033[0;90m%s\033[0m\n", $$1, $$2}'
	@printf "\n"
	@printf "$(DIM)  ·─── QUALIDADE & SEGURANÇA ─────────────────$(RESET)\n"
	@grep -E '^(lint|doctor|verify):.*## ' Makefile \
	  | sort | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[0;36m◆ %-16s\033[0m \033[0;90m%s\033[0m\n", $$1, $$2}'
	@printf "\n"
	@printf "$(DIM) ─────────────────────────────────────────────$(RESET)\n"
	@printf "$(DIM) ⬡ Chat-as-a-Protocol · neo-auti$(RESET)\n"
	@printf "\n"

# ─── AMBIENTE ────────────────────────────────────────────────────────────────

check-node: ## Valida versão do ambiente Node.js (>= 22)
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)◉  CHECK-NODE$(RESET)%-27s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@node -e 'const v=process.versions.node.split(".")[0]; if(parseInt(v)<22){console.error("Node >= 22 required"); process.exit(1);}'
	@printf "$(GREEN)  ✓ Node.js $$(node -v) validado.$(RESET)\n"

install: check-node ## Instala dependências com pnpm
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)▼  INSTALL$(RESET)%-31s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@pnpm install --frozen-lockfile
	@printf "$(GREEN)  ✓ Dependências instaladas com sucesso.$(RESET)\n"

repair: ## Reinstala dependências do zero
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)⚡ REPAIR$(RESET)%-32s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@rm -rf node_modules dist server.js server.cjs
	@pnpm install
	@printf "$(GREEN)  ✓ Ambiente reparado com sucesso.$(RESET)\n"

clean: ## Remove diretórios de build temporários
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)⌫  CLEAN$(RESET)%-33s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@rm -rf dist server.js server.cjs
	@printf "$(GREEN)  ✓ Build dist removido.$(RESET)\n"

# ─── DESENVOLVIMENTO ─────────────────────────────────────────────────────────

dev: ## Inicia o servidor de desenvolvimento (Express + Vite)
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)▶  DEV$(RESET)%-35s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)│$(RESET)  $(DIM)Iniciando servidor em http://localhost:3000$(RESET)$(CYAN)│$(RESET)\n"
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@pnpm run dev

build: ## Compila o frontend Vite e empacota o servidor Node
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)⚙  BUILD$(RESET)%-33s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@pnpm run build
	@printf "$(GREEN)  ✓ Build de produção gerada com sucesso em dist/.$(RESET)\n"

start: ## Executa o servidor de produção compilado
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)▲  START$(RESET)%-33s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@pnpm run start

preview: ## Visualiza preview estático do frontend
	@pnpm run preview

# ─── QUALIDADE & SEGURANÇA ───────────────────────────────────────────────────

lint: ## Executa checagem de tipos estáticos (TypeScript tsc --noEmit)
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)✓  LINT (TYPECHECK)$(RESET)%-21s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@pnpm run lint
	@printf "$(GREEN)  ✓ 0 erros de tipagem encontrados.$(RESET)\n"

doctor: ## Diagnóstico de ambiente, variáveis e dependências
	@printf "$(CYAN)╭──────────────────────────────────────────╮$(RESET)\n"
	@printf "$(CYAN)│$(RESET)  $(WHITE)⛑  DOCTOR$(RESET)%-32s$(CYAN)│$(RESET)\n" ""
	@printf "$(CYAN)╰──────────────────────────────────────────╯$(RESET)\n"
	@node -v | awk '{printf "  Node.js: \033[0;32m%s\033[0m\n", $$1}'
	@pnpm -v | awk '{printf "  pnpm:    \033[0;32m%s\033[0m\n", $$1}'
	@if [ -f .env ]; then \
		printf "  .env:    $(GREEN)Presente$(RESET)\n"; \
	else \
		printf "  .env:    $(YELLOW)Não encontrado (use .env.example como base)$(RESET)\n"; \
	fi
	@if [ -z "$$GEMINI_API_KEY" ]; then \
		if grep -q "GEMINI_API_KEY=" .env 2>/dev/null; then \
			printf "  API Key: $(GREEN)Configurada em .env$(RESET)\n"; \
		else \
			printf "  API Key: $(RED)GEMINI_API_KEY ausente$(RESET)\n"; \
		fi \
	else \
		printf "  API Key: $(GREEN)Exportada no ambiente$(RESET)\n"; \
	fi

verify: lint build ## Validação completa da esteira CI/CD local (typecheck + build)
	@printf "$(GREEN)  ✓ Todas as verificações de qualidade foram aprovadas com sucesso!$(RESET)\n"
