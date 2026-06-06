CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(50) PRIMARY KEY,
    currency VARCHAR(3) NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    transaction_id VARCHAR(100) PRIMARY KEY,
    from_account_id VARCHAR(50) REFERENCES accounts(id),
    to_account_id VARCHAR(50) REFERENCES accounts(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT amount_must_be_positive CHECK (amount > 0)
);

INSERT INTO accounts (id, currency, balance) VALUES 
('CORP-UK-001', 'GBP', 100000.00),
('CORP-US-002', 'USD', 50000.00)
ON CONFLICT (id) DO NOTHING;