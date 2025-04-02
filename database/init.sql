CREATE TABLE IF NOT EXISTS micro_link_registry (
    id SERIAL PRIMARY KEY,
    link TEXT NOT NULL,
    micro VARCHAR(18) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    label TEXT,
    passcode VARCHAR(255),
    info TEXT
);

CREATE INDEX IF NOT EXISTS idx_micro ON micro_link_registry(micro);

CREATE TABLE IF NOT EXISTS micro_accesses (
    moment TIMESTAMP WITH TIME ZONE PRIMARY KEY DEFAULT CURRENT_TIMESTAMP,
    micro VARCHAR(18) NOT NULL REFERENCES micro_link_registry(micro),
    info TEXT
);