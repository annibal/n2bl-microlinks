.PHONY: install start stop restart clean db-wipe db-reset start-db stop-db start-server start-server-detached stop-server

PROJECT_NAME := $(shell basename $(shell pwd))
DB_VOLUME := $(PROJECT_NAME)_database-data

install:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "⧃〉Created .env file from .env.example"; \
	fi
	@docker-compose pull

start:
	@echo "⧃〉start what?"

start-db:
	@if docker-compose ps database | grep -q "Up"; then \
		echo "⧃〉Error: Database is already running."; \
		exit 1; \
	fi
	@echo "⧃〉Starting the database..."
	@docker-compose up -d database
	@echo "⧃〉Database up and running."

stop-db:
	@if ! docker-compose ps database | grep -q "Up"; then \
		echo "⧃〉Error: No database running to stop."; \
		exit 1; \
	fi
	@echo "⧃〉Stopping database..."
	@docker-compose stop database
	@echo "⧃〉Database stopped."

start-server:
	@if ! docker-compose ps database | grep -q "Up"; then \
		echo "⧃〉Error: Database must be running to start the server."; \
		exit 1; \
	fi
	@if docker-compose ps server | grep -q "Up"; then \
		echo "⧃〉Error: Server is already running."; \
		exit 1; \
	fi
	@echo "⧃〉Starting the server..."
	@docker-compose up server
	@echo "⧃〉Server stopped."

start-server-detached:
	@if ! docker-compose ps database | grep -q "Up"; then \
		echo "⧃〉Error: Database must be running to start the server."; \
		exit 1; \
	fi
	@if docker-compose ps server | grep -q "Up"; then \
		echo "⧃〉Error: Server is already running."; \
		exit 1; \
	fi
	@echo "⧃〉Starting the server in detached mode..."
	@docker-compose up -d server
	@echo "⧃〉Server up and running in detached mode."

stop-server:
	@if ! docker-compose ps server | grep -q "Up"; then \
		echo "⧃〉Error: No server running to stop."; \
		exit 1; \
	fi
	@echo "⧃〉Stopping server..."
	@docker-compose stop server
	@echo "⧃〉Server stopped."

stop:
	@echo "⧃〉¡ixtopi!"
	@docker-compose down
	@echo "⧃〉Services stopped."

restart: stop start-db start-server-detached

logs:
	@docker-compose logs -f

clean:
	@echo "⧃〉Cleaning up Docker resources..."
	@docker-compose down -v
	@docker system prune -f

db-wipe:
	@echo "⧃〉Wiping database data..."
	@docker-compose exec database psql -U linksman -d microlinks_db_001 -c "TRUNCATE micro_link_registry CASCADE; TRUNCATE micro_accesses CASCADE;"
	@echo "⧃〉Database tables truncated."

db-reset: stop
	@echo "⧃〉Removing database volume..."
	@docker volume rm -f $(DB_VOLUME) 2>/dev/null || true
	@echo "⧃〉Starting services with fresh database..."
	@make start-db