CREATE TABLE recurring_transactions (
    id BIGSERIAL PRIMARY KEY,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(50) NOT NULL, -- 'EXPENSE', 'INCOME'
    description VARCHAR(255) NOT NULL,
    frequency VARCHAR(50) NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'
    start_date DATE NOT NULL,
    end_date DATE,
    next_execution_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'COMPLETED'
    
    user_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    category_id BIGINT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_recurring_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_recurring_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_recurring_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Indexes for background scheduler efficiency and user queries
CREATE INDEX idx_recurring_scheduler_catchup ON recurring_transactions(status, next_execution_date);
CREATE INDEX idx_recurring_user_lookup ON recurring_transactions(user_id, status);

-- Add linking column to transactions
ALTER TABLE transactions 
ADD COLUMN recurring_transaction_id BIGINT,
ADD CONSTRAINT fk_transaction_recurring 
    FOREIGN KEY (recurring_transaction_id) 
    REFERENCES recurring_transactions(id) 
    ON DELETE SET NULL;
